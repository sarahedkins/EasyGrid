app.controller("GridCtrl", function($scope, GridFactory){

    $scope.generatedHTML = "Code will appear here after you click generate!";

    // TODO make work for 5 cols?? weird.
    $scope.maxRC = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];


    // helper function to draw on ctx
    var drawRowsAndCols = function(ctx, gridObj) {
        var curr = gridObj;
        var height = curr.getHeight(), width = curr.getrSpace();
        var rSpacing = curr.getrSpace();
        var cSpacing = curr.getcSpace();
        for (var i = 0; i < height; i += rSpacing) {
            ctx.moveTo(0, i);
            ctx.lineTo(width, i);
            ctx.stroke();
        }
        for (var i = 0; i < width; i += cSpacing){
            ctx.moveTo(i, 0);
            ctx.lineTo(i, height);
            ctx.stroke();
        }
    };

    // get mainGrid from bg, draw the whole grid
    var drawTheGrid = function(){

        chrome.runtime.sendMessage({action: "getMainGrid"}, function(res){
            console.log("got main grid: ", res.data);
            var canvas = document.getElementById("display");
            if (canvas.getContext) {
                var ctx = canvas.getContext("2d");
                ctx.beginPath();
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.strokeStyle = "black";

                var _draw = function(values, ctx) {
                    for (var item in values) {
                        if (item.hasOwnProperty("type")) {
                            if (item.type = "grid") {
                                drawRowsAndCols(ctx, item.data);
                                _draw(item.data.getAllValues(), ctx);
                            }
                        }
                    }
                };

                var curr = res.data; // initialize to mainGrid
                var values = curr.getAllValues();
                _draw(values, ctx);
            }
        });

    };

    drawTheGrid();  // on start, draw the grid outline


    // get saved grid rows/cols from background to display
    chrome.runtime.sendMessage({action: "getRC"}, function(response){
        var rc = response.data;
        GridFactory.drawGrid(rc[0], rc[1]);
    });

    // get saved grid element positions from coordinateHash in background
    var rcArr, rCoord, cCoord, rectCenter;
    $scope.legend = [];
    var paintGridFromHash = function(){
        $scope.legend = [];
        chrome.runtime.sendMessage({action: "getCoordHash"}, function(response){
            $scope.gridElements = response.data;
            var color_index = 0;
            for (var key in $scope.gridElements) {
                rcArr = key.split("c");
                rCoord = rcArr[0].slice(1);
                cCoord = rcArr[1];
                rectCenter = GridFactory.getPixelsFromCoordinates(rCoord, cCoord);
                // put a marker on the canvas
                var canvas = document.getElementById("display");
                if (canvas.getContext) {
                    var ctx = canvas.getContext("2d");
                    var markerSz = GridFactory.markerSize();
                    var color = GridFactory.color(color_index);
                    ctx.fillStyle = color;
                    ctx.fillRect(rectCenter[0] - (markerSz/2), rectCenter[1] - (markerSz/2),  markerSz, markerSz);
                }
                // display the legend (marker color + html snippet)
                $scope.legend.push({html: $scope.gridElements[key], color: color});
                $scope.$apply();

                // get next color for next snippet
                color_index++;
            }
        });
    };
    paintGridFromHash();

    $scope.dim = {};
    $scope.dim.width = GridFactory.getWidth();
    $scope.dim.height = GridFactory.getHeight();

    $scope.freshGrid = function(r, c) {
        // clear previous settings (coordHash and lastGenHTML in bg, legend in frontend)
        chrome.runtime.sendMessage({action: "resetGrid"}, function(response){
            $scope.legend = [];
            $scope.$apply();
        });
        chrome.runtime.sendMessage({action: "clearLastGen"}, function(response){
            $scope.generatedHTML = response.data;
            // draw new grid
            GridFactory.drawGrids(r, c);
            $scope.$apply();
        });
    };

    $scope.nestGrid = function(r, c) {
        console.log("nestGrid clicked");
        chrome.runtime.sendMessage({action: "addNestedGrid", r: r, c: c}, function(response){
            console.log("coordHash[keyofBlockToNestIn]res.data", response.data);
        });
    };

    // Nesting // -----------------------------------------------------------------

    // toggle nest mode
    $scope.inNestMode = false;
    $scope.setNestMode = function(){
        $scope.inNestMode = !$scope.inNestMode;
    };

    // -----------------------------------------------------------------------------

    // canvas click listener
    var canvas = document.getElementById("display");
    canvas.addEventListener('click', function(e) {

        var x = e.offsetX, y = e.offsetY;
        var rc = GridFactory.getCoordinatesFromPixels(x, y);
        var r = rc[0], c = rc[1];

        // check if in Nest Mode
        if ($scope.inNestMode) {
            // send to background
            console.log("in nestMode when canvas clicked");
            chrome.runtime.sendMessage({action: "setBlockToNest",  rCoord: r, cCoord: c}, function(response){
                $scope.confirmBlockToNest = "Block confirmed. Select dimensions.";
                $scope.$apply();
                console.log("res is", response);
            });
        }

        // if NOT in Nest Mode, add html element
        else {
            // check if there is any currently selected html. if no - return.
            // get HTML from background, put it on the pop-up scope
            chrome.runtime.sendMessage({action: "sendHTML"}, function(response){
                if(!response.data) {
                    return;
                } else {
                    chrome.runtime.sendMessage({action: "updateCoordHash", data: {x: r, y: c}}, function(response){
                        // keep view in sync with background
                        paintGridFromHash();
                    });
                }
            });
        }
    }, false);

    // HTML View //  -------------------------------------------------------------

    // display last generated html when popup opens
    chrome.runtime.sendMessage({action: "getLastGenHTML"}, function(response){
        $scope.generatedHTML = response.data;
        $scope.$apply();
    });

    // generate new HTML and update the view to reflect it
    $scope.generateHTML = function() {
        chrome.runtime.sendMessage({action: "generateHTML", sz: "md"}, function(response){
            var resFromGenHTML = response.data;
            chrome.tabs.query({active:true,currentWindow:true}, function(tabs){
                var message = { action: "changeContent", html: response.data};
                chrome.tabs.sendMessage(tabs[0].id, message, function(response){
                    $scope.generatedHTML = response.data;
                    $scope.$apply();
                });
            });
        });
    }

});

app.factory("GridFactory", function(){
    var currentRows = 0;
    var currentCols = 0;

    var canvasWidth = 300;
    var canvasHeight = 187.5;

    var getRSpacing = function(){
        return canvasHeight / currentRows;
    };

    var getCSpacing = function(){
        return canvasWidth / currentCols;
    };

    var colors = ["Blue", "BlueViolet", "Coral", "Crimson",
        "DarkSeaGreen", "DeepPink", "Gold", "GreenYellow",
        "Tan", "SkyBlue", "Red", "Black", "Green", "Yellow", "Orange",
        "AliceBlue", "Goldenrod", "Gray", "CadetBlue"];

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
        drawGrid: function(rows, cols, width, height) {
            // draw the initial grid
            currentRows = rows;
            currentCols = cols;

            // send updated grid rows/cols to background for persistence
            chrome.runtime.sendMessage({action: "saveGridDimensions", data: {row: rows, col: cols, width: width, height: height}}, function(response){});

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
            var row = Math.floor(y / getRSpacing());
            var col = Math.floor(x / getCSpacing());
            return [row, col];
        },
        getPixelsFromCoordinates: function(r, c) {
            // find the center in pixels of a given grid position
            var rSpacing = getRSpacing(); // number of pixels per row
            var rowTop = r * rSpacing; // pixel at the top of the row
            var y = rowTop + (rSpacing/2);

            var cSpacing = getCSpacing(); // number of pixels per col
            var colLeft = c * cSpacing;
            var x = colLeft + (cSpacing/2);
            return [x, y];
        },
        markerSize: function(){
            return (getCSpacing() * .1);
        },
        color: function(idx) {
            if (idx > colors.length - 1) {
                idx = idx % colors.length;
            }
            return colors[idx];
        },

    };

    return gridFactory;
});