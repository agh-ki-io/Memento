
function export_data(exportData) {
    var htmlContent = [exportData];
    var bl = new Blob(htmlContent, {type: "text/html"});
    var a = document.createElement("a");
    a.href = URL.createObjectURL(bl);
    a.download = generateFileName();
    a.hidden = true;
    document.body.appendChild(a);
    a.innerHTML = "";
    a.click();
}

function export_notes() {
    browser.storage.local.get()
        .then((result) => {
            export_data([JSON.stringify(result)])
        }, onError);
}

function generateFileName() {
    var base = "export-";
    var exstension = ".json";
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = mm + '/' + dd + '/' + yyyy;
    return base + today + exstension;
}

function onError(error) {
    console.log(error);
}

document.querySelector('.export').addEventListener('click', export_notes);