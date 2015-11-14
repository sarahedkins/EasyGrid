// DO JQUERY event listener for mouse click here.
// Send DOM element that was clicked to the background.

// Get HTML from page and send to background
$(document).click(function(event) {
    // var html = $("html").html();
    var html = event.target.outerHTML;
    chrome.runtime.sendMessage({
        action: "saveHTML",
        data: html
    });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if (request.action == "changeContent") {
        console.log("Got inside the changeContent listener in content.js.");
        console.log("request.html is", request.html);

        document.body.innerHTML = request.html;
    }
});

// TODO highlight on hover over clickable elements


