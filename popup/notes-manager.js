/* initialise variables */
const newFragmentMarker = "- ";
const delimeter = "\n";
const settingsKey = 'settings@marker';
const formatKey = 'settings@format';
const templateKey = 'template@format';
const reservedKeys = [settingsKey, formatKey, templateKey];

const forbidden_pages = [
    "accounts-static.cdn.mozilla.net",
    "accounts.firefox.com",
    "addons.cdn.mozilla.net",
    "addons.mozilla.org",
    "api.accounts.firefox.com",
    "content.cdn.mozilla.net",
    "content.cdn.mozilla.net",
    "discovery.addons.mozilla.org",
    "input.mozilla.org",
    "install.mozilla.org",
    "oauth.accounts.firefox.com",
    "profile.accounts.firefox.com",
    "support.mozilla.org",
    "sync.services.mozilla.com",
    "testpilot.firefox.com",
    "about:"
];

const wrap = (str) => newFragmentMarker + str;

var noteContaineDisplayNoneIsOn = true;


var inputTitle = document.querySelector('.new-note input');
var inputBody = document.querySelector('.new-note textarea');
var inputSelector = document.querySelector('.selector');

var noteContainer = document.querySelector('.note-container');

var clearBtn = document.querySelector('.clear');
var resetBtn = document.querySelector('.reset');
var addBtn = document.querySelector('.add');

/*  add event listeners to buttons */

addBtn.addEventListener('click', addNote);
resetBtn.addEventListener('click', resetTemplate);
clearBtn.addEventListener('click', clearAll);
inputSelector.addEventListener('input', selectNotes);
inputBody.addEventListener('input', saveTemplate);
inputTitle.addEventListener('input', saveTemplate);
/* generic error handler */
function onError(error) {
    console.log(error);
}

/* display previously-saved stored notes on startup */

function saveTemplate() {
    browser.storage.local.set({[templateKey]: {
        title: document.getElementById('title').value,
        content: document.getElementById('textarea').value
    }});
}

initialize();

function initialize() {
    var gettingAllStorageItems = browser.storage.local.get(null);
    gettingAllStorageItems.then((results) => {
        var noteKeys = Object.keys(results);
        for (let noteKey of noteKeys) {
            var curValue = results[noteKey];
            displayNote(noteKey, curValue);
        }
    }, onError);

    browser.tabs.query({
        currentWindow: true,
        active: true
    }).then(sendMessageToTabs).catch(onError);
}

var lastSelectedTextData = {};

function sendMessageToTabs(tabs) {
    for (let tab of tabs) {
        browser.tabs.sendMessage(
            tab.id,
            {type: "getSelectedText"}
        ).then(response => {
            var gettingItem = browser.storage.local.get(templateKey);
            gettingItem.then((result) => {
                var content = "";
                var title = "";
                if (result[templateKey] !== undefined && result[templateKey].content !== undefined && result[templateKey].content !== null && result[templateKey].content.length > 0) {
                    content = result[templateKey].content;
                    if (response.selected.length>0) {
                        content += delimeter;
                    }
                }
                if (result[templateKey] !== undefined && result[templateKey].title !== undefined && result[templateKey].title !== null && result[templateKey].title.length > 0) {
                    title = result[templateKey].title;
                }else {
                    title = response.title;
                }
                if (response.selected.length>0){
                    content += response.selected;
                }
                document.getElementById('textarea').value = content;
                document.getElementById('title').value = title;
                saveTemplate();
                lastSelectedTextData = response;
            }, onError);
        }).catch(onError);
    }
}

function resetTemplate() {
    inputTitle.value = '';
    inputBody.value = '';
    saveTemplate();
}

/* Add a note to the display, and storage */

//okazuje sie ze klucz musi byc unikatowy
function addNote() {

    // showDisplayOfNotes();

    var noteTitle = inputTitle.value;
    var noteBody = lastSelectedTextData;
    noteBody.selected = inputBody.value;
    noteBody.title = inputTitle.value;
    var gettingItem = browser.storage.local.get(noteTitle);
    gettingItem.then((result) => {
        var objTest = Object.keys(result);
        if (objTest.length < 1 && noteTitle !== "" && noteBody.selected !== "") {
            storeNote(noteTitle, noteBody);
            resetTemplate();
        }else{
            if (noteTitle === ""){
                browser.notifications.create({
                    "type":"basic",
                    "title":"Error",
                    "iconUrl": "icons/exclamation.png",
                    "message": "Title is empty"
                });
            }else if (noteBody.selected === ""){
                browser.notifications.create({
                    "type":"basic",
                    "title":"Error",
                    "iconUrl": "icons/exclamation.png",
                    "message": "Content is empty"
                });
            }else{
                browser.notifications.create({
                    "type":"basic",
                    "title":"Error",
                    "iconUrl": "icons/exclamation.png",
                    "message": "There is already a note with this title: " + inputTitle.value
                });
            }

        }
    }, onError);
}

/* function to store a new note in storage */

function storeNote(title, body) {
    var storingNote = browser.storage.local.set({[title]: body});
    storingNote.then(() => {
        displayNote(title, body);
    }, onError);
}

/* function copy to clipboard */

function updateClipboard(newClip) {
    navigator.clipboard.writeText(newClip).then(function() {
        /* clipboard successfully set */
    }, function() {
        console.error("Error update clipboard")
    });
}

/* function to display a note in the note box */

function displayNote(title, body) {

    /* don't display settings as note */
    if (reservedKeys.includes(title)) {
        return;
    }

    /* create note display box */
    var note = document.createElement('div');
    var noteDisplay = document.createElement('div');
    var noteH = document.createElement('h2');
    var notePara = document.createElement('p');

    var deleteBtn = document.createElement('button');
    var clibboardBtn = document.createElement('button');
    var editBtn = document.createElement('button');
    var injectNoteBtn = document.createElement('button');
    var clearFix = document.createElement('div');

    note.setAttribute('class', 'note');

    noteH.textContent = title;
    notePara.textContent = body.selected;
    deleteBtn.setAttribute('class', 'delete');
    deleteBtn.textContent = 'Delete note';
    editBtn.setAttribute('class', 'edit');
    editBtn.textContent = 'Edit note';
    clibboardBtn.setAttribute('class', 'copy');
    clibboardBtn.textContent = 'Clipboard';
    injectNoteBtn.setAttribute('class','injectNote');
    injectNoteBtn.textContent = 'Inject';
    clearFix.setAttribute('class', 'clearfix');

    noteDisplay.appendChild(noteH);
    noteDisplay.appendChild(notePara);
    noteDisplay.appendChild(editBtn);
    noteDisplay.appendChild(clibboardBtn);
    noteDisplay.appendChild(deleteBtn);
    noteDisplay.appendChild(injectNoteBtn);
    noteDisplay.appendChild(clearFix);

    note.appendChild(noteDisplay);

    /* set up listener for the delete functionality */

    deleteBtn.addEventListener('click', (e) => {
        const evtTgt = e.target;
        evtTgt.parentNode.parentNode.parentNode.removeChild(evtTgt.parentNode.parentNode);
        browser.storage.local.remove(title);
    });

    editBtn.addEventListener('click', (e) => {
        noteDisplay.style.display = 'none';
        noteEdit.style.display = 'block';
    });

    clibboardBtn.addEventListener('click', (e) => {
        var noteSt = browser.storage.local.get(noteH.textContent);
        var noteParametersSt = browser.storage.local.get(formatKey);
        noteSt.then((note) => {
                noteParametersSt.then((noteParameters) => {
                        const formattedNote = noteWithChosenParameters(note[noteH.textContent], noteH.textContent, noteParameters[formatKey]);
                        updateClipboard(formattedNote);
                        browser.notifications.create({
                            "type":"basic",
                            "title":"Info",
                            "message": "Note injected to clipboard"
                        });
                    }
                );
            }
        );
    });

    // let importBtn = document.querySelector('.import');

    injectNoteBtn.addEventListener("click", (e) => {
        // if(forbidden_pages.filter(page => window.location.includes(page)).length != 0){
        //     browser.notifications.create({
        //         "type":"basic",
        //         "title":"Error",
        //         "iconUrl": "icons/exclamation.png",
        //         "message": "Cant inject note on this website"
        //     });
        //     return;
        // }
        var noteSt = browser.storage.local.get(noteH.textContent);
        var noteParametersSt = browser.storage.local.get(formatKey);
        noteSt.then((note) => {
                noteParametersSt.then((noteParameters) => {
                        const formattedNote = noteWithChosenParameters(note[noteH.textContent], noteH.textContent, noteParameters[formatKey]);
                        browser.tabs.query({
                            currentWindow: true,
                            active: true
                        }).then((tabs) => injectNoteFromActiveTab(tabs, formattedNote)).catch(onError);
                    }
                );
            }
        );
    });

    function injectNoteFromActiveTab(tabs, content) {
        for (let tab of tabs) {
            if(forbidden_pages.filter(page => tab.url.includes(page)).length == 0) {
                browser.tabs.sendMessage(
                    tab.id,
                    {
                        type: "importNote",
                        content: content
                    }
                )
            }
            else{
                browser.notifications.create({
                    "type":"basic",
                    "title":"Error",
                    "iconUrl": "icons/exclamation.png",
                    "message": "Can't inject note on this website"
                });
            }
        }
    }

    /* create note edit box */
    var noteEdit = document.createElement('div');
    var noteTitleEdit = document.createElement('input');
    var noteBodyEdit = document.createElement('textarea');
    var clearFix2 = document.createElement('div');

    var updateBtn = document.createElement('button');
    var cancelBtn = document.createElement('button');

    updateBtn.setAttribute('class', 'btn update');
    updateBtn.textContent = 'Update note';
    cancelBtn.setAttribute('class', 'btn cancel');
    cancelBtn.textContent = 'Cancel update';

    noteEdit.appendChild(noteTitleEdit);
    noteTitleEdit.value = title;
    noteEdit.appendChild(noteBodyEdit);
    noteBodyEdit.textContent = body.selected;
    noteEdit.appendChild(updateBtn);
    noteEdit.appendChild(cancelBtn);

    noteEdit.appendChild(clearFix2);
    clearFix2.setAttribute('class', 'clearfix');

    note.appendChild(noteEdit);

    noteContainer.appendChild(note);
    noteEdit.style.display = 'none';

    /* set up listeners for the update functionality */

    noteH.addEventListener('click', () => {
        noteDisplay.style.display = 'none';
        noteEdit.style.display = 'block';
    });

    notePara.addEventListener('click', () => {
        noteDisplay.style.display = 'none';
        noteEdit.style.display = 'block';
    });

    cancelBtn.addEventListener('click', () => {
        noteDisplay.style.display = 'block';
        noteEdit.style.display = 'none';
    });

    updateBtn.addEventListener('click', () => {
        if (noteTitleEdit.value !== title || noteBodyEdit.value !== body) {
            updateNote(title, noteTitleEdit.value, noteBodyEdit.value);
            note.parentNode.removeChild(note);
        }
    });
}

function noteWithChosenParameters(noteBody, noteTitle, noteParameters){
    var formattedNote = "";
    for(let parametr of noteParameters){
        if(parametr.localeCompare("content") == 0){
            formattedNote += "Note:\n";
            formattedNote += '  ';
            formattedNote += noteBody["selected"];
            formattedNote += '\n';
        }
        else{
            if(parametr.localeCompare("title") == 0){
                formattedNote +="Title:\n"
            }
            else if(parametr.localeCompare("date") == 0){
                formattedNote +="Date:\n"
            }
            formattedNote += '  ';
            formattedNote += noteBody[parametr.toString()];
            formattedNote += '\n';
        }
    }
    return formattedNote;
}

/* function to update notes */


function updateNote(oldTitle, newTitle, newSelected) {
    var storedNote = browser.storage.local.get(oldTitle);
    storedNote.then((note) => {
        if (note.newSelected !== note[oldTitle]) {
            note[oldTitle].selected = newSelected
        }
        var title = oldTitle;
        if (note.title !== newTitle) {
            title = newTitle;
            var removingNote = browser.storage.local.remove(oldTitle);
            removingNote.then(() => {
            }, onError);
        }
        var updatedNote = browser.storage.local.set({[title]: note[oldTitle]});
        updatedNote.then(() => {
            displayNote(title, note[oldTitle]);
            selectNotes();
        })
    })
};

function selectNotes() {
    hideNotes();
    var selector = inputSelector.value;
    var gettingItems = browser.storage.local.get();
    gettingItems.then((result) => {
        Object.keys(result).forEach(function (key) {
            if (titleMatch(selector, key)) {
                displayNote(key, result[key]);
            }
        });
    }, onError);
}

function titleMatch(title, noteTitle) {
    return noteTitle.toLowerCase().includes(title.toLowerCase());
}

/* Clear all notes from the display/storage */

function hideNotes() {
    while (noteContainer.firstChild) {
        noteContainer.removeChild(noteContainer.firstChild);
    }

}

function clearAll() {
    hideNotes();
    browser.storage.local.get(formatKey).then((noteParameters) => {
        browser.storage.local.get(settingsKey).then((settings) => {
            browser.storage.local.clear().then((r) => {
                browser.storage.local.set({[formatKey]: noteParameters[formatKey]}).then((a) => {
                    browser.storage.local.set({[settingsKey]: settings[settingsKey]});
                });
            });
        });
    });
    // hideNotesDisplay()

}

function htmlCode() {
    return '<head>' +
        document.getElementsByTagName('head')[0].innerHTML +
        '</head><body>' +
        document.body.innerHTML +
        '</body>';
}

function showDisplayOfNotes() {
    if (noteContaineDisplayNoneIsOn) {
        noteContaineDisplayNoneIsOn = false;
        document.getElementById("note-container").style.display = '';
    }
}

function hideNotesDisplay() {
    if (!noteContaineDisplayNoneIsOn) {
        noteContaineDisplayNoneIsOn = true;
        document.getElementById("note-container").style.display = 'none';
    }
}
