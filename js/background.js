console.log("Background is running...");

var html = null;  // currently selected element from content
var currentRC = [];

/* Keys are rc coordinates and values are html strings. {
    r0c1: “<div>cats</div>”,
    r1c1: “<div>meow</div>”
 } */
var coordinateHash = {};

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

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {

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
        if (request.action == "gridRC") {
            currentRC[0] = request.data.row;
            currentRC[1] = request.data.col;
            sendResponse({data: "Successfully saved row/col values in bg."});
        }

        // when user creates a grid, save rows/cols here
        if (request.action == "getRC") {
            sendResponse({data: currentRC});
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
            var dim = currentRC;
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

    });

