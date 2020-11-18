/**
 * Image Optimizer
 * 
 * @author Bavamont
 * @link https://github.com/bavamont
 */

/** 
 * Load from from settings.json
 */
document.title = settings.get("appName");
document.getElementById("loading").innerHTML = i18n.__("Loading...");

/** 
 * Set initial values.
 */
var initView = false;
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

/**
 * Show the image optimizer view.
 */
function showImageOptimizerView() {
    if (!initView) initView = true;
    $("#helpView").hide();
    $("#imageOptimizerView").show();
}

/**
 * Show the help view.
 */
function showHelpView() {
    if (initView) {
        $("#imageOptimizerView").hide();
        $("#helpView").show();
    } else showImageOptimizerView();
}

/**
 * Change console text.
 */
function printToConsole(text) {
    $("#console").html(text);
}

$(document).ready(function() {
    $("#splashScreen").delay(1500).hide(0, () => {
        $("#navbar").show(0);
        $("#main").show(0);
        $(".footer").show(0);
        /**
         * Translate app.html content.
         */
        $("#showImageOptimizerView").html(i18n.__($("#showImageOptimizerView").html()));
        $("#showHelpView").html(i18n.__($("#showHelpView").html()));
        $("#exitView").html(i18n.__($("#exitView").html()));
        $("#loading").html(i18n.__($("#loading").html()));
        $("#dropYourFilesHereText").html(i18n.__($("#dropYourFilesHereText").html()));
        $("#changeOutputFormatText").html(i18n.__($("#changeOutputFormatText").html()));
        $("#outputFormatText").html(i18n.__($("#outputFormatText").html()));
        $("#changeOutputCompressionText").html(i18n.__($("#changeOutputCompressionText").html()));
        $("#outputCompressionLevelText").html(i18n.__($("#outputCompressionLevelText").html()));
        $("#changeOutputSizeText").html(i18n.__($("#changeOutputSizeText").html()));
        $("#outputSizeText").html(i18n.__($("#outputSizeText").html()));
        $("#outputSizeTypeText").html(i18n.__($("#outputSizeTypeText").html()));
        $("#outputSizeTypeCropText").html(i18n.__($("#outputSizeTypeCropText").html()));
        $("#outputSizeTypeCoverText").html(i18n.__($("#outputSizeTypeCoverText").html()));
        $("#outputSizeTypeFillText").html(i18n.__($("#outputSizeTypeFillText").html()));
        $("#outputSizeTypeInsideText").html(i18n.__($("#outputSizeTypeInsideText").html()));
        $("#outputSizeTypeOutsideText").html(i18n.__($("#outputSizeTypeOutsideText").html()));
        $("#outputBackgroundColorText").html(i18n.__($("#outputBackgroundColorText").html()));
        $("#changeUseWatermarkText").html(i18n.__($("#changeUseWatermarkText").html()));
        $("#watermarkFileText").html(i18n.__($("#watermarkFileText").html()));
        $("#watermarkFileButton").html(i18n.__($("#watermarkFileButton").html()));
        $("#watermarkPositionText").html(i18n.__($("#watermarkPositionText").html()));
        $("#watermarkDescriptionText").html(i18n.__($("#watermarkDescriptionText").html()));
        $("#watermarkPositionCenterText").html(i18n.__($("#watermarkPositionCenterText").html()));
        $("#watermarkPositionTopLeftText").html(i18n.__($("#watermarkPositionTopLeftText").html()));
        $("#watermarkPositionTopRightText").html(i18n.__($("#watermarkPositionTopRightText").html()));
        $("#watermarkPositionBottomLeftText").html(i18n.__($("#watermarkPositionBottomLeftText").html()));
        $("#watermarkPositionBottomRightText").html(i18n.__($("#watermarkPositionBottomRightText").html()));
        $("#changeOutputNameText").html(i18n.__($("#changeOutputNameText").html()));
        $("#outputNameFormatText").html(i18n.__($("#outputNameFormatText").html()));
        $("#changeResetCounterText").html(i18n.__($("#changeResetCounterText").html()));
        $("#outputStartCountingFromText").html(i18n.__($("#outputStartCountingFromText").html()));
        $("#changeOutputLetterCaseText").html(i18n.__($("#changeOutputLetterCaseText").html()));
        $("#outputLetterCaseText").html(i18n.__($("#outputLetterCaseText").html()));
        $("#outputLetterCaseLowercaseText").html(i18n.__($("#outputLetterCaseLowercaseText").html()));
        $("#outputLetterCaseUppercaseText").html(i18n.__($("#outputLetterCaseUppercaseText").html()));
        $("#outputLetterCaseNameLowercaseText").html(i18n.__($("#outputLetterCaseNameLowercaseText").html()));
        $("#outputLetterCaseNameUppercaseText").html(i18n.__($("#outputLetterCaseNameUppercaseText").html()));
        $("#outputLetterCaseExtensionLowercaseText").html(i18n.__($("#outputLetterCaseExtensionLowercaseText").html()));
        $("#outputLetterCaseExtensionUppercaseText").html(i18n.__($("#outputLetterCaseExtensionUppercaseText").html()));
        $("#notConnectedText").html(i18n.__($("#notConnectedText").html()));
        $("#resizeDescriptionText").html(i18n.__($("#resizeDescriptionText").html()));
        $("#helpDescriptionText").html(i18n.__($("#helpDescriptionText").html()));
        $("#changeIncludeSubdirectoriesText").html(i18n.__($("#changeIncludeSubdirectoriesText").html()));
        $("#changeOutputDirectoryText").html(i18n.__($("#changeOutputDirectoryText").html()));
        $("#outputDirectoryText").html(i18n.__($("#outputDirectoryText").html()));
        $("#outputDirectoryButton").html(i18n.__($("#outputDirectoryButton").html()));
        $("#changeCopyNonImageFilesText").html(i18n.__($("#changeCopyNonImageFilesText").html()));

        /**
         * Populate form with settings.json values.
         */
        $("#changeOutputFormat").prop("checked", changeOutputFormat);
        $("#outputFormat").val(outputFormat);
        $("#changeOutputCompression").prop("checked", changeOutputCompression);
        $("#outputCompressionLevel").val(outputCompressionLevel);
        $("#changeIncludeSubdirectories").prop("checked", changeIncludeSubdirectories);
        $("#changeOutputSize").prop("checked", changeOutputSize);
        $("#outputSizeWidth").val(outputSizeWidth);
        $("#outputSizeHeight").val(outputSizeHeight);
        $("#outputSizeType").val(outputSizeType);
        $("#outputBackgroundColor").val(outputBackgroundColor);
        $("#changeUseWatermark").prop("checked", changeUseWatermark);
        $("#watermarkFile").val(watermarkFile);
        $("#watermarkPosition").val(watermarkPosition);
        $("#changeOutputName").prop("checked", changeOutputName);
        $("#outputNameFormat").val(outputNameFormat);
        $("#changeResetCounter").prop("checked", changeResetCounter);
        $("#outputStartCountingFrom").val(outputStartCountingFrom);
        $("#changeOutputLetterCase").prop("checked", changeOutputLetterCase);
        $("#outputLetterCase").val(outputLetterCase);
        $("#outputBackgroundColorWrapper").data("color", outputBackgroundColor);
        $("#outputBackgroundColorWrapper").colorpicker({ format: "rgba" });
        $("#changeOutputDirectory").prop("checked", changeOutputDirectory);
        $("#outputDirectory").val(outputDirectory);
        $("#changeCopyNonImageFiles").prop("checked", changeCopyNonImageFiles);

        $("#showImageOptimizerView").click(() => {
            showImageOptimizerView();
        });

        $("#showHelpView").click(() => {
            showHelpView();
        });

        $("#exitView").click(() => {
            closeWindow();
        });

        $("#minimizeWindow").click(() => {
            minimizeWindow();
        });

        $("#maximizeWindow").click(() => {
            maximizeWindow();
        });

        $("#closeWindow").click(() => {
            closeWindow();
        });

        $("#dropzone").on("dragover", function(e) {
            e.preventDefault();
            e.stopPropagation();
        });

        $("#dropzone").on("dragenter", function(e) {
            e.preventDefault();
            e.stopPropagation();
        });

        $("#dropzone").on("dragleave", function(e) {
            e.preventDefault();
            e.stopPropagation();
        });

        $("#dropzone").on("dragend", function(e) {
            e.preventDefault();
            e.stopPropagation();
        });

        document.getElementById("dropzone").addEventListener("drop", function(e) {
            e.preventDefault();
            e.stopPropagation();
            var files = [];
            for (let f of e.dataTransfer.files) {
                files.push({ path: f.path });
            }
            ipcRenderer.send("dropzone-drop", files);
        });

        $("#dropzone").click(() => {
            ipcRenderer.send("select-files");
        });

        $("#outputDirectoryButton").click(() => {
            ipcRenderer.send("select-output-directory");
        });

        $("#watermarkFileButton").click(() => {
            ipcRenderer.send("select-watermark-file");
        });

        /**
         * Update and save change output format
         */
        $("#changeOutputFormat").change(function() {
            changeOutputFormat = $("#changeOutputFormat").prop("checked");
            settings.set("changeOutputFormat", changeOutputFormat);
            ipcRenderer.send("change-setting", { "variable": "changeOutputFormat", "value": changeOutputFormat });
        });

        /**
         * Update and save output format
         */
        $("#outputFormat").change(function() {
            outputFormat = $("#outputFormat").val();
            settings.set("outputFormat", outputFormat);
            $("#outputFormat").val(outputFormat);
            ipcRenderer.send("change-setting", { "variable": "outputFormat", "value": "'" + outputFormat + "'" });
        });

        /**
         * Update and save change output compression
         */
        $("#changeOutputCompression").change(function() {
            changeOutputCompression = $("#changeOutputCompression").prop("checked");
            settings.set("changeOutputCompression", changeOutputCompression);
            ipcRenderer.send("change-setting", { "variable": "changeOutputCompression", "value": changeOutputCompression });
        });

        /**
         * Update and save output compression level
         */
        $("#outputCompressionLevel").change(function() {
            outputCompressionLevel = parseInt($("#outputCompressionLevel").val());
            if ((outputCompressionLevel <= 0) || (outputCompressionLevel > 100)) outputCompressionLevel = 80;
            settings.set("outputCompressionLevel", outputCompressionLevel);
            $("#outputCompressionLevel").val(outputCompressionLevel);
            ipcRenderer.send("change-setting", { "variable": "outputCompressionLevel", "value": outputCompressionLevel });
        });

        /**
         * Update and save change include subdirectories
         */
        $("#changeIncludeSubdirectories").change(function() {
            changeIncludeSubdirectories = $("#changeIncludeSubdirectories").prop("checked");
            settings.set("changeIncludeSubdirectories", changeIncludeSubdirectories);
            ipcRenderer.send("change-setting", { "variable": "changeIncludeSubdirectories", "value": changeIncludeSubdirectories });
        });

        /**
         * Update and save output size
         */
        $("#changeOutputSize").change(function() {
            changeOutputSize = $("#changeOutputSize").prop("checked");
            settings.set("changeOutputSize", changeOutputSize);
            ipcRenderer.send("change-setting", { "variable": "changeOutputSize", "value": changeOutputSize });
        });

        /**
         * Update and save output size width
         */
        $("#outputSizeWidth").change(function() {
            outputSizeWidth = parseInt($("#outputSizeWidth").val());
            if (outputSizeWidth < 0) outputSizeWidth = 0;
            settings.set("outputSizeWidth", outputSizeWidth);
            $("#outputSizeWidth").val(outputSizeWidth);
            ipcRenderer.send("change-setting", { "variable": "outputSizeWidth", "value": outputSizeWidth });
        });

        /**
         * Update and save output size height
         */
        $("#outputSizeHeight").change(function() {
            outputSizeHeight = parseInt($("#outputSizeHeight").val());
            if (outputSizeHeight < 0) outputSizeHeight = 0;
            settings.set("outputSizeHeight", outputSizeHeight);
            $("#outputSizeHeight").val(outputSizeHeight);
            ipcRenderer.send("change-setting", { "variable": "outputSizeHeight", "value": outputSizeHeight });
        });

        /**
         * Update and save output resize type
         */
        $("#outputSizeType").change(function() {
            outputSizeType = $("#outputSizeType").val();
            settings.set("outputSizeType", outputSizeType);
            $("#outputSizeType").val(outputSizeType);
            ipcRenderer.send("change-setting", { "variable": "outputSizeType", "value": "'" + outputSizeType + "'" });
        });

        /**
         * Update and save output background color
         */
        $("#outputBackgroundColor").change(function() {
            outputBackgroundColor = $("#outputBackgroundColor").val();
            settings.set("outputBackgroundColor", outputBackgroundColor);
            $("#outputBackgroundColor").val(outputBackgroundColor);
            ipcRenderer.send("change-setting", { "variable": "outputBackgroundColor", "value": "'" + outputBackgroundColor + "'" });
        });

        /**
         * Update and save use watermark
         */
        $("#changeUseWatermark").change(function() {
            changeUseWatermark = $("#changeUseWatermark").prop("checked");
            settings.set("changeUseWatermark", changeUseWatermark);
            ipcRenderer.send("change-setting", { "variable": "changeUseWatermark", "value": changeUseWatermark });
        });

        /**
         * Update and save watermark file
         */
        $("#watermarkFile").change(function() {
            watermarkFile = $("#watermarkFile").val();
            settings.set("watermarkFile", watermarkFile);
            $("#watermarkFile").val(watermarkFile);
            ipcRenderer.send("change-setting", { "variable": "watermarkFile", "value": "'" + watermarkFile + "'" });
        });

        /**
         * Update and save watermark position
         */
        $("#watermarkPosition").change(function() {
            watermarkPosition = $("#watermarkPosition").val();
            settings.set("watermarkPosition", watermarkPosition);
            $("#watermarkPosition").val(watermarkPosition);
            ipcRenderer.send("change-setting", { "variable": "watermarkPosition", "value": "'" + watermarkPosition + "'" });
        });

        /**
         * Update and save output name
         */
        $("#changeOutputName").change(function() {
            changeOutputName = $("#changeOutputName").prop("checked");
            settings.set("changeOutputName", changeOutputName);
            ipcRenderer.send("change-setting", { "variable": "changeOutputName", "value": changeOutputName });
        });

        /**
         * Update and save output name
         */
        $("#outputNameFormat").change(function() {
            outputNameFormat = $("#outputNameFormat").val();
            settings.set("outputNameFormat", outputNameFormat);
            $("#outputNameFormat").val(outputNameFormat);
            ipcRenderer.send("change-setting", { "variable": "outputNameFormat", "value": "'" + outputNameFormat + "'" });
        });

        /**
         * Update and save reset counter
         */
        $("#changeResetCounter").change(function() {
            changeResetCounter = $("#changeResetCounter").prop("checked");
            settings.set("changeResetCounter", changeResetCounter);
            ipcRenderer.send("change-setting", { "variable": "changeResetCounter", "value": changeResetCounter });
        });

        /**
         * Update and save output start counting from
         */
        $("#outputStartCountingFrom").change(function() {
            outputStartCountingFrom = parseInt($("#outputStartCountingFrom").val());
            if (outputStartCountingFrom <= 0) outputStartCountingFrom = 0;
            settings.set("outputStartCountingFrom", outputStartCountingFrom);
            $("#outputStartCountingFrom").val(outputStartCountingFrom);
            ipcRenderer.send("change-setting", { "variable": "outputStartCountingFrom", "value": outputStartCountingFrom });
        });

        /**
         * Update and save output letter case
         */
        $("#changeOutputLetterCase").change(function() {
            changeOutputLetterCase = $("#changeOutputLetterCase").prop("checked");
            settings.set("changeOutputLetterCase", changeOutputLetterCase);
            ipcRenderer.send("change-setting", { "variable": "changeOutputLetterCase", "value": changeOutputLetterCase });
        });

        /**
         * Update and save output letter case
         */
        $("#outputLetterCase").change(function() {
            outputLetterCase = $("#outputLetterCase").val();
            settings.set("outputLetterCase", outputLetterCase);
            $("#outputLetterCase").val(outputLetterCase);
            ipcRenderer.send("change-setting", { "variable": "outputLetterCase", "value": "'" + outputLetterCase + "'" });
        });

        /**
         * Update and save output directory
         */
        $("#changeOutputDirectory").change(function() {
            changeOutputDirectory = $("#changeOutputDirectory").prop("checked");
            settings.set("changeOutputDirectory", changeOutputDirectory);
            ipcRenderer.send("change-setting", { "variable": "changeOutputDirectory", "value": changeOutputDirectory });
        });

        /**
         * Update and save output directory
         */
        $("#outputDirectory").change(function() {
            outputDirectory = $("#outputDirectory").val();
            settings.set("outputDirectory", outputDirectory);
            $("#outputDirectory").val(outputDirectory);
            ipcRenderer.send("change-setting", { "variable": "outputDirectory", "value": "'" + outputDirectory + "'" });
        });

        /**
         * Update and save copy non image files
         */
        $("#changeCopyNonImageFiles").change(function() {
            changeCopyNonImageFiles = $("#changeCopyNonImageFiles").prop("checked");
            settings.set("changeCopyNonImageFiles", changeCopyNonImageFiles);
            ipcRenderer.send("change-setting", { "variable": "changeCopyNonImageFiles", "value": changeCopyNonImageFiles });
        });

        printToConsole(i18n.__("Image Optimizer started."));
        showImageOptimizerView();
    });
});

function maximizeWindow() {
    ipcRenderer.send("maximize-window");
}

function minimizeWindow() {
    ipcRenderer.send("minimize-window");
}

function closeWindow() {
    ipcRenderer.send("close-window");
}

ipcRenderer.on("show-overlay", function(event, arg) {
    document.getElementById("overlay").style.display = "block";
});

ipcRenderer.on("hide-overlay", function(event, arg) {
    document.getElementById("overlay").style.display = "none";
});

ipcRenderer.on("print-to-console", function(event, arg) {
    printToConsole(arg);
});

ipcRenderer.on("set-version", function(event, arg) {
    document.getElementById("softwareVersion").innerHTML = arg;
});

ipcRenderer.on("show-notification", function(event, arg) {
    let showNotification = new Notification(arg.title, arg);
});

ipcRenderer.on("watermark-selected", function(event, arg) {
    watermarkFile = arg;
    $("#watermarkFile").val(watermarkFile);
    settings.set("watermarkFile", watermarkFile);
});

ipcRenderer.on("output-directory-selected", function(event, arg) {
    outputDirectory = arg;
    $("#outputDirectory").val(outputDirectory);
    settings.set("outputDirectory", outputDirectory);
});