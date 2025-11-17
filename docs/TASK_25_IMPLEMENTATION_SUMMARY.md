# Task 25 Implementation Summary: Update main.js to Single-Window Architecture

## Overview

Successfully updated `src/main.js` to use the single-window architecture, replacing the multi-window/multi-instance approach with a unified single-window design using BrowserViews.

## Changes Made

### 1. Import Statements Updated

**Removed (Multi-Window Components):**
- `InstanceManager` - Managed multiple BrowserWindow instances
- `MainApplicationWindow` - Container window for multi-window architecture
- `ErrorHandler` - Multi-window error handling
- `ResourceManager` - Resource monitoring for multiple windows
- `FirstRunWizardIntegration` - Old wizard integration
- `registerContainerIPCHandlers` - Multi-window IPC handlers

**Added (Single-Window Components):**
- `MainWindow` - Single main window manager
- `ViewManager` - BrowserView lifecycle manager
- `MigrationManager` - Handles migration from old architecture
- `MigrationDialog` - UI for migration process
- `registerSingleWindowIPCHandlers` - Single-window IPC handlers

### 2. Manager Initialization

**Before (Multi-Window):**
```javascript
// Multiple managers for multi-window architecture
instanceManager = new InstanceManager(...)
mainApplicationWindow = new MainApplicationWindow()
errorHandler = new ErrorHandler(...)
resourceManager = new ResourceManager(...)
```

**After (Single-Window):**
```javascript
// Simplified single-window architecture
mainWindow = new MainWindow({
  width: 1400,
  height: 900,
  minWidth: 1000,
  minHeight: 600,
  title: 'WhatsApp Desktop',
  preloadPath: path.join(__dirname, 'single-window', 'renderer', 'preload-main.js'),
  htmlPath: path.join(__dirname, 'single-window', 'renderer', 'app.html')
})

viewManager = new ViewManager(mainWindow, sessionManager, {
  defaultSidebarWidth: 280,
  translationIntegration: translationIntegration
})
```

### 3. Migration Handling

Added comprehensive migration detection and handling:

```javascript
migrationManager = new MigrationManager({
  userDataPath: app.getPath('userData')
})

const detectionResult = await migrationManager.detectMigrationNeeded()

if (detectionResult.needed) {
  const migrationDialog = new MigrationDialog()
  const migrationResult = await migrationDialog.showMigrationDialog(migrationManager)
  // Handle migration results
}
```

### 4. IPC Handler Registration

**Before:**
```javascript
registerContainerIPCHandlers(accountConfigManager, instanceManager, mainApplicationWindow)
```

**After:**
```javascript
registerSingleWindowIPCHandlers(accountConfigManager, viewManager, mainWindow, translationIntegration)
```

### 5. Auto-Start Logic

**Before (Multi-Window):**
- Started multiple BrowserWindow instances
- Each account in separate window

**After (Single-Window):**
- Restores last active account first
- Falls back to auto-start if no saved state
- Only one view active at a time

```javascript
// Try to restore last active account
const restoreResult = await viewManager.restoreActiveAccount(accountIds)

if (!restoreResult.success && config.autoStart !== false) {
  // Fall back to auto-start
  await autoStartAccounts()
}
```

### 6. Cleanup Logic

**Before (Multi-Window):**
```javascript
// Stop resource monitoring
resourceManager.stopMonitoring()

// Destroy all window instances
await instanceManager.destroyAllInstances()

// Save window states
for (const account of accounts) {
  const windowState = instanceManager.getWindowState(account.id)
  account.window = windowState.bounds
}
```

**After (Single-Window):**
```javascript
// Stop connection and login monitoring
viewManager.stopAllConnectionMonitoring()
viewManager.stopAllLoginStatusMonitoring()

// Destroy all BrowserViews
await viewManager.destroyAllViews()

// Save account states (no window bounds needed)
for (const account of accounts) {
  if (viewManager.hasView(account.id)) {
    await accountConfigManager.updateAccount(account.id, {
      lastActiveAt: new Date()
    })
  }
}
```

### 7. Application Lifecycle

**Key Changes:**
- Single window lifecycle instead of multiple windows
- BrowserView management instead of BrowserWindow management
- Simplified state persistence (no per-account window bounds)
- Integrated migration flow on first run

## Requirements Addressed

### Requirement 1.1: Single Main Window Architecture
✅ Main window created as sole primary window
✅ Contains sidebar and session area
✅ Loads custom UI shell instead of WhatsApp Web directly

### Requirement 1.5: Application Lifecycle Management
✅ Handles app ready event to initialize MainWindow
✅ Handles window close event to save state
✅ Handles app quit event to cleanup resources
✅ Implements graceful shutdown for all BrowserViews
✅ Saves all account states on quit

## Testing

Created comprehensive test script: `scripts/test-single-window-main.js`

**Test Results:**
- ✅ All required imports present
- ✅ All old components removed
- ✅ All initialization logic present
- ✅ All cleanup logic present
- ✅ All required files exist

## File Structure

```
src/
├── main.js (UPDATED)
│   ├── Single-window imports
│   ├── MainWindow initialization
│   ├── ViewManager initialization
│   ├── Migration handling
│   ├── Single-window IPC handlers
│   └── BrowserView cleanup
│
├── single-window/
│   ├── MainWindow.js
│   ├── ViewManager.js
│   ├── ipcHandlers.js
│   ├── migration/
│   │   ├── MigrationManager.js
│   │   └── MigrationDialog.js
│   └── renderer/
│       ├── app.html
│       └── preload-main.js
│
└── managers/
    ├── AccountConfigManager.js
    ├── SessionManager.js
    └── TranslationIntegration.js
```

## Key Benefits

1. **Simplified Architecture**: Single window instead of multiple windows
2. **Better Resource Management**: BrowserViews are lighter than BrowserWindows
3. **Unified UI**: All accounts in one window with sidebar navigation
4. **Seamless Migration**: Automatic detection and migration from old architecture
5. **Maintained Isolation**: Each account still has isolated session/storage
6. **Better UX**: Faster switching between accounts, no window clutter

## Breaking Changes

- Old multi-window configuration format no longer supported (migration handles this)
- Window position/size per account no longer stored (single window state instead)
- InstanceManager API no longer available (replaced by ViewManager)
- Different IPC handler names (old handlers removed)

## Migration Path

For existing users:
1. Application detects old configuration on startup
2. Shows migration dialog with progress
3. Migrates account configurations to new format
4. Backs up old configuration
5. Preserves all session data and settings

## Next Steps

- Task 26: Implement application lifecycle management (if needed)
- Task 27: Create preload script for main window (if not complete)
- Continue with remaining tasks in the implementation plan

## Notes

- All session data is preserved during migration
- Translation configurations are maintained per account
- Proxy settings are preserved and applied per BrowserView
- Auto-start functionality adapted for single-window architecture
- System tray integration remains compatible

## Verification

Run the test script to verify the implementation:

```bash
node scripts/test-single-window-main.js
```

Expected output: All tests should pass ✅
