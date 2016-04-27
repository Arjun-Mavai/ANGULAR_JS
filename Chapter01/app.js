//Create module
var myApp = angular.module("myModule", []);

// Register controller with the module
myApp.controller("myController", function ($scope) {
    $scope.message = "AngularJS Tutorial";
});