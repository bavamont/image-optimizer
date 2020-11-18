/**
 * Image Optimizer
 * 
 * @author Bavamont
 * @link https://github.com/bavamont
 */

const electron = require("electron");
const { app, BrowserWindow, Menu, ipcMain, Tray } = electron;
const { autoUpdater } = require("electron-updater");
const url = require("url");
const path = require("path");
const settings = new(require("./scripts/settings.js"));
const i18n = new(require("./scripts/i18n.js"));
var mainWindow = null;
var exeDirectory = app.getAppPath();
var showFrame = false;

/**
 * Set environment variable NODE_ENV
 */
process.env.NODE_ENV = settings.get("appMode");

/**
 * Disable security warnings
 * https://github.com/electron/electron/issues/12035
 */
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;

/**
 * Bug fix
 * https://github.com/electron/electron/issues/6139
 */
if (process.platform === "linux") {
    app.disableHardwareAcceleration();
}

/**
 * Creates the main window
 */
function createMainWindow() {

    /**
     * Check for updates.
     */
    if (process.env.NODE_ENV === "production") {
        /* autoUpdater.checkForUpdates(); */
    }

    /**
     * Added for notifications during development.
     * https://electronjs.org/docs/tutorial/notifications#windows
     */
    if (process.env.NODE_ENV === "development") {
        app.setAppUserModelId(process.execPath);
        showFrame = true;
    }

    /* Define main window. */
    mainWindow = new BrowserWindow({
        backgroundColor: "#FFF",
        width: 800,
        height: 600,
        minWidth: 800,
        minHeight: 600,
        transparent: false,
        frame: showFrame,
        resizable: false,
        show: false,
        webPreferences: {
            enableRemoteModule: true,
            preload: path.join(__dirname, "preload.js")
        },
        icon: path.join(__dirname, "assets", "app", "icons", "64x64.png")
    });
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, "app.html"),
        protocol: "file",
        slashes: true
    }));
    mainWindow.on("ready-to-show", function() {
        mainWindow.show();
        mainWindow.focus();
        mainWindow.webContents.send("set-version", app.getVersion());
    });
    /* Event triggered when mainWindow is closed. */
    mainWindow.on("closed", () => {
        mainWindow = null;
    });
    var trayIcon = new Tray(path.join(__dirname, "assets", "app", "icon-off.png"));
    const mainMenu = require("./scripts/menu.js");
    Menu.setApplicationMenu(mainMenu);
    mainWindow.setMenu(mainMenu);
}

/**
 * app Events
 * https://github.com/electron/electron/blob/master/docs/api/app.md 
 *
 * Emitted when Electron has finished initializing.
 */
app.on("ready", () => createMainWindow());

/**
 * Emitted before the application starts closing its windows.
 */
app.on("before-quit", () => {})

/**
 * Emitted when all windows have been closed.
 */
app.on("window-all-closed", () => {
    app.quit()
})

/**
 * Emitted when the application is activated (macOS).
 */
app.on("activate", () => {
    if (mainWindow === null) {
        createMainWindow();
    }
})

/**
 * Update has been downloaded.
 */
autoUpdater.on("update-downloaded", () => {
    if (process.env.NODE_ENV === "production") {
        dialog.showMessageBox({
            type: "info",
            title: i18n.__("Update available"),
            message: i18n.__("Do you want to update now?"),
            buttons: [i18n.__("Yes"), i18n.__("No")]
        }, (index) => {
            if (!index) autoUpdater.quitAndInstall();
        });
    }
});

/**
 * Toggle maximize window
 */
ipcMain.on("maximize-window", function(event, arg) {
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
});

/**
 * Minimize window
 */
ipcMain.on("minimize-window", function(event, arg) {
    mainWindow.minimize();
});

/**
 * Clsoe window
 */
ipcMain.on("close-window", function(event, arg) {
    mainWindow.close();
});

/**
 * Image Optimizer
 * 
 * @author Bavamont
 * @link https://github.com/bavamont
 */
const dialog = electron.dialog;
const fs = require("fs");
const fse = require("fs-extra");
const $ = require("./assets/jquery/jquery-3.4.0.js");
const mime = require("mime-types");
const sharp = require("sharp");
const moment = require("moment");
var Color = require("color");

/** 
 * Set initial values.
 */
var changeOutputFormat = settings.get("changeOutputFormat");
var outputFormat = settings.get("outputFormat");
var changeOutputCompression = settings.get("changeOutputCompression");
var outputCompressionLevel = settings.get("outputCompressionLevel");
var changeIncludeSubdirectories = settings.get("changeIncludeSubdirectories");
var changeOutputSize = settings.get("changeOutputSize");
var outputSizeWidth = settings.get("outputSizeWidth");
var outputSizeHeight = settings.get("outputSizeHeight");
var outputSizeType = settings.get("outputSizeType");
var outputBackgroundColor = settings.get("outputBackgroundColor");
var changeUseWatermark = settings.get("changeUseWatermark");
var watermarkFile = settings.get("watermarkFile");
var watermarkPosition = settings.get("watermarkPosition");
var changeOutputName = settings.get("changeOutputName");
var outputNameFormat = settings.get("outputNameFormat");
var changeResetCounter = settings.get("changeResetCounter");
var outputStartCountingFrom = settings.get("outputStartCountingFrom");
var changeOutputLetterCase = settings.get("changeOutputLetterCase");
var outputLetterCase = settings.get("outputLetterCase");
var changeOutputDirectory = settings.get("changeOutputDirectory");
var outputDirectory = settings.get("outputDirectory");
var changeCopyNonImageFiles = settings.get("changeCopyNonImageFiles");
var originalDirectory = "";
var originalRequiredDiskSpace = 0;
var optimizedRequiredDiskSpace = 0;
var totalFilesToOptimize = 0;
var totalFilesOptimized = 0;
var currentImageNumber = {};

function padNumber(number, size) {
    return number.toString().padStart(size.toString().length, '0');
}

function updateProgressbar(amount) {
    return new Promise((resolve, reject) => {
        let widthPercentage = Math.floor((amount / totalFilesToOptimize) * 100);
        mainWindow.webContents.send("print-to-console", '<div class="progress"><div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="' + amount + '" aria-valuemin="0" aria-valuemax="' + totalFilesToOptimize + '" style="width: ' + widthPercentage + '%"></div></div>');
        mainWindow.setProgressBar(parseFloat((widthPercentage / 100).toFixed(2)));
        resolve();
    });
}

function optimizationFinished() {
    mainWindow.setProgressBar(-1);
    let bytesSaved = (originalRequiredDiskSpace / Math.pow(1024, 2)) - (optimizedRequiredDiskSpace / Math.pow(1024, 2));
    let finishedMessage = "";
    if (bytesSaved > 0) finishedMessage = (bytesSaved).toFixed(2) + " " + i18n.__("MB saved.");
    else finishedMessage = i18n.__("Done.");
    mainWindow.webContents.send("print-to-console", finishedMessage);
    mainWindow.webContents.send("hide-overlay");
    mainWindow.webContents.send("show-notification", { title: app.getName(), body: finishedMessage, icon: path.join(__dirname, "assets", "app", "icons", "64x64.png") });
}

function getTotalFilesToOptimize(directory) {
    return new Promise((resolve, reject) => {
        let directoryStats = fs.lstatSync(directory);
        if (directoryStats.isDirectory()) {
            fs.readdir(directory, function(err, files) {
                if (err) resolve();
                let waitForTotalFilesToOptimize = new Promise((waitForTotalFilesToOptimizeResolve, waitForTotalFilesToOptimizeReject) => {
                    let x = 0;
                    if (files.length <= 0) resolve();
                    files.forEach(function(file) {
                        let fileStats = fs.lstatSync(path.join(directory, file));
                        if (fileStats.isDirectory() && changeIncludeSubdirectories)
                            getTotalFilesToOptimize(path.join(directory, file)).then(() => {
                                x++;
                                if (x == files.length) waitForTotalFilesToOptimizeResolve();
                            })
                            .catch((e) => {
                                mainWindow.webContents.send("print-to-console", e);
                                x++;
                                if (x == files.length) waitForTotalFilesToOptimizeResolve();
                            });
                        else if (fileStats.isFile()) {
                            totalFilesToOptimize++;
                            x++;
                            if (x == files.length) waitForTotalFilesToOptimizeResolve();
                        } else {
                            x++;
                            if (x == files.length) waitForTotalFilesToOptimizeResolve();
                        }
                    });
                });
                waitForTotalFilesToOptimize.then(() => {
                    resolve();
                }).catch((e) => {
                    mainWindow.webContents.send("print-to-console", e);
                    reject();
                });
            });
        } else if (directoryStats.isFile()) {
            totalFilesToOptimize++;
            resolve();
        } else resolve();

    });
}

function countFiles(array) {
    return new Promise((resolve, reject) => {
        let waitForTotalFiles = new Promise((waitForTotalFilesResolve, waitForTotalFilesReject) => {
            let x = 0;
            if (array.length <= 0) waitForTotalFilesResolve();
            for (let file of array) {
                getTotalFilesToOptimize(file.path).then(() => {
                    x++;
                    if (x == array.length) waitForTotalFilesResolve();
                }).catch((e) => {
                    mainWindow.webContents.send("print-to-console", e);
                    x++;
                    if (x == array.length) waitForTotalFilesResolve();
                });
            }
        });
        waitForTotalFiles.then(() => {
            resolve();
        }).catch((e) => {
            mainWindow.webContents.send("print-to-console", e);
            reject();
        });
    });
}

function optimizeImage(file, optimizedFile) {
    return new Promise((resolve, reject) => {
        let directory = path.parse(file).dir;
        currentImageNumber["global"]++;
        if (currentImageNumber[directory] == undefined) currentImageNumber[directory] = parseInt(outputStartCountingFrom) - 1;
        currentImageNumber[directory]++;
        let useCurrentImageNumber = currentImageNumber["global"];
        if (changeResetCounter) useCurrentImageNumber = currentImageNumber[directory];
        let options = {};
        let parsedFile = path.parse(optimizedFile);
        let optimizedFileName = parsedFile.name;
        let optimizedNewFileName = optimizedFileName;
        let optimizedFileExt = parsedFile.ext;
        let optimizedNewFileExt = optimizedFileExt;
        let createOptimizedImage = sharp(file);
        if (changeOutputCompression) options = { quality: outputCompressionLevel };
        if (changeOutputFormat) optimizedNewFileExt = "." + outputFormat;
        if ((optimizedNewFileExt.toLowerCase() == ".jpg") || (optimizedNewFileExt.toLowerCase() == ".jpeg")) createOptimizedImage.jpeg(options);
        else if (optimizedNewFileExt.toLowerCase() == ".png") createOptimizedImage.png(options);
        else if (optimizedNewFileExt.toLowerCase() == ".webp") createOptimizedImage.webp(options);
        else if ((optimizedNewFileExt.toLowerCase() == ".tiff") || (optimizedNewFileExt.toLowerCase() == ".tif")) createOptimizedImage.tiff(options);
        if (changeOutputSize) {
            if ((outputSizeWidth > 0) && (outputSizeHeight > 0)) createOptimizedImage.resize({ width: outputSizeWidth, height: outputSizeHeight, fit: outputSizeType, background: Color(outputBackgroundColor) });
            else if (outputSizeWidth > 0) createOptimizedImage.resize({ width: outputSizeWidth, fit: outputSizeType, background: Color(outputBackgroundColor) });
            else createOptimizedImage.resize({ height: outputSizeHeight, fit: outputSizeType, background: Color(outputBackgroundColor) });
        }
        if (changeOutputName && (outputNameFormat.length > 0)) {
            optimizedNewFileName = outputNameFormat
                .replace("%counter%", useCurrentImageNumber)
                .replace("%counterpadding%", padNumber(useCurrentImageNumber, totalFilesToOptimize))
                .replace("%year%", moment().format("YYYY"))
                .replace("%month%", moment().format("MM"))
                .replace("%day%", moment().format("DD"))
                .replace("%hour%", moment().format("HH"))
                .replace("%minutes%", moment().format("mm"))
                .replace("%seconds%", moment().format("ss"))
                .replace("%weekday%", moment().format("dddd"))
                .replace("%timestamp%", moment().format("X"));
        }
        if (changeOutputLetterCase) {
            if (outputLetterCase == "lowercase") {
                optimizedNewFileName = optimizedNewFileName.toLowerCase();
                optimizedNewFileExt = optimizedNewFileExt.toLowerCase();
            } else if (outputLetterCase == "uppercase") {
                optimizedNewFileName = optimizedNewFileName.toUpperCase();
                optimizedNewFileExt = optimizedNewFileExt.toUpperCase();
            } else if (outputLetterCase == "namelowercase") optimizedNewFileName = optimizedNewFileName.toLowerCase();
            else if (outputLetterCase == "nameuppercase") optimizedNewFileName = optimizedNewFileName.toUpperCase();
            else if (outputLetterCase == "extensionlowercase") optimizedNewFileExt = optimizedNewFileExt.toLowerCase();
            else if (outputLetterCase == "extensionuppercase") optimizedNewFileExt = optimizedNewFileExt.toUpperCase();
        }
        optimizedFile = optimizedFile.replace(optimizedFileName + optimizedFileExt, optimizedNewFileName + optimizedNewFileExt);
        let fileStats = fs.lstatSync(file);
        originalRequiredDiskSpace += fileStats.size;
        createOptimizedImage.flatten({ background: Color(outputBackgroundColor) });
        if (changeUseWatermark && watermarkFile != "") {
            if (fs.existsSync(watermarkFile)) createOptimizedImage.composite([{ input: watermarkFile, gravity: watermarkPosition }]);
        }
        createOptimizedImage.toBuffer(function(err, buffer, info) {
            if (err) {
                totalFilesOptimized += 1;
                updateProgressbar(totalFilesOptimized).then(() => { resolve(optimizedFile); }).catch(() => { resolve(optimizedFile); });
            } else {
                fs.writeFile(optimizedFile, buffer, function(err) {
                    optimizedRequiredDiskSpace += info.size;
                    totalFilesOptimized += 1;
                    updateProgressbar(totalFilesOptimized).then(() => { resolve(optimizedFile); }).catch(() => { resolve(optimizedFile); });
                });
            }
        });
    });
}

function optimizeFile(file) {
    return new Promise((resolve, reject) => {
        let optimizedFile = "";
        if (originalDirectory != "") {
            if (changeOutputDirectory && outputDirectory != "") optimizedFile = file.replace(originalDirectory, outputDirectory);
            else optimizedFile = file.replace(originalDirectory, originalDirectory + "-optimized");
        } else {
            if (changeOutputDirectory && outputDirectory != "") optimizedFile = file.replace(path.dirname(file), outputDirectory);
            else optimizedFile = file.replace(path.dirname(file), path.join(path.dirname(file), "optimized"));
        }
        let optimizedFileDirectory = path.dirname(optimizedFile);
        fse.ensureDir(optimizedFileDirectory).then(() => {
            if (["image/png", "image/jpg", "image/jpeg", "image/webp", "image/tiff", "image/gif", "image/svg+xml"].indexOf(mime.lookup(file)) >= 0) {
                let waitForOptimizedFile = new Promise((waitForOptimizedFileResolve, waitForOptimizedFileReject) => {
                    optimizeImage(file, optimizedFile).then(() => {
                        waitForOptimizedFileResolve();
                    }).catch((e) => {
                        waitForOptimizedFileResolve();
                    });
                });
                waitForOptimizedFile.then(() => {
                    resolve();
                }).catch((e) => {
                    mainWindow.webContents.send("print-to-console", e);
                    reject(e);
                });
            } else {
                if (changeCopyNonImageFiles) fse.copySync(file, optimizedFile);
                totalFilesOptimized += 1;
                updateProgressbar(totalFilesOptimized).then(() => { resolve(); }).catch(() => { resolve(); });
            }
        }).catch((e) => {
            mainWindow.webContents.send("print-to-console", e);
            reject(e);
        });
    });
}

function checkFiles(directory) {
    return new Promise((resolve, reject) => {
        let directoryStats = fs.lstatSync(directory);
        if (directoryStats.isDirectory()) {
            fs.readdir(directory, { withFileTypes: true }, function(err, files) {
                if (err) resolve();
                else {
                    let waitForCheckOptimize = new Promise((waitForCheckOptimizeResolve, waitForCheckOptimizeReject) => {
                        let x = 0;
                        if (files.length <= 0) waitForCheckOptimizeResolve();
                        files.sort((a, b) => {
                            return b.isDirectory() - a.isDirectory() || a.name > b.name ? 1 : -1;
                        });
                        files.forEach(function(file) {
                            if (file.isDirectory() && changeIncludeSubdirectories) {
                                currentImageNumber[directory] = parseInt(outputStartCountingFrom) - 1;
                                checkFiles(path.join(directory, file.name)).then(() => {
                                    x++;
                                    if (x == files.length) waitForCheckOptimizeResolve();
                                }).catch((e) => {
                                    x++;
                                    if (x == files.length) waitForCheckOptimizeResolve();
                                });
                            } else if (file.isFile()) {
                                optimizeFile(path.join(directory, file.name)).then(() => {
                                    x++;
                                    if (x == files.length) waitForCheckOptimizeResolve();
                                }).catch((e) => {
                                    x++;
                                    if (x == files.length) waitForCheckOptimizeResolve();
                                });
                            } else {
                                x++;
                                if (x == files.length) waitForCheckOptimizeResolve();
                            }
                        });
                    });
                    waitForCheckOptimize.then(() => {
                        resolve();
                    }).catch((e) => {
                        mainWindow.webContents.send("print-to-console", e);
                        reject(e);
                    });
                }
            });
        } else if (directoryStats.isFile())
            optimizeFile(directory).then(() => {
                resolve();
            }).catch((e) => {
                mainWindow.webContents.send("print-to-console", e);
                reject(e);
            });
        else resolve();
    });
}

function getFiles(array) {
    return new Promise((resolve, reject) => {
        if (array.length <= 0) resolve();
        for (let file of array) {
            if (fs.lstatSync(file.path).isDirectory())
                originalDirectory = file.path;
            else originalDirectory = "";
            let waitForCheckedFiles = new Promise((waitForCheckedFilesResolve, waitForCheckedFilesReject) => {
                checkFiles(file.path).then(() => {
                    waitForCheckedFilesResolve();
                }).catch((e) => {
                    mainWindow.webContents.send("print-to-console", e);
                    waitForCheckedFilesReject(e);
                });
            });
            waitForCheckedFiles.then(() => {
                resolve();
            }).catch((e) => {
                mainWindow.webContents.send("print-to-console", e);
                reject(e);
            });
        }
    });
}

function selectFiles() {
    const options = {
        title: i18n.__("Select files."),
        buttonLabel: i18n.__("Select"),
        properties: ["openFile", "multiSelections"]
    };
    originalRequiredDiskSpace = 0;
    optimizedRequiredDiskSpace = 0;
    totalFilesOptimized = 0;
    totalFilesToOptimize = 0;
    currentImageNumber = {};
    currentImageNumber["global"] = parseInt(outputStartCountingFrom) - 1;
    let files = [];
    let selected = dialog.showOpenDialog(null, options);
    if (selected && selected.length > 0) {
        mainWindow.webContents.send("show-overlay");
        let waitForFiles = new Promise((waitForFilesResolve, waitForFilesReject) => {
            totalFilesToOptimize = Object.keys(selected).length;
            let fileCounter = 1;
            selected.forEach(function(file) {
                files.push({
                    path: file
                });
                if (fileCounter == totalFilesToOptimize) {
                    waitForFilesResolve();
                } else {
                    fileCounter++;
                }
            });
        });
        waitForFiles.then(() => {            
            getFiles(files).then(() => {
                optimizationFinished();
            }).catch(() => {
                optimizationFinished();
            });
        }).catch((e) => {
            optimizationFinished();
        });
    }
}

function selectOutputDirectory() {
    const options = {
        title: i18n.__("Select output directory."),
        buttonLabel: i18n.__("Select"),
        properties: ["openDirectory"]
    };
    let selected = dialog.showOpenDialog(null, options);
    if (selected && selected.length > 0) {
        outputDirectory = selected[0];
        mainWindow.webContents.send("output-directory-selected", outputDirectory);
    }
}

function selectWatermarkFile() {
    const options = {
        title: i18n.__("Select watermark."),
        buttonLabel: i18n.__("Select"),
        properties: ["openFile"],
        filters: [
            { name: ".png, .jpg", extensions: ["png", "jpg"] }
        ]
    };
    let selected = dialog.showOpenDialog(null, options);
    if (selected && selected.length > 0) {
        watermarkFile = selected[0];
        mainWindow.webContents.send("watermark-selected", watermarkFile);
    }
}

ipcMain.on("dropzone-drop", function(event, arg) {
    if (arg.length) {
        originalRequiredDiskSpace = 0;
        optimizedRequiredDiskSpace = 0;
        totalFilesOptimized = 0;
        totalFilesToOptimize = 0;
        currentImageNumber = {};
        currentImageNumber["global"] = parseInt(outputStartCountingFrom) - 1;
        if (arg && arg.length > 0) {
            mainWindow.webContents.send("show-overlay");
            countFiles(arg).then(() => {
                getFiles(arg).then(() => {
                    optimizationFinished();
                }).catch(() => {
                    optimizationFinished();
                });
            }).catch(() => {
                mainWindow.setProgressBar(-1);
                mainWindow.webContents.send("print-to-console", i18n.__("An error occurred."));
                mainWindow.webContents.send("hide-overlay");
            });
        }
    }
});

ipcMain.on("select-files", function(event, arg) {
    selectFiles();
});

ipcMain.on("select-watermark-file", function(event, arg) {
    selectWatermarkFile();
});

ipcMain.on("select-output-directory", function(event, arg) {
    selectOutputDirectory();
});

ipcMain.on("change-setting", function(event, arg) {
    eval(arg.variable + " = " + arg.value);
});