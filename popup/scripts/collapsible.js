const coll = document.getElementsByClassName("collapsible");
let i;

for (i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function () {
        this.classList.toggle("active");
        const content = this.nextElementSibling;
        if (content.style.display === "block") {
            content.style.display = "none";
        } else {
            content.style.display = "block";
        }
    });
}

$(".slides").sortable({
    placeholder: 'slide-placeholder',
    axis: "y",
    revert: 150,
    start: function (e, ui) {

        placeholderHeight = ui.item.outerHeight();
        ui.placeholder.height(placeholderHeight + 15);
        $('<div class="slide-placeholder-animator" data-height="' + placeholderHeight + '"></div>').insertAfter(ui.placeholder);

    },
    change: function (event, ui) {

        ui.placeholder.stop().height(0).animate({
            height: ui.item.outerHeight() + 15
        }, 300);

        placeholderAnimatorHeight = parseInt($(".slide-placeholder-animator").attr("data-height"));

        $(".slide-placeholder-animator").stop().height(placeholderAnimatorHeight + 15).animate({
            height: 0
        }, 300, function () {
            $(this).remove();
            placeholderHeight = ui.item.outerHeight();
            $('<div class="slide-placeholder-animator" data-height="' + placeholderHeight + '"></div>').insertAfter(ui.placeholder);
        });

    },
    stop: function (e, ui) {

        $(".slide-placeholder-animator").remove();

    },
});

const slides = document.getElementsByClassName("slides");
const saveBtn = document.getElementById("saveNoteParameters");

saveBtn.addEventListener('click', function(){

    var lis = slides[0].getElementsByTagName("li");
    var noteParameters = [];
    for(let li of lis){
        var input = li.getElementsByTagName("input")[0];
        if(input.checked){
            var id = input.getAttribute("id");
            noteParameters.push(id);
        }
    }
    console.log(noteParameters);
    setNoteParameters(noteParameters);
});

const formatKey = 'settings@format';

function setNoteParameters(noteParameters){
    // console.log("siema");
    browser.storage.local.set({[formatKey]: noteParameters}).then((r)=> {
        // browser.storage.local.get(formatKey).then(function (result) {
        //     console.log(result[formatKey]);
        // });
    })
}
