/**
 * settings.js
 * 
 * @author Bavamont
 * @link https://github.com/bavamont
 */

/**
 * Adjust these settings for your application.
 */
const defaults = {
    appName: "Image Optimizer",
    appMode: "production", /* development */
    defaultLang: "en",
    lang: "",
    
    /**
     * Add more settings for your application here.
     */
    changeOutputFormat: false,
    outputFormat: "jpg",
    changeOutputCompression: false,
    outputCompressionLevel: 80,
    changeIncludeSubdirectories: true,
    changeOutputSize: false,
    outputSizeWidth: 1920,
    outputSizeHeight: 1080,
    outputSizeType: "cover",
    outputBackgroundColor: "rgb(0, 0, 0)",
    changeUseWatermark: false,
    watermarkFile: "",
    watermarkPosition: "centre",
    changeOutputName: false,
    outputNameFormat: "%counter%",
    changeResetCounter: true,
    outputStartCountingFrom: 1,
    changeOutputLetterCase: false,
    outputLetterCase: "lowercase",
    changeOutputDirectory: false,
    outputDirectory: "",
    changeCopyNonImageFiles: true
};

/**
 * Do not change anything below this line.
 */
const electron = require("electron");
const path = require("path");
const fse = require("fs-extra");
let app = electron.app ? electron.app : electron.remote.app;

class Settings {

    constructor() {
        const userDataPath = app.getPath("userData");
        this.path = path.join(userDataPath, "settings.json");
        this.data = defaults;
        if (fse.existsSync(this.path)) {
            const data = fse.readJsonSync(this.path);
            if (Object.keys(data).length > 0) this.data = data;
        }
        /** 
         * Making sure that these values are not changed by the user manually editing the settings.json file.
         */
        this.data.appName = defaults.appName;
        this.data.appMode = defaults.appMode;
        this.data.defaultLang = defaults.defaultLang;
    }

    /**
     * Returns the value of key
     *
     * @return
     *   The value of key
     */
    get(key) {
        return this.data[key];
    }

    /**
     * Sets and saves a value
     */
    set(key, val) {
        this.data[key] = val;
        fse.writeJsonSync(this.path, this.data);
    }
}
module.exports = Settings;