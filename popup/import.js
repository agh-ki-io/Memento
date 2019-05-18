
var importBtn = document.querySelector('.import');

importBtn.addEventListener("click", sendMessage);

function handlePicked() {
    displayFile(this.files);
}

function displayFile(fileList) {
    var text;
    var file = fileList[0];
    var fr = new FileReader();
    fr.onload = function(e) {
        console.log(e.target["result"]);
        text = e.target["result"];
    };
    fr.readAsText(file);
}

function sendMessage() {
    browser.tabs.query({
        currentWindow: true,
        active: true
    }).then(sendMessageToTabs).catch(onError);


    function sendMessageToTabs(tabs) {
        for (let tab of tabs) {
            browser.tabs.sendMessage(
                tab.id,
                {type: "importNote",
                content: "content of file"}
            )
        }
    }
}
