app.controller("GridCtrl", function($scope, GridFactory){

    // get saved grid rows/cols from background to display for persistence
    chrome.runtime.sendMessage({action: "getRC"}, function(response){
        console.log("Response from getRC is", response);
        var rc = response.data;
        GridFactory.drawGrid(rc[0], rc[1]);
    });

    $scope.dim = {};
    $scope.dim.width = GridFactory.getWidth();
    $scope.dim.height = GridFactory.getHeight();

    $scope.drawGrid = GridFactory.drawGrid;

    // click listener
    var canvas = document.getElementById("display");
    canvas.addEventListener('click', function(e) {
        console.log('click position: ' + e.offsetX + '/' + e.offsetY);
        var x = e.offsetX, y = e.offsetY;
        // TODO determine where click coordinates and return id for the part of template?
    }, false);

});

app.factory("GridFactory", function(){
    var currentRows = 0;
    var currentCols = 0;

    var canvasWidth = 300;
    var canvasHeight = 187.5;

    var gridFactory = {
        setCanvasByWidth: function(width){
            canvasWidth = width;
            canvasHeight = width/6;
        },
        getWidth: function() {
            return canvasWidth;
        },
        getHeight: function() {
            return canvasHeight;
        },
        getCurrentRC: function() {
            return [currentRows, currentCols];
        },
        drawGrid: function(rows, cols) {
            currentRows = rows;
            currentCols = cols;

            // send updated grid rows/cols to background for persistence
            chrome.runtime.sendMessage({action: "gridRC", data: {row: rows, col: cols}}, function(response){
                console.log("Response from gridRC is", response);
            });

            var canvas = document.getElementById("display");
            if (canvas.getContext) {
                console.log("drawing...");
                var ctx = canvas.getContext("2d");
                ctx.beginPath();
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.strokeStyle = "black";

                // calculate line positions:
                // ROWS:
                var rowSpacing = canvasHeight / rows;
                for (var i = 0; i < canvasHeight; i += rowSpacing){
                    ctx.moveTo(0, i);
                    ctx.lineTo(canvasWidth, i);
                    ctx.stroke();
                }
                // COLS:
                var colSpacing = canvasWidth / cols;
                for (var i = 0; i < canvasWidth; i += colSpacing){
                    ctx.moveTo(i, 0);
                    ctx.lineTo(i, canvasHeight);
                    ctx.stroke();
                }
            }
        }
    };

    return gridFactory;
});