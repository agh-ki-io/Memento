const defaultMarker = "[marker]";
const settingsKey = 'settings@marker';
const formatKey = 'settings@format';
browser.runtime.onInstalled.addListener(async ({ reason, temporary, }) => {
    //if (temporary) return; // skip during development

    switch (reason) {
        case "install": {
            browser.storage.local.set({[formatKey]: ["title", "content"]});
            browser.storage.local.set({[settingsKey]: defaultMarker}).then((e) =>{
                browser.runtime.openOptionsPage();
            });
        } break;
    }
});
