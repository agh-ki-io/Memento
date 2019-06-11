/* initialise variables */
const newFragmentMarker = "- ";
const delimeter = "\n";
const settingsKey = 'settings@marker';
const formatKey = 'settings@format';
const reservedKeys = [settingsKey, formatKey];

const wrap = (str) => newFragmentMarker + str;

var inputTitle = document.querySelector('.new-note input');
var inputBody = document.querySelector('.new-note textarea');
var inputSelector = document.querySelector('.selector');

var noteContainer = document.querySelector('.note-container');

var clearBtn = document.querySelector('.clear');
var resetBtn = document.querySelector('.reset');
var addBtn = document.querySelector('.add');

/*  add event listeners to buttons */

addBtn.addEventListener('click', addNote);
resetBtn.addEventListener('click', reset);
clearBtn.addEventListener('click', clearAll);
inputSelector.addEventListener('input', selectNotes);

/* generic error handler */
function onError(error) {
    console.log(error);
}

/* display previously-saved stored notes on startup */

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
            var content;
            if (response.selected.length !== 1) {
                content = response.selected
                    .map((a) => wrap(a))
                    .join(delimeter);
            } else {
                content = response.selected[0];
            }
            document.getElementById('textarea').value = content;
            document.getElementById('title').value = response.title;
            lastSelectedTextData = response;
        }).catch(onError);
    }
}

function reset() {
    browser.tabs.query({
        currentWindow: true,
        active: true
    }).then(tabs => {
        for (let tab of tabs) {
            browser.tabs.sendMessage(
                tab.id,
                {type: "resetSelectedText"}
            )
        }
        document.getElementById('textarea').value = "";
    }).catch(onError);
}

/* Add a note to the display, and storage */

//okazuje sie ze klucz musi byc unikatowy
function addNote() {
    var noteTitle = inputTitle.value;
    var noteBody = lastSelectedTextData;
    var gettingItem = browser.storage.local.get(noteTitle);
    gettingItem.then((result) => {
        var objTest = Object.keys(result);
        if (objTest.length < 1 && noteTitle !== '' && noteBody !== '') {
            inputTitle.value = '';
            inputBody.value = '';
            storeNote(noteTitle, noteBody);
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
    var copyBtn = document.createElement('button');
    var editBtn = document.createElement('button');
    var injectNoteBtn = document.createElement('button');
    var clipboardNoteBtn = document.createElement('button');
    var clearFix = document.createElement('div');

    note.setAttribute('class', 'note');

    noteH.textContent = title;
    notePara.textContent = body.selected;
    deleteBtn.setAttribute('class', 'delete');
    deleteBtn.textContent = 'Delete note';
    editBtn.setAttribute('class', 'edit');
    editBtn.textContent = 'Edit note';
    copyBtn.setAttribute('class', 'copy');
    copyBtn.textContent = 'Clipboard';
    injectNoteBtn.setAttribute('class','injectNote');
    injectNoteBtn.textContent = 'Inject';
    clearFix.setAttribute('class', 'clearfix');

    noteDisplay.appendChild(noteH);
    noteDisplay.appendChild(notePara);
    noteDisplay.appendChild(editBtn);
    noteDisplay.appendChild(copyBtn);
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

    copyBtn.addEventListener('click', (e) => {
        var noteSt = browser.storage.local.get(noteH.textContent);
        var noteParametersSt = browser.storage.local.get(formatKey);
        noteSt.then((note) => {
                noteParametersSt.then((noteParameters) => {
                        const formattedNote = noteWithChosenParameters(note[noteH.textContent], noteH.textContent, noteParameters[formatKey]);
                        updateClipboard(formattedNote);
                    }
                );
            }
        );
    });

    injectNoteBtn.addEventListener('click', (e) => {
        var noteSt = browser.storage.local.get(noteH.textContent);
        var noteParametersSt = browser.storage.local.get(formatKey);
        noteSt.then((note) => {
                noteParametersSt.then((noteParameters) => {
                        const formattedNote = noteWithChosenParameters(note[noteH.textContent], noteH.textContent, noteParameters[formatKey]);
                        updateClipboard(formattedNote);
                    }
                );
            }
        );
    });

    // let importBtn = document.querySelector('.import');

    injectNoteBtn.addEventListener("click", injectNote);

    function injectNote() {
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
        noteTitleEdit.value = title;
        noteBodyEdit.value = body;
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
    console.log(noteBody);
    for(let parametr of noteParameters){
        console.log(parametr);
        if(parametr.localeCompare("content") == 0){
            formattedNote += "Note:\n";
            for(let line of noteBody["selected"]){
                formattedNote += '  - ';
                formattedNote += line.toString();
                formattedNote += '\n';
            }
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
    console.log(formattedNote);
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
    browser.storage.local.clear();
}

function htmlCode() {
    return '<head>' +
        document.getElementsByTagName('head')[0].innerHTML +
        '</head><body>' +
        document.body.innerHTML +
        '</body>';
}
