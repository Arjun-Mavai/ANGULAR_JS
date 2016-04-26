angular.module('app',[]);
angular.module('app').service('mySvc',function(){
    return {
        val:"I am a service"
    };
});
angular.module('app').controller('Controller1',function($scope,mySvc){
    $scope.val = mySvc.val;
});