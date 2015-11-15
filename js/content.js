// Get HTML from content page and send to background
$(document).click(function(event) {
    // var html = $("html").html();
    var html = event.target.outerHTML;
    chrome.runtime.sendMessage({
        action: "saveHTML",
        data: html
    });
});

// update the view with newly generated HTML
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if (request.action == "changeContent") {
        console.log("ChangeContent recieved the message. req is", request);
        document.body.innerHTML = request.html;
        sendResponse({data: request.html});
    }
});

// TODO highlight on hover over clickable elements


