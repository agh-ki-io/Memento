
function importFile() {
    var file = document.getElementById("input").files[0];
    console.log(file.size);
}

function onError(error) {
    console.log(error);
}
