console.log("Background is running...");

var html = null;
var currentRC = [];

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

    });

