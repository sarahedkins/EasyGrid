console.log("Background is running...");

var html = null;
var currentRC = [];
var coordinateHash = {};   /* Keys are rc coordinates and values are html strings.
 { r0c1: “<div>cats</div>”, r1c1: “<div>meow</div>” } */

// for generator
var bits = {
    container: '<div class="container">',
    row: '<div class="row">',
    nl: '<br />',
    close: '</div>'
}

var colMaker = function(sz, span) {
    console.log("in colMaker, sz " + sz, ", span: " + span);
    return '<div class="col-' + sz + '-' + span + '"></div>';
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {

        // when user clicks the page in content, save the html
        if (request.action == "saveHTML") {
            console.log("The HTML for this page is:", request.data);
            html = request.data;
            console.log("html in bg is now", html);
            sendResponse({data: request.data});
        }

        // when the user clicks in the popup, send the html to the popup
        if (request.action == "sendHTML") {
            console.log("Received request for HTML in bg.");
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
            console.log("Received request to save row/col in bg.");
            currentRC[0] = request.data.row;
            currentRC[1] = request.data.col;
            sendResponse({data: "Successfully saved row/col values in bg."});
        }

        // when user creates a grid, save rows/cols here
        if (request.action == "getRC") {
            console.log("Received request to send row/col from bg.");
            sendResponse({data: currentRC});
        }

        // receive coordinates, combine with current html and save in hash
        if (request.action == "updateCoordHash") {
            console.log("Received request to store coordinates in bg.");
            var key = "r" + request.data.x + "c" + request.data.y;
            coordinateHash[key] = html;
            sendResponse({data: coordinateHash});
        }

        // send the coordinate hash back to the frontend
        if (request.action == "getCoordHash") {
            console.log("Received request to send coordinates from bg.");
            sendResponse({data: coordinateHash});
        }

        // generate and send the new html to the frontend
        if (request.action == "generateHTML") {
            console.log("Received request to generate html");
            var sz = "lg";
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
                    console.log("i is", i, "j is", j);
                    console.log("key is", key);
                    console.log("coordinateHash is", coordinateHash);
                    if (coordinateHash.hasOwnProperty(key)) {
                        console.log("coordinateHash[key]", coordinateHash[key]);
                        console.log("appending the user's content!");
                        newHTML += coordinateHash[key];
                    }
                    newHTML += colMaker(sz, span);
                }
                newHTML += bits.close;
            }
            newHTML += bits.close;
            sendResponse({data: newHTML});
        }

    });

