const { ipcRenderer } = require('electron');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const os = require('os');

let appState = {
    files: [],
    combinerFiles: [],
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
        autoCheckUpdates: true,

        combinerAlignment: 'vertical',
        combinerSpacing: 10,
        combinerMaxWidth: 3000,
        combinerMaxHeight: 3000,
        combinerBackgroundColor: '#ffffff',
        combinerOutputFormat: 'jpg',
        combinerQuality: 90,
        combinerOutputMode: 'source',
        combinerCustomOutputFolder: '',
        
        enableCrop: false,
        cropMode: 'custom',
        cropWidth: 1920,
        cropHeight: 1080,
        
        enableRotate: false,
        rotationAngle: 0,
        flipHorizontal: false,
        flipVertical: false,
        
        enableAdjustments: false,
        brightness: 0,
        contrast: 0,
        saturation: 0,
        
        enableFilters: false,
        filterType: 'none',
        filterStrength: 5,
        
        preserveExif: false,
        recentFolders: []
    },
    outputFolder: '',
    combinerOutputFolder: '',
    processing: {
        isProcessing: false,
        currentFile: '',
        processed: 0,
        total: 0,
        errors: [],
        startTime: null,
        cancelled: false,
        stage: 'preparing'
    },
    combining: {
        isCombining: false,
        progress: 0,
        status: '',
        startTime: null,
        cancelled: false,
        stage: 'loading'
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

    combinerDropzone: document.getElementById('combiner-dropzone'),
    combinerFileInput: document.getElementById('combiner-file-input'),
    combinerFileList: document.getElementById('combiner-file-list'),
    combinerFileListContainer: document.getElementById('combiner-file-list-container'),
    combinerFileCount: document.getElementById('combiner-file-count'),
    combinerTotalSize: document.getElementById('combiner-total-size'),
    combinerClearFilesBtn: document.getElementById('combiner-clear-files'),

    outputModeSource: document.getElementById('output-mode-source'),
    outputModeCustom: document.getElementById('output-mode-custom'),
    outputFolderSelection: document.getElementById('output-folder-selection'),
    outputFolderInput: document.getElementById('output-folder-input'),
    browseOutputFolderBtn: document.getElementById('browse-output-folder'),
    createSubfolder: document.getElementById('create-subfolder'),
    subfolderNameGroup: document.getElementById('subfolder-name-group'),
    subfolderName: document.getElementById('subfolder-name'),
    outputFolderPath: document.getElementById('output-folder-path'),

    combinerOutputModeSource: document.getElementById('combiner-output-mode-source'),
    combinerOutputModeCustom: document.getElementById('combiner-output-mode-custom'),
    combinerOutputFolderSelection: document.getElementById('combiner-output-folder-selection'),
    combinerOutputFolderInput: document.getElementById('combiner-output-folder-input'),
    combinerBrowseOutputFolderBtn: document.getElementById('combiner-browse-output-folder'),
    combinerOutputFolderPath: document.getElementById('combiner-output-folder-path'),

    processingControls: document.getElementById('processing-controls'),
    startProcessingBtn: document.getElementById('start-processing'),

    combinerProcessingControls: document.getElementById('combiner-processing-controls'),
    startCombiningBtn: document.getElementById('start-combining'),

    processingProgress: document.getElementById('processing-progress'),
    progressFill: document.getElementById('progress-fill'),
    progressText: document.getElementById('progress-text'),
    progressPercentage: document.getElementById('progress-percentage'),
    currentFile: document.getElementById('current-file'),
    processedCount: document.getElementById('processed-count'),
    remainingCount: document.getElementById('remaining-count'),
    errorCount: document.getElementById('error-count'),

    combinerProgress: document.getElementById('combiner-progress'),
    combinerProgressFill: document.getElementById('combiner-progress-fill'),
    combinerProgressText: document.getElementById('combiner-progress-text'),
    combinerProgressPercentage: document.getElementById('combiner-progress-percentage'),

    processingResults: document.getElementById('processing-results'),
    resultsSummary: document.getElementById('results-summary'),
    openOutputFolderBtn: document.getElementById('open-output-folder'),

    combinerResults: document.getElementById('combiner-results'),
    combinerResultsSummary: document.getElementById('combiner-results-summary'),
    combinerOpenOutputFolderBtn: document.getElementById('combiner-open-output-folder'),

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

    combinerVertical: document.getElementById('combiner-vertical'),
    combinerHorizontal: document.getElementById('combiner-horizontal'),
    combinerSpacing: document.getElementById('combiner-spacing'),
    combinerSpacingValue: document.getElementById('combiner-spacing-value'),
    combinerMaxWidth: document.getElementById('combiner-max-width'),
    combinerMaxHeight: document.getElementById('combiner-max-height'),
    combinerBackgroundColor: document.getElementById('combiner-background-color'),
    combinerBackgroundColorText: document.getElementById('combiner-background-color-text'),
    combinerOutputFormat: document.getElementById('combiner-output-format'),
    combinerQuality: document.getElementById('combiner-quality'),
    combinerQualityValue: document.getElementById('combiner-quality-value'),

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
    installUpdateBtn: document.getElementById('install-update'),

    fullscreenProcessing: document.getElementById('fullscreen-processing'),
    fullscreenTitle: document.getElementById('fullscreen-title'),
    fullscreenSubtitle: document.getElementById('fullscreen-subtitle'),
    fullscreenProgressFill: document.getElementById('fullscreen-progress-fill'),
    fullscreenProgressText: document.getElementById('fullscreen-progress-text'),
    fullscreenProcessed: document.getElementById('fullscreen-processed'),
    fullscreenRemaining: document.getElementById('fullscreen-remaining'),
    fullscreenTimeElapsed: document.getElementById('fullscreen-time-elapsed'),
    fullscreenTimeRemaining: document.getElementById('fullscreen-time-remaining'),
    fullscreenCurrentFile: document.getElementById('fullscreen-current-file'),
    cancelProcessingBtn: document.getElementById('cancel-processing'),
    cancelProcessingText: document.getElementById('cancel-processing-text'),
    stageIcon: document.getElementById('stage-icon'),
    stageTitle: document.getElementById('stage-title'),
    stageDescription: document.getElementById('stage-description'),
    
    enableCrop: document.getElementById('enable-crop'),
    cropMode: document.getElementById('crop-mode'),
    cropSettings: document.querySelector('.crop-settings'),
    cropWidth: document.getElementById('crop-width'),
    cropHeight: document.getElementById('crop-height'),
    cropDimensions: document.getElementById('crop-dimensions'),
    
    enableRotate: document.getElementById('enable-rotate'),
    rotationAngle: document.getElementById('rotation-angle'),
    flipHorizontal: document.getElementById('flip-horizontal'),
    flipVertical: document.getElementById('flip-vertical'),
    rotateSettings: document.querySelector('.rotate-settings'),
    
    enableAdjustments: document.getElementById('enable-adjustments'),
    brightnessSlider: document.getElementById('brightness-slider'),
    brightnessValue: document.getElementById('brightness-value'),
    contrastSlider: document.getElementById('contrast-slider'),
    contrastValue: document.getElementById('contrast-value'),
    saturationSlider: document.getElementById('saturation-slider'),
    saturationValue: document.getElementById('saturation-value'),
    adjustmentsSettings: document.querySelector('.adjustments-settings'),
    
    enableFilters: document.getElementById('enable-filters'),
    filterType: document.getElementById('filter-type'),
    filterStrength: document.getElementById('filter-strength'),
    filterStrengthValue: document.getElementById('filter-strength-value'),
    filterStrengthGroup: document.getElementById('filter-strength-group'),
    filtersSettings: document.querySelector('.filters-settings'),
    
    preserveExif: document.getElementById('preserve-exif')
};

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    document.body.classList.add('start-page-active');
    
    setupEventListeners();
    setupWindowControls();
    setupUpdateHandlers();
    setupKeyboardShortcuts();
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
            if (typeof i18n !== 'undefined') {
                i18n.setLanguage(e.target.value);
            }
        });
    }
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        const isCtrlOrCmd = e.ctrlKey || e.metaKey;
        
        if (isCtrlOrCmd && (e.code === 'Delete' || e.key === 'Delete')) {
            e.preventDefault();
            clearFiles();
        } else if (isCtrlOrCmd && (e.code === 'Enter' || e.key === 'Enter')) {
            e.preventDefault();
            if (appState.files.length > 0 && !appState.processing.isProcessing) {
                startProcessing();
            }
        } else if (isCtrlOrCmd && (e.code === 'KeyO' || e.key.toLowerCase() === 'o')) {
            e.preventDefault();
            openOutputFolder();
        } else if ((e.code === 'Digit1' || e.code === 'Numpad1') && !isCtrlOrCmd && !e.altKey && !e.shiftKey) {
            e.preventDefault();
            switchTab('optimizer');
        } else if ((e.code === 'Digit2' || e.code === 'Numpad2') && !isCtrlOrCmd && !e.altKey && !e.shiftKey) {
            e.preventDefault();
            switchTab('combiner');
        } else if ((e.code === 'Digit3' || e.code === 'Numpad3') && !isCtrlOrCmd && !e.altKey && !e.shiftKey) {
            e.preventDefault();
            switchTab('help');
        } else if ((e.code === 'Escape' || e.key === 'Escape') && appState.processing.isProcessing) {
            e.preventDefault();
            cancelProcessing();
        }
    });
}

function setupEventListeners() {
    elements.navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabId = item.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    const startOptions = document.querySelectorAll('.start-option');
    startOptions.forEach(option => {
        option.addEventListener('click', () => {
            const action = option.getAttribute('data-action');
            switchTab(action);
        });
        
        option.addEventListener('mousemove', (e) => {
            const rect = option.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            option.style.setProperty('--mouse-x', `${x}%`);
            option.style.setProperty('--mouse-y', `${y}%`);
        });
    });

    setupDropzone();
    setupCombinerDropzone();
    setupFileInputs();
    setupOutputFolderControls();
    setupCombinerOutputFolderControls();

    elements.startProcessingBtn?.addEventListener('click', startProcessing);
    elements.clearFilesBtn?.addEventListener('click', clearFiles);
    elements.openOutputFolderBtn?.addEventListener('click', openOutputFolder);

    elements.startCombiningBtn?.addEventListener('click', startCombining);
    elements.combinerClearFilesBtn?.addEventListener('click', clearCombinerFiles);
    elements.combinerOpenOutputFolderBtn?.addEventListener('click', openCombinerOutputFolder);

    elements.cancelProcessingBtn?.addEventListener('click', cancelProcessing);

    setupSettingsEventListeners();
    setupCombinerEventListeners();
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

    ipcRenderer.on('processing-cancelled', () => {
        handleProcessingCancellation();
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

function setupCombinerOutputFolderControls() {
    const combinerOutputModeRadios = document.querySelectorAll('input[name="combiner-output-mode"]');
    combinerOutputModeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            appState.settings.combinerOutputMode = e.target.value;
            updateCombinerOutputFolderUI();
            updateCombinerOutputFolderDisplay();
        });
    });

    elements.combinerBrowseOutputFolderBtn?.addEventListener('click', browseForCombinerOutputFolder);
    
    const recentFoldersSelect = document.getElementById('recent-folders-select');
    if (recentFoldersSelect) {
        recentFoldersSelect.addEventListener('change', function() {
            if (this.value) {
                appState.settings.customOutputFolder = this.value;
                elements.outputFolderInput.value = this.value;
                updateOutputFolderDisplay();
                showToast(getToastMessage('outputFolderSelected'), 'success');
                this.value = '';
            }
        });
    }
    
    const combinerRecentFoldersSelect = document.getElementById('combiner-recent-folders-select');
    if (combinerRecentFoldersSelect) {
        combinerRecentFoldersSelect.addEventListener('change', function() {
            if (this.value) {
                appState.settings.combinerCustomOutputFolder = this.value;
                elements.combinerOutputFolderInput.value = this.value;
                updateCombinerOutputFolderDisplay();
                showToast(getToastMessage('outputFolderSelected'), 'success');
                this.value = '';
            }
        });
    }
}

function setupDropzone() {
    if (!elements.dropzone) return;

    elements.dropzone.addEventListener('click', (e) => {
        if (e.target === elements.dropzone || e.target.closest('.dropzone-content')) {
            selectImagesUsingDialog();
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
        if (files.length > 0) {
            await handleDroppedImageFiles(files);
        }
    });
}

function setupCombinerDropzone() {
    if (!elements.combinerDropzone) return;

    elements.combinerDropzone.addEventListener('click', (e) => {
        if (e.target === elements.combinerDropzone || e.target.closest('.dropzone-content')) {
            selectCombinerFilesUsingDialog();
        }
    });

    elements.combinerDropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.combinerDropzone.classList.add('dragover');
    });

    elements.combinerDropzone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        if (!elements.combinerDropzone.contains(e.relatedTarget)) {
            elements.combinerDropzone.classList.remove('dragover');
        }
    });

    elements.combinerDropzone.addEventListener('drop', async (e) => {
        e.preventDefault();
        elements.combinerDropzone.classList.remove('dragover');
        
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            await handleDroppedCombinerFiles(files);
        }
    });
}

function setupFileInputs() {
    elements.fileInputFiles?.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            await handleSelectedImageFiles(files);
        }
        e.target.value = '';
    });

    elements.combinerFileInput?.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            await handleSelectedCombinerFiles(files);
        }
        e.target.value = '';
    });
}

function showFullscreenProcessing(type = 'processing') {
    if (elements.fullscreenProcessing) {
        elements.fullscreenProcessing.style.display = 'flex';
        
        if (type === 'processing') {
            elements.fullscreenTitle.textContent = typeof i18n !== 'undefined' ? i18n.t('processing.fullscreen_title') : 'Processing Images';
            elements.fullscreenSubtitle.textContent = typeof i18n !== 'undefined' ? i18n.t('processing.fullscreen_subtitle') : 'Please wait while we optimize your images';
            elements.cancelProcessingText.textContent = typeof i18n !== 'undefined' ? i18n.t('processing.fullscreen_cancel') : 'Cancel Processing';
        } else {
            elements.fullscreenTitle.textContent = typeof i18n !== 'undefined' ? i18n.t('combining.fullscreen_title') : 'Combining Images';
            elements.fullscreenSubtitle.textContent = typeof i18n !== 'undefined' ? i18n.t('combining.fullscreen_subtitle') : 'Please wait while we combine your images';
            elements.cancelProcessingText.textContent = typeof i18n !== 'undefined' ? i18n.t('combining.fullscreen_cancel') : 'Cancel Combining';
        }
        
        updateFullscreenProgress(0, 'preparing', 0, 0);
    }
}

function hideFullscreenProcessing() {
    if (elements.fullscreenProcessing) {
        elements.fullscreenProcessing.style.display = 'none';
    }
}

function updateFullscreenProgress(percentage, stage, processed, total) {
    if (!elements.fullscreenProcessing) return;

    if (elements.fullscreenProgressFill) {
        elements.fullscreenProgressFill.style.width = `${percentage}%`;
    }

    if (elements.fullscreenProgressText) {
        elements.fullscreenProgressText.textContent = `${Math.floor(percentage)}%`;
    }

    if (elements.fullscreenProcessed) {
        elements.fullscreenProcessed.textContent = processed.toString();
    }

    if (elements.fullscreenRemaining) {
        elements.fullscreenRemaining.textContent = (total - processed).toString();
    }

    updateProcessingStage(stage);
    updateTimeDisplays();
}

function updateProcessingStage(stage) {
    if (!elements.stageTitle || !elements.stageIcon) return;

    const stageData = getStageData(stage);
    elements.stageTitle.textContent = stageData.title;
    elements.stageDescription.textContent = stageData.description;
    elements.stageIcon.className = `fas ${stageData.icon}`;
}

function getStageData(stage) {
    const processingStages = {
        preparing: {
            title: typeof i18n !== 'undefined' ? i18n.t('processing.stage_preparing') : 'Preparing...',
            description: '',
            icon: 'fa-cogs'
        },
        analyzing: {
            title: typeof i18n !== 'undefined' ? i18n.t('processing.stage_analyzing') : 'Analyzing...',
            description: '',
            icon: 'fa-search'
        },
        processing: {
            title: typeof i18n !== 'undefined' ? i18n.t('processing.stage_processing') : 'Processing...',
            description: '',
            icon: 'fa-cogs'
        },
        watermark: {
            title: typeof i18n !== 'undefined' ? i18n.t('processing.stage_applying_watermark') : 'Applying watermark...',
            description: '',
            icon: 'fa-copyright'
        },
        resizing: {
            title: typeof i18n !== 'undefined' ? i18n.t('processing.stage_resizing') : 'Resizing...',
            description: '',
            icon: 'fa-expand-arrows-alt'
        },
        converting: {
            title: typeof i18n !== 'undefined' ? i18n.t('processing.stage_converting') : 'Converting format...',
            description: '',
            icon: 'fa-exchange-alt'
        },
        saving: {
            title: typeof i18n !== 'undefined' ? i18n.t('processing.stage_saving') : 'Saving...',
            description: '',
            icon: 'fa-save'
        },
        finalizing: {
            title: typeof i18n !== 'undefined' ? i18n.t('processing.stage_finalizing') : 'Finalizing...',
            description: '',
            icon: 'fa-check'
        }
    };

    const combiningStages = {
        loading: {
            title: typeof i18n !== 'undefined' ? i18n.t('combining.stage_loading') : 'Loading images...',
            description: '',
            icon: 'fa-download'
        },
        extracting: {
            title: typeof i18n !== 'undefined' ? i18n.t('combining.stage_extracting') : 'Extracting PDF pages...',
            description: '',
            icon: 'fa-file-pdf'
        },
        analyzing: {
            title: typeof i18n !== 'undefined' ? i18n.t('combining.stage_analyzing') : 'Analyzing dimensions...',
            description: '',
            icon: 'fa-ruler'
        },
        scaling: {
            title: typeof i18n !== 'undefined' ? i18n.t('combining.stage_scaling') : 'Scaling images...',
            description: '',
            icon: 'fa-expand-arrows-alt'
        },
        arranging: {
            title: typeof i18n !== 'undefined' ? i18n.t('combining.stage_arranging') : 'Arranging layout...',
            description: '',
            icon: 'fa-layer-group'
        },
        compositing: {
            title: typeof i18n !== 'undefined' ? i18n.t('combining.stage_compositing') : 'Compositing images...',
            description: '',
            icon: 'fa-magic'
        },
        saving: {
            title: typeof i18n !== 'undefined' ? i18n.t('combining.stage_saving') : 'Saving combined image...',
            description: '',
            icon: 'fa-save'
        }
    };

    if (appState.processing.isProcessing) {
        return processingStages[stage] || processingStages.processing;
    } else if (appState.combining.isCombining) {
        return combiningStages[stage] || combiningStages.loading;
    }

    return processingStages.preparing;
}

function updateTimeDisplays() {
    const now = Date.now();
    
    if (appState.processing.isProcessing && appState.processing.startTime) {
        const elapsed = now - appState.processing.startTime;
        const elapsedFormatted = formatTime(elapsed);
        
        if (elements.fullscreenTimeElapsed) {
            elements.fullscreenTimeElapsed.textContent = elapsedFormatted;
        }

        if (appState.processing.processed > 0) {
            const avgTimePerFile = elapsed / appState.processing.processed;
            const remaining = (appState.processing.total - appState.processing.processed) * avgTimePerFile;
            const remainingFormatted = formatTime(remaining);
            
            if (elements.fullscreenTimeRemaining) {
                elements.fullscreenTimeRemaining.innerHTML = `<span data-i18n="processing.estimated">${typeof i18n !== 'undefined' ? i18n.t('processing.estimated') : 'estimated'}</span> ${remainingFormatted}`;
            }
        } else if (appState.processing.total > 0 && elapsed > 3000) {
            let estimatedTimePerFile = 2000;
            
            if (appState.processing.total > 20) {
                estimatedTimePerFile = 1500;
            } else if (appState.processing.total > 5) {
                estimatedTimePerFile = 2000;
            } else {
                estimatedTimePerFile = 3000;
            }
            
            const remaining = (appState.processing.total - appState.processing.processed) * estimatedTimePerFile;
            const remainingFormatted = formatTime(remaining);
            
            if (elements.fullscreenTimeRemaining) {
                elements.fullscreenTimeRemaining.innerHTML = `<span data-i18n="processing.estimated">${typeof i18n !== 'undefined' ? i18n.t('processing.estimated') : 'estimated'}</span> ${remainingFormatted}`;
            }
        } else {
            if (elements.fullscreenTimeRemaining) {
                elements.fullscreenTimeRemaining.innerHTML = `<span data-i18n="processing.calculating">${typeof i18n !== 'undefined' ? i18n.t('processing.calculating') : 'calculating...'}</span>`;
            }
        }
    } else if (appState.combining.isCombining && appState.combining.startTime) {
        const elapsed = now - appState.combining.startTime;
        const elapsedFormatted = formatTime(elapsed);
        
        if (elements.fullscreenTimeElapsed) {
            elements.fullscreenTimeElapsed.textContent = elapsedFormatted;
        }

        if (elapsed > 1000) {
            const fileCount = appState.combinerFiles.length;
            let estimatedTotalTime = 20000;
            
            appState.combinerFiles.forEach(file => {
                if (file.isPDF) {
                    estimatedTotalTime += 20000 + (5 * 3000);
                } else {
                    if (file.size && file.size > 5 * 1024 * 1024) {
                        estimatedTotalTime += 5000;
                    } else if (file.size && file.size > 1 * 1024 * 1024) {
                        estimatedTotalTime += 3000;
                    } else {
                        estimatedTotalTime += 2000;
                    }
                }
            });
            
            if (fileCount > 10) {
                estimatedTotalTime += 15000;
            } else if (fileCount > 5) {
                estimatedTotalTime += 8000;
            }
            
            if (fileCount > 8) {
                estimatedTotalTime += 12000;
            } else if (fileCount > 4) {
                estimatedTotalTime += 6000;
            }
            let adjustedEstimate = estimatedTotalTime;
            const currentStage = appState.combining.stage;
            
            if (currentStage === 'analyzing' || currentStage === 'scaling' || 
                currentStage === 'arranging' || currentStage === 'compositing' || 
                currentStage === 'saving') {
                adjustedEstimate = elapsed + (elapsed * 0.67);
            }
            
            const remaining = Math.max(0, adjustedEstimate - elapsed);
            const remainingFormatted = formatTime(remaining);
            
            if (elements.fullscreenTimeRemaining) {
                elements.fullscreenTimeRemaining.innerHTML = `<span data-i18n="processing.estimated">${typeof i18n !== 'undefined' ? i18n.t('processing.estimated') : 'estimated'}</span> ${remainingFormatted}`;
            }
        } else {
            if (elements.fullscreenTimeRemaining) {
                elements.fullscreenTimeRemaining.innerHTML = `<span data-i18n="processing.calculating">${typeof i18n !== 'undefined' ? i18n.t('processing.calculating') : 'calculating...'}</span>`;
            }
        }
    } else {
        if (elements.fullscreenTimeElapsed) {
            elements.fullscreenTimeElapsed.textContent = '00:00';
        }
        if (elements.fullscreenTimeRemaining) {
            elements.fullscreenTimeRemaining.innerHTML = `<span data-i18n="processing.estimated">${typeof i18n !== 'undefined' ? i18n.t('processing.estimated') : 'estimated'}</span> 00:00`;
        }
    }
}

function formatTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    } else {
        return `${minutes.toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
}

function cancelProcessing() {
    if (appState.processing.isProcessing) {
        appState.processing.cancelled = true;
        ipcRenderer.invoke('cancel-processing');
    } else if (appState.combining.isCombining) {
        appState.combining.cancelled = true;
        handleCombiningCancellation();
    }
}

function handleProcessingCancellation() {
    appState.processing.isProcessing = false;
    appState.processing.cancelled = true;
    hideFullscreenProcessing();
    elements.startProcessingBtn.disabled = false;
    showToast(getToastMessage('processingCancelled'), 'warning');
}

function handleCombiningCancellation() {
    appState.combining.isCombining = false;
    appState.combining.cancelled = true;
    hideFullscreenProcessing();
    elements.startCombiningBtn.disabled = false;
    showToast(getToastMessage('combiningCancelled'), 'warning');
}

async function selectImagesUsingDialog() {
    try {
        const result = await ipcRenderer.invoke('select-images');
        if (result.success && !result.canceled) {
            appState.files.push(...result.files);
            updateFileList();
            updateFileStats();
            updateOutputFolderDisplay();
            showToast(`${result.files.length} ${getToastMessage('filesAdded')}`, 'success');
        }
    } catch (error) {
        showToast(getToastMessage('failedToSelectImages'), 'error');
    }
}

async function selectCombinerFilesUsingDialog() {
    try {
        const result = await ipcRenderer.invoke('select-combiner-files');
        if (result.success && !result.canceled) {
            appState.combinerFiles.push(...result.files);
            updateCombinerFileList();
            updateCombinerFileStats();
            updateCombinerOutputFolderDisplay();
            showToast(`${result.files.length} ${getToastMessage('filesAdded')}`, 'success');
        }
    } catch (error) {
        showToast(getToastMessage('failedToSelectFiles'), 'error');
    }
}

async function readFileAsBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve(Buffer.from(reader.result));
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

async function writeBufferToTempFile(buffer, extension) {
    const tempDir = os.tmpdir();
    const tempFileName = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}${extension}`;
    const tempFilePath = path.join(tempDir, tempFileName);
    
    await fs.writeFile(tempFilePath, buffer);
    return tempFilePath;
}

async function handleSelectedImageFiles(files) {
    try {
        const validFiles = [];
        
        for (const file of files) {
            const fileName = file.name;
            
            
            if (fileName && isImageFile(fileName)) {
                try {
                    const buffer = await readFileAsBuffer(file);
                    
                    const fileInfo = {
                        path: file.path || null,
                        name: fileName,
                        size: file.size,
                        extension: path.extname(fileName).toLowerCase(),
                        directory: file.path ? path.dirname(file.path) : os.homedir(),
                        isImage: true,
                        modified: file.lastModified ? new Date(file.lastModified) : new Date(),
                        created: file.lastModified ? new Date(file.lastModified) : new Date(),
                        buffer: buffer,
                        fileObject: file
                    };
                    
                    validFiles.push(fileInfo);
                } catch (error) {
                }
            }
        }

        if (validFiles.length > 0) {
            appState.files.push(...validFiles);
            updateFileList();
            updateFileStats();
            updateOutputFolderDisplay();
            showToast(`${validFiles.length} ${getToastMessage('filesAdded')}`, 'success');
        } else {
            showToast(getToastMessage('noImageFiles'), 'warning');
        }
    } catch (error) {
        showToast(getToastMessage('failedToProcessFiles'), 'error');
    }
}

async function handleSelectedCombinerFiles(files) {
    try {
        const validFiles = [];
        
        for (const file of files) {
            const fileName = file.name;
            
            
            if (fileName && (isImageFile(fileName) || isPDFFile(fileName))) {
                try {
                    const buffer = await readFileAsBuffer(file);
                    const ext = path.extname(fileName).toLowerCase();
                    
                    let tempFilePath = null;
                    if (ext === '.pdf' && !file.path) {
                        tempFilePath = await writeBufferToTempFile(buffer, ext);
                    }
                    
                    const fileInfo = {
                        path: file.path || tempFilePath,
                        name: fileName,
                        size: file.size,
                        extension: ext,
                        directory: file.path ? path.dirname(file.path) : os.homedir(),
                        isImage: isImageFile(fileName),
                        isPDF: ext === '.pdf',
                        modified: file.lastModified ? new Date(file.lastModified) : new Date(),
                        created: file.lastModified ? new Date(file.lastModified) : new Date(),
                        buffer: buffer,
                        fileObject: file,
                        tempFilePath: tempFilePath,
                        isTemporary: !!tempFilePath
                    };
                    
                    validFiles.push(fileInfo);
                } catch (error) {
                }
            }
        }

        if (validFiles.length > 0) {
            appState.combinerFiles.push(...validFiles);
            updateCombinerFileList();
            updateCombinerFileStats();
            updateCombinerOutputFolderDisplay();
            showToast(`${validFiles.length} ${getToastMessage('filesAdded')}`, 'success');
        } else {
            showToast(getToastMessage('noValidFiles'), 'warning');
        }
    } catch (error) {
        showToast(getToastMessage('failedToProcessFiles'), 'error');
    }
}

async function handleDroppedImageFiles(files) {
    return await handleSelectedImageFiles(files);
}

async function handleDroppedCombinerFiles(files) {
    return await handleSelectedCombinerFiles(files);
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

function setupCombinerEventListeners() {
    elements.combinerVertical?.addEventListener('change', (e) => {
        if (e.target.checked) {
            appState.settings.combinerAlignment = 'vertical';
        }
    });

    elements.combinerHorizontal?.addEventListener('change', (e) => {
        if (e.target.checked) {
            appState.settings.combinerAlignment = 'horizontal';
        }
    });

    elements.combinerSpacing?.addEventListener('input', (e) => {
        appState.settings.combinerSpacing = parseInt(e.target.value);
        if (elements.combinerSpacingValue) {
            elements.combinerSpacingValue.textContent = e.target.value + 'px';
        }
    });

    elements.combinerMaxWidth?.addEventListener('input', (e) => {
        appState.settings.combinerMaxWidth = parseInt(e.target.value) || 3000;
    });

    elements.combinerMaxHeight?.addEventListener('input', (e) => {
        appState.settings.combinerMaxHeight = parseInt(e.target.value) || 3000;
    });

    elements.combinerBackgroundColor?.addEventListener('input', (e) => {
        appState.settings.combinerBackgroundColor = e.target.value;
        if (elements.combinerBackgroundColorText) {
            elements.combinerBackgroundColorText.value = e.target.value;
        }
    });

    elements.combinerBackgroundColorText?.addEventListener('input', (e) => {
        const color = e.target.value;
        if (isValidColor(color)) {
            appState.settings.combinerBackgroundColor = color;
            if (elements.combinerBackgroundColor) {
                elements.combinerBackgroundColor.value = color;
            }
        }
    });

    elements.combinerOutputFormat?.addEventListener('change', (e) => {
        appState.settings.combinerOutputFormat = e.target.value;
    });

    elements.combinerQuality?.addEventListener('input', (e) => {
        appState.settings.combinerQuality = parseInt(e.target.value);
        if (elements.combinerQualityValue) {
            elements.combinerQualityValue.textContent = e.target.value;
        }
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

    elements.combinerSpacing?.addEventListener('input', (e) => {
        if (elements.combinerSpacingValue) {
            elements.combinerSpacingValue.textContent = e.target.value + 'px';
        }
    });

    elements.combinerQuality?.addEventListener('input', (e) => {
        if (elements.combinerQualityValue) {
            elements.combinerQualityValue.textContent = e.target.value;
        }
    });
    
    elements.enableCrop?.addEventListener('change', (e) => {
        appState.settings.enableCrop = e.target.checked;
        if (elements.cropSettings) {
            elements.cropSettings.style.display = e.target.checked ? 'block' : 'none';
        }
    });
    
    elements.cropMode?.addEventListener('change', (e) => {
        appState.settings.cropMode = e.target.value;
        if (elements.cropDimensions) {
            elements.cropDimensions.style.display = e.target.value === 'custom' ? 'flex' : 'none';
        }
    });
    
    elements.cropWidth?.addEventListener('input', (e) => {
        appState.settings.cropWidth = parseInt(e.target.value) || 1920;
    });
    
    elements.cropHeight?.addEventListener('input', (e) => {
        appState.settings.cropHeight = parseInt(e.target.value) || 1080;
    });
    
    elements.enableRotate?.addEventListener('change', (e) => {
        appState.settings.enableRotate = e.target.checked;
        if (elements.rotateSettings) {
            elements.rotateSettings.style.display = e.target.checked ? 'block' : 'none';
        }
    });
    
    elements.rotationAngle?.addEventListener('change', (e) => {
        appState.settings.rotationAngle = parseInt(e.target.value);
    });
    
    elements.flipHorizontal?.addEventListener('change', (e) => {
        appState.settings.flipHorizontal = e.target.checked;
    });
    
    elements.flipVertical?.addEventListener('change', (e) => {
        appState.settings.flipVertical = e.target.checked;
    });
    
    elements.enableAdjustments?.addEventListener('change', (e) => {
        appState.settings.enableAdjustments = e.target.checked;
        if (elements.adjustmentsSettings) {
            elements.adjustmentsSettings.style.display = e.target.checked ? 'block' : 'none';
        }
    });
    
    elements.brightnessSlider?.addEventListener('input', (e) => {
        appState.settings.brightness = parseInt(e.target.value);
        if (elements.brightnessValue) {
            elements.brightnessValue.textContent = e.target.value;
        }
    });
    
    elements.contrastSlider?.addEventListener('input', (e) => {
        appState.settings.contrast = parseInt(e.target.value);
        if (elements.contrastValue) {
            elements.contrastValue.textContent = e.target.value;
        }
    });
    
    elements.saturationSlider?.addEventListener('input', (e) => {
        appState.settings.saturation = parseInt(e.target.value);
        if (elements.saturationValue) {
            elements.saturationValue.textContent = e.target.value;
        }
    });
    
    elements.enableFilters?.addEventListener('change', (e) => {
        appState.settings.enableFilters = e.target.checked;
        if (elements.filtersSettings) {
            elements.filtersSettings.style.display = e.target.checked ? 'block' : 'none';
        }
    });
    
    elements.filterType?.addEventListener('change', (e) => {
        appState.settings.filterType = e.target.value;
        if (elements.filterStrengthGroup) {
            elements.filterStrengthGroup.style.display = (e.target.value !== 'none') ? 'block' : 'none';
        }
    });
    
    elements.filterStrength?.addEventListener('input', (e) => {
        appState.settings.filterStrength = parseInt(e.target.value);
        if (elements.filterStrengthValue) {
            elements.filterStrengthValue.textContent = e.target.value;
        }
    });
    
    elements.preserveExif?.addEventListener('change', (e) => {
        appState.settings.preserveExif = e.target.checked;
    });
}

function switchTab(tabId) {
    if (tabId === 'start') {
        document.body.classList.add('start-page-active');
    } else {
        document.body.classList.remove('start-page-active');
    }
    
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

function updateCombinerFileList() {
    if (!elements.combinerFileList) return;

    elements.combinerFileList.innerHTML = '';

    if (appState.combinerFiles.length === 0) {
        elements.combinerFileListContainer.style.display = 'none';
        elements.combinerProcessingControls.style.display = 'none';
        return;
    }

    elements.combinerFileListContainer.style.display = 'block';
    elements.combinerProcessingControls.style.display = 'flex';

    appState.combinerFiles.forEach((file, index) => {
        const fileItem = createCombinerFileItem(file, index);
        elements.combinerFileList.appendChild(fileItem);
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
            <div class="file-path">${file.directory || (typeof i18n !== 'undefined' ? i18n.t('common.local_file') : 'Local file')}</div>
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

function createCombinerFileItem(file, index) {
    const item = document.createElement('div');
    item.className = 'file-item';

    const icon = file.isPDF ? 'fa-file-pdf' : getFileIcon(file.extension);
    const size = formatFileSize(file.size);
    const statusText = file.isTemporary ? ' (temp)' : '';

    item.innerHTML = `
        <div class="file-icon">
            <i class="fas ${icon}"></i>
        </div>
        <div class="file-info">
            <div class="file-name">${file.name}${statusText}</div>
            <div class="file-path">${file.directory || (typeof i18n !== 'undefined' ? i18n.t('common.local_file') : 'Local file')}</div>
        </div>
        <div class="file-size">${size}</div>
        <button class="btn btn-sm btn-outline remove-file-btn" data-index="${index}">
            <i class="fas fa-times"></i>
        </button>
    `;

    const removeBtn = item.querySelector('.remove-file-btn');
    removeBtn.addEventListener('click', () => {
        removeCombinerFile(index);
    });

    return item;
}

async function removeFile(index) {
    appState.files.splice(index, 1);
    updateFileList();
    updateFileStats();
    updateOutputFolderDisplay();
}

async function removeCombinerFile(index) {
    const file = appState.combinerFiles[index];
    
    if (file.isTemporary && file.tempFilePath) {
        try {
            await fs.unlink(file.tempFilePath);
        } catch (error) {
        }
    }
    
    appState.combinerFiles.splice(index, 1);
    updateCombinerFileList();
    updateCombinerFileStats();
    updateCombinerOutputFolderDisplay();
}

function clearFiles() {
    appState.files = [];
    updateFileList();
    updateFileStats();
    updateOutputFolderDisplay();
    showToast(getToastMessage('filesCleared'), 'info');
}

async function clearCombinerFiles() {
    for (const file of appState.combinerFiles) {
        if (file.isTemporary && file.tempFilePath) {
            try {
                await fs.unlink(file.tempFilePath);
                } catch (error) {
                }
        }
    }
    
    appState.combinerFiles = [];
    updateCombinerFileList();
    updateCombinerFileStats();
    updateCombinerOutputFolderDisplay();
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

function updateCombinerFileStats() {
    const count = appState.combinerFiles.length;
    const totalSize = appState.combinerFiles.reduce((sum, file) => sum + file.size, 0);

    if (elements.combinerFileCount) {
        elements.combinerFileCount.textContent = count.toString();
    }

    if (elements.combinerTotalSize) {
        elements.combinerTotalSize.textContent = formatFileSize(totalSize);
    }
}

function updateOutputFolderUI() {
    const isCustomMode = appState.settings.outputMode === 'custom';
    elements.outputFolderSelection.style.display = isCustomMode ? 'block' : 'none';

    elements.outputModeSource.checked = appState.settings.outputMode === 'source';
    elements.outputModeCustom.checked = appState.settings.outputMode === 'custom';
    
    if (isCustomMode) {
        updateRecentFoldersUI();
    }
}

function updateCombinerOutputFolderUI() {
    const isCustomMode = appState.settings.combinerOutputMode === 'custom';
    elements.combinerOutputFolderSelection.style.display = isCustomMode ? 'block' : 'none';

    elements.combinerOutputModeSource.checked = appState.settings.combinerOutputMode === 'source';
    elements.combinerOutputModeCustom.checked = appState.settings.combinerOutputMode === 'custom';
    
    if (isCustomMode) {
        updateCombinerRecentFoldersUI();
    }
}

function updateOutputFolderDisplay() {
    if (!elements.outputFolderPath) return;

    let outputPath = '';

    if (appState.settings.outputMode === 'custom' && appState.settings.customOutputFolder) {
        outputPath = appState.settings.customOutputFolder;
    } else if (appState.files.length > 0) {
        const firstFile = appState.files[0];
        outputPath = firstFile.directory || os.homedir();
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

function updateCombinerOutputFolderDisplay() {
    if (!elements.combinerOutputFolderPath) return;

    let outputPath = '';

    if (appState.settings.combinerOutputMode === 'custom' && appState.settings.combinerCustomOutputFolder) {
        outputPath = appState.settings.combinerCustomOutputFolder;
    } else if (appState.combinerFiles.length > 0) {
        const firstFile = appState.combinerFiles[0];
        outputPath = firstFile.directory || os.homedir();
    } else {
        const defaultText = typeof i18n !== 'undefined' ? i18n.t('optimizer.same_as_source') : 'Same as source';
        elements.combinerOutputFolderPath.textContent = defaultText;
        return;
    }

    appState.combinerOutputFolder = outputPath;
    elements.combinerOutputFolderPath.textContent = outputPath;
}

async function browseForOutputFolder() {
    try {
        const result = await ipcRenderer.invoke('browse-for-output-folder', {
            title: typeof i18n !== 'undefined' ? i18n.t('common.select_output_folder') : 'Select Output Folder',
            defaultPath: appState.settings.customOutputFolder
        });

        if (result.success && !result.canceled) {
            appState.settings.customOutputFolder = result.folder;
            elements.outputFolderInput.value = result.folder;
            updateOutputFolderDisplay();
            addToRecentFolders(result.folder);
            showToast(getToastMessage('outputFolderSelected'), 'success');
        }
    } catch (error) {
        showToast(getToastMessage('outputFolderInvalid'), 'error');
    }
}

async function browseForCombinerOutputFolder() {
    try {
        const result = await ipcRenderer.invoke('browse-for-output-folder', {
            title: typeof i18n !== 'undefined' ? i18n.t('common.select_output_folder') : 'Select Output Folder',
            defaultPath: appState.settings.combinerCustomOutputFolder
        });

        if (result.success && !result.canceled) {
            appState.settings.combinerCustomOutputFolder = result.folder;
            elements.combinerOutputFolderInput.value = result.folder;
            updateCombinerOutputFolderDisplay();
            addToRecentFolders(result.folder);
            showToast(getToastMessage('outputFolderSelected'), 'success');
        }
    } catch (error) {
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
        errors: [],
        startTime: Date.now(),
        cancelled: false,
        stage: 'preparing'
    };

    showFullscreenProcessing('processing');
    elements.startProcessingBtn.disabled = true;

    const timeUpdateInterval = setInterval(() => {
        if (appState.processing.isProcessing) {
            updateTimeDisplays();
        } else {
            clearInterval(timeUpdateInterval);
        }
    }, 1000);

    try {
        await createOutputDirectory(finalOutputDir);
        
        appState.processing.stage = 'analyzing';
        updateFullscreenProgress(5, 'analyzing', 0, appState.files.length);

        for (let i = 0; i < appState.files.length && !appState.processing.cancelled; i++) {
            const file = appState.files[i];

            appState.processing.currentFile = file.name;
            appState.processing.stage = 'processing';
            
            if (elements.fullscreenCurrentFile) {
                elements.fullscreenCurrentFile.textContent = file.name;
            }

            const basePercentage = (i / appState.files.length) * 90;
            updateFullscreenProgress(basePercentage + 10, 'processing', i, appState.files.length);

            try {
                await processImage(file, finalOutputDir);
                appState.processing.processed++;
                
                updateTimeDisplays();
            } catch (error) {
                appState.processing.errors.push({
                    file: file.name,
                    error: error.message
                });
            }

            const percentage = ((i + 1) / appState.files.length) * 90 + 10;
            updateFullscreenProgress(percentage, 'processing', appState.processing.processed, appState.files.length);
        }

        if (!appState.processing.cancelled) {
            appState.processing.stage = 'finalizing';
            updateFullscreenProgress(100, 'finalizing', appState.processing.processed, appState.files.length);
            
            setTimeout(() => {
                hideFullscreenProcessing();
                showProcessingResults();
            }, 1000);
        }

    } catch (error) {
        showToast(`${getToastMessage('processingFailed')}: ${error.message}`, 'error');
        hideFullscreenProcessing();
    } finally {
        appState.processing.isProcessing = false;
        elements.startProcessingBtn.disabled = false;
        clearInterval(timeUpdateInterval);
    }
}

async function startCombining() {
    if (appState.combinerFiles.length === 0) {
        showToast(getToastMessage('noImageFiles'), 'warning');
        return;
    }

    const finalOutputDir = await determineFinalCombinerOutputDirectory();
    if (!finalOutputDir) {
        showToast(getToastMessage('outputFolderInvalid'), 'error');
        return;
    }

    appState.combining = {
        isCombining: true,
        progress: 0,
        status: typeof i18n !== 'undefined' ? i18n.t('common.starting') : 'Starting...',
        startTime: Date.now(),
        cancelled: false,
        stage: 'loading'
    };

    showFullscreenProcessing('combining');
    elements.startCombiningBtn.disabled = true;

    const timeUpdateInterval = setInterval(() => {
        if (appState.combining.isCombining) {
            updateTimeDisplays();
        } else {
            clearInterval(timeUpdateInterval);
        }
    }, 1000);

    try {
        await createOutputDirectory(finalOutputDir);
        appState.combining.stage = 'loading';
        updateFullscreenProgress(10, 'loading', 0, 0);

        const images = [];
        const tempFilesToCleanup = [];

        for (let i = 0; i < appState.combinerFiles.length && !appState.combining.cancelled; i++) {
            const file = appState.combinerFiles[i];
            const fileProgress = 10 + (i / appState.combinerFiles.length) * 30;
            
            if (elements.fullscreenCurrentFile) {
                elements.fullscreenCurrentFile.textContent = file.name;
            }

            if (file.isPDF) {
                appState.combining.stage = 'extracting';
                updateFullscreenProgress(fileProgress, 'extracting', i, appState.combinerFiles.length);
                
                try {
                    const pdfImages = await extractPDFPages(file);
                    images.push(...pdfImages);
                    showToast(getToastMessage('pdfPagesExtracted'), 'success');
                } catch (error) {
                    showToast(`${getToastMessage('pdfExtractionFailed')} ${file.name}: ${error.message}`, 'error');
                }
            } else {
                appState.combining.stage = 'loading';
                updateFullscreenProgress(fileProgress, 'loading', i, appState.combinerFiles.length);
                
                if (file.buffer) {
                    try {
                        const image = sharp(file.buffer);
                        const metadata = await image.metadata();
                        images.push({
                            image,
                            width: metadata.width,
                            height: metadata.height,
                            name: file.name
                        });
                    } catch (error) {
                        throw new Error(`${typeof i18n !== 'undefined' ? i18n.t('error.invalid_image_format') : 'Invalid image format for'} ${file.name}: ${error.message}`);
                    }
                } else if (file.path) {
                    try {
                        const image = sharp(file.path);
                        const metadata = await image.metadata();
                        images.push({
                            image,
                            width: metadata.width,
                            height: metadata.height,
                            name: file.name
                        });
                    } catch (error) {
                        throw new Error(`${typeof i18n !== 'undefined' ? i18n.t('error.invalid_image_format') : 'Invalid image format for'} ${file.name}: ${error.message}`);
                    }
                }
            }
        }

        if (images.length === 0 || appState.combining.cancelled) {
            if (!appState.combining.cancelled) {
                throw new Error(typeof i18n !== 'undefined' ? i18n.t('error.no_images_to_combine') : 'No valid images to combine');
            }
            return;
        }

        appState.combining.stage = 'analyzing';
        updateFullscreenProgress(50, 'analyzing', 0, 0);
        
        appState.combining.stage = 'scaling';
        updateFullscreenProgress(60, 'scaling', 0, 0);
        
        appState.combining.stage = 'arranging';
        updateFullscreenProgress(70, 'arranging', 0, 0);
        
        const combinedImage = await combineImages(images);

        appState.combining.stage = 'compositing';
        updateFullscreenProgress(85, 'compositing', 0, 0);

        appState.combining.stage = 'saving';
        updateFullscreenProgress(95, 'saving', 0, 0);
        
        const outputPath = await saveCombinedImage(combinedImage, finalOutputDir);

        for (const file of appState.combinerFiles) {
            if (file.isTemporary && file.tempFilePath) {
                try {
                    await fs.unlink(file.tempFilePath);
                        } catch (error) {
                        }
            }
        }

        updateFullscreenProgress(100, 'saving', 0, 0);
        
        setTimeout(() => {
            hideFullscreenProcessing();
            showCombinerResults(outputPath);
        }, 1000);

    } catch (error) {
        showToast(`${getToastMessage('combiningFailed')}: ${error.message}`, 'error');
        hideFullscreenProcessing();
    } finally {
        appState.combining.isCombining = false;
        elements.startCombiningBtn.disabled = false;
        clearInterval(timeUpdateInterval);
    }
}

async function extractPDFPages(pdfFile) {
    const images = [];
    try {
        
        if (!pdfFile.path) {
            throw new Error(typeof i18n !== 'undefined' ? i18n.t('error.pdf_required') : 'PDF file path is required for extraction');
        }
        
        const pdfPoppler = require('pdf-poppler');
        const tempDir = path.join(os.tmpdir(), `pdf_extract_${Date.now()}`);
        
        await fs.mkdir(tempDir, { recursive: true });
        
        const options = {
            format: 'png',
            out_dir: tempDir,
            out_prefix: 'page',
            page: null
        };

        await pdfPoppler.convert(pdfFile.path, options);
        
        const tempFiles = await fs.readdir(tempDir);
        const pngFiles = tempFiles.filter(file => file.endsWith('.png')).sort();
        
        for (const fileName of pngFiles) {
            const filePath = path.join(tempDir, fileName);
            try {
                const image = sharp(filePath);
                const metadata = await image.metadata();
                images.push({
                    image,
                    width: metadata.width,
                    height: metadata.height,
                    name: fileName,
                    tempPath: filePath
                });
            } catch (error) {
            }
        }
        
        setTimeout(async () => {
            try {
                const files = await fs.readdir(tempDir);
                for (const file of files) {
                    await fs.unlink(path.join(tempDir, file));
                }
                await fs.rmdir(tempDir);
            } catch (error) {
            }
        }, 10000);
        
    } catch (error) {
        throw new Error(`${typeof i18n !== 'undefined' ? i18n.t('error.pdf_extraction_failed') : 'PDF extraction failed'}: ${error.message}`);
    }
    return images;
}

async function combineImages(images) {
    if (images.length === 0) {
        throw new Error(typeof i18n !== 'undefined' ? i18n.t('error.no_images') : 'No images to combine');
    }

    const isVertical = appState.settings.combinerAlignment === 'vertical';
    const spacing = appState.settings.combinerSpacing;
    const maxWidth = appState.settings.combinerMaxWidth;
    const maxHeight = appState.settings.combinerMaxHeight;
    const backgroundColor = appState.settings.combinerBackgroundColor;

    let totalWidth = 0;
    let totalHeight = 0;

    for (const img of images) {
        if (isVertical) {
            totalWidth = Math.max(totalWidth, img.width);
            totalHeight += img.height;
        } else {
            totalWidth += img.width;
            totalHeight = Math.max(totalHeight, img.height);
        }
    }

    if (isVertical) {
        totalHeight += spacing * (images.length - 1);
    } else {
        totalWidth += spacing * (images.length - 1);
    }

    const scale = Math.min(
        maxWidth / totalWidth,
        maxHeight / totalHeight,
        1
    );

    if (scale < 1) {
        totalWidth = Math.floor(totalWidth * scale);
        totalHeight = Math.floor(totalHeight * scale);
        
        for (const img of images) {
            img.width = Math.floor(img.width * scale);
            img.height = Math.floor(img.height * scale);
            img.image = img.image.resize(img.width, img.height);
        }
    }

    const canvas = sharp({
        create: {
            width: totalWidth,
            height: totalHeight,
            channels: 4,
            background: backgroundColor
        }
    });

    const composite = [];
    let currentX = 0;
    let currentY = 0;

    for (let i = 0; i < images.length; i++) {
        const img = images[i];
        
        if (isVertical) {
            const x = Math.floor((totalWidth - img.width) / 2);
            composite.push({
                input: await img.image.toBuffer(),
                left: x,
                top: currentY
            });
            currentY += img.height + spacing;
        } else {
            const y = Math.floor((totalHeight - img.height) / 2);
            composite.push({
                input: await img.image.toBuffer(),
                left: currentX,
                top: y
            });
            currentX += img.width + spacing;
        }
    }

    return canvas.composite(composite);
}

async function saveCombinedImage(image, outputDir) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const format = appState.settings.combinerOutputFormat;
    const quality = appState.settings.combinerQuality;
    const filename = `combined-${timestamp}.${format}`;
    const outputPath = path.join(outputDir, filename);

    const options = {};
    if (format === 'jpg' || format === 'jpeg') {
        options.quality = quality;
    } else if (format === 'png') {
        options.compressionLevel = Math.floor((100 - quality) / 10);
    } else if (format === 'webp') {
        options.quality = quality;
    }

    await image.toFormat(format, options).toFile(outputPath);
    return outputPath;
}

function showCombinerResults(outputPath) {
    elements.combinerResults.style.display = 'block';

    if (!elements.combinerResultsSummary) return;

    const filename = path.basename(outputPath);
    const summaryHTML = `
        <div class="result-item success">
            <i class="fas fa-check-circle"></i>
            <span>${typeof i18n !== 'undefined' ? i18n.t('results.successfully_combined') : 'Successfully combined'} ${appState.combinerFiles.length} ${typeof i18n !== 'undefined' ? i18n.t('common.files') : 'files'} ${typeof i18n !== 'undefined' ? i18n.t('results.into') : 'into'} ${filename}</span>
        </div>
        <div class="result-item info">
            <i class="fas fa-folder"></i>
            <span>${typeof i18n !== 'undefined' ? i18n.t('results.saved_to') : 'Saved to'}: ${outputPath}</span>
        </div>
    `;

    elements.combinerResultsSummary.innerHTML = summaryHTML;
    showToast(getToastMessage('combiningComplete'), 'success');
}

async function determineFinalOutputDirectory() {
    let outputDir;

    if (appState.settings.outputMode === 'custom' && appState.settings.customOutputFolder) {
        outputDir = appState.settings.customOutputFolder;
    } else if (appState.files.length > 0) {
        const firstFile = appState.files[0];
        outputDir = firstFile.directory || os.homedir();
    } else {
        return null;
    }

    if (appState.settings.createSubfolder) {
        outputDir = path.join(outputDir, appState.settings.subfolderName);
    }

    return outputDir;
}

async function determineFinalCombinerOutputDirectory() {
    let outputDir;

    if (appState.settings.combinerOutputMode === 'custom' && appState.settings.combinerCustomOutputFolder) {
        outputDir = appState.settings.combinerCustomOutputFolder;
    } else if (appState.combinerFiles.length > 0) {
        const firstFile = appState.combinerFiles[0];
        outputDir = firstFile.directory || os.homedir();
    } else {
        return null;
    }

    return outputDir;
}

async function processImage(file, outputDir) {
    const outputPath = generateOutputPath(file, outputDir);

    let image;
    let metadata;
    
    try {
        if (file.buffer) {
            image = sharp(file.buffer);
        } else if (file.path) {
            image = sharp(file.path);
        } else {
            throw new Error(typeof i18n !== 'undefined' ? i18n.t('error.no_valid_source') : 'No valid file source found');
        }
        
        metadata = await image.metadata();
    } catch (error) {
        throw new Error(`${typeof i18n !== 'undefined' ? i18n.t('error.cannot_process') : 'Cannot process'} ${file.name}: ${error.message}`);
    }

    if (appState.settings.preserveExif) {
        image = image.withMetadata();
    }

    if (appState.settings.enableCrop) {
        let cropWidth, cropHeight;
        
        if (appState.settings.cropMode === 'custom') {
            cropWidth = appState.settings.cropWidth;
            cropHeight = appState.settings.cropHeight;
        } else {
            const presets = {
                '16:9': { width: 1920, height: 1080 },
                '4:3': { width: 1600, height: 1200 },
                '1:1': { width: 1000, height: 1000 },
                '21:9': { width: 2560, height: 1080 }
            };
            
            if (presets[appState.settings.cropMode]) {
                cropWidth = presets[appState.settings.cropMode].width;
                cropHeight = presets[appState.settings.cropMode].height;
            }
        }
        
        if (cropWidth && cropHeight) {
            image = image.resize(cropWidth, cropHeight, {
                fit: 'cover',
                position: 'centre'
            });
        }
    }

    if (appState.settings.enableRotate) {
        if (appState.settings.rotationAngle !== 0) {
            image = image.rotate(appState.settings.rotationAngle);
        }
        
        if (appState.settings.flipHorizontal) {
            image = image.flop();
        }
        
        if (appState.settings.flipVertical) {
            image = image.flip();
        }
    }

    if (appState.settings.enableAdjustments) {
        if (appState.settings.brightness !== 0) {
            image = image.modulate({
                brightness: 1 + (appState.settings.brightness / 100)
            });
        }
        
        if (appState.settings.contrast !== 0) {
            image = image.linear(
                1 + (appState.settings.contrast / 100),
                -(128 * (appState.settings.contrast / 100))
            );
        }
        
        if (appState.settings.saturation !== 0) {
            image = image.modulate({
                saturation: 1 + (appState.settings.saturation / 100)
            });
        }
    }

    if (appState.settings.enableFilters && appState.settings.filterType !== 'none') {
        const strength = appState.settings.filterStrength;
        
        switch (appState.settings.filterType) {
            case 'blur':
                image = image.blur(strength);
                break;
            case 'sharpen':
                image = image.sharpen({ sigma: strength });
                break;
            case 'grayscale':
                image = image.grayscale();
                break;
            case 'sepia':
                image = image.recomb([
                    [0.393, 0.769, 0.189],
                    [0.349, 0.686, 0.168],
                    [0.272, 0.534, 0.131]
                ]);
                break;
        }
    }

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
        let metadata;
        
        if (file.buffer) {
            metadata = await sharp(file.buffer).metadata();
        } else if (file.path) {
            metadata = await sharp(file.path).metadata();
        } else {
            return null;
        }
        
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
        const basePath = appState.files.length > 0 && appState.files[0].directory ? 
                          appState.files[0].directory : 
                          os.homedir();
        const relativePath = path.relative(basePath, file.directory);
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
        throw new Error(`${typeof i18n !== 'undefined' ? i18n.t('error.create_directory_failed') : 'Failed to create output directory'}: ${error.message}`);
    }
}

function updateProcessingProgress(currentFile, current, total) {
    const percentage = Math.floor((current / total) * 100);

    if (elements.progressFill) {
        elements.progressFill.style.width = `${percentage}%`;
    }

    if (elements.progressText) {
        elements.progressText.textContent = `${typeof i18n !== 'undefined' ? i18n.t('optimizer.processing_status') : 'Processing'} ${current + 1} ${typeof i18n !== 'undefined' ? i18n.t('common.of') : 'of'} ${total}`;
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
            <span>${typeof i18n !== 'undefined' ? i18n.t('results.successfully_processed') : 'Successfully processed'} ${successCount} ${typeof i18n !== 'undefined' ? i18n.t('common.of') : 'of'} ${total} ${typeof i18n !== 'undefined' ? i18n.t('common.images') : 'images'}</span>
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

    showToast(`${getToastMessage('processingComplete')} ${successCount}/${total} ${typeof i18n !== 'undefined' ? i18n.t('results.images_processed_successfully') : 'images processed successfully'}`,
        errors.length > 0 ? 'warning' : 'success');
}

function updateUI() {
    updateFileList();
    updateCombinerFileList();
    updateFileStats();
    updateCombinerFileStats();
    updateOutputFolderUI();
    updateCombinerOutputFolderUI();
    updateOutputFolderDisplay();
    updateCombinerOutputFolderDisplay();

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
    
    if (elements.cropSettings) {
        elements.cropSettings.style.display = appState.settings.enableCrop ? 'block' : 'none';
    }
    
    if (elements.cropDimensions) {
        elements.cropDimensions.style.display = appState.settings.cropMode === 'custom' ? 'flex' : 'none';
    }
    
    if (elements.rotateSettings) {
        elements.rotateSettings.style.display = appState.settings.enableRotate ? 'block' : 'none';
    }
    
    if (elements.adjustmentSettings) {
        elements.adjustmentSettings.style.display = appState.settings.enableAdjustments ? 'block' : 'none';
    }
    
    if (elements.filterSettings) {
        elements.filterSettings.style.display = appState.settings.enableFilters ? 'block' : 'none';
    }
    
    if (elements.compressionValue) {
        elements.compressionValue.textContent = appState.settings.compressionQuality;
    }
    if (elements.opacityValue) {
        elements.opacityValue.textContent = appState.settings.watermarkOpacity + '%';
    }
    if (elements.sizeValue) {
        elements.sizeValue.textContent = appState.settings.watermarkSize + '%';
    }
    if (elements.combinerSpacingValue) {
        elements.combinerSpacingValue.textContent = appState.settings.combinerSpacing + 'px';
    }
    if (elements.combinerQualityValue) {
        elements.combinerQualityValue.textContent = appState.settings.combinerQuality;
    }
    if (elements.brightnessValue) {
        elements.brightnessValue.textContent = appState.settings.brightness;
    }
    if (elements.contrastValue) {
        elements.contrastValue.textContent = appState.settings.contrast;
    }
    if (elements.saturationValue) {
        elements.saturationValue.textContent = appState.settings.saturation;
    }
    if (elements.filterStrengthValue) {
        elements.filterStrengthValue.textContent = appState.settings.filterStrength;
    }

    if (elements.outputFolderInput && appState.settings.customOutputFolder) {
        elements.outputFolderInput.value = appState.settings.customOutputFolder;
    }

    if (elements.combinerOutputFolderInput && appState.settings.combinerCustomOutputFolder) {
        elements.combinerOutputFolderInput.value = appState.settings.combinerCustomOutputFolder;
    }

    if (elements.compressionValue) {
        elements.compressionValue.textContent = appState.settings.compressionQuality;
    }

    if (elements.opacityValue) {
        elements.opacityValue.textContent = appState.settings.watermarkOpacity + '%';
    }

    if (elements.sizeValue) {
        elements.sizeValue.textContent = appState.settings.watermarkSize + '%';
    }

    if (elements.combinerSpacingValue) {
        elements.combinerSpacingValue.textContent = appState.settings.combinerSpacing + 'px';
    }

    if (elements.combinerQualityValue) {
        elements.combinerQualityValue.textContent = appState.settings.combinerQuality;
    }

    if (elements.watermarkFile && appState.settings.watermarkFile) {
        const filename = path.basename(appState.settings.watermarkFile);
        elements.watermarkFile.value = filename;
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
        showToast(getToastMessage('failedToSelectWatermark'), 'error');
    }
}

async function openOutputFolder() {
    const outputDir = await determineFinalOutputDirectory();
    if (!outputDir) {
        showToast(getToastMessage('noOutputFolder'), 'warning');
        return;
    }

    try {
        await ipcRenderer.invoke('open-folder', outputDir);
    } catch (error) {
        showToast(getToastMessage('failedToOpenFolder'), 'error');
    }
}

async function openCombinerOutputFolder() {
    const outputDir = await determineFinalCombinerOutputDirectory();
    if (!outputDir) {
        showToast(getToastMessage('noOutputFolder'), 'warning');
        return;
    }

    try {
        await ipcRenderer.invoke('open-folder', outputDir);
    } catch (error) {
        showToast(getToastMessage('failedToOpenFolder'), 'error');
    }
}

async function loadAppVersion() {
    try {
        const result = await ipcRenderer.invoke('get-app-version');
        if (result.success && elements.currentVersion) {
            elements.currentVersion.textContent = result.version;
        }
    } catch (error) {
    }
}

async function checkForUpdates() {
    try {
        showToast(getToastMessage('updateChecking'), 'info');
        appState.updateInfo.checking = true;
        updateUpdateStatus();

        await ipcRenderer.invoke('check-for-updates');
    } catch (error) {
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
        appState.updateInfo.downloading = false;
        updateInstallButton();
    }
}

async function installUpdate() {
    try {
        await ipcRenderer.invoke('install-update');
    } catch (error) {
        showToast(getToastMessage('failedToInstallUpdate'), 'error');
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
    }
}

function saveSettings() {
    try {
        localStorage.setItem('imageOptimizerSettings', JSON.stringify(appState.settings));
    } catch (error) {
    }
}

setInterval(saveSettings, 5000);

function isImageFile(filename) {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.tiff', '.tif', '.gif', '.avif', '.svg'];
    const ext = path.extname(filename).toLowerCase();
    return imageExtensions.includes(ext);
}

function isPDFFile(filename) {
    const ext = path.extname(filename).toLowerCase();
    return ext === '.pdf';
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
        '.svg': 'fa-file-code',
        '.pdf': 'fa-file-pdf'
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

function addToRecentFolders(folder) {
    if (!folder || !appState.settings.recentFolders) return;
    
    const recentFolders = appState.settings.recentFolders.filter(f => f !== folder);
    recentFolders.unshift(folder);
    
    if (recentFolders.length > 5) {
        recentFolders.length = 5;
    }
    
    appState.settings.recentFolders = recentFolders;
    localStorage.setItem('appSettings', JSON.stringify(appState.settings));
    
    updateRecentFoldersUI();
    updateCombinerRecentFoldersUI();
}

function updateRecentFoldersUI() {
    const recentFoldersDiv = document.getElementById('recent-folders');
    const recentFoldersSelect = document.getElementById('recent-folders-select');
    
    if (!recentFoldersDiv || !recentFoldersSelect) return;
    
    if (appState.settings.recentFolders && appState.settings.recentFolders.length > 0) {
        recentFoldersDiv.style.display = 'block';
        
        recentFoldersSelect.innerHTML = `<option value="" data-i18n="optimizer.select_recent">${i18n.t('optimizer.select_recent')}</option>`;
        
        appState.settings.recentFolders.forEach(folder => {
            const option = document.createElement('option');
            option.value = folder;
            option.textContent = folder;
            recentFoldersSelect.appendChild(option);
        })
    } else {
        recentFoldersDiv.style.display = 'none';
    }
}

function updateCombinerRecentFoldersUI() {
    const recentFoldersDiv = document.getElementById('combiner-recent-folders');
    const recentFoldersSelect = document.getElementById('combiner-recent-folders-select');
    
    if (!recentFoldersDiv || !recentFoldersSelect) return;
    
    if (appState.settings.recentFolders && appState.settings.recentFolders.length > 0) {
        recentFoldersDiv.style.display = 'block';
        
        recentFoldersSelect.innerHTML = `<option value="" data-i18n="optimizer.select_recent">${i18n.t('optimizer.select_recent')}</option>`;
        
        appState.settings.recentFolders.forEach(folder => {
            const option = document.createElement('option');
            option.value = folder;
            option.textContent = folder;
            recentFoldersSelect.appendChild(option);
        })
    } else {
        recentFoldersDiv.style.display = 'none';
    }
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
        combiningComplete: 'Images combined successfully!',
        pdfPagesExtracted: 'PDF pages extracted',
        updateChecking: 'Checking for updates...',
        updateAvailable: 'Update available!',
        updateNotAvailable: 'No updates available',
        updateDownloaded: 'Update ready to install',
        updateError: 'Update check failed',
        processingCancelled: 'Processing cancelled',
        combiningCancelled: 'Combining cancelled',
        failedToSelectImages: 'Failed to select images',
        failedToSelectFiles: 'Failed to select files',
        failedToProcessFiles: 'Failed to process selected files',
        noValidFiles: 'No valid files found',
        processingFailed: 'Processing failed',
        combiningFailed: 'Combining failed',
        pdfExtractionFailed: 'PDF extraction failed',
        failedToSelectWatermark: 'Failed to select watermark',
        noOutputFolder: 'No output folder determined',
        failedToOpenFolder: 'Failed to open output folder',
        failedToInstallUpdate: 'Failed to install update'
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
    showToast(`${typeof i18n !== 'undefined' ? i18n.t('error.unexpected') : 'Unexpected error'}: ${e.error?.message || 'Unknown error'}`, 'error');
});

window.addEventListener('unhandledrejection', (e) => {
    showToast(`${typeof i18n !== 'undefined' ? i18n.t('error.promise') : 'Promise error'}: ${e.reason?.message || 'Unknown error'}`, 'error');
});

window.appState = appState;
window.showToast = showToast;