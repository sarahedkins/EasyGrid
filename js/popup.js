app.controller('MainCtrl', function($scope){
    $scope.title = "EasyGrid"
    $scope.tab = {};
    $scope.currentElement = null;

    function renderStatus(statusText) {
        document.getElementById('status').textContent = statusText;
    }

    // get current tab info
    chrome.tabs.query({ 'active': true }, function(tabs){
        if (tabs.length > 0) {
            $scope.tab.title = tabs[0].title;
            $scope.tab.url = tabs[0].url;
            $scope.$apply();

            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                console.log("before the send start in popup");
                //chrome.tabs.sendMessage(tabs[0].id, {action: "start"}, function(response) {
                //    console.log(response.msg);
                //});
            });
        }
    });

    chrome.runtime.sendMessage({action: "start"},
        function (response) {
            console.log(response.msg);
        });

//    // Canvas
//    document.addEventListener('DOMContentLoaded', function draw() {
//        var canvas = document.getElementById("display");
//        if (canvas.getContext) {
//            var ctx = canvas.getContext("2d");
//
//            ctx.fillStyle = "rgb(200,0,0)";
//            ctx.fillRect (10, 10, 55, 50);
//
//            ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
//            ctx.fillRect (30, 30, 55, 50);
//        } else {
//            renderStatus("Where is the canvas?")
//        }
//    }, function(error) {
//        renderStatus("Cannot display the canvas. " + error);
//    });

}); // end of controller




