let importBtn = document.querySelector('.import');

importBtn.addEventListener("click", injectNote);

function injectNote() {
    let content = "ala ma kota";
    browser.tabs.query({
        currentWindow: true,
        active: true
    }).then((tabs) => injectNoteFromActiveTab(tabs, content)).catch(onError);
}

function injectNoteFromActiveTab(tabs, content) {
    for (let tab of tabs) {
        browser.tabs.sendMessage(
            tab.id,
            {
                type: "importNote",
                content: content
            }
        )
    }
}