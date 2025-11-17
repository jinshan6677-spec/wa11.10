# Single-Window Main.js Quick Reference

## Architecture Overview

The main.js file now implements a single-window architecture using BrowserViews instead of multiple BrowserWindows.

## Key Components

### Main Window
```javascript
mainWindow = new MainWindow({
  width: 1400,
  height: 900,
  minWidth: 1000,
  minHeight: 600,
  title: 'WhatsApp Desktop'
})
```

### View Manager
```javascript
viewManager = new ViewManager(mainWindow, sessionManager, {
  defaultSidebarWidth: 280,
  translationIntegration: translationIntegration
})
```

## Initialization Flow

1. **Migration Check**
   - Detect old multi-window configuration
   - Show migration dialog if needed
   - Migrate data to new format

2. **Manager Initialization**
   - AccountConfigManager
   - SessionManager
   - NotificationManager
   - TranslationIntegration
   - MainWindow
   - ViewManager
   - TrayManager (optional)

3. **IPC Registration**
   - Single-window handlers
   - Translation handlers

4. **Account Loading**
   - Load account configurations
   - Send to renderer
   - Restore last active account or auto-start

## Cleanup Flow

1. **Stop Monitoring**
   - Connection monitoring
   - Login status monitoring

2. **Destroy Views**
   - All BrowserViews destroyed
   - Session data preserved

3. **Save State**
   - Update last active times
   - Save account configurations

4. **Cleanup Managers**
   - Tray manager
   - IPC handlers
   - Translation integration
   - Notification manager

## Key Differences from Multi-Window

| Aspect | Multi-Window | Single-Window |
|--------|--------------|---------------|
| Window Management | Multiple BrowserWindows | Single BrowserWindow |
| Account Views | Separate windows | BrowserViews in one window |
| Switching | Focus different windows | Show/hide BrowserViews |
| State Persistence | Per-window bounds | Single window + active account |
| Resource Usage | Higher (multiple windows) | Lower (shared window) |
| UI | Scattered windows | Unified sidebar interface |

## Common Operations

### Create Account View
```javascript
await viewManager.switchView(accountId, {
  createIfMissing: true,
  viewConfig: {
    url: 'https://web.whatsapp.com',
    proxy: account.proxy,
    translation: account.translation
  }
})
```

### Switch Between Accounts
```javascript
await viewManager.switchView(accountId)
```

### Restore Last Active Account
```javascript
const accounts = await accountConfigManager.loadAccounts()
const accountIds = accounts.map(acc => acc.id)
await viewManager.restoreActiveAccount(accountIds)
```

### Cleanup on Exit
```javascript
await viewManager.destroyAllViews()
await accountConfigManager.updateAccount(accountId, {
  lastActiveAt: new Date()
})
```

## Migration Handling

### Detection
```javascript
const detectionResult = await migrationManager.detectMigrationNeeded()
if (detectionResult.needed) {
  // Show migration dialog
}
```

### Execution
```javascript
const migrationDialog = new MigrationDialog()
const result = await migrationDialog.showMigrationDialog(migrationManager)
```

## IPC Handlers

### Account Management
- `account:list` - Get all accounts with status
- `account:create` - Create new account
- `account:update` - Update account
- `account:delete` - Delete account
- `switch-account` - Switch to account
- `account:reorder` - Reorder accounts

### View Management
- `account:view-status` - Get view status
- `account:reload-view` - Reload view
- `account:load-url` - Load URL in view
- `get-view-bounds` - Get view bounds

### State Management
- `get-active-account-id` - Get saved active account
- `restore-active-account` - Restore last active
- `get-sidebar-width` - Get saved sidebar width

### Session Management
- `account:login-status` - Get login status
- `account:force-logout` - Force logout
- `account:session-persistence-status` - Get session status

### Monitoring
- `account:connection-status` - Get connection status
- `account:start-connection-monitoring` - Start monitoring
- `account:stop-connection-monitoring` - Stop monitoring

## Error Handling

All operations include try-catch blocks with proper logging:

```javascript
try {
  // Operation
  log('info', 'Operation successful')
} catch (error) {
  log('error', 'Operation failed:', error)
  // Graceful degradation
}
```

## Logging

Consistent logging format:
```javascript
log('info', 'Message')
log('warn', 'Warning message')
log('error', 'Error message', error)
```

## Testing

Run verification test:
```bash
node scripts/test-single-window-main.js
```

## Troubleshooting

### Issue: Views not switching
- Check ViewManager initialization
- Verify IPC handlers registered
- Check account exists in configuration

### Issue: Migration not working
- Check MigrationManager initialization
- Verify old configuration file exists
- Check migration dialog display

### Issue: Session not persisting
- Verify SessionManager initialization
- Check session directory paths
- Verify partition names correct

### Issue: Translation not working
- Check TranslationIntegration initialization
- Verify ViewManager has translation reference
- Check script injection in BrowserViews

## Performance Tips

1. **Lazy View Creation**: Views created only when first accessed
2. **Keep Views Alive**: Hidden views maintain connection
3. **Debounced Resize**: Window resize events debounced
4. **Efficient Switching**: BrowserView show/hide is fast

## Security Considerations

1. **Session Isolation**: Each account has unique partition
2. **Context Isolation**: All windows use contextIsolation
3. **Sandbox**: BrowserViews run in sandbox mode
4. **No Node Integration**: Renderer processes have no Node access
5. **Preload Scripts**: Secure IPC bridge via preload

## Related Files

- `src/main.js` - Main process entry point
- `src/single-window/MainWindow.js` - Main window manager
- `src/single-window/ViewManager.js` - BrowserView manager
- `src/single-window/ipcHandlers.js` - IPC handlers
- `src/single-window/migration/MigrationManager.js` - Migration logic
- `src/managers/AccountConfigManager.js` - Account configuration
- `src/managers/SessionManager.js` - Session management
- `src/managers/TranslationIntegration.js` - Translation integration

## See Also

- [Task 25 Implementation Summary](./TASK_25_IMPLEMENTATION_SUMMARY.md)
- [Migration Detection Quick Reference](./MIGRATION_DETECTION_QUICK_REFERENCE.md)
- [Session Persistence Quick Reference](./SESSION_PERSISTENCE_QUICK_REFERENCE.md)
