const coll = document.getElementsByClassName("collapsible");
let i;

const formatKey = 'settings@format';
const possibleAttributes = [
    {
        name: "title",
        text: "Page Title"
    },
    {
        name: "date",
        text: "Date"
    },
    {
        name: "content",
        text: "Content"
    }
];

function createSlide(title, checkboxValue, elementText) {
    const slides = document.getElementsByClassName("slides")[0];
    let checkbox = document.createElement('input');
    let text = document.createElement('span');
    checkbox.setAttribute('type', 'checkbox');
    checkbox.setAttribute('id', title);
    checkbox.checked = checkboxValue;
    text.setAttribute('class', 'checkbox-text');
    text.textContent = elementText;
    let li = document.createElement('li');
    li.setAttribute('class', 'slide');
    li.appendChild(checkbox);
    li.appendChild(text);
    slides.appendChild(li);
}

browser.storage.local.get(formatKey)
    .then((r) => {
            console.log(r[formatKey]);
            for (const index in r[formatKey]) {
                let attribute = r[formatKey][index];
                possibleAttributes
                    .filter(attr => attr.name == attribute)
                    .forEach(attr =>
                        createSlide(attr.name, true, attr.text)
                    )
            }
            for (let index in possibleAttributes) {
                let attribute = possibleAttributes[index];
                if (!r[formatKey].includes(attribute.name)) {
                    createSlide(attribute.name, false, attribute.text)
                }
            }
        }
    );

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

function setNoteParameters(noteParameters){
    // console.log("siema");
    browser.storage.local.set({[formatKey]: noteParameters}).then((r)=> {
        // browser.storage.local.get(formatKey).then(function (result) {
        //     console.log(result[formatKey]);
        // });
    })
}
