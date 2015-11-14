app.controller('MainCtrl', function($scope){
    $scope.title = "EasyGrid"
    $scope.tab = {};
    $scope.error = null;
    $scope.selectedHTML = null;
    // TODO separate rows from columns, don't allow 5,7,8,9,10,11 cols. for now.
    $scope.maxRC = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    $scope.onGrid = [];

    // send a message to bg on startup
    chrome.runtime.sendMessage({action: "start"},
        function (response) {
            console.log(response.msg);
        });

    // display messages
    function renderStatus(statusText) {
        document.getElementById('status').textContent = statusText;
    }

    // get HTML from background, put it on the pop-up scope
    $scope.getHTML = function() {
        chrome.runtime.sendMessage({action: "sendHTML"}, function(response){
            console.log("Response from sendHTML is", response);
            if(response.data) {
                $scope.selectedHTML = response.data;

            } else {
                $scope.error = response.error;
            }
            $scope.$apply();
        })
    };

    // get current tab info
    chrome.tabs.query({ 'active': true }, function(tabs){
        if (tabs.length > 0) {
            $scope.tab.title = tabs[0].title;
            $scope.tab.url = tabs[0].url;
            $scope.$apply();
        }
    });

}); // end of controller




