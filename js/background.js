console.log("Background is running...");

var html = null;

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {

        // when user clicks the page in content, save the html
        if (request.action == "saveHTML") {
            console.log("The HTML for this page is:", request.data);
            html = request.data;
            console.log("html in bg is now", html);
            sendResponse({data: request.data});
        }

        // TODO - do multiple events in one handler work?
        // Does this response get sent to the popup/view?
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

    });

