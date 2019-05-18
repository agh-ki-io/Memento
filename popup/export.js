var exportBtn = document.querySelector('.export');
var exportData = fetchData();

exportBtn.addEventListener('click', export_notes);

function export_notes() {
    var htmlContent = [exportData];
    var bl = new Blob(htmlContent, {type: "text/html"});
    var a = document.createElement("a");
    a.href = URL.createObjectURL(bl);
    a.download = generateFileName();
    a.hidden = true;
    document.body.appendChild(a);
    a.innerHTML = "something random - nobody will see this, it doesn't matter what you put here";
    a.click();
}

function fetchData() {
    var data = [];
    browser.storage.local.get()
        .then((result) => {
            data.push(JSON.stringify(result))
        }, onError);
    return data;
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