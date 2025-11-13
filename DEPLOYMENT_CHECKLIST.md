# Deployment Checklist

Use this checklist before building and releasing the application.

## Pre-Build Checklist

### Code Quality
- [ ] All tests pass: `npm test`
- [ ] No linting errors: `npm run lint`
- [ ] Code has been reviewed
- [ ] All features are working as expected
- [ ] No console errors in development mode

### Dependencies
- [ ] All dependencies are up to date
- [ ] No security vulnerabilities: `npm audit`
- [ ] Dependencies are properly listed in package.json
- [ ] Native modules (better-sqlite3) are configured correctly

### Configuration
- [ ] Version number updated in package.json
- [ ] CHANGELOG.md updated with release notes
- [ ] README.md is current
- [ ] LICENSE file is present and correct
- [ ] Author and repository information is correct in package.json

### Assets
- [ ] Icon files are present in resources/
  - [ ] resources/icon.ico (Windows)
  - [ ] resources/icon.icns (macOS)
  - [ ] resources/icons/*.png (Linux)
- [ ] resources/entitlements.mac.plist exists (macOS)
- [ ] All required documentation is in docs/

### Translation Features
- [ ] All translation engines are working
- [ ] Configuration persistence works
- [ ] Cache system is functional
- [ ] Security features are enabled
- [ ] Privacy protection is implemented

## Build Process

### Preparation
- [ ] Run prepare-build script: `npm run prebuild`
- [ ] All prerequisites are met
- [ ] Clean previous builds: `rm -rf dist/`

### Testing Build
- [ ] Create test build: `npm run pack`
- [ ] Run build tests: `npm run test:build`
- [ ] Manually test unpacked application
- [ ] Verify all features work in packaged app
- [ ] Check for console errors
- [ ] Test configuration persistence
- [ ] Verify translation features

### Production Build
- [ ] Build for target platform(s): `npm run build`
- [ ] Verify build completed without errors
- [ ] Check dist/ directory for output files
- [ ] Verify file sizes are reasonable
- [ ] Test installers on clean systems

## Platform-Specific Checks

### Windows
- [ ] NSIS installer works correctly
- [ ] Portable version runs without installation
- [ ] Desktop shortcut is created
- [ ] Start menu entry is created
- [ ] Uninstaller works properly
- [ ] Application runs on Windows 10/11

### macOS
- [ ] DMG mounts correctly
- [ ] Application can be dragged to Applications
- [ ] Application runs on Intel Macs
- [ ] Application runs on Apple Silicon Macs
- [ ] Gatekeeper doesn't block (if signed)
- [ ] Application runs on macOS 10.13+

### Linux
- [ ] AppImage runs on Ubuntu/Debian
- [ ] DEB package installs correctly
- [ ] RPM package installs correctly
- [ ] Application appears in application menu
- [ ] Application runs on different distributions

## Security Checks

### Code Signing (if applicable)
- [ ] Windows: Code signing certificate configured
- [ ] macOS: Apple Developer certificate configured
- [ ] Signatures are valid
- [ ] No security warnings when running

### Privacy
- [ ] API keys are encrypted
- [ ] No sensitive data in logs
- [ ] User data is stored locally only
- [ ] Privacy policy is included
- [ ] GDPR compliance verified

## Release Preparation

### Documentation
- [ ] User guide is complete
- [ ] API documentation is current
- [ ] Build guide is accurate
- [ ] FAQ is updated
- [ ] Release notes are written

### Repository
- [ ] All changes are committed
- [ ] Version tag is created: `git tag v1.0.0`
- [ ] Tag is pushed: `git push --tags`
- [ ] Branch is clean and up to date

### Distribution
- [ ] GitHub release is created
- [ ] Release notes are added
- [ ] Installers are uploaded
- [ ] Checksums are provided
- [ ] Download links are tested

## Post-Release

### Verification
- [ ] Download links work
- [ ] Installers download correctly
- [ ] Installation works on clean systems
- [ ] Application launches successfully
- [ ] Auto-update works (if configured)

### Communication
- [ ] Release announcement prepared
- [ ] Documentation website updated
- [ ] Users are notified
- [ ] Social media posts (if applicable)

### Monitoring
- [ ] Monitor for bug reports
- [ ] Check error logs
- [ ] Monitor download statistics
- [ ] Collect user feedback

## Rollback Plan

If issues are discovered after release:

1. [ ] Identify the issue severity
2. [ ] Decide if rollback is necessary
3. [ ] Remove problematic release from downloads
4. [ ] Notify users of the issue
5. [ ] Prepare hotfix release
6. [ ] Test hotfix thoroughly
7. [ ] Deploy hotfix following this checklist

## Notes

- Keep this checklist updated with lessons learned
- Document any issues encountered during deployment
- Update build scripts based on feedback
- Maintain a deployment log for reference
