# Image Optimizer

A desktop application for batch image processing, optimization, and conversion. Built with Electron and powered by libvips for fast, high-quality image processing.

## Features

### Image Processing
- **Batch Processing** - Process hundreds of images simultaneously
- **Format Conversion** - Convert between JPEG, PNG, WebP, TIFF, and AVIF formats
- **Quality Control** - Adjust compression levels from 1-100%
- **Smart Resizing** - Multiple resize modes including cover, contain, fill, inside, and outside
- **Dimension Control** - Resize to specific pixel dimensions with aspect ratio options

### Image Enhancement
- **Watermark Overlay** - Add watermarks with customizable position, opacity, and size
- **Background Color** - Set custom background colors for transparent images
- **Aspect Ratio** - Maintain or modify image proportions
- **Image Enlargement** - Optional upscaling for smaller images

### File Management
- **Drag & Drop Interface** - Simply drag files or entire folders into the application
- **Flexible Output** - Save to source folders or custom output directories
- **Folder Structure** - Preserve original directory hierarchy or flatten structure
- **Subdirectory Processing** - Include or exclude subdirectories
- **Smart Organization** - Create subfolders for organized output

### Batch Rename
- **Pattern-Based Naming** - Use custom patterns with placeholders
- **Counter System** - Auto-increment numbers with custom start values
- **Date/Time Stamps** - Include current date and time in filenames
- **Case Control** - Apply uppercase, lowercase, or mixed case formatting
- **Original Names** - Preserve or modify original filenames

### User Experience
- **Multi-Language Support** - Available in English and German
- **Modern Interface** - Clean, intuitive design with dark theme support
- **Real-Time Progress** - Live progress tracking with detailed statistics
- **Auto-Updates** - Automatic update checking and installation
- **Help Documentation** - Built-in comprehensive help system

## Supported Formats

### Input Formats
- **JPEG** (.jpg, .jpeg)
- **PNG** (.png)
- **WebP** (.webp)
- **TIFF** (.tiff, .tif)
- **GIF** (.gif) - Read only
- **AVIF** (.avif)
- **SVG** (.svg) - Read only

### Output Formats
- **JPEG** (.jpg) - Best for photos with good compression
- **PNG** (.png) - Best for images with transparency
- **WebP** (.webp) - Modern format with superior compression
- **TIFF** (.tiff) - High-quality archival format
- **AVIF** (.avif) - Next-generation format with excellent compression

## Quick Start

1. **Add Images** - Drag and drop images or folders into the dropzone
2. **Choose Output** - Select same folder as source or choose a custom directory
3. **Configure Settings** - Adjust format, quality, resize, watermark, and rename options
4. **Process** - Click "Start Processing" and monitor progress
5. **View Results** - Open the output folder to see your optimized images

## Interface Overview

### Main Tabs
- **Image Optimizer** - Main processing interface with file input and quick settings
- **Advanced Settings** - Fine-tune processing parameters and app preferences
- **Help** - Comprehensive documentation and usage guide

### Quick Settings Panel
- **Format & Quality** - Output format selection and compression control
- **Resize** - Dimension and resize mode configuration
- **Watermark** - Overlay settings with position and opacity controls
- **Batch Rename** - Pattern-based renaming with counters and case options

## Advanced Configuration

### Resize Modes
- **Cover** - Crop image to fit exact dimensions
- **Contain** - Fit image inside dimensions maintaining aspect ratio
- **Fill** - Stretch image to fill dimensions exactly
- **Inside** - Only shrink images that are larger than target
- **Outside** - Only enlarge images that are smaller than target

### Watermark Options
- **Position** - Center, corners, or custom placement
- **Opacity** - 0-100% transparency control
- **Size** - 5-50% of image size
- **Format Support** - PNG with transparency recommended

### Naming Patterns
Use these placeholders in your naming patterns:
- `{counter}` - Auto-incrementing number
- `{date}` - Current date (YYYY-MM-DD)
- `{time}` - Current time (HH-MM-SS)
- `{original}` - Original filename without extension

Example: `IMG_{counter}_{date}` produces `IMG_001_2025-07-25.jpg`

## Technical Details

- **Built with** - Electron framework for cross-platform compatibility
- **Image Processing** - libvips and sharp.js for high-performance processing
- **Languages** - HTML5, CSS3, JavaScript
- **Supported OS** - Windows, macOS, Linux
- **Architecture** - Modern web technologies with native system integration

## Update History

**25/07/2025** - 1.0.0 - Complete rewrite with modern UI
- Multi-language support (English/German)
- Advanced watermarking system  
- Pattern-based batch renaming
- Auto-updater functionality
- Comprehensive settings panel
- Real-time progress tracking
- Modern drag & drop interface

**11/18/2020** - 0.0.2 - Updated dependencies + small bug fixes

**04/16/2019** - 0.0.1 - Initial release

## Credits

Developed by **www.bavamont.com**

Powered by:
- **libvips** - High-performance image processing library
- **sharp.js** - Fast Node.js image processing
- **Electron** - Cross-platform desktop app framework