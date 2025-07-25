const { ipcRenderer } = require('electron');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');

let appState = {
    files: [],
    settings: {
        changeCompression: false,
        compressionQuality: 80,
        backgroundColor: '#ffffff',

        includeSubdirectories: true,
        copyNonImages: false,
        preserveStructure: true,

        enableBatchRename: false,
        namePattern: '',
        counterStart: 1,
        resetCounter: false,
        changeCase: false,
        letterCase: 'lowercase',

        enableWatermark: false,
        watermarkFile: '',
        watermarkPosition: 'southeast',
        watermarkOpacity: 80,
        watermarkSize: 20,

        enableResize: false,
        resizeWidth: 1920,
        resizeHeight: 1080,
        resizeMode: 'cover',
        maintainAspect: true,
        enlargeImages: false,

        changeFormat: false,
        outputFormat: 'jpg',

        outputMode: 'source',
        customOutputFolder: '',
        createSubfolder: false,
        subfolderName: 'optimized',
        autoCheckUpdates: true
    },
    outputFolder: '',
    processing: {
        isProcessing: false,
        currentFile: '',
        processed: 0,
        total: 0,
        errors: []
    },
    updateInfo: {
        checking: false,
        available: false,
        downloading: false,
        downloaded: false,
        error: null
    }
};

const elements = {
    navItems: document.querySelectorAll('.nav-item'),
    tabContents: document.querySelectorAll('.tab-content'),

    dropzone: document.getElementById('dropzone'),
    fileInput: document.getElementById('file-input'),
    fileInputFiles: document.getElementById('file-input-files'),
    fileList: document.getElementById('file-list'),
    fileListContainer: document.getElementById('file-list-container'),
    fileCount: document.getElementById('file-count'),
    totalSize: document.getElementById('total-size'),
    clearFilesBtn: document.getElementById('clear-files'),

    outputModeSource: document.getElementById('output-mode-source'),
    outputModeCustom: document.getElementById('output-mode-custom'),
    outputFolderSelection: document.getElementById('output-folder-selection'),
    outputFolderInput: document.getElementById('output-folder-input'),
    browseOutputFolderBtn: document.getElementById('browse-output-folder'),
    createSubfolder: document.getElementById('create-subfolder'),
    subfolderNameGroup: document.getElementById('subfolder-name-group'),
    subfolderName: document.getElementById('subfolder-name'),
    outputFolderPath: document.getElementById('output-folder-path'),

    processingControls: document.getElementById('processing-controls'),
    startProcessingBtn: document.getElementById('start-processing'),

    processingProgress: document.getElementById('processing-progress'),
    progressFill: document.getElementById('progress-fill'),
    progressText: document.getElementById('progress-text'),
    progressPercentage: document.getElementById('progress-percentage'),
    currentFile: document.getElementById('current-file'),
    processedCount: document.getElementById('processed-count'),
    remainingCount: document.getElementById('remaining-count'),
    errorCount: document.getElementById('error-count'),

    processingResults: document.getElementById('processing-results'),
    resultsSummary: document.getElementById('results-summary'),
    openOutputFolderBtn: document.getElementById('open-output-folder'),

    changeCompression: document.getElementById('change-compression'),
    compressionQuality: document.getElementById('compression-quality'),
    compressionValue: document.getElementById('compression-value'),
    backgroundColor: document.getElementById('background-color'),
    backgroundColorText: document.getElementById('background-color-text'),

    includeSubdirectories: document.getElementById('include-subdirectories'),
    copyNonImages: document.getElementById('copy-non-images'),
    preserveStructure: document.getElementById('preserve-structure'),

    enableBatchRename: document.getElementById('enable-batch-rename'),
    namePattern: document.getElementById('name-pattern'),
    counterStart: document.getElementById('counter-start'),
    resetCounter: document.getElementById('reset-counter'),
    changeCase: document.getElementById('change-case'),
    letterCase: document.getElementById('letter-case'),

    enableWatermark: document.getElementById('enable-watermark'),
    watermarkFile: document.getElementById('watermark-file'),
    selectWatermarkBtn: document.getElementById('select-watermark'),
    watermarkPosition: document.getElementById('watermark-position'),
    watermarkOpacity: document.getElementById('watermark-opacity'),
    opacityValue: document.getElementById('opacity-value'),
    watermarkSize: document.getElementById('watermark-size'),
    sizeValue: document.getElementById('size-value'),

    enableResize: document.getElementById('enable-resize'),
    resizeWidth: document.getElementById('resize-width'),
    resizeHeight: document.getElementById('resize-height'),
    resizeMode: document.getElementById('resize-mode'),
    maintainAspect: document.getElementById('maintain-aspect'),
    enlargeImages: document.getElementById('enlarge-images'),

    changeFormat: document.getElementById('change-format'),
    outputFormat: document.getElementById('output-format'),

    minimizeBtn: document.getElementById('minimize-btn'),
    maximizeBtn: document.getElementById('maximize-btn'),
    closeBtn: document.getElementById('close-btn'),

    languageSelector: document.getElementById('language-selector'),
    checkUpdatesBtn: document.getElementById('check-updates-btn'),
    manualCheckUpdatesBtn: document.getElementById('manual-check-updates'),
    autoCheckUpdates: document.getElementById('auto-check-updates'),
    currentVersion: document.getElementById('current-version'),
    updateStatus: document.getElementById('update-status'),

    updateModal: document.getElementById('update-modal'),
    modalCurrentVersion: document.getElementById('modal-current-version'),
    modalNewVersion: document.getElementById('modal-new-version'),
    releaseNotesContent: document.getElementById('release-notes-content'),
    downloadProgress: document.getElementById('download-progress'),
    downloadPercentage: document.getElementById('download-percentage'),
    downloadProgressFill: document.getElementById('download-progress-fill'),
    skipUpdateBtn: document.getElementById('skip-update'),
    installLaterBtn: document.getElementById('install-later'),
    installUpdateBtn: document.getElementById('install-update')
};

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    setupWindowControls();
    setupUpdateHandlers();
    loadSettings();
    updateUI();
    loadAppVersion();

    if (typeof i18n !== 'undefined') {
        setupLanguageHandling();
    } else {
        setTimeout(() => {
            if (typeof i18n !== 'undefined') {
                setupLanguageHandling();
            }
        }, 100);
    }
}

function setupLanguageHandling() {
    if (elements.languageSelector) {
        elements.languageSelector.addEventListener('change', (e) => {
            i18n.setLanguage(e.target.value);
        });
    }
}

function setupEventListeners() {
    elements.navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabId = item.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    setupDropzone();
    setupFileInputs();
    setupOutputFolderControls();

    elements.startProcessingBtn?.addEventListener('click', startProcessing);
    elements.clearFilesBtn?.addEventListener('click', clearFiles);
    elements.openOutputFolderBtn?.addEventListener('click', openOutputFolder);

    setupSettingsEventListeners();
    setupRealtimeUpdates();
}

function setupWindowControls() {
    elements.minimizeBtn?.addEventListener('click', () => {
        ipcRenderer.invoke('window-minimize');
    });

    elements.maximizeBtn?.addEventListener('click', () => {
        ipcRenderer.invoke('window-maximize');
    });

    elements.closeBtn?.addEventListener('click', () => {
        ipcRenderer.invoke('window-close');
    });
}

function setupUpdateHandlers() {
    elements.checkUpdatesBtn?.addEventListener('click', checkForUpdates);
    elements.manualCheckUpdatesBtn?.addEventListener('click', checkForUpdates);

    elements.autoCheckUpdates?.addEventListener('change', (e) => {
        appState.settings.autoCheckUpdates = e.target.checked;
        saveSettings();
    });

    elements.skipUpdateBtn?.addEventListener('click', () => {
        hideUpdateModal();
    });

    elements.installLaterBtn?.addEventListener('click', () => {
        hideUpdateModal();
    });

    elements.installUpdateBtn?.addEventListener('click', () => {
        if (appState.updateInfo.downloaded) {
            installUpdate();
        } else {
            downloadUpdate();
        }
    });

    ipcRenderer.on('update-checking', () => {
        appState.updateInfo.checking = true;
        updateUpdateStatus();
        showToast(getToastMessage('updateChecking'), 'info');
    });

    ipcRenderer.on('update-available', (event, info) => {
        appState.updateInfo = {
            checking: false,
            available: true,
            downloading: false,
            downloaded: false,
            error: null,
            info: info
        };
        updateUpdateStatus();
        showUpdateModal(info);
        showToast(getToastMessage('updateAvailable'), 'success');
    });

    ipcRenderer.on('update-not-available', () => {
        appState.updateInfo = {
            checking: false,
            available: false,
            downloading: false,
            downloaded: false,
            error: null
        };
        updateUpdateStatus();
        showToast(getToastMessage('updateNotAvailable'), 'info');
    });

    ipcRenderer.on('update-error', (event, error) => {
        appState.updateInfo = {
            checking: false,
            available: false,
            downloading: false,
            downloaded: false,
            error: error
        };
        updateUpdateStatus();
        showToast(getToastMessage('updateError'), 'error');
    });

    ipcRenderer.on('update-download-progress', (event, progressObj) => {
        updateDownloadProgress(progressObj);
    });

    ipcRenderer.on('update-downloaded', (event, info) => {
        appState.updateInfo.downloading = false;
        appState.updateInfo.downloaded = true;
        updateUpdateStatus();
        updateInstallButton();
        showToast(getToastMessage('updateDownloaded'), 'success');
    });
}

function setupOutputFolderControls() {
    const outputModeRadios = document.querySelectorAll('input[name="output-mode"]');
    outputModeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            appState.settings.outputMode = e.target.value;
            updateOutputFolderUI();
            updateOutputFolderDisplay();
        });
    });

    elements.browseOutputFolderBtn?.addEventListener('click', browseForOutputFolder);

    elements.createSubfolder?.addEventListener('change', (e) => {
        appState.settings.createSubfolder = e.target.checked;
        elements.subfolderNameGroup.style.display = e.target.checked ? 'block' : 'none';
        updateOutputFolderDisplay();
    });

    elements.subfolderName?.addEventListener('input', (e) => {
        appState.settings.subfolderName = e.target.value || 'optimized';
        updateOutputFolderDisplay();
    });
}

function setupDropzone() {
    if (!elements.dropzone) return;

    elements.dropzone.addEventListener('click', (e) => {
        if (e.target === elements.dropzone || e.target.closest('.dropzone-content')) {
            elements.fileInputFiles.click();
        }
    });

    elements.dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.dropzone.classList.add('dragover');
    });

    elements.dropzone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        if (!elements.dropzone.contains(e.relatedTarget)) {
            elements.dropzone.classList.remove('dragover');
        }
    });

    elements.dropzone.addEventListener('drop', async (e) => {
        e.preventDefault();
        elements.dropzone.classList.remove('dragover');

        const files = Array.from(e.dataTransfer.files);
        await handleFilesDrop(files);
    });
}

function setupFileInputs() {
    elements.fileInputFiles?.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        await handleFilesDrop(files);
    });

    elements.fileInput?.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        await handleFilesDrop(files);
    });
}

function setupSettingsEventListeners() {
    elements.changeCompression?.addEventListener('change', (e) => {
        appState.settings.changeCompression = e.target.checked;
        updateUI();
    });

    elements.compressionQuality?.addEventListener('input', (e) => {
        appState.settings.compressionQuality = parseInt(e.target.value);
        if (elements.compressionValue) {
            elements.compressionValue.textContent = e.target.value;
        }
    });

    elements.backgroundColor?.addEventListener('input', (e) => {
        appState.settings.backgroundColor = e.target.value;
        if (elements.backgroundColorText) {
            elements.backgroundColorText.value = e.target.value;
        }
    });

    elements.backgroundColorText?.addEventListener('input', (e) => {
        const color = e.target.value;
        if (isValidColor(color)) {
            appState.settings.backgroundColor = color;
            if (elements.backgroundColor) {
                elements.backgroundColor.value = color;
            }
        }
    });

    elements.includeSubdirectories?.addEventListener('change', (e) => {
        appState.settings.includeSubdirectories = e.target.checked;
    });

    elements.copyNonImages?.addEventListener('change', (e) => {
        appState.settings.copyNonImages = e.target.checked;
    });

    elements.preserveStructure?.addEventListener('change', (e) => {
        appState.settings.preserveStructure = e.target.checked;
    });

    elements.enableBatchRename?.addEventListener('change', (e) => {
        appState.settings.enableBatchRename = e.target.checked;
    });

    elements.namePattern?.addEventListener('input', (e) => {
        appState.settings.namePattern = e.target.value;
    });

    elements.counterStart?.addEventListener('input', (e) => {
        appState.settings.counterStart = parseInt(e.target.value) || 1;
    });

    elements.resetCounter?.addEventListener('change', (e) => {
        appState.settings.resetCounter = e.target.checked;
    });

    elements.changeCase?.addEventListener('change', (e) => {
        appState.settings.changeCase = e.target.checked;
    });

    elements.letterCase?.addEventListener('change', (e) => {
        appState.settings.letterCase = e.target.value;
    });

    elements.enableWatermark?.addEventListener('change', (e) => {
        appState.settings.enableWatermark = e.target.checked;
        updateUI();
    });

    elements.selectWatermarkBtn?.addEventListener('click', selectWatermark);

    elements.watermarkPosition?.addEventListener('change', (e) => {
        appState.settings.watermarkPosition = e.target.value;
    });

    elements.watermarkOpacity?.addEventListener('input', (e) => {
        appState.settings.watermarkOpacity = parseInt(e.target.value);
        if (elements.opacityValue) {
            elements.opacityValue.textContent = e.target.value + '%';
        }
    });

    elements.watermarkSize?.addEventListener('input', (e) => {
        appState.settings.watermarkSize = parseInt(e.target.value);
        if (elements.sizeValue) {
            elements.sizeValue.textContent = e.target.value + '%';
        }
    });

    elements.enableResize?.addEventListener('change', (e) => {
        appState.settings.enableResize = e.target.checked;
    });

    elements.resizeWidth?.addEventListener('input', (e) => {
        appState.settings.resizeWidth = parseInt(e.target.value) || 1920;
    });

    elements.resizeHeight?.addEventListener('input', (e) => {
        appState.settings.resizeHeight = parseInt(e.target.value) || 1080;
    });

    elements.resizeMode?.addEventListener('change', (e) => {
        appState.settings.resizeMode = e.target.value;
    });

    elements.maintainAspect?.addEventListener('change', (e) => {
        appState.settings.maintainAspect = e.target.checked;
    });

    elements.enlargeImages?.addEventListener('change', (e) => {
        appState.settings.enlargeImages = e.target.checked;
    });

    elements.changeFormat?.addEventListener('change', (e) => {
        appState.settings.changeFormat = e.target.checked;
    });

    elements.outputFormat?.addEventListener('change', (e) => {
        appState.settings.outputFormat = e.target.value;
    });
}

function setupRealtimeUpdates() {
    elements.compressionQuality?.addEventListener('input', (e) => {
        if (elements.compressionValue) {
            elements.compressionValue.textContent = e.target.value;
        }
    });

    elements.watermarkOpacity?.addEventListener('input', (e) => {
        if (elements.opacityValue) {
            elements.opacityValue.textContent = e.target.value + '%';
        }
    });

    elements.watermarkSize?.addEventListener('input', (e) => {
        if (elements.sizeValue) {
            elements.sizeValue.textContent = e.target.value + '%';
        }
    });
}

function switchTab(tabId) {
    elements.navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-tab') === tabId) {
            item.classList.add('active');
        }
    });

    elements.tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `${tabId}-tab`) {
            content.classList.add('active');
        }
    });
}

async function handleFilesDrop(files) {
    showToast(getToastMessage('processingFiles'), 'info');

    const newFiles = [];

    for (const file of files) {
        if (file.type.startsWith('image/') || isImageFile(file.name)) {
            const fileInfo = {
                path: file.path || file.name,
                name: file.name,
                size: file.size,
                extension: path.extname(file.name).toLowerCase(),
                directory: file.path ? path.dirname(file.path) : '',
                isImage: true,
                file: file
            };
            newFiles.push(fileInfo);
        }
    }

    if (newFiles.length === 0) {
        showToast(getToastMessage('noImageFiles'), 'warning');
        return;
    }

    appState.files.push(...newFiles);
    updateFileList();
    updateFileStats();
    updateOutputFolderDisplay();

    showToast(`${newFiles.length} ${getToastMessage('filesAdded')}`, 'success');
}

function updateFileList() {
    if (!elements.fileList) return;

    elements.fileList.innerHTML = '';

    if (appState.files.length === 0) {
        elements.fileListContainer.style.display = 'none';
        elements.processingControls.style.display = 'none';
        return;
    }

    elements.fileListContainer.style.display = 'block';
    elements.processingControls.style.display = 'flex';

    appState.files.forEach((file, index) => {
        const fileItem = createFileItem(file, index);
        elements.fileList.appendChild(fileItem);
    });
}

function createFileItem(file, index) {
    const item = document.createElement('div');
    item.className = 'file-item';

    const icon = getFileIcon(file.extension);
    const size = formatFileSize(file.size);

    item.innerHTML = `
        <div class="file-icon">
            <i class="fas ${icon}"></i>
        </div>
        <div class="file-info">
            <div class="file-name">${file.name}</div>
            <div class="file-path">${file.directory || 'Browser File'}</div>
        </div>
        <div class="file-size">${size}</div>
        <button class="btn btn-sm btn-outline remove-file-btn" data-index="${index}">
            <i class="fas fa-times"></i>
        </button>
    `;

    const removeBtn = item.querySelector('.remove-file-btn');
    removeBtn.addEventListener('click', () => {
        removeFile(index);
    });

    return item;
}

function removeFile(index) {
    appState.files.splice(index, 1);
    updateFileList();
    updateFileStats();
    updateOutputFolderDisplay();
}

function clearFiles() {
    appState.files = [];
    updateFileList();
    updateFileStats();
    updateOutputFolderDisplay();
    showToast(getToastMessage('filesCleared'), 'info');
}

function updateFileStats() {
    const count = appState.files.length;
    const totalSize = appState.files.reduce((sum, file) => sum + file.size, 0);

    if (elements.fileCount) {
        elements.fileCount.textContent = count.toString();
    }

    if (elements.totalSize) {
        elements.totalSize.textContent = formatFileSize(totalSize);
    }
}

function updateOutputFolderUI() {
    const isCustomMode = appState.settings.outputMode === 'custom';
    elements.outputFolderSelection.style.display = isCustomMode ? 'block' : 'none';

    elements.outputModeSource.checked = appState.settings.outputMode === 'source';
    elements.outputModeCustom.checked = appState.settings.outputMode === 'custom';
}

function updateOutputFolderDisplay() {
    if (!elements.outputFolderPath) return;

    let outputPath = '';

    if (appState.settings.outputMode === 'custom' && appState.settings.customOutputFolder) {
        outputPath = appState.settings.customOutputFolder;
    } else if (appState.files.length > 0) {
        const firstFileDir = path.dirname(appState.files[0].path);
        outputPath = firstFileDir;
    } else {
        const defaultText = typeof i18n !== 'undefined' ? i18n.t('optimizer.same_as_source') : 'Same as source';
        elements.outputFolderPath.textContent = defaultText;
        return;
    }

    if (appState.settings.createSubfolder) {
        outputPath = path.join(outputPath, appState.settings.subfolderName);
    }

    appState.outputFolder = outputPath;
    elements.outputFolderPath.textContent = outputPath;
}

async function browseForOutputFolder() {
    try {
        const result = await ipcRenderer.invoke('browse-for-output-folder', {
            title: 'Select Output Folder',
            defaultPath: appState.settings.customOutputFolder
        });

        if (result.success && !result.canceled) {
            appState.settings.customOutputFolder = result.folder;
            elements.outputFolderInput.value = result.folder;
            updateOutputFolderDisplay();
            showToast(getToastMessage('outputFolderSelected'), 'success');
        }
    } catch (error) {
        console.error('Error browsing for output folder:', error);
        showToast(getToastMessage('outputFolderInvalid'), 'error');
    }
}

async function startProcessing() {
    if (appState.files.length === 0) {
        showToast(getToastMessage('noImageFiles'), 'warning');
        return;
    }

    const finalOutputDir = await determineFinalOutputDirectory();
    if (!finalOutputDir) {
        showToast(getToastMessage('outputFolderInvalid'), 'error');
        return;
    }

    appState.processing = {
        isProcessing: true,
        currentFile: '',
        processed: 0,
        total: appState.files.length,
        errors: []
    };

    elements.processingProgress.style.display = 'block';
    elements.processingResults.style.display = 'none';
    elements.startProcessingBtn.disabled = true;

    try {
        await createOutputDirectory(finalOutputDir);

        for (let i = 0; i < appState.files.length; i++) {
            const file = appState.files[i];

            updateProcessingProgress(file.name, i, appState.files.length);

            try {
                await processImage(file, finalOutputDir);
                appState.processing.processed++;
            } catch (error) {
                console.error(`Error processing ${file.name}:`, error);
                appState.processing.errors.push({
                    file: file.name,
                    error: error.message
                });
            }

            updateProcessingStats();
        }

        showProcessingResults();

    } catch (error) {
        console.error('Processing error:', error);
        showToast(`Processing failed: ${error.message}`, 'error');
    } finally {
        appState.processing.isProcessing = false;
        elements.startProcessingBtn.disabled = false;
        elements.processingProgress.style.display = 'none';
    }
}

async function determineFinalOutputDirectory() {
    let outputDir;

    if (appState.settings.outputMode === 'custom' && appState.settings.customOutputFolder) {
        outputDir = appState.settings.customOutputFolder;
    } else if (appState.files.length > 0) {
        outputDir = path.dirname(appState.files[0].path);
    } else {
        return null;
    }

    if (appState.settings.createSubfolder) {
        outputDir = path.join(outputDir, appState.settings.subfolderName);
    }

    return outputDir;
}

async function processImage(file, outputDir) {
    const outputPath = generateOutputPath(file, outputDir);

    let image = sharp(file.path);

    if (appState.settings.enableResize) {
        const resizeOptions = {
            width: appState.settings.resizeWidth,
            height: appState.settings.resizeHeight,
            fit: appState.settings.resizeMode,
            withoutEnlargement: !appState.settings.enlargeImages
        };

        if (appState.settings.backgroundColor && appState.settings.backgroundColor !== '#ffffff') {
            resizeOptions.background = appState.settings.backgroundColor;
        }

        image = image.resize(resizeOptions);
    }

    if (appState.settings.enableWatermark && appState.settings.watermarkFile) {
        try {
            const watermarkBuffer = await createWatermark(file);
            if (watermarkBuffer) {
                image = image.composite([{
                    input: watermarkBuffer,
                    gravity: appState.settings.watermarkPosition,
                    blend: 'over'
                }]);
            }
        } catch (error) {
            console.warn(`Watermark failed for ${file.name}:`, error);
        }
    }

    if (appState.settings.changeFormat) {
        const format = appState.settings.outputFormat;
        const options = {};

        if (appState.settings.changeCompression) {
            if (format === 'jpg' || format === 'jpeg') {
                options.quality = appState.settings.compressionQuality;
            } else if (format === 'png') {
                options.compressionLevel = Math.floor((100 - appState.settings.compressionQuality) / 10);
            } else if (format === 'webp') {
                options.quality = appState.settings.compressionQuality;
            }
        }

        image = image.toFormat(format, options);
    } else if (appState.settings.changeCompression) {
        const ext = file.extension.toLowerCase().replace('.', '');
        if (ext === 'jpg' || ext === 'jpeg') {
            image = image.jpeg({ quality: appState.settings.compressionQuality });
        } else if (ext === 'png') {
            image = image.png({
                compressionLevel: Math.floor((100 - appState.settings.compressionQuality) / 10)
            });
        } else if (ext === 'webp') {
            image = image.webp({ quality: appState.settings.compressionQuality });
        }
    }

    await image.toFile(outputPath);
}

async function createWatermark(file) {
    if (!appState.settings.watermarkFile) return null;

    try {
        const metadata = await sharp(file.path).metadata();
        const imageWidth = metadata.width;
        const imageHeight = metadata.height;

        const watermarkWidth = Math.floor(imageWidth * (appState.settings.watermarkSize / 100));

        let watermark = sharp(appState.settings.watermarkFile)
            .resize(watermarkWidth, null, {
                fit: 'inside',
                withoutEnlargement: true
            });

        if (appState.settings.watermarkOpacity < 100) {
            const opacity = appState.settings.watermarkOpacity / 100;
            watermark = watermark.composite([{
                input: Buffer.from([255, 255, 255, Math.floor(255 * opacity)]),
                raw: { width: 1, height: 1, channels: 4 },
                tile: true,
                blend: 'dest-in'
            }]);
        }

        return await watermark.toBuffer();
    } catch (error) {
        console.error('Watermark creation error:', error);
        return null;
    }
}

function generateOutputPath(file, outputDir) {
    let filename = file.name;

    if (appState.settings.enableBatchRename && appState.settings.namePattern) {
        filename = applyNamePattern(file, appState.processing.processed + 1);
    }

    if (appState.settings.changeCase) {
        filename = applyCaseChange(filename, appState.settings.letterCase);
    }

    if (appState.settings.changeFormat) {
        const nameWithoutExt = path.parse(filename).name;
        filename = `${nameWithoutExt}.${appState.settings.outputFormat}`;
    }

    let outputPath;
    if (appState.settings.preserveStructure && file.directory) {
        const relativePath = path.relative(path.dirname(appState.files[0].path), file.directory);
        outputPath = path.join(outputDir, relativePath, filename);
    } else {
        outputPath = path.join(outputDir, filename);
    }

    return outputPath;
}

function applyNamePattern(file, counter) {
    let pattern = appState.settings.namePattern;
    const originalName = path.parse(file.name).name;
    const ext = path.extname(file.name);

    pattern = pattern.replace(/{counter}/g, counter.toString().padStart(3, '0'));
    pattern = pattern.replace(/{original}/g, originalName);
    pattern = pattern.replace(/{date}/g, new Date().toISOString().split('T')[0]);
    pattern = pattern.replace(/{time}/g, new Date().toTimeString().split(' ')[0].replace(/:/g, '-'));

    return pattern + ext;
}

function applyCaseChange(filename, caseType) {
    const { name, ext } = path.parse(filename);

    switch (caseType) {
        case 'lowercase':
            return (name + ext).toLowerCase();
        case 'uppercase':
            return (name + ext).toUpperCase();
        case 'name-lowercase':
            return name.toLowerCase() + ext;
        case 'name-uppercase':
            return name.toUpperCase() + ext;
        case 'ext-lowercase':
            return name + ext.toLowerCase();
        case 'ext-uppercase':
            return name + ext.toUpperCase();
        default:
            return filename;
    }
}

async function createOutputDirectory(outputDir) {
    try {
        const result = await ipcRenderer.invoke('create-output-directory', outputDir);
        if (!result.success) {
            throw new Error(result.error);
        }
        appState.outputFolder = outputDir;
        showToast(getToastMessage('outputFolderCreated'), 'success');
    } catch (error) {
        throw new Error(`Failed to create output directory: ${error.message}`);
    }
}

function updateProcessingProgress(currentFile, current, total) {
    const percentage = Math.floor((current / total) * 100);

    if (elements.progressFill) {
        elements.progressFill.style.width = `${percentage}%`;
    }

    if (elements.progressText) {
        elements.progressText.textContent = `Processing ${current + 1} of ${total}`;
    }

    if (elements.progressPercentage) {
        elements.progressPercentage.textContent = `${percentage}%`;
    }

    if (elements.currentFile) {
        elements.currentFile.textContent = currentFile;
    }

    appState.processing.currentFile = currentFile;
}

function updateProcessingStats() {
    if (elements.processedCount) {
        elements.processedCount.textContent = appState.processing.processed.toString();
    }

    if (elements.remainingCount) {
        elements.remainingCount.textContent =
            (appState.processing.total - appState.processing.processed).toString();
    }

    if (elements.errorCount) {
        elements.errorCount.textContent = appState.processing.errors.length.toString();
    }
}

function showProcessingResults() {
    elements.processingResults.style.display = 'block';

    if (!elements.resultsSummary) return;

    const { processed, total, errors } = appState.processing;
    const successCount = processed - errors.length;

    const summaryHTML = `
        <div class="result-item success">
            <i class="fas fa-check-circle"></i>
            <span>Successfully processed ${successCount} of ${total} images</span>
        </div>
        ${errors.length > 0 ? `
            <div class="result-item error">
                <i class="fas fa-exclamation-circle"></i>
                <span>${errors.length} images failed to process</span>
            </div>
        ` : ''}
        ${errors.map(error => `
            <div class="result-item error">
                <i class="fas fa-file-image"></i>
                <span>${error.file}: ${error.error}</span>
            </div>
        `).join('')}
    `;

    elements.resultsSummary.innerHTML = summaryHTML;

    showToast(`${getToastMessage('processingComplete')} ${successCount}/${total} images processed successfully`,
        errors.length > 0 ? 'warning' : 'success');
}

function updateUI() {
    updateFileList();
    updateFileStats();
    updateOutputFolderUI();
    updateOutputFolderDisplay();

    Object.keys(appState.settings).forEach(key => {
        const element = elements[key];
        if (element) {
            if (element.type === 'checkbox') {
                element.checked = appState.settings[key];
            } else if (element.type === 'radio') {
                element.checked = appState.settings[key] === element.value;
            } else if (element.type === 'range') {
                element.value = appState.settings[key];
            } else {
                element.value = appState.settings[key];
            }
        }
    });

    if (elements.subfolderNameGroup) {
        elements.subfolderNameGroup.style.display = appState.settings.createSubfolder ? 'block' : 'none';
    }
}

async function selectWatermark() {
    try {
        const result = await ipcRenderer.invoke('select-watermark');
        if (result.success && !result.canceled) {
            appState.settings.watermarkFile = result.path;
            if (elements.watermarkFile) {
                elements.watermarkFile.value = result.name;
            }
            showToast(getToastMessage('watermarkSelected'), 'success');
        }
    } catch (error) {
        console.error('Error selecting watermark:', error);
        showToast('Failed to select watermark', 'error');
    }
}

async function openOutputFolder() {
    const outputDir = await determineFinalOutputDirectory();
    if (!outputDir) {
        showToast('No output folder determined', 'warning');
        return;
    }

    try {
        await ipcRenderer.invoke('open-folder', outputDir);
    } catch (error) {
        console.error('Error opening output folder:', error);
        showToast('Failed to open output folder', 'error');
    }
}

async function loadAppVersion() {
    try {
        const result = await ipcRenderer.invoke('get-app-version');
        if (result.success && elements.currentVersion) {
            elements.currentVersion.textContent = result.version;
        }
    } catch (error) {
        console.error('Error loading app version:', error);
    }
}

async function checkForUpdates() {
    try {
        appState.updateInfo.checking = true;
        updateUpdateStatus();

        await ipcRenderer.invoke('check-for-updates');
    } catch (error) {
        console.error('Error checking for updates:', error);
        appState.updateInfo = {
            checking: false,
            available: false,
            downloading: false,
            downloaded: false,
            error: error
        };
        updateUpdateStatus();
    }
}

async function downloadUpdate() {
    try {
        appState.updateInfo.downloading = true;
        updateInstallButton();
        elements.downloadProgress.style.display = 'block';

        await ipcRenderer.invoke('download-update');
    } catch (error) {
        console.error('Error downloading update:', error);
        appState.updateInfo.downloading = false;
        updateInstallButton();
    }
}

async function installUpdate() {
    try {
        await ipcRenderer.invoke('install-update');
    } catch (error) {
        console.error('Error installing update:', error);
        showToast('Failed to install update', 'error');
    }
}

function showUpdateModal(info) {
    if (!elements.updateModal) return;

    if (elements.modalCurrentVersion && elements.currentVersion) {
        elements.modalCurrentVersion.textContent = elements.currentVersion.textContent;
    }

    if (elements.modalNewVersion && info.version) {
        elements.modalNewVersion.textContent = info.version;
    }

    if (elements.releaseNotesContent && info.releaseNotes) {
        elements.releaseNotesContent.innerHTML = info.releaseNotes.replace(/\n/g, '<br>');
    }

    elements.downloadProgress.style.display = 'none';
    updateInstallButton();
    elements.updateModal.style.display = 'block';
}

function hideUpdateModal() {
    if (elements.updateModal) {
        elements.updateModal.style.display = 'none';
    }
}

function updateDownloadProgress(progressObj) {
    if (elements.downloadPercentage) {
        elements.downloadPercentage.textContent = `${Math.round(progressObj.percent)}%`;
    }

    if (elements.downloadProgressFill) {
        elements.downloadProgressFill.style.width = `${progressObj.percent}%`;
    }
}

function updateInstallButton() {
    if (!elements.installUpdateBtn) return;

    const button = elements.installUpdateBtn;
    const icon = button.querySelector('i');
    const text = button.querySelector('span');

    if (appState.updateInfo.downloading) {
        button.disabled = true;
        icon.className = 'fas fa-spinner fa-spin';
        text.textContent = typeof i18n !== 'undefined' ? i18n.t('updater.downloading') : 'Downloading...';
    } else if (appState.updateInfo.downloaded) {
        button.disabled = false;
        icon.className = 'fas fa-rocket';
        text.textContent = typeof i18n !== 'undefined' ? i18n.t('updater.install_now') : 'Install Now';
    } else {
        button.disabled = false;
        icon.className = 'fas fa-download';
        text.textContent = typeof i18n !== 'undefined' ? i18n.t('updater.install_now') : 'Install Now';
    }
}

function updateUpdateStatus() {
    if (!elements.updateStatus) return;

    let statusHTML = '';

    if (appState.updateInfo.checking) {
        statusHTML = `
            <div class="update-status-item info">
                <i class="fas fa-spinner fa-spin"></i>
                <span>${typeof i18n !== 'undefined' ? i18n.t('updater.checking') : 'Checking for updates...'}</span>
            </div>
        `;
    } else if (appState.updateInfo.available) {
        statusHTML = `
            <div class="update-status-item success">
                <i class="fas fa-download"></i>
                <span>${typeof i18n !== 'undefined' ? i18n.t('updater.available') : 'Update Available'}</span>
            </div>
        `;
    } else if (appState.updateInfo.error) {
        statusHTML = `
            <div class="update-status-item error">
                <i class="fas fa-exclamation-circle"></i>
                <span>${typeof i18n !== 'undefined' ? i18n.t('updater.error') : 'Update failed'}</span>
            </div>
        `;
    } else {
        statusHTML = `
            <div class="update-status-item">
                <i class="fas fa-check-circle"></i>
                <span>${typeof i18n !== 'undefined' ? i18n.t('updater.not_available') : 'You are using the latest version'}</span>
            </div>
        `;
    }

    elements.updateStatus.innerHTML = statusHTML;
}

function loadSettings() {
    try {
        const saved = localStorage.getItem('imageOptimizerSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            appState.settings = { ...appState.settings, ...settings };
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

function saveSettings() {
    try {
        localStorage.setItem('imageOptimizerSettings', JSON.stringify(appState.settings));
    } catch (error) {
        console.error('Error saving settings:', error);
    }
}

setInterval(saveSettings, 5000);

function isImageFile(filename) {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.tiff', '.tif', '.gif', '.avif', '.svg'];
    const ext = path.extname(filename).toLowerCase();
    return imageExtensions.includes(ext);
}

function getFileIcon(extension) {
    const iconMap = {
        '.jpg': 'fa-file-image',
        '.jpeg': 'fa-file-image',
        '.png': 'fa-file-image',
        '.webp': 'fa-file-image',
        '.tiff': 'fa-file-image',
        '.tif': 'fa-file-image',
        '.gif': 'fa-file-image',
        '.avif': 'fa-file-image',
        '.svg': 'fa-file-code'
    };
    return iconMap[extension] || 'fa-file';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function isValidColor(color) {
    const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return colorRegex.test(color);
}

function getToastMessage(key) {
    if (typeof i18n !== 'undefined') {
        const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        return i18n.t(`toast.${snakeKey}`);
    }

    const fallbackMessages = {
        filesAdded: 'files added',
        noImageFiles: 'No image files found',
        processingFiles: 'Processing files...',
        outputFolderSelected: 'Output folder selected',
        outputFolderCreated: 'Output folder created',
        outputFolderInvalid: 'Invalid output folder',
        watermarkSelected: 'Watermark selected',
        processingComplete: 'Processing complete!',
        filesCleared: 'All files cleared',
        updateChecking: 'Checking for updates...',
        updateAvailable: 'Update available!',
        updateNotAvailable: 'No updates available',
        updateDownloaded: 'Update ready to install',
        updateError: 'Update check failed'
    };

    return fallbackMessages[key] || key;
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas ${icons[type] || icons.info}"></i>
            <div class="toast-message">${message}</div>
        </div>
    `;

    const container = document.getElementById('toast-container');
    if (container) {
        container.appendChild(toast);

        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 4000);

        toast.addEventListener('click', () => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        });
    }
}

window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    showToast(`Unexpected error: ${e.error?.message || 'Unknown error'}`, 'error');
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    showToast(`Promise error: ${e.reason?.message || 'Unknown error'}`, 'error');
});

window.appState = appState;
window.showToast = showToast;