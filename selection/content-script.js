var output=[];

function copySelection() {
    var selectedText = window.getSelection().toString().trim();
    if(selectedText.trim()!==""){
        output.push(selectedText)
    }
    if (selectedText) {
        document.execCommand("Copy");
    }
}

document.addEventListener("mouseup", copySelection);

browser.runtime.onMessage.addListener(request => {
    console.log(request.greeting);
    return Promise.resolve({response: output});
});