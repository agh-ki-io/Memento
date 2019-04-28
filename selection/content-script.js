var selectedTextArray = [];

function copySelection() {
    var selectedText = window.getSelection().toString().trim();
    if (selectedText) {
        if(selectedText.length > 1){
            selectedTextArray.push(selectedText)
        }
        document.execCommand("Copy");
    }
}

document.addEventListener("mouseup", copySelection);

browser.runtime.onMessage.addListener(request => {
    switch (request.type) {
        case "resetSelectedText":
            selectedTextArray = [];
            break;
        case 'getSelectedText':
            return Promise.resolve({title: document.title, url: window.location.href, selected: selectedTextArray});
        default:
            console.error("Illegal request");
    }
});