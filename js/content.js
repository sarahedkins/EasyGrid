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

//$(document).click(function() {
//    alert("Clicked!! this is", this);
//    var html = $(this).html();
//    chrome.runtime.sendMessage({
//        action: "saveHTML",
//        data: html
//    });
//});



