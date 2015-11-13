app.controller("GridCtrl", function($scope, GridFactory){

    // get saved grid rows/cols from background to display for persistence
    chrome.runtime.sendMessage({action: "getRC"}, function(response){
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

        // send coordinates to the background,
        // where it will be paired with the current html selected
        // and stored in a coordinate hash
        var rc = GridFactory.getCoordinatesFromPixels(x, y);
        var r = rc[0], c = rc[1];
        chrome.runtime.sendMessage({action: "updateCoordHash", data: {x: r, y: c}}, function(response){
            console.log("Response from updateCoordHash is", response);
            // keep factory in sync with background
            var key = "r" + x + "c" + y;
           // HTMLFactory.updateCoordinateHash(x, y, response.data[key]);
        });

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
        },
        getCoordinatesFromPixels: function(x, y) {
            // Convert x,y pixel coordinates to grid ROW x COL coordinates
            var rSpacing = canvasHeight / currentRows; // number of pixels per row
            var row = Math.floor(y / rSpacing);

            var cSpacing = canvasWidth / currentCols; // number of pixels per col
            var col = Math.floor(x / cSpacing);
            console.log("COORDINATES ARE:::", row, col);
            return [row, col];
        }
    };

    return gridFactory;
});