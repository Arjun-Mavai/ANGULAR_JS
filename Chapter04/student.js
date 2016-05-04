
angular.module('student', ['ngRoute', 'firebase'])

.value('fbURL', 'https://aman-studentlist.firebaseio.com/')
.service('fbRef', function(fbURL) {
  return new Firebase(fbURL)
})
.service('fbAuth', function($q, $firebaseAuth, fbRef) {
  var auth;
  return function () {
      if (auth) return $q.when(auth);
      var authObj = $firebaseAuth(fbRef);
      if (authObj.$getAuth()) {
        return $q.when(auth = authObj.$getAuth());
      }
      var deferred = $q.defer();
      authObj.$authAnonymously().then(function(authData) {
          auth = authData;
          deferred.resolve(authData);
      });
      return deferred.promise;
  }
})

.service('Students', function($q, $firebaseArray, fbRef, fbAuth, studentListValue) {
  var self = this;
  this.fetch = function () {
    if (this.students) return $q.when(this.students);
    return fbAuth().then(function(auth) {
      var deferred = $q.defer();
      var ref = fbRef.child('students-fresh/' + auth.uid);
      ref.on('value', function(snapshot) {
        if (snapshot.val() === null) {
          ref.set(studentListValue);
        }
        self.students = $firebaseArray(ref);
        deferred.resolve(self.students);
      });

      //Remove students list when no longer needed.
      //ref.onDisconnect().remove();
      return deferred.promise;
    });
  };
})

.config(function($routeProvider) {
  var resolveStudents = {
    students: function (Students) {
      return Students.fetch();
    }
  };

  $routeProvider
    .when('/', {
      controller:'StudentListController as studentList',
      templateUrl:'studentlist.html',
      resolve: resolveStudents
    })
    .when('/edit/:studentId', {
      controller:'EditStudentController as editStudent',
      templateUrl:'detail.html',
      resolve: resolveStudents
    })
    .when('/profile/:studentId', {
      controller:'EditStudentController as editStudent',
      templateUrl:'profile.html',
      resolve: resolveStudents
    })
    .when('/new', {
      controller:'NewStudentController as editStudent',
      templateUrl:'detail.html',
      resolve: resolveStudents
    })
    .when('/contact', {
      templateUrl:'contact.html',
      resolve: resolveStudents
    })
    .when('/about', {
      templateUrl:'about.html',
      resolve: resolveStudents
    })
    .otherwise({
      redirectTo:'/'
    });
})

.controller('StudentListController', function(students) {
  var studentList = this;
  studentList.students = students;
})

.controller('NewStudentController', function($location, students) {
  var editStudent = this;
  editStudent.save = function() {
      students.$add(editStudent.student).then(function(data) {
          $location.path('/');
      });
  };
   editStudent.cancel = function() {
    $location.path('/');
  };
})

.controller('EditStudentController',
  function($location, $routeParams,students) {
    var editStudent = this;
    var studentId = $routeParams.studentId,
        studentIndex;
    editStudent.students = students;
    studentIndex = editStudent.students.$indexFor(studentId);
    editStudent.student = editStudent.students[studentIndex];
    editStudent.date = new Date();
    //saving the old state of the student object
    var oldstudent = angular.copy(editStudent.student);
    
    editStudent.destroy = function() {
        editStudent.students.$remove(editStudent.student).then(function(data) {
            $location.path('/');
        });
    };

    editStudent.save = function() {
        editStudent.students.$save(editStudent.student).then(function(data) {
           $location.path('/');
        });
    };
    
    editStudent.cancel = function() {
        angular.copy(oldstudent,editStudent.student);
        $location.path('/');
    };
});

