"use strict";

var selectedText = "";

function copySelection() {
    selectedText = window.getSelection().toString().trim();

    if (selectedText) {
        document.execCommand("Copy");
    }
}

//Add copySelection() as a listener to mouseup events.
document.addEventListener("mouseup", copySelection);

browser.runtime.onMessage.addListener(request => {
    console.log(request.greeting);
    return Promise.resolve({response: selectedText});
});