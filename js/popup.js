app.controller('MainCtrl', function($scope){
    $scope.title = "EasyGrid"

    function renderStatus(statusText) {
        document.getElementById('status').textContent = statusText;
    }

    // get current tab
    chrome.tabs.query({ 'active': true }, function(tabs){
        if (tabs.length > 0) {
            console.log("tabs is", tabs);
            // active tab was second in the tabs array. weird.
            $scope.title = tabs[1].title;
            $scope.url = tabs[1].url;


            chrome.tabs.sendMessage(tabs[0].id, {'action': 'PageInfo'}, function(response){
                $scope.pageInfos = response;
                console.log("response is", response);
                $scope.$apply();
            })
        }
    });

// Canvas
    document.addEventListener('DOMContentLoaded', function draw() {
        var canvas = document.getElementById("display");
        if (canvas.getContext) {
            var ctx = canvas.getContext("2d");

            ctx.fillStyle = "rgb(200,0,0)";
            ctx.fillRect (10, 10, 55, 50);

            ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
            ctx.fillRect (30, 30, 55, 50);
        } else {
            renderStatus("Where is the canvas?")
        }
    }, function(error) {
        renderStatus("Cannot display the canvas. " + error);
    });

});




