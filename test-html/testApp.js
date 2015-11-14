var myTestingApp = angular.module('myTestingApp', ['ui.router']);

myTestingApp.controller("TestCtrl", function($scope){
    // nothing here
});

myTestingApp.config(function($stateProvider, $urlRouterProvider) {
    //
    // For any unmatched url, redirect to /state1
    $urlRouterProvider.otherwise("/before");
    //
    // Now set up the states
    $stateProvider
        .state('before', {
            url: "/before",
            templateUrl: "/test/before.html"
        })
        .state('after', {
            url: "/after",
            templateUrl: "/test/after.html"
        })
});