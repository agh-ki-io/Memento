
// TO DO
// use as inject
// const inputElement = document.getElementById("input");
// inputElement.addEventListener("change", handlePicked, false);

function handlePicked() {
    displayFile(this.files);
}

function displayFile(fileList) {
    var text;
    var file = fileList[0];
    var fr = new FileReader();
    fr.onload = function(e) {
        console.log(e.target["result"])
        text = e.target["result"];
    };
    fr.readAsText(file);

    browser.tabs.executeScript({
        file: "/content_scripts/content.js"
    }).then(messageContent)
        .catch(reportError);
}