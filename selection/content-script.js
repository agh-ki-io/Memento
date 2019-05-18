var selectedTextArray = [];

function copySelection() {
    var selectedText = window.getSelection().toString().trim();
    if (selectedText) {
        if (selectedText.length > 1) {
            selectedTextArray.push(selectedText)
        }
        // document.execCommand("Copy"); // unnecessary
    }
}

document.addEventListener("mouseup", copySelection);

browser.runtime.onMessage.addListener(request => {
    switch (request.type) {
        case "resetSelectedText":
            selectedTextArray = [];
            break;
        case "importNote":
            console.log(request);
            importNote(request);
            break;
        case 'getSelectedText':
            return Promise.resolve({
                title: document.title,
                url: window.location.href,
                date: window.Date(),
                selected: selectedTextArray,
                // html:
                //     '<head>' +
                //         document.getElementsByTagName('head')[0].innerHTML +
                //     '</head>' +
                //     '<body>' +
                //         document.body.innerHTML +
                //     '</body>',
                // htmlNode : window.getSelection().anchorNode.parentElement.outerHTML,
            });
        default:
            console.error("Illegal request");
    }
});

let content;

function importNote(request) {
    content = request.content;
    inputElement.click();
}

var inputElement = document.createElement("input");
inputElement.type = "file";
inputElement.className = "import";
inputElement.hidden = true;
document.body.appendChild(inputElement);

inputElement.addEventListener("change", handlePicked, false);

function handlePicked() {

    displayFile(this.files);
}

function displayFile(fileList) {

    var text;
    var file = fileList[0];
    var fr = new FileReader();
    fr.onload = function (e) {
        console.log(e.target["result"]);
        const fileName = "test.txt";
        // console.log(inputElement.value.split("/").pop());
        text = e.target["result"];
        var htmlContent = [text + content];
        var bl = new Blob(htmlContent, {type: "text/html"});
        var a = document.createElement("a");
        a.href = URL.createObjectURL(bl);
        a.download = fileName;
        a.hidden = true;
        document.body.appendChild(a);
        a.innerHTML = "something random - nobody will see this, it doesn't matter what you put here";
        a.click();
    };
    fr.readAsText(file);
}