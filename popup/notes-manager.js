/* initialise variables */
const newFragmentMarker = "- ";
const delimeter = "\n";

const wrap = (str) => newFragmentMarker + str;

var inputTitle = document.querySelector('.new-note input');
var inputBody = document.querySelector('.new-note textarea');
var inputSelector = document.querySelector('.selector');

var noteContainer = document.querySelector('.note-container');

var clearBtn = document.querySelector('.clear');
var resetBtn = document.querySelector('.reset');
var addBtn = document.querySelector('.add');
var selectorBtn = document.querySelector('.select');

/*  add event listeners to buttons */

addBtn.addEventListener('click', addNote);
resetBtn.addEventListener('click', reset);
clearBtn.addEventListener('click', clearAll);
selectorBtn.addEventListener('click', selectNotes);

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

/* function to display a note in the note box */

function displayNote(title, body) {

    /* create note display box */
    var note = document.createElement('div');
    var noteDisplay = document.createElement('div');
    var noteH = document.createElement('h2');
    var notePara = document.createElement('p');
    var deleteBtn = document.createElement('button');
    var clearFix = document.createElement('div');

    note.setAttribute('class', 'note');

    noteH.textContent = title;
    // notePara.textContent = JSON.stringify(body);
    notePara.textContent = body.selected;
    // notePara.textContent = body;
    deleteBtn.setAttribute('class', 'delete');
    deleteBtn.textContent = 'Delete note';
    clearFix.setAttribute('class', 'clearfix');

    noteDisplay.appendChild(noteH);
    noteDisplay.appendChild(notePara);
    noteDisplay.appendChild(deleteBtn);
    noteDisplay.appendChild(clearFix);

    note.appendChild(noteDisplay);

    /* set up listener for the delete functionality */

    deleteBtn.addEventListener('click', (e) => {
        const evtTgt = e.target;
        evtTgt.parentNode.parentNode.parentNode.removeChild(evtTgt.parentNode.parentNode);
        browser.storage.local.remove(title);
    });

    /* create note edit box */
    var noteEdit = document.createElement('div');
    var noteTitleEdit = document.createElement('input');
    var noteBodyEdit = document.createElement('textarea');
    var clearFix2 = document.createElement('div');

    var updateBtn = document.createElement('button');
    var cancelBtn = document.createElement('button');

    updateBtn.setAttribute('class', 'update');
    updateBtn.textContent = 'Update note';
    cancelBtn.setAttribute('class', 'cancel');
    cancelBtn.textContent = 'Cancel update';

    noteEdit.appendChild(noteTitleEdit);
    noteTitleEdit.value = title;
    noteEdit.appendChild(noteBodyEdit);
    noteBodyEdit.textContent = body;
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


/* function to update notes */

function updateNote(delNote, newTitle, newBody) {
    var storingNote = browser.storage.local.set({[newTitle]: newBody});
    storingNote.then(() => {
        if (delNote !== newTitle) {
            var removingNote = browser.storage.local.remove(delNote);
            removingNote.then(() => {
                displayNote(newTitle, newBody);
            }, onError);
        } else {
            displayNote(newTitle, newBody);
        }
    }, onError);
}

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
    return noteTitle.toLowerCase().startsWith(title.toLowerCase());
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
