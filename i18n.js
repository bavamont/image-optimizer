const i18n = {
    currentLanguage: 'en',
    translations: {
        en: {
            'app.title': 'Image Optimizer',
            'app.subtitle': 'Batch image processing and optimization',

            'nav.optimizer': 'Image Optimizer',
            'nav.optimizer.tooltip': 'Batch process and optimize images',
            'nav.settings': 'Advanced Settings',
            'nav.settings.tooltip': 'Advanced processing options',
            'nav.help': 'Help',
            'nav.help.tooltip': 'Usage guide and documentation',

            'optimizer.title': 'Image Optimizer',
            'optimizer.subtitle': 'Drag and drop images or folders for batch processing',
            'optimizer.file_input': 'File Input',
            'optimizer.files': 'Files:',
            'optimizer.total_size': 'Total Size:',
            'optimizer.drop_images': 'Drop your images here',
            'optimizer.or_browse': 'or click to browse files and folders',
            'optimizer.supports': 'Supports:',
            'optimizer.selected_files': 'Selected Files',
            'optimizer.clear_all': 'Clear All',
            'optimizer.quick_settings': 'Quick Settings',
            'optimizer.processing': 'Processing',
            'optimizer.start_processing': 'Start Processing',
            'optimizer.select_output': 'Select Output Folder',
            'optimizer.browse_output': 'Browse',
            'optimizer.output': 'Output:',
            'optimizer.same_as_source': 'Same as source',
            'optimizer.custom_folder': 'Custom folder',
            'optimizer.processing_images': 'Processing Images',
            'optimizer.processing_status': 'Processing...',
            'optimizer.current': 'Current:',
            'optimizer.processed': 'Processed:',
            'optimizer.remaining': 'Remaining:',
            'optimizer.errors': 'Errors:',
            'optimizer.processing_complete': 'Processing Complete',
            'optimizer.open_output': 'Open Output Folder',

            'settings.format_quality': 'Format & Quality',
            'settings.change_format': 'Change output format',
            'settings.output_format': 'Output Format',
            'settings.change_compression': 'Adjust compression',
            'settings.quality_level': 'Quality Level',
            'settings.resize': 'Resize',
            'settings.enable_resize': 'Enable resize',
            'settings.dimensions': 'Dimensions',
            'settings.resize_mode': 'Resize Mode',
            'settings.mode_cover': 'Cover (crop to fit)',
            'settings.mode_contain': 'Contain (fit inside)',
            'settings.mode_fill': 'Fill (stretch)',
            'settings.mode_inside': 'Inside (shrink only)',
            'settings.mode_outside': 'Outside (enlarge only)',
            'settings.watermark': 'Watermark',
            'settings.enable_watermark': 'Enable watermark',
            'settings.watermark_image': 'Watermark Image',
            'settings.select_watermark': 'Select watermark image...',
            'settings.position': 'Position',
            'settings.pos_center': 'Center',
            'settings.pos_top_left': 'Top Left',
            'settings.pos_top_right': 'Top Right',
            'settings.pos_bottom_left': 'Bottom Left',
            'settings.pos_bottom_right': 'Bottom Right',
            'settings.opacity': 'Opacity',
            'settings.size': 'Size',
            'settings.batch_rename': 'Batch Rename',
            'settings.enable_batch_rename': 'Enable batch rename',
            'settings.name_pattern': 'Name Pattern',
            'settings.pattern_example': 'e.g. Image_{counter}',
            'settings.pattern_help': 'Use {counter}, {date}, {time}, {original} placeholders',
            'settings.start_counter': 'Start Counter',
            'settings.letter_case': 'Letter Case',
            'settings.case_lower': 'All lowercase',
            'settings.case_upper': 'All uppercase',
            'settings.case_name_lower': 'Name lowercase',
            'settings.case_name_upper': 'Name uppercase',
            'settings.include_subdirs': 'Include subdirectories',
            'settings.preserve_structure': 'Preserve folder structure',
            'settings.advanced_title': 'Advanced Settings',
            'settings.advanced_subtitle': 'Fine-tune processing parameters for optimal results',
            'settings.image_enhancement': 'Image Enhancement',
            'settings.background_color': 'Background Color',
            'settings.maintain_aspect': 'Maintain aspect ratio',
            'settings.allow_enlargement': 'Allow image enlargement',
            'settings.file_handling': 'File Handling',
            'settings.copy_non_images': 'Copy non-image files to output',
            'settings.reset_counter': 'Reset counter in each directory',
            'settings.change_case': 'Apply case changes to filenames',
            'settings.output_folder': 'Output Folder',
            'settings.output_folder_subtitle': 'Choose where processed images will be saved',
            'settings.use_source_folder': 'Use source folder',
            'settings.use_custom_folder': 'Use custom folder',
            'settings.create_subfolder': 'Create subfolder in output directory',
            'settings.subfolder_name': 'Subfolder Name',

            'help.title': 'Help & Documentation',
            'help.subtitle': 'Learn how to use Image Optimizer effectively',
            'help.getting_started': 'Getting Started',
            'help.step1': 'Drag and drop images into the dropzone or click to browse files',
            'help.step2': 'Choose output location: same folder as source or custom folder',
            'help.step3': 'Configure processing options in Quick Settings (format, quality, resize, watermark, batch rename)',
            'help.step4': 'Click "Start Processing" to optimize your images',
            'help.step5': 'View results and open the output folder when complete',
            'help.key_features': 'Key Features:',
            'help.feature1': 'Batch processing of multiple images',
            'help.feature2': 'Format conversion (JPEG, PNG, WebP, TIFF, AVIF)',
            'help.feature3': 'Quality adjustment and compression',
            'help.feature4': 'Image resizing with multiple fit modes',
            'help.feature5': 'Watermark overlay with position and opacity control',
            'help.feature6': 'Batch rename with patterns and counters',
            'help.feature7': 'Preserve folder structure option',
            'help.supported_formats': 'Supported Formats',
            'help.input_formats': 'Input Formats:',
            'help.output_formats': 'Output Formats:',
            'help.format_notes': 'Format Notes:',
            'help.format_note1': 'WebP and AVIF offer better compression than JPEG',
            'help.format_note2': 'PNG is best for images with transparency',
            'help.format_note3': 'TIFF is ideal for high-quality archival images',
            'help.format_note4': 'SVG and GIF are read-only formats',
            'help.settings_guide': 'Settings Guide',
            'help.output_folder_help': 'Output Folder:',
            'help.output_folder_desc': 'Choose to save processed images in the same folder as originals or select a custom output folder. Enable "Create subfolder" to organize processed images.',
            'help.resize_help': 'Resize Options:',
            'help.resize_desc': 'Resize images to specific dimensions. Choose fit mode: Cover (crop to fit), Contain (fit inside), Fill (stretch), Inside (shrink only), or Outside (enlarge only).',
            'help.watermark_help': 'Watermark:',
            'help.watermark_desc': 'Add a watermark image to all processed images. PNG files with transparency work best. Adjust position, opacity, and size as needed.',
            'help.batch_rename_help': 'Batch Rename:',
            'help.batch_rename_desc': 'Rename files using patterns. Use {counter} for numbers, {date} for current date, {time} for current time, and {original} for original filename.',
            'help.about': 'About',
            'help.description': 'Batch image processing tool',
            'help.built_with': 'www.bavamont.com',
            'help.powered_by': 'Powered by libvips and sharp.js for fast image processing',
            'help.auto_updates': 'Automatic updates keep you current',

            'updater.title': 'App Updater',
            'updater.checking': 'Checking for updates...',
            'updater.available': 'Update Available',
            'updater.not_available': 'You are using the latest version',
            'updater.downloading': 'Downloading update...',
            'updater.downloaded': 'Update downloaded. Restart to install.',
            'updater.error': 'Update failed',
            'updater.install_now': 'Install Now',
            'updater.install_later': 'Install Later',
            'updater.skip_version': 'Skip This Version',
            'updater.check_updates': 'Check for Updates',
            'updater.current_version': 'Current Version:',
            'updater.new_version': 'New Version:',
            'updater.release_notes': 'Release Notes',
            'updater.download_progress': 'Download Progress:',
            'updater.auto_check': 'Check for updates automatically',

            'common.browse': 'Browse',
            'common.ok': 'OK',
            'common.cancel': 'Cancel',
            'common.yes': 'Yes',
            'common.no': 'No',
            'common.apply': 'Apply',
            'common.reset': 'Reset',
            'common.default': 'Default',

            'toast.files_added': 'files added',
            'toast.no_image_files': 'No image files found',
            'toast.processing_files': 'Processing files...',
            'toast.output_folder_selected': 'Output folder selected',
            'toast.output_folder_created': 'Output folder created',
            'toast.output_folder_invalid': 'Invalid output folder',
            'toast.watermark_selected': 'Watermark selected',
            'toast.processing_complete': 'Processing complete!',
            'toast.files_cleared': 'All files cleared',
            'toast.update_checking': 'Checking for updates...',
            'toast.update_available': 'Update available!',
            'toast.update_not_available': 'No updates available',
            'toast.update_downloaded': 'Update ready to install',
            'toast.update_error': 'Update check failed'
        },
        de: {
            'app.title': 'Image Optimizer',
            'app.subtitle': 'Stapelverarbeitung und -optimierung von Bildern',

            'nav.optimizer': 'Image Optimizer',
            'nav.optimizer.tooltip': 'Bilder stapelweise verarbeiten und optimieren',
            'nav.settings': 'Erweiterte Einstellungen',
            'nav.settings.tooltip': 'Erweiterte Verarbeitungsoptionen',
            'nav.help': 'Hilfe',
            'nav.help.tooltip': 'Benutzerhandbuch und Dokumentation',

            'optimizer.title': 'Image Optimizer',
            'optimizer.subtitle': 'Bilder oder Ordner per Drag & Drop für Stapelverarbeitung hinzufügen',
            'optimizer.file_input': 'Dateieingabe',
            'optimizer.files': 'Dateien:',
            'optimizer.total_size': 'Gesamtgröße:',
            'optimizer.drop_images': 'Bilder hier ablegen',
            'optimizer.or_browse': 'oder klicken zum Durchsuchen von Dateien und Ordnern',
            'optimizer.supports': 'Unterstützt:',
            'optimizer.selected_files': 'Ausgewählte Dateien',
            'optimizer.clear_all': 'Alle löschen',
            'optimizer.quick_settings': 'Schnelleinstellungen',
            'optimizer.processing': 'Verarbeitung',
            'optimizer.start_processing': 'Verarbeitung starten',
            'optimizer.select_output': 'Ausgabeordner auswählen',
            'optimizer.browse_output': 'Durchsuchen',
            'optimizer.output': 'Ausgabe:',
            'optimizer.same_as_source': 'Gleich wie Quelle',
            'optimizer.custom_folder': 'Benutzerdefinierter Ordner',
            'optimizer.processing_images': 'Bilder werden verarbeitet',
            'optimizer.processing_status': 'Verarbeitung läuft...',
            'optimizer.current': 'Aktuell:',
            'optimizer.processed': 'Verarbeitet:',
            'optimizer.remaining': 'Verbleibend:',
            'optimizer.errors': 'Fehler:',
            'optimizer.processing_complete': 'Verarbeitung abgeschlossen',
            'optimizer.open_output': 'Ausgabeordner öffnen',

            'settings.format_quality': 'Format & Qualität',
            'settings.change_format': 'Ausgabeformat ändern',
            'settings.output_format': 'Ausgabeformat',
            'settings.change_compression': 'Komprimierung anpassen',
            'settings.quality_level': 'Qualitätsstufe',
            'settings.resize': 'Größe ändern',
            'settings.enable_resize': 'Größenänderung aktivieren',
            'settings.dimensions': 'Abmessungen',
            'settings.resize_mode': 'Größenänderungsmodus',
            'settings.mode_cover': 'Abdecken (zuschneiden)',
            'settings.mode_contain': 'Einpassen (hineinpassen)',
            'settings.mode_fill': 'Füllen (strecken)',
            'settings.mode_inside': 'Innen (nur verkleinern)',
            'settings.mode_outside': 'Außen (nur vergrößern)',
            'settings.watermark': 'Wasserzeichen',
            'settings.enable_watermark': 'Wasserzeichen aktivieren',
            'settings.watermark_image': 'Wasserzeichen-Bild',
            'settings.select_watermark': 'Wasserzeichen-Bild auswählen...',
            'settings.position': 'Position',
            'settings.pos_center': 'Mitte',
            'settings.pos_top_left': 'Oben links',
            'settings.pos_top_right': 'Oben rechts',
            'settings.pos_bottom_left': 'Unten links',
            'settings.pos_bottom_right': 'Unten rechts',
            'settings.opacity': 'Transparenz',
            'settings.size': 'Größe',
            'settings.batch_rename': 'Stapelumbenennung',
            'settings.enable_batch_rename': 'Stapelumbenennung aktivieren',
            'settings.name_pattern': 'Namensmuster',
            'settings.pattern_example': 'z.B. Bild_{counter}',
            'settings.pattern_help': 'Verwenden Sie {counter}, {date}, {time}, {original} Platzhalter',
            'settings.start_counter': 'Zähler starten bei',
            'settings.letter_case': 'Groß-/Kleinschreibung',
            'settings.case_lower': 'Alles kleingeschrieben',
            'settings.case_upper': 'Alles großgeschrieben',
            'settings.case_name_lower': 'Name kleingeschrieben',
            'settings.case_name_upper': 'Name großgeschrieben',
            'settings.include_subdirs': 'Unterordner einschließen',
            'settings.preserve_structure': 'Ordnerstruktur beibehalten',
            'settings.advanced_title': 'Erweiterte Einstellungen',
            'settings.advanced_subtitle': 'Verarbeitungsparameter für optimale Ergebnisse feinabstimmen',
            'settings.image_enhancement': 'Bildverbesserung',
            'settings.background_color': 'Hintergrundfarbe',
            'settings.maintain_aspect': 'Seitenverhältnis beibehalten',
            'settings.allow_enlargement': 'Bildvergrößerung erlauben',
            'settings.file_handling': 'Dateiverwaltung',
            'settings.copy_non_images': 'Nicht-Bilddateien in Ausgabe kopieren',
            'settings.reset_counter': 'Zähler in jedem Verzeichnis zurücksetzen',
            'settings.change_case': 'Groß-/Kleinschreibung auf Dateinamen anwenden',
            'settings.output_folder': 'Ausgabeordner',
            'settings.output_folder_subtitle': 'Wählen Sie, wo verarbeitete Bilder gespeichert werden',
            'settings.use_source_folder': 'Quellordner verwenden',
            'settings.use_custom_folder': 'Benutzerdefinierten Ordner verwenden',
            'settings.create_subfolder': 'Unterordner im Ausgabeverzeichnis erstellen',
            'settings.subfolder_name': 'Unterordner-Name',

            'help.title': 'Hilfe & Dokumentation',
            'help.subtitle': 'Lernen Sie, wie Sie den Image Optimizer effektiv verwenden',
            'help.getting_started': 'Erste Schritte',
            'help.step1': 'Bilder in die Ablagezone ziehen oder klicken zum Durchsuchen',
            'help.step2': 'Ausgabeort wählen: gleicher Ordner wie Quelle oder benutzerdefinierter Ordner',
            'help.step3': 'Verarbeitungsoptionen in Schnelleinstellungen konfigurieren (Format, Qualität, Größe ändern, Wasserzeichen, Stapelumbenennung)',
            'help.step4': 'Auf "Verarbeitung starten" klicken, um Bilder zu optimieren',
            'help.step5': 'Ergebnisse anzeigen und Ausgabeordner bei Abschluss öffnen',
            'help.key_features': 'Hauptfunktionen:',
            'help.feature1': 'Stapelverarbeitung mehrerer Bilder',
            'help.feature2': 'Formatkonvertierung (JPEG, PNG, WebP, TIFF, AVIF)',
            'help.feature3': 'Qualitätsanpassung und Komprimierung',
            'help.feature4': 'Bildgrößenänderung mit mehreren Anpassungsmodi',
            'help.feature5': 'Wasserzeichen-Overlay mit Position und Transparenz-Kontrolle',
            'help.feature6': 'Stapelumbenennung mit Mustern und Zählern',
            'help.feature7': 'Option zum Beibehalten der Ordnerstruktur',
            'help.supported_formats': 'Unterstützte Formate',
            'help.input_formats': 'Eingabeformate:',
            'help.output_formats': 'Ausgabeformate:',
            'help.format_notes': 'Format-Hinweise:',
            'help.format_note1': 'WebP und AVIF bieten bessere Komprimierung als JPEG',
            'help.format_note2': 'PNG ist am besten für Bilder mit Transparenz',
            'help.format_note3': 'TIFF ist ideal für hochwertige Archivbilder',
            'help.format_note4': 'SVG und GIF sind nur-lesen Formate',
            'help.settings_guide': 'Einstellungshandbuch',
            'help.output_folder_help': 'Ausgabeordner:',
            'help.output_folder_desc': 'Wählen Sie, ob verarbeitete Bilder im gleichen Ordner wie die Originale oder in einem benutzerdefinierten Ausgabeordner gespeichert werden sollen. Aktivieren Sie "Unterordner erstellen" zum Organisieren.',
            'help.resize_help': 'Größenänderungs-Optionen:',
            'help.resize_desc': 'Bilder auf bestimmte Abmessungen ändern. Anpassungsmodus wählen: Abdecken (zuschneiden), Einpassen (hineinpassen), Füllen (strecken), Innen (nur verkleinern) oder Außen (nur vergrößern).',
            'help.watermark_help': 'Wasserzeichen:',
            'help.watermark_desc': 'Wasserzeichen-Bild zu allen verarbeiteten Bildern hinzufügen. PNG-Dateien mit Transparenz funktionieren am besten. Position, Transparenz und Größe nach Bedarf anpassen.',
            'help.batch_rename_help': 'Stapelumbenennung:',
            'help.batch_rename_desc': 'Dateien mit Mustern umbenennen. Verwenden Sie {counter} für Zahlen, {date} für aktuelles Datum, {time} für aktuelle Zeit und {original} für ursprünglichen Dateinamen.',
            'help.about': 'Über',
            'help.description': 'Stapelverarbeitungstool für Bilder',
            'help.built_with': 'www.bavamont.com',
            'help.powered_by': 'Angetrieben von libvips und sharp.js für schnelle Bildverarbeitung',
            'help.auto_updates': 'Automatische Updates halten Sie auf dem neuesten Stand',

            'updater.title': 'App-Updater',
            'updater.checking': 'Suche nach Updates...',
            'updater.available': 'Update verfügbar',
            'updater.not_available': 'Sie verwenden die neueste Version',
            'updater.downloading': 'Update wird heruntergeladen...',
            'updater.downloaded': 'Update heruntergeladen. Neu starten zum Installieren.',
            'updater.error': 'Update fehlgeschlagen',
            'updater.install_now': 'Jetzt installieren',
            'updater.install_later': 'Später installieren',
            'updater.skip_version': 'Diese Version überspringen',
            'updater.check_updates': 'Nach Updates suchen',
            'updater.current_version': 'Aktuelle Version:',
            'updater.new_version': 'Neue Version:',
            'updater.release_notes': 'Versionshinweise',
            'updater.download_progress': 'Download-Fortschritt:',
            'updater.auto_check': 'Automatisch nach Updates suchen',

            'common.browse': 'Durchsuchen',
            'common.ok': 'OK',
            'common.cancel': 'Abbrechen',
            'common.yes': 'Ja',
            'common.no': 'Nein',
            'common.apply': 'Anwenden',
            'common.reset': 'Zurücksetzen',
            'common.default': 'Standard',

            'toast.files_added': 'Dateien hinzugefügt',
            'toast.no_image_files': 'Keine Bilddateien gefunden',
            'toast.processing_files': 'Dateien werden verarbeitet...',
            'toast.output_folder_selected': 'Ausgabeordner ausgewählt',
            'toast.output_folder_created': 'Ausgabeordner erstellt',
            'toast.output_folder_invalid': 'Ungültiger Ausgabeordner',
            'toast.watermark_selected': 'Wasserzeichen ausgewählt',
            'toast.processing_complete': 'Verarbeitung abgeschlossen!',
            'toast.files_cleared': 'Alle Dateien gelöscht',
            'toast.update_checking': 'Suche nach Updates...',
            'toast.update_available': 'Update verfügbar!',
            'toast.update_not_available': 'Keine Updates verfügbar',
            'toast.update_downloaded': 'Update bereit zur Installation',
            'toast.update_error': 'Update-Prüfung fehlgeschlagen'
        }
    },

    init() {
        this.detectLanguage();
        this.setupLanguageSelector();
        this.translatePage();
    },

    detectLanguage() {
        const savedLanguage = localStorage.getItem('imageOptimizerLanguage');
        if (savedLanguage && this.translations[savedLanguage]) {
            this.currentLanguage = savedLanguage;
        } else {
            const systemLanguage = navigator.language.substring(0, 2);
            if (this.translations[systemLanguage]) {
                this.currentLanguage = systemLanguage;
            }
        }
    },

    setupLanguageSelector() {
        const selector = document.getElementById('language-selector');
        if (selector) {
            selector.value = this.currentLanguage;
            selector.addEventListener('change', (e) => {
                this.setLanguage(e.target.value);
            });
        }
    },

    setLanguage(language) {
        if (this.translations[language]) {
            this.currentLanguage = language;
            localStorage.setItem('imageOptimizerLanguage', language);
            this.translatePage();
        }
    },

    t(key, params = {}) {
        const translation = this.translations[this.currentLanguage]?.[key] ||
                          this.translations['en']?.[key] ||
                          key;

        let result = translation;
        Object.keys(params).forEach(param => {
            result = result.replace(`{${param}}`, params[param]);
        });

        return result;
    },

    translatePage() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = this.t(key);
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = this.t(key);
        });

        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            element.title = this.t(key);
        });

        document.title = this.t('app.title');
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => i18n.init());
} else {
    i18n.init();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = i18n;
}