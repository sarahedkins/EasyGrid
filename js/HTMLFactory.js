app.controller("HTMLCtrl", function($scope){

    $scope.generateHTML = function() {
        console.log("got inside generateHTML function. before chrome sendMsg.");
        chrome.runtime.sendMessage({action: "generateHTML"}, function(response){
            console.log("Response from generateHTML is", response);
            $scope.generatedHTML = response.data;
            $scope.$apply();
        });
    }
});