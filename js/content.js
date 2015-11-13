// DO JQUERY event listener for mouse click here.
// Send DOM element that was clicked to the background.

// user clicks the page, html is saved in background
$(document).click(function() {
    var html = $("html").html();
    // Get HTML from page and send to background
    chrome.runtime.sendMessage({
        action: "saveHTML",
        data: html
    });
});





