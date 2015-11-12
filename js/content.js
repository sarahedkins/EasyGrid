// DO JQUERY event listener for mouse click here.
// Send DOM element that was clicked to the background.

//$( document ).ready(function() {
//    console.log("document is ready (from content)");
//    // send a message to background which sends msg to popup
//    chrome.runtime.sendMessage("content", function(response){
//
//    });
//
//});

window.addEventListener("load", function() {
    chrome.extension.sendMessage({
        type: "dom-loaded",
        data: {
            myProperty: "value"
        }
    });
}, true);


