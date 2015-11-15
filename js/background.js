console.log("Background is running...");

 //// GRID OBJECT ////
function Grid(x,y,r,c) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.c = c;
    this.rSpace = y / r;
    this.cSpace = x / c;
    this.values = {};
};

//values = { value: something type: "html/grid"};
Grid.prototype.setHTML = function(key, val){
    this.values[key].value = val;
    this.values[key].type = "html";
};
Grid.prototype.setNest = function(key,r,c){
    var x = this.cSpace;
    var y = this.rSpace;
    this.values[key].value = new Grid(x,y,r,c);
    this.values[key].type = "grid";
};
Grid.prototype.updateRC = function(r,c) {
    this.r = r;
    this.c = c;
    this.rSpace = y / r;
    this.cSpace = x / c;
};
// given x,y pixel coordinates, find the corresponding r,c coords in this grid
Grid.prototype.xy_to_rc =function(x,y) {
    var rCoord = Math.floor(y / this.rSpace);
    var cCoord = Math.floor(x / this.cSpace);
    return [rCoord, cCoord];
};
Grid.prototype.rc_to_xy =function(rCoord,cCoord) {
    // find the center in pixels of a given grid position
    var rowTop = rCoord * this.rSpace; // pixel at the top of the row
    var y = rowTop + (this.rSpace/2);

    var colLeft = cCoord * this.cSpace;
    var x = colLeft + (this.cSpace/2);
    return [x, y];
};
Grid.prototype.markerSize = function(){
    return (this.cSpace * .1);
};
Grid.prototype.valueIsGrid = function(key){
  return this.values[key].type == "grid";
};
Grid.prototype.getValue = function(key){
   return this.values[key].value;
};
Grid.prototype.getAllValues = function(){
    return this.values;
};
Grid.prototype.resetGrid = function(x,y,r,c) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.c = c;
    this.rSpace = y / r;
    this.cSpace = x / c;
    this.value = null;
};
Grid.prototype.getrSpace = function(){
    return this.rSpace;
};
Grid.prototype.getcSpace = function(){
    return this.cSpace;
};
Grid.prototype.getHeight = function(){
    return this.y;
};
Grid.prototype.getWidth = function(){
    return this.x;
};
///// end of GRID OBJECT////
// initialize first grid
var startx = 300;
var starty = 187.5;
var mainGrid = new Grid (startx, starty, 0, 0);

// FOR CREATING NESTS
var new_nest_Parent_Key; // array of parent grid and key of location;


var getDeepestGridByXYCoords = function(x,y, startGrid) {
    // if value is a grid, check deeper.
    var rcCoords = startGrid.xy_to_rc(x, y);
    var key = "r" + rcCoords[0] + "c" + rcCoords[1];
    var currentGrid = startGrid;
    while (currentGrid.valueIsGrid(key)) {
        currentGrid = mainGrid.getValue(key);
        rcCoords = currentGrid.xy_to_rc(x, y);
        key = "r" + rcCoords[0] + "c" + rcCoords[1];
    }
    return [currentGrid, key]; // deepest grid in that location, and key to place nest at.
};

////////////////////////////////////////////////////////////

var html = null;  // currently selected element from content
/* Keys are rc coordinates and values are html strings. {
    r0c1: “<div>cats</div>”,
    r1c1: “<div>meow</div>”
 } */
var coordinateHash = {};

// main grid dimensions
var currentR, currentC, pixelWidth, pixelHeight, spacingR, spacingC;

// for html generator
var bits = {
    container: '<div class="container">',
    row: '<div class="row">',
    nl: '<br />',
    close: '</div>'
}

var colMaker = function(sz, span) {
    return '<div class="col-' + sz + '-' + span + '">';
}

var genMsg = "Your generated html will appear here. Configure a grid above.";
var lastGeneratedHTML = genMsg;
var keyOfBlockToNestIn = null;

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {

        if (request.action == "resetGrid") {
            mainGrid.resetGrid(startx, starty, 0, 0);
            sendResponse({data: mainGrid});
        }

        if (request.action == "getMainGrid") {
            sendResponse({data: mainGrid});
        }

        // { x: , y:  }  // where clicked on canvas
        // find the parent grid to save the nest into based on user click
        if (request.action == "saveBlockToNestInto") {
            new_nest_Parent_Key = getDeepestGridByXYCoords(request.x, request.y);
        }

        // create the new nest on the currently saved parent { r: numrows, c: numcols}
        if (request.action == "saveNewNest") {
            new_nest_Parent_Key[0].setNest(new_nest_Parent_Key[1], request.r, request.c);
        }

        //////////////////////////////////////////////////////

        // when user clicks the page in content, save the html
        if (request.action == "saveHTML") {
            html = request.data;
            sendResponse({data: request.data});
        }

        // when the user clicks in the popup, send the currently selected html to the popup
        if (request.action == "sendHTML") {
            var dataToSend = {};
            if (html) {
                dataToSend.data = html;
            } else {
                dataToSend.error = "First click an element on the page to view it's HTML.";
            }
            sendResponse(dataToSend);
        }

        // when user creates a grid, save rows/cols here
        if (request.action == "saveGridDimensions") {
            currentR = request.data.row;
            currentC = request.data.col;
            pixelWidth = request.data.width;
            pixelHeight = request.data.height;
            spacingR = request.data.height / request.data.row;
            spacingC = request.data.width / request.data.col;
            sendResponse({data: "Done"});
        }

        // retrieve rows/cols here
        if (request.action == "getRC") {
            sendResponse({data: [currentR, currentC]});
        }

        // receive coordinates, combine with current html and save in hash
        if (request.action == "updateCoordHash") {
            var key1 = "r" + request.data.x + "c" + request.data.y;
            coordinateHash[key1] = html;
            sendResponse({data: coordinateHash});
        }

        // send the coordinate hash back to the frontend
        if (request.action == "getCoordHash") {
            sendResponse({data: coordinateHash});
        }

        // clear the coordinate hash
        if (request.action == "clearCoordHash") {
            coordinateHash = {};
            sendResponse({data: coordinateHash});
        }

        // clear the last generated html
        if (request.action == "clearLastGen") {
            lastGeneratedHTML = genMsg;
            sendResponse({data: lastGeneratedHTML});
        }

        // generate and send the new html to the frontend
        if (request.action == "generateHTML") {
            var sz = request.sz || "md";
            var newHTML = "";
            var dim = [currentR, currentC];
            var rows = dim[0], cols = dim[1];
            var span = 12 / dim[1]; // number of Bootstrap columns to span across
            var key;

            // generate the html
            newHTML += bits.container;
            for (var i = 0; i < rows; i++) {
                newHTML += bits.row;
                for (var j = 0; j < cols; j++){
                    // check the hash obj
                    key = "r" + i + "c" + j;
                    newHTML += colMaker(sz, span);
                    if (coordinateHash.hasOwnProperty(key)) { // add content
                        newHTML += coordinateHash[key];
                    }
                    newHTML += bits.close;
                }
                newHTML += bits.close;
            }
            newHTML += bits.close;
            lastGeneratedHTML = newHTML;
            sendResponse({data: lastGeneratedHTML});
        }

        // send the last generated HTML (to show upon popup)
        if (request.action == "getLastGenHTML") {
            sendResponse({data: lastGeneratedHTML});
        }

        // nesting
        if (request.action == "setBlockToNest") {
            // find the block in the coordinate hash and add a nest object
            var key2 = "r" + request.rCoord + "c" + request.cCoord;
            coordinateHash[key2] = {}; // clear html, no longer string but obj
            keyOfBlockToNestIn = key2; // save its key
            // save the block's dimensions
            coordinateHash[key2].dimensionsXY = [];
            console.log("key of block to nest is", key2);
            sendResponse({data: coordinateHash});
        }

        if (request.action == "addNestedGrid") {
            console.log("request.rCoord", request.rCoord);
            coordinateHash[keyOfBlockToNestIn].numR = request.r;
            coordinateHash[keyOfBlockToNestIn].numC = request.c;
            coordinateHash[keyOfBlockToNestIn].nestedGrid = {};
            sendResponse({data: coordinateHash[keyOfBlockToNestIn]});
        }

    });

