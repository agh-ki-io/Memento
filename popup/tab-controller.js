document.getElementById("nav-button").addEventListener("click", function () {
    console.log("s");
    document.getElementById("sidenav").style.width = "200px";
});

document.getElementById("closebtn").addEventListener("click", function () {
    document.getElementById("sidenav").style.width = "0";
});