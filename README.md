# Image Optimizer

A professional desktop application for batch image processing, optimization, and combination. Built with Electron and powered by libvips for lightning-fast, high-quality image processing.

## Features

### Image Processing
- **Batch Processing** - Process hundreds of images simultaneously with real-time progress tracking
- **Format Conversion** - Convert between JPEG, PNG, WebP, TIFF, and AVIF formats
- **Quality Control** - Precise compression levels from 1-100% with format-specific optimization
- **Smart Resizing** - Multiple resize modes including cover, contain, fill, inside, and outside
- **Dimension Control** - Resize to specific pixel dimensions with intelligent aspect ratio handling
- **Image Enhancement** - Crop, rotate, flip, and adjust brightness, contrast, and saturation
- **Filter Effects** - Apply blur and sharpen filters with adjustable intensity
- **EXIF Preservation** - Maintain original image metadata when desired

### Image Combination
- **Multi-Image Combiner** - Combine multiple images into a single output image
- **PDF Page Extraction** - Extract and combine pages from PDF files with high quality
- **Flexible Alignment** - Choose vertical (stacked) or horizontal (side-by-side) layouts
- **Custom Spacing** - Adjust pixel spacing between combined images
- **Maximum Dimensions** - Set output size limits with automatic intelligent scaling
- **Background Control** - Customize background color for combined images
- **Mixed Input Support** - Combine images and PDF pages in the same operation

### Advanced Features
- **Watermark Overlay** - Add logos or copyright watermarks with customizable position, opacity, and size
- **Background Color Replacement** - Set custom background colors for transparent images
- **Batch Rename** - Pattern-based renaming with counters, date/time stamps, and case control
- **Recent Folders** - Quick access to frequently used directories
- **Settings Persistence** - All preferences automatically saved and restored

### File Management
- **Drag & Drop Interface** - Simply drag files or entire folders into the application
- **Flexible Output** - Save to source folders or custom output directories
- **Folder Structure** - Preserve original directory hierarchy or flatten structure
- **Subdirectory Processing** - Include or exclude subdirectories with full control
- **Smart Organization** - Create subfolders for organized output
- **Non-Image File Handling** - Copy non-image files to output directory when needed

### User Experience
- **Modern Interface** - Clean, intuitive design with glass-morphism effects
- **Start Page** - Welcome screen with quick access to main functions
- **Multi-Language Support** - Available in English and German with automatic detection
- **Cross-Platform Shortcuts** - Keyboard shortcuts that work on Windows, macOS, and Linux
- **Real-Time Progress** - Live progress tracking with time estimation and detailed statistics
- **Auto-Updates** - Automatic update checking and installation
- **Comprehensive Help** - Built-in documentation with keyboard shortcuts and troubleshooting

## Supported Formats

### Input Formats
- **JPEG** (.jpg, .jpeg) - Universal photo format
- **PNG** (.png) - Lossless format with transparency support
- **WebP** (.webp) - Modern web format with excellent compression
- **TIFF** (.tiff, .tif) - High-quality archival format
- **GIF** (.gif) - Animated and static images (read only)
- **AVIF** (.avif) - Next-generation format with superior compression
- **SVG** (.svg) - Vector graphics (read only)
- **PDF** (.pdf) - Extract pages as high-quality images

### Output Formats
- **JPEG** (.jpg) - Best for photos with adjustable compression
- **PNG** (.png) - Best for images requiring transparency
- **WebP** (.webp) - Modern format with superior compression and quality
- **TIFF** (.tiff) - Lossless format for archival purposes
- **AVIF** (.avif) - Next-generation format with excellent compression

## Quick Start

### Image Optimizer
1. **Add Images** - Drag and drop images or folders into the dropzone, or click to browse
2. **Choose Output** - Select same folder as source or browse for custom directory
3. **Configure Settings** - Adjust format, quality, resize, watermark, and rename options
4. **Process** - Click "Start Processing" and monitor real-time progress with time estimates
5. **View Results** - Open the output folder to see optimized images with processing summary

### Image Combiner
1. **Add Files** - Drag and drop images or PDF files into the combiner dropzone
2. **Choose Layout** - Select vertical (stacked) or horizontal (side-by-side) alignment
3. **Set Dimensions** - Configure maximum output size and spacing between images
4. **Select Format** - Choose output format and quality settings
5. **Combine** - Click "Combine Images" to create your merged image with progress tracking

## Interface Overview

### Navigation
- **Start Page** - Welcome screen with quick access to main functions
- **Image Optimizer** - Main processing interface with file input and settings
- **Image Combiner** - Combine multiple images or PDF pages into single output
- **Help** - Comprehensive documentation, keyboard shortcuts, and app information

### Settings Integration
All settings are now conveniently located on the main optimizer page:
- **Format & Quality** - Output format selection and compression control
- **Resize** - Dimension and resize mode configuration
- **Watermark** - Overlay settings with position and opacity controls
- **Batch Rename** - Pattern-based renaming with counters and case options
- **Advanced Options** - Background color, aspect ratio, and file handling preferences

## Keyboard Shortcuts

The application supports universal keyboard shortcuts that work across all platforms and keyboard layouts:

- **1-3** - Switch between main sections (Optimizer, Combiner, Help)
- **Ctrl/Cmd + Del** - Clear all files
- **Ctrl/Cmd + Enter** - Start processing
- **Ctrl/Cmd + O** - Open output folder
- **Escape** - Cancel processing

## Advanced Configuration

### Resize Modes
- **Cover** - Crop image to fit exact dimensions while maintaining aspect ratio
- **Contain** - Fit image inside dimensions maintaining aspect ratio with letterboxing
- **Fill** - Stretch image to fill dimensions exactly (may distort)
- **Inside** - Only shrink images that are larger than target dimensions
- **Outside** - Only enlarge images that are smaller than target dimensions

### Image Enhancements
- **Crop Modes** - Square, 16:9, 4:3, 3:2, or custom aspect ratios
- **Rotation** - 90°, 180°, 270° rotation with optional horizontal/vertical flipping
- **Adjustments** - Brightness (-100 to +100), Contrast (-100 to +100), Saturation (-100 to +100)
- **Filters** - Blur (0-10 sigma) and Sharpen (0-10 intensity) with preview

### Combination Options
- **Vertical Alignment** - Stack images from top to bottom with customizable spacing
- **Horizontal Alignment** - Place images side by side from left to right
- **Spacing Control** - Adjust pixel spacing between combined images (0-100px)
- **Maximum Dimensions** - Set output size limits with automatic intelligent scaling
- **Background Fill** - Choose background color for empty areas with color picker

### Watermark Configuration
- **Position** - Center, top-left, top-right, bottom-left, bottom-right
- **Opacity** - 0-100% transparency control with live preview
- **Size** - 5-50% of image width with proportional scaling
- **Format Support** - PNG with transparency recommended for best results

### Naming Patterns
Use these placeholders in your custom naming patterns:
- `{counter}` - Auto-incrementing number starting from 1
- `{date}` - Current date in YYYY-MM-DD format
- `{time}` - Current time in HH-MM-SS format
- `{original}` - Original filename without extension

**Example**: `IMG_{counter}_{date}` produces `IMG_001_2025-08-02.jpg`

## Performance & Optimization

- **Lightning-Fast Processing** - Powered by libvips for maximum performance
- **Memory Efficient** - Optimized for processing large batches without memory issues
- **Multi-Threading** - Utilizes all available CPU cores for fastest processing
- **Smart Time Estimation** - Accurate progress tracking with remaining time calculation
- **Batch Optimization** - Intelligent processing order for optimal performance

## Technical Details

- **Built with** - Electron framework for cross-platform compatibility
- **Image Processing** - libvips and sharp.js for high-performance processing
- **PDF Processing** - pdf-poppler for high-quality PDF page extraction
- **Languages** - HTML5, CSS3, JavaScript (ES6+)
- **Supported OS** - Windows 10/11, macOS 10.14+, Linux (Ubuntu 18.04+)
- **Architecture** - Modern web technologies with native system integration
- **Security** - Context isolation and secure design principles

## System Requirements

### Minimum Requirements
- **OS**: Windows 10, macOS 10.14, or Linux (Ubuntu 18.04+)
- **RAM**: 4GB RAM
- **Storage**: 200MB available space
- **Display**: 1024x768 resolution

### Recommended Requirements
- **OS**: Windows 11, macOS 12+, or modern Linux distribution
- **RAM**: 8GB RAM or more for large batch processing
- **Storage**: 1GB available space for temporary files
- **Display**: 1920x1080 resolution or higher

## Update History

**02/08/2025** - 1.1.0 - New Image Combiner tab for merging multiple images
- PDF support with high-quality page extraction
- Vertical and horizontal alignment options
- Custom spacing and maximum dimension controls
- Background color customization for combined images


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
- **sharp.js** - Fast Node.js image processing with comprehensive format support
- **pdf-poppler** - High-quality PDF to image conversion
- **Electron** - Cross-platform desktop application framework

---

*For support, feature requests, or bug reports, please visit our website or check the built-in help documentation.*