app.controller("HTMLCtrl", function($scope){

    // display last generated html when popup opens
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        
    });

    $scope.generateHTML = function() {
        console.log("got inside generateHTML function. before chrome sendMsg.");
        chrome.runtime.sendMessage({action: "generateHTML", sz: "md"}, function(response){
            console.log("Response from generateHTML is", response);
            $scope.generatedHTML = response.data;
            $scope.$apply();

            chrome.tabs.query({active:true,currentWindow:true},function(tabs){
                var message = { action: "changeContent", html: $scope.generatedHTML};
                chrome.tabs.sendMessage(tabs[0].id, message, function(response){
                    console.log("Response from changeContent", response);
                });
            });
        });
    }
});