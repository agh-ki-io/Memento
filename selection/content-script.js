var selectedText = "";

function copySelection() {
    selectedText = window.getSelection().toString().trim();
    /*
    if (selectedText) {
        if (selectedText.length > 1) {
            selectedTextArray.push(selectedText)
        }
        // document.execCommand("Copy"); // unnecessary
    }
     */
}

document.addEventListener("mouseup", copySelection);

browser.runtime.onMessage.addListener(request => {
    switch (request.type) {
        case "importNote":
            // console.log(request);
            importNote(request);
            break;
        case 'getSelectedText':
            return Promise.resolve({
                title: document.title,
                url: window.location.href,
                date: window.Date(),
                selected: selectedText,
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
    var marker;
    var file = fileList[0];
    var fr = new FileReader();
    fr.onload = function (e) {
        const fileName = "test.txt";
        text = e.target["result"];
        var htmlContent = [text.replace(marker,content+marker)];
        var bl = new Blob(htmlContent, {type: "text/html"});
        var a = document.createElement("a");
        a.href = URL.createObjectURL(bl);
        a.download = fileName;
        a.hidden = true;
        document.body.appendChild(a);
        a.innerHTML = "something random - nobody will see this, it doesn't matter what you put here";
        a.click();
    };
    browser.storage.local.get("settings@marker")
        .then((result) => {
            marker = result["settings@marker"];
            fr.readAsText(file);
            }
        );
}
