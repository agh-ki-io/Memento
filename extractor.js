
var clickHandler = function(clickData) {

    alert(clickData.selectionText)

};

chrome.contextMenus.create({
    id: "Memento",
    title: "Memento",
    contexts: ["selection"],
});

chrome.contextMenus.onClicked.addListener(clickHandler);

