# Build and Packaging Guide

This guide explains how to build and package the WhatsApp Desktop Translation application for distribution.

## Prerequisites

### Required Software
- Node.js 18.x or higher
- npm 9.x or higher
- Git

### Platform-Specific Requirements

#### Windows
- Windows 10 or higher
- No additional requirements for building Windows packages

#### macOS
- macOS 10.13 or higher
- Xcode Command Line Tools: `xcode-select --install`
- For code signing: Apple Developer account

#### Linux
- Ubuntu 18.04 or higher (or equivalent)
- Required packages:
  ```bash
  sudo apt-get install -y build-essential
  ```

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/whatsapp-desktop-translation.git
   cd whatsapp-desktop-translation
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Verify installation:
   ```bash
   npm run version
   ```

## Icon Files

Before building, ensure you have proper icon files in the `resources/` directory.


See `resources/BUILD_NOTES.md` for detailed instructions on creating icon files.

## Building

### Development Build (Testing)

Create an unpacked build for testing:

```bash
npm run pack
```

This creates an unpacked application in `dist/` that you can run directly.

### Production Builds

#### Build for Current Platform

```bash
npm run build
```

#### Build for Specific Platforms

```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

#### Build for All Platforms

```bash
npm run build:all
```

Note: Cross-platform building may require additional setup. See the electron-builder documentation.

## Testing the Build

### Automated Tests

Run the build test script:

```bash
npm run test:build
```

### Manual Testing

1. Navigate to the `dist/` directory
2. Find the unpacked build or installer
3. Run the application
4. Test the following features:
   - Application launches successfully
   - WhatsApp Web loads correctly
   - Translation settings can be configured
   - Message translation works
   - Input box translation works
   - Configuration persists after restart
   - No console errors

## Build Output

Built files are located in the `dist/` directory:

### Windows
- `WhatsApp Desktop Translation-{version}-x64.exe` - NSIS installer (64-bit)
- `WhatsApp Desktop Translation-{version}-ia32.exe` - NSIS installer (32-bit)
- `WhatsApp Desktop Translation-{version}-portable.exe` - Portable executable

### macOS
- `WhatsApp Desktop Translation-{version}-x64.dmg` - DMG installer (Intel)
- `WhatsApp Desktop Translation-{version}-arm64.dmg` - DMG installer (Apple Silicon)
- `WhatsApp Desktop Translation-{version}-x64.zip` - ZIP archive (Intel)
- `WhatsApp Desktop Translation-{version}-arm64.zip` - ZIP archive (Apple Silicon)

### Linux
- `WhatsApp Desktop Translation-{version}-x64.AppImage` - AppImage (64-bit)
- `WhatsApp Desktop Translation-{version}-arm64.AppImage` - AppImage (ARM64)
- `WhatsApp Desktop Translation-{version}-amd64.deb` - Debian package
- `WhatsApp Desktop Translation-{version}-x86_64.rpm` - RPM package

## Code Signing (Optional)

### Windows Code Signing

1. Obtain a code signing certificate (.pfx file)
2. Set environment variables:
   ```bash
   set CSC_LINK=C:\path\to\certificate.pfx
   set CSC_KEY_PASSWORD=your_password
   ```
3. Build normally: `npm run build:win`

### macOS Code Signing

1. Obtain an Apple Developer certificate
2. Set environment variables:
   ```bash
   export CSC_LINK=/path/to/certificate.p12
   export CSC_KEY_PASSWORD=your_password
   export APPLE_ID=your@apple.id
   export APPLE_ID_PASSWORD=app-specific-password
   ```
3. Build normally: `npm run build:mac`

## Troubleshooting

### Build Fails with "Icon not found"

Ensure icon files exist in `resources/`. See `resources/BUILD_NOTES.md`.

### Native Module Errors

Rebuild native modules:
```bash
npm run postinstall
```

### Large Bundle Size

The application bundle includes:
- Electron runtime (~150MB)
- Node.js modules
- Application code

This is normal for Electron applications.

### Build Fails on Different Platform

Cross-platform building has limitations:
- Windows builds work on Windows
- macOS builds require macOS
- Linux builds work on Linux and macOS

Use CI/CD services like GitHub Actions for multi-platform builds.

## Distribution

### GitHub Releases

1. Create a new release on GitHub
2. Upload the built installers from `dist/`
3. Include release notes

### Auto-Update (Advanced)

Configure electron-updater for automatic updates:
1. Set up a release server
2. Configure `publish` in package.json
3. Implement update checking in the app

## Continuous Integration

Example GitHub Actions workflow:

```yaml
name: Build

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - run: npm install
      - run: npm run build
      
      - uses: actions/upload-artifact@v3
        with:
          name: ${{ matrix.os }}-build
          path: dist/
```

## Support

For build issues:
1. Check the troubleshooting section
2. Review electron-builder documentation
3. Open an issue on GitHub
