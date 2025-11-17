# Application Lifecycle Management - Quick Reference

## Overview

The application lifecycle management system handles the complete lifecycle of the WhatsApp Desktop application, from initialization to graceful shutdown. It ensures proper state persistence, resource cleanup, and error handling throughout the application's lifetime.

## Key Components

### 1. Application Initialization (`app.whenReady()`)

**Location**: `src/main.js`

**Responsibilities**:
- Initialize all managers (AccountConfigManager, SessionManager, ViewManager, etc.)
- Register IPC handlers
- Check and execute data migration if needed
- Load account configurations
- Restore last active account or auto-start configured accounts
- Set up window close handlers

**Flow**:
```
app.whenReady()
  ├── Check migration needed
  ├── Initialize managers
  │   ├── AccountConfigManager
  │   ├── SessionManager
  │   ├── NotificationManager
  │   ├── TranslationIntegration
  │   ├── MainWindow
  │   ├── ViewManager
  │   └── TrayManager (if enabled)
  ├── Register IPC handlers
  ├── Load accounts
  ├── Restore active account
  └── Setup window close handler
```

### 2. Window Close Event Handler

**Location**: `src/main.js` - `setupMainWindowCloseHandler()`

**Responsibilities**:
- Save application state when window is closing
- Update account last active times
- Persist window bounds and sidebar width

**Triggered by**:
- User clicking window close button
- System shutdown
- Application quit command

### 3. State Saving (`saveApplicationState()`)

**Location**: `src/main.js`

**Responsibilities**:
- Save active account ID (via ViewManager)
- Update last active time for all accounts with active views
- Save window bounds (via MainWindow)
- Save sidebar width (via MainWindow)

**State Saved**:
```javascript
{
  // Saved by ViewManager
  activeAccountId: 'acc_001',
  
  // Saved by MainWindow
  bounds: { x, y, width, height },
  isMaximized: false,
  sidebarWidth: 280,
  
  // Saved by AccountConfigManager
  accounts: [
    {
      id: 'acc_001',
      lastActiveAt: '2024-01-15T10:30:00Z',
      // ... other account data
    }
  ]
}
```

### 4. Resource Cleanup (`cleanup()`)

**Location**: `src/main.js`

**Responsibilities**:
- Save application state
- Stop all monitoring (connection, login status)
- Gracefully shutdown all BrowserViews
- Destroy system tray
- Unregister IPC handlers
- Clean up translation integration
- Clear notifications

**Cleanup Order**:
```
cleanup()
  ├── 1. Save application state
  ├── 2. Stop all monitoring
  │   ├── Connection monitoring
  │   └── Login status monitoring
  ├── 3. Destroy all BrowserViews
  ├── 4. Destroy system tray
  ├── 5. Unregister IPC handlers
  ├── 6. Clean up translation integration
  ├── 7. Clean up notification manager
  └── 8. Clean up session manager
```

### 5. Application Quit Events

**Events Handled**:

#### `window-all-closed`
- Triggered when all windows are closed
- Checks if minimize to tray is enabled
- Executes cleanup if not minimizing to tray
- Quits app on non-macOS platforms

#### `before-quit`
- Triggered before application quits
- Prevents duplicate cleanup with `app.isQuitting` flag
- Executes final cleanup
- Logs completion

#### `will-quit`
- Triggered as last chance before quit
- Synchronously stops all monitoring
- Final cleanup opportunity

## State Persistence

### Window State

**Stored in**: `window-state.json` (electron-store)

**Data**:
```javascript
{
  bounds: {
    x: 100,
    y: 100,
    width: 1400,
    height: 900
  },
  isMaximized: false,
  sidebarWidth: 280,
  activeAccountId: 'acc_001'
}
```

**Persistence Points**:
- Window resize → Save bounds
- Window move → Save bounds
- Window maximize/unmaximize → Save state
- Sidebar resize → Save width
- Account switch → Save active account ID
- Window close → Save all state

### Account State

**Stored in**: `accounts.json` (AccountConfigManager)

**Data**:
```javascript
{
  accounts: [
    {
      id: 'acc_001',
      name: 'WhatsApp Business',
      lastActiveAt: '2024-01-15T10:30:00Z',
      // ... other account data
    }
  ]
}
```

**Persistence Points**:
- Account create/update/delete → Save immediately
- Window close → Update last active times
- App quit → Final save

## Graceful Shutdown

### BrowserView Shutdown

**Process**:
1. Stop connection monitoring for all views
2. Stop login status monitoring for all views
3. Destroy each BrowserView individually
4. Handle errors gracefully (log but continue)
5. Report success/failure counts

**Implementation**:
```javascript
// ViewManager.destroyAllViews()
const result = await viewManager.destroyAllViews();
// Returns: { destroyed: 3, failed: 0 }
```

### Error Handling During Shutdown

**Strategy**:
- Wrap each cleanup step in try-catch
- Log errors but continue cleanup
- Ensure app can exit even if cleanup fails
- Save critical state first

**Example**:
```javascript
try {
  await saveApplicationState();
} catch (error) {
  log('error', 'State save failed:', error);
  // Continue with cleanup anyway
}
```

## Error Recovery

### Uncaught Exceptions

**Handler**: `process.on('uncaughtException')`

**Actions**:
- Log error with stack trace
- Attempt emergency state save
- Continue (don't crash immediately)

### Unhandled Promise Rejections

**Handler**: `process.on('unhandledRejection')`

**Actions**:
- Log rejection reason
- Log stack trace if available
- Continue execution

## Testing

### Test Script

**Location**: `scripts/test-lifecycle-management.js`

**Tests**:
1. App ready event initialization
2. Manager initialization
3. State saving on window close
4. Cleanup execution
5. State persistence verification

**Run**:
```bash
npm run test:lifecycle
```

### Manual Testing

**Test Scenarios**:

1. **Normal Shutdown**
   - Open app
   - Add accounts
   - Switch between accounts
   - Close window
   - Verify state saved
   - Reopen app
   - Verify state restored

2. **Forced Quit**
   - Open app with accounts
   - Force quit (Ctrl+C or Task Manager)
   - Reopen app
   - Verify state recovered

3. **Multiple Accounts**
   - Create 5+ accounts
   - Switch between them
   - Close app
   - Verify all last active times saved

4. **Window State**
   - Resize window
   - Move window
   - Maximize window
   - Close and reopen
   - Verify position/size restored

## Configuration

### Auto-start Accounts

**Config**: `account.autoStart = true`

**Behavior**:
- On app ready, check for auto-start accounts
- Start first auto-start account automatically
- Update last active time

### Minimize to Tray

**Config**: `config.trayConfig.minimizeToTray = true`

**Behavior**:
- On window close, don't quit app
- Keep running in background
- Show tray icon

## Best Practices

### For Developers

1. **Always save state before destructive operations**
   ```javascript
   await saveApplicationState();
   await performDestructiveOperation();
   ```

2. **Handle errors gracefully in cleanup**
   ```javascript
   try {
     await cleanup();
   } catch (error) {
     log('error', 'Cleanup failed:', error);
     // Continue anyway
   }
   ```

3. **Use the isQuitting flag to prevent duplicate cleanup**
   ```javascript
   if (app.isQuitting) return;
   app.isQuitting = true;
   ```

4. **Test lifecycle with multiple accounts**
   - Ensure cleanup works with 10+ accounts
   - Verify no memory leaks
   - Check cleanup timing

### For Users

1. **Normal shutdown is recommended**
   - Use File → Quit or close window
   - Allows proper state saving
   - Prevents data loss

2. **Avoid force quit when possible**
   - May lose unsaved state
   - May leave resources uncleaned
   - Use only when app is frozen

## Troubleshooting

### State Not Saving

**Symptoms**:
- Window position resets on restart
- Active account not restored
- Last active times not updated

**Solutions**:
1. Check electron-store permissions
2. Verify `userData` path is writable
3. Check logs for save errors
4. Try deleting state files and restart

### Cleanup Hangs

**Symptoms**:
- App doesn't quit
- Window stays open
- Process remains in task manager

**Solutions**:
1. Check for infinite loops in cleanup
2. Verify all async operations have timeouts
3. Check BrowserView destruction
4. Force quit and check logs

### Memory Leaks

**Symptoms**:
- Memory usage grows over time
- Slow shutdown
- System becomes sluggish

**Solutions**:
1. Verify all BrowserViews are destroyed
2. Check for event listener leaks
3. Ensure timers are cleared
4. Profile with Chrome DevTools

## Related Documentation

- [Main Window Architecture](./SINGLE_WINDOW_MAIN_QUICK_REFERENCE.md)
- [View Manager](./SESSION_PERSISTENCE_QUICK_REFERENCE.md)
- [Account Management](./MULTI_ACCOUNT_GUIDE.md)
- [Session Persistence](./SESSION_PERSISTENCE.md)

## API Reference

### saveApplicationState()

Saves all application state to persistent storage.

**Returns**: `Promise<void>`

**Throws**: Error if save fails

### cleanup()

Performs graceful shutdown of all resources.

**Returns**: `Promise<void>`

**Side Effects**:
- Stops all monitoring
- Destroys all BrowserViews
- Unregisters IPC handlers
- Clears notifications

### setupMainWindowCloseHandler()

Sets up window close event handler.

**Returns**: `void`

**Side Effects**:
- Registers 'close' event listener
- Saves state on window close

## Version History

- **v1.0.0** (2024-01-15): Initial implementation
  - Basic lifecycle management
  - State persistence
  - Graceful shutdown
