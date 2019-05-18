


function handlePicked() {
    importFile(this.files);
}

function importFile(fileList) {
    var text;
    var file = fileList[0];
    var fr = new FileReader();
    fr.onload = function(e) {
        text = e.target["result"];
        var parser = JSON.parse(text);
        //browser.storage.local.clear();
        browser.storage.local.set(parser);
        console.log(parser)
    };
    fr.readAsText(file);
}

document.getElementById("input").addEventListener("change", handlePicked, false);