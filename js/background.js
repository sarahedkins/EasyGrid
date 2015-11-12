chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {

        if (request.action == "getHTML") {
            console.log("The HTML for this page is:", request.data);
            sendResponse({data: request.data});
        }

    });
