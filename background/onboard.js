const defaultMarker = "[marker]";
const settingsKey = 'settings@marker';

browser.runtime.onInstalled.addListener(async ({ reason, temporary, }) => {
    //if (temporary) return; // skip during development

    switch (reason) {
        case "install": {
            browser.storage.local.set({[settingsKey]: defaultMarker});
            browser.runtime.openOptionsPage()
        } break;
    }
});
