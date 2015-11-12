chrome.extension.onMessage.addListener(function(request, sender, sendResponse){
    if(request.action == "PageInfo") {
        var pageInfo = {
            a: "hi",
            b: "hey"
        }
        sendResponse(pageInfo);
    }
});

