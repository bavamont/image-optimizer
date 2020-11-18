const { ipcRenderer } = require("electron");
const settings = new(require("./scripts/settings.js"));
const i18n = new(require("./scripts/i18n.js"));

function init() {
    window.isElectron = true;
    window.ipcRenderer = ipcRenderer;
    window.settings = settings;
    window.i18n = i18n;
}
init();