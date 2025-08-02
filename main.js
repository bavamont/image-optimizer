const { app, BrowserWindow, ipcMain, dialog, shell, Menu } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const os = require('os');

let mainWindow;
let updateDownloaded = false;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1000,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        icon: getIconPath(),
        show: false,
        frame: false,
        titleBarStyle: 'hidden',
        backgroundColor: '#0a0e1a',
        title: 'Image Optimizer'
    });

    mainWindow.setMenu(null);
    mainWindow.loadFile('index.html');

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        if (process.argv.includes('--dev') || process.env.NODE_ENV === 'development') {
            mainWindow.webContents.openDevTools();
        }

        if (!process.argv.includes('--dev')) {
            checkForUpdates();
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });
}

function getIconPath() {
    const iconPaths = {
        win32: 'assets/icon.ico',
        darwin: 'assets/icon.icns',
        linux: 'assets/icon.png'
    };

    const iconPath = iconPaths[process.platform] || iconPaths.linux;
    return path.join(__dirname, iconPath);
}

function setupAutoUpdater() {
    autoUpdater.checkForUpdatesAndNotify();

    autoUpdater.on('checking-for-update', () => {
        if (mainWindow) {
            mainWindow.webContents.send('update-checking');
        }
    });

    autoUpdater.on('update-available', (info) => {
        if (mainWindow) {
            mainWindow.webContents.send('update-available', info);
        }
    });

    autoUpdater.on('update-not-available', (info) => {
        if (mainWindow) {
            mainWindow.webContents.send('update-not-available', info);
        }
    });

    autoUpdater.on('error', (err) => {
        if (mainWindow) {
            mainWindow.webContents.send('update-error', err);
        }
    });

    autoUpdater.on('download-progress', (progressObj) => {
        if (mainWindow) {
            mainWindow.webContents.send('update-download-progress', progressObj);
        }
    });

    autoUpdater.on('update-downloaded', (info) => {
        updateDownloaded = true;
        if (mainWindow) {
            mainWindow.webContents.send('update-downloaded', info);
        }
    });
}

function checkForUpdates() {
    if (process.platform === 'linux') {
        return;
    }

    try {
        autoUpdater.checkForUpdatesAndNotify();
    } catch (error) {
    }
}

ipcMain.handle('check-for-updates', async () => {
    try {
        const result = await autoUpdater.checkForUpdates();
        return { success: true, updateInfo: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('download-update', async () => {
    try {
        await autoUpdater.downloadUpdate();
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('install-update', async () => {
    try {
        if (updateDownloaded) {
            autoUpdater.quitAndInstall();
            return { success: true };
        } else {
            return { success: false, error: 'No update downloaded' };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('get-update-info', async () => {
    try {
        return {
            success: true,
            version: app.getVersion(),
            updateDownloaded: updateDownloaded,
            platform: process.platform
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('window-minimize', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.minimize();
    }
    return { success: true };
});

ipcMain.handle('window-maximize', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            mainWindow.maximize();
        }
    }
    return { success: true };
});

ipcMain.handle('window-close', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.close();
    }
    return { success: true };
});

ipcMain.handle('window-is-maximized', () => {
    return mainWindow && !mainWindow.isDestroyed() ? mainWindow.isMaximized() : false;
});

ipcMain.handle('select-images', async () => {
    try {
        const { filePaths, canceled } = await dialog.showOpenDialog(mainWindow, {
            properties: ['openFile', 'multiSelections'],
            filters: [
                { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp', 'tiff', 'tif', 'gif', 'avif', 'svg'] },
                { name: 'JPEG', extensions: ['jpg', 'jpeg'] },
                { name: 'PNG', extensions: ['png'] },
                { name: 'WebP', extensions: ['webp'] },
                { name: 'TIFF', extensions: ['tiff', 'tif'] },
                { name: 'GIF', extensions: ['gif'] },
                { name: 'AVIF', extensions: ['avif'] },
                { name: 'SVG', extensions: ['svg'] },
                { name: 'All Files', extensions: ['*'] }
            ],
            title: 'Select Images'
        });

        if (canceled) {
            return { success: false, canceled: true };
        }

        const files = [];
        for (const filePath of filePaths) {
            try {
                const stats = await fs.stat(filePath);
                const fileInfo = {
                    path: filePath,
                    name: path.basename(filePath),
                    size: stats.size,
                    extension: path.extname(filePath).toLowerCase(),
                    directory: path.dirname(filePath),
                    isImage: isImageFile(filePath),
                    modified: stats.mtime,
                    created: stats.birthtime
                };
                
                if (fileInfo.isImage) {
                    files.push(fileInfo);
                }
            } catch (error) {
            }
        }

        return { success: true, files };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('select-combiner-files', async () => {
    try {
        const { filePaths, canceled } = await dialog.showOpenDialog(mainWindow, {
            properties: ['openFile', 'multiSelections'],
            filters: [
                { name: 'Images & PDFs', extensions: ['jpg', 'jpeg', 'png', 'webp', 'tiff', 'tif', 'gif', 'avif', 'svg', 'pdf'] },
                { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp', 'tiff', 'tif', 'gif', 'avif', 'svg'] },
                { name: 'PDF Files', extensions: ['pdf'] },
                { name: 'All Files', extensions: ['*'] }
            ],
            title: 'Select Images and PDF Files'
        });

        if (canceled) {
            return { success: false, canceled: true };
        }

        const files = [];
        for (const filePath of filePaths) {
            try {
                const stats = await fs.stat(filePath);
                const ext = path.extname(filePath).toLowerCase();
                const fileInfo = {
                    path: filePath,
                    name: path.basename(filePath),
                    size: stats.size,
                    extension: ext,
                    directory: path.dirname(filePath),
                    isImage: isImageFile(filePath),
                    isPDF: ext === '.pdf',
                    modified: stats.mtime,
                    created: stats.birthtime
                };
                
                if (fileInfo.isImage || fileInfo.isPDF) {
                    files.push(fileInfo);
                }
            } catch (error) {
            }
        }

        return { success: true, files };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('select-folder', async () => {
    try {
        const { filePaths, canceled } = await dialog.showOpenDialog(mainWindow, {
            properties: ['openDirectory'],
            title: 'Select Folder'
        });

        if (canceled) {
            return { success: false, canceled: true };
        }

        const folderPath = filePaths[0];
        const files = await scanFolderForImages(folderPath, true);

        return {
            success: true,
            folder: folderPath,
            files
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('select-output-folder', async (event, defaultPath = null) => {
    try {
        const dialogOptions = {
            properties: ['openDirectory', 'createDirectory'],
            title: 'Select Output Folder'
        };

        if (defaultPath) {
            dialogOptions.defaultPath = defaultPath;
        }

        const { filePaths, canceled } = await dialog.showOpenDialog(mainWindow, dialogOptions);

        if (canceled) {
            return { success: false, canceled: true };
        }

        const selectedPath = filePaths[0];

        try {
            const stats = await fs.stat(selectedPath);
            if (!stats.isDirectory()) {
                return { success: false, error: 'Selected path is not a directory' };
            }
        } catch (error) {
            return { success: false, error: 'Cannot access selected directory' };
        }

        return { success: true, folder: selectedPath };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('get-default-output-folder', async (event, sourceFiles = []) => {
    try {
        let defaultFolder;

        if (sourceFiles.length > 0) {
            const firstFileDir = path.dirname(sourceFiles[0].path);
            defaultFolder = path.join(firstFileDir, 'optimized');
        } else {
            const documentsPath = app.getPath('documents');
            defaultFolder = path.join(documentsPath, 'Image Optimizer', 'Output');
        }

        return { success: true, folder: defaultFolder };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('browse-for-output-folder', async (event, options = {}) => {
    try {
        const dialogOptions = {
            properties: ['openDirectory', 'createDirectory'],
            title: options.title || 'Select Output Folder',
            buttonLabel: options.buttonLabel || 'Select Folder'
        };

        if (options.defaultPath) {
            dialogOptions.defaultPath = options.defaultPath;
        }

        const { filePaths, canceled } = await dialog.showOpenDialog(mainWindow, dialogOptions);

        if (canceled) {
            return { success: false, canceled: true };
        }

        return { success: true, folder: filePaths[0] };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('validate-output-folder', async (event, folderPath) => {
    try {
        if (!folderPath) {
            return { success: false, error: 'No folder path provided' };
        }

        const stats = await fs.stat(folderPath);

        if (!stats.isDirectory()) {
            return { success: false, error: 'Path is not a directory' };
        }

        try {
            await fs.access(folderPath, fsSync.constants.W_OK);
        } catch (error) {
            return { success: false, error: 'Directory is not writable' };
        }

        return {
            success: true,
            folder: folderPath,
            isDirectory: true,
            isWritable: true,
            size: stats.size,
            modified: stats.mtime
        };
    } catch (error) {
        if (error.code === 'ENOENT') {
            return { success: false, error: 'Directory does not exist', canCreate: true };
        }
        return { success: false, error: error.message };
    }
});

ipcMain.handle('create-output-directory', async (event, outputPath) => {
    try {
        await fs.mkdir(outputPath, { recursive: true });

        const stats = await fs.stat(outputPath);
        if (stats.isDirectory()) {
            return { success: true, path: outputPath };
        } else {
            return { success: false, error: 'Path exists but is not a directory' };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('select-watermark', async () => {
    try {
        const { filePaths, canceled } = await dialog.showOpenDialog(mainWindow, {
            properties: ['openFile'],
            filters: [
                { name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp', 'svg'] },
                { name: 'PNG (Recommended)', extensions: ['png'] },
                { name: 'JPEG', extensions: ['jpg', 'jpeg'] },
                { name: 'WebP', extensions: ['webp'] },
                { name: 'SVG', extensions: ['svg'] },
                { name: 'All Files', extensions: ['*'] }
            ],
            title: 'Select Watermark Image'
        });

        if (canceled) {
            return { success: false, canceled: true };
        }

        const watermarkPath = filePaths[0];
        try {
            const stats = await fs.stat(watermarkPath);
            return {
                success: true,
                path: watermarkPath,
                name: path.basename(watermarkPath),
                size: stats.size,
                extension: path.extname(watermarkPath).toLowerCase()
            };
        } catch (error) {
            return { success: false, error: 'Unable to access watermark file' };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('check-path-exists', async (event, filePath) => {
    try {
        await fs.access(filePath);
        const stats = await fs.stat(filePath);
        return {
            exists: true,
            isDirectory: stats.isDirectory(),
            isFile: stats.isFile(),
            size: stats.size,
            modified: stats.mtime
        };
    } catch (error) {
        return { exists: false };
    }
});

ipcMain.handle('get-file-stats', async (event, filePath) => {
    try {
        const stats = await fs.stat(filePath);
        return {
            success: true,
            stats: {
                size: stats.size,
                modified: stats.mtime,
                created: stats.birthtime,
                isDirectory: stats.isDirectory(),
                isFile: stats.isFile(),
                permissions: stats.mode
            }
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('open-folder', async (event, folderPath) => {
    try {
        const result = await shell.openPath(folderPath);
        if (result) {
            return { success: false, error: result };
        }
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('show-item-in-folder', async (event, filePath) => {
    try {
        shell.showItemInFolder(filePath);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('get-system-language', async () => {
    try {
        const locale = app.getLocale();
        const language = locale.substring(0, 2);

        const supportedLanguages = ['en', 'de'];
        const detectedLanguage = supportedLanguages.includes(language) ? language : 'en';

        return {
            success: true,
            language: detectedLanguage,
            locale: locale,
            systemLanguages: app.getPreferredSystemLanguages()
        };
    } catch (error) {
        return { success: false, error: error.message, language: 'en' };
    }
});

ipcMain.handle('get-system-info', async () => {
    try {
        return {
            success: true,
            platform: process.platform,
            arch: process.arch,
            nodeVersion: process.version,
            electronVersion: process.versions.electron,
            chromeVersion: process.versions.chrome,
            totalMemory: os.totalmem(),
            freeMemory: os.freemem(),
            cpus: os.cpus().length,
            cpuModel: os.cpus()[0]?.model || 'Unknown',
            homeDir: os.homedir(),
            tempDir: os.tmpdir(),
            username: os.userInfo().username,
            hostname: os.hostname()
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('save-settings', async (event, settings, filePath = null) => {
    try {
        let savePath = filePath;

        if (!savePath) {
            const { filePath: selectedPath, canceled } = await dialog.showSaveDialog(mainWindow, {
                title: 'Save Settings',
                defaultPath: 'image-optimizer-settings.json',
                filters: [
                    { name: 'JSON Files', extensions: ['json'] },
                    { name: 'All Files', extensions: ['*'] }
                ]
            });

            if (canceled) {
                return { success: false, canceled: true };
            }

            savePath = selectedPath;
        }

        const settingsData = {
            version: '1.1.0',
            timestamp: new Date().toISOString(),
            settings: settings
        };

        await fs.writeFile(savePath, JSON.stringify(settingsData, null, 2), 'utf8');
        return { success: true, path: savePath };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('load-settings', async (event, filePath = null) => {
    try {
        let loadPath = filePath;

        if (!loadPath) {
            const { filePaths, canceled } = await dialog.showOpenDialog(mainWindow, {
                title: 'Load Settings',
                filters: [
                    { name: 'JSON Files', extensions: ['json'] },
                    { name: 'All Files', extensions: ['*'] }
                ],
                properties: ['openFile']
            });

            if (canceled) {
                return { success: false, canceled: true };
            }

            loadPath = filePaths[0];
        }

        const data = await fs.readFile(loadPath, 'utf8');
        const settingsData = JSON.parse(data);

        const settings = settingsData.settings || settingsData;

        return {
            success: true,
            settings,
            path: loadPath,
            version: settingsData.version,
            timestamp: settingsData.timestamp
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('show-error-dialog', async (event, title, message, detail = null) => {
    try {
        const options = {
            type: 'error',
            title: title || 'Error',
            message: message || 'An unknown error occurred',
            buttons: ['OK']
        };

        if (detail) {
            options.detail = detail;
        }

        await dialog.showMessageBox(mainWindow, options);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('show-info-dialog', async (event, title, message, detail = null) => {
    try {
        const options = {
            type: 'info',
            title: title || 'Information',
            message: message || '',
            buttons: ['OK']
        };

        if (detail) {
            options.detail = detail;
        }

        await dialog.showMessageBox(mainWindow, options);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('show-warning-dialog', async (event, title, message, buttons = ['Continue', 'Cancel']) => {
    try {
        const result = await dialog.showMessageBox(mainWindow, {
            type: 'warning',
            title: title || 'Warning',
            message: message || '',
            buttons: buttons,
            defaultId: 0,
            cancelId: buttons.length - 1
        });

        return {
            success: true,
            response: result.response,
            canceled: result.response === buttons.length - 1,
            buttonClicked: buttons[result.response]
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('show-question-dialog', async (event, title, message, buttons = ['Yes', 'No']) => {
    try {
        const result = await dialog.showMessageBox(mainWindow, {
            type: 'question',
            title: title || 'Question',
            message: message || '',
            buttons: buttons,
            defaultId: 0,
            cancelId: buttons.length - 1
        });

        return {
            success: true,
            response: result.response,
            buttonIndex: result.response,
            buttonClicked: buttons[result.response],
            canceled: result.response === buttons.length - 1
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('get-app-version', async () => {
    return {
        success: true,
        version: app.getVersion(),
        name: app.getName()
    };
});

ipcMain.handle('cancel-processing', async () => {
    try {
        if (mainWindow) {
            mainWindow.webContents.send('processing-cancelled');
        }
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

function isImageFile(filePath) {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.tiff', '.tif', '.gif', '.avif', '.svg'];
    const ext = path.extname(filePath).toLowerCase();
    return imageExtensions.includes(ext);
}

function isPDFFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return ext === '.pdf';
}

function isSupportedFile(filePath) {
    return isImageFile(filePath) || isPDFFile(filePath);
}

async function scanFolderForImages(folderPath, includeSubdirectories = false, currentDepth = 0, maxDepth = 10) {
    const files = [];

    try {
        if (currentDepth > maxDepth) {
            return files;
        }

        const entries = await fs.readdir(folderPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(folderPath, entry.name);

            if (entry.isFile() && isImageFile(entry.name)) {
                try {
                    const stats = await fs.stat(fullPath);
                    const fileInfo = {
                        path: fullPath,
                        name: entry.name,
                        size: stats.size,
                        extension: path.extname(entry.name).toLowerCase(),
                        directory: folderPath,
                        isImage: true,
                        relativePath: path.relative(folderPath, fullPath),
                        modified: stats.mtime,
                        created: stats.birthtime
                    };
                    files.push(fileInfo);
                } catch (error) {
                }
            } else if (entry.isDirectory() && includeSubdirectories) {
                try {
                    const subFiles = await scanFolderForImages(fullPath, true, currentDepth + 1, maxDepth);
                    files.push(...subFiles);
                } catch (error) {
                }
            }
        }
    } catch (error) {
    }

    return files;
}

process.on('uncaughtException', (error) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
        dialog.showErrorBox('Unexpected Error',
            `An unexpected error occurred: ${error.message}\n\nThe application will continue running, but you may want to restart it.`
        );
    }
});

process.on('unhandledRejection', (reason, promise) => {
});

app.enableSandbox = false;

app.whenReady().then(() => {
    Menu.setApplicationMenu(null);
    createWindow();
    setupAutoUpdater();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', (event) => {
    if (updateDownloaded) {
        event.preventDefault();
        autoUpdater.quitAndInstall();
    }
});

app.on('web-contents-created', (event, contents) => {
    contents.on('new-window', (event, url) => {
        event.preventDefault();
        shell.openExternal(url);
    });

    contents.on('will-navigate', (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);

        if (parsedUrl.origin !== 'file://') {
            event.preventDefault();
            shell.openExternal(navigationUrl);
        }
    });

    contents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });
});

app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
    if (process.env.NODE_ENV === 'development' || process.argv.includes('--dev')) {
        event.preventDefault();
        callback(true);
    } else {
        callback(false);
    }
});

app.on('before-quit', (event) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.removeAllListeners('closed');
    }
});

app.setAboutPanelOptions({
    applicationName: 'Image Optimizer',
    applicationVersion: app.getVersion(),
    copyright: 'Copyright © 2025',
    credits: 'Built with Electron and Sharp.js'
});

if (process.env.NODE_ENV === 'production') {
    const gotTheLock = app.requestSingleInstanceLock();

    if (!gotTheLock) {
        app.quit();
    } else {
        app.on('second-instance', () => {
            if (mainWindow) {
                if (mainWindow.isMinimized()) mainWindow.restore();
                mainWindow.focus();
            }
        });
    }
}