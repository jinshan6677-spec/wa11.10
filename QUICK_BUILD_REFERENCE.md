# Quick Build Reference

Fast reference for common build tasks.

## Quick Start

```bash
# Install dependencies
npm install

# Test the app
npm start

# Create test build
npm run pack

# Build for production
npm run build
```

## Common Commands

| Command | Description |
|---------|-------------|
| `npm start` | Run app in development mode |
| `npm run dev` | Run with debugging enabled |
| `npm run pack` | Create unpacked build for testing |
| `npm run build` | Build for current platform |
| `npm run build:win` | Build for Windows |
| `npm run build:mac` | Build for macOS |
| `npm run build:linux` | Build for Linux |
| `npm run build:all` | Build for all platforms |
| `npm run test:build` | Test the packaged build |
| `npm run prebuild` | Check build prerequisites |

## Build Output Locations

All builds are in the `dist/` directory:

- **Windows**: `*.exe` files
- **macOS**: `*.dmg` and `*.zip` files
- **Linux**: `*.AppImage`, `*.deb`, `*.rpm` files

## Before Building

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Ensure icon files exist in `resources/`
4. Run `npm run prebuild` to check prerequisites

## Testing Builds

```bash
# Create test build
npm run pack

# Test the build
npm run test:build

# Manually test
cd dist/win-unpacked  # or mac/linux
# Run the executable
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Missing icons | See `resources/BUILD_NOTES.md` |
| Native module errors | Run `npm run postinstall` |
| Build fails | Check `npm run prebuild` output |
| Large file size | Normal for Electron apps (~150MB) |

## Icon Files Needed

- `resources/icon.ico` - Windows
- `resources/icon.icns` - macOS
- `resources/icons/*.png` - Linux (multiple sizes)

## Quick Icon Creation

```bash
# Install icon builder
npm install -g electron-icon-builder

# Generate icons from source image
electron-icon-builder --input=./source.png --output=./resources
```

## Distribution

1. Build: `npm run build`
2. Test installers on clean systems
3. Create GitHub release
4. Upload files from `dist/`
5. Add release notes

## Support

- Full guide: `BUILD_GUIDE.md`
- Deployment checklist: `DEPLOYMENT_CHECKLIST.md`
- Icon instructions: `resources/BUILD_NOTES.md`
