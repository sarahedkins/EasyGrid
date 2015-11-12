console.log("background");

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {

        if (request.action == "start") {
            console.log("got in the START action (in bg)");
            sendResponse({msg: "The ext has started. This came from the background listener."});
        }

    });
