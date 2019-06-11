
const settingsKey = 'settings@marker';

document.querySelector('.set').addEventListener('click', validateMark);

browser.storage.local.get(settingsKey).then(function (result) {
    document.getElementById("marker").value = result[settingsKey];
});


function validateMark() {

    var marker = document.getElementById("marker").value;

    if (marker === "") {
        alert("Marker must be filled out");
        return;
    }
    browser.storage.local.set({[settingsKey]: marker});
}
