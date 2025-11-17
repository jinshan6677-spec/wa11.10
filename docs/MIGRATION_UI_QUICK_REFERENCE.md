# Migration UI Quick Reference

## Overview

The Migration UI provides a user-friendly interface for migrating from the old multi-window architecture to the new single-window architecture. It displays progress, logs, and results in real-time.

## Components

### 1. MigrationDialog Class

**Location**: `src/single-window/migration/MigrationDialog.js`

**Purpose**: Manages the migration dialog window and coordinates with MigrationManager.

**Key Methods**:
- `show(migrationManager)` - Create and display the migration dialog
- `sendProgress(progress, status, step)` - Update progress bar and status
- `sendLog(level, message)` - Add log entry to the dialog
- `sendComplete(data)` - Show completion results
- `sendError(error)` - Show error state
- `close()` - Close the dialog

**Usage**:
```javascript
const MigrationDialog = require('./src/single-window/migration/MigrationDialog');
const MigrationManager = require('./src/single-window/migration/MigrationManager');

// Create instances
const migrationManager = new MigrationManager();
const migrationDialog = new MigrationDialog({
  width: 700,
  height: 600,
  parent: mainWindow  // Optional parent window
});

// Show dialog
await migrationDialog.show(migrationManager);
```

### 2. Migration Dialog UI

**Location**: `src/single-window/renderer/migrationDialog.html`

**Screens**:

#### Detection Screen
- Shows migration information
- Lists what will be migrated
- Provides "Start Migration" and "Cancel" buttons

#### Progress Screen
- Displays progress bar (0-100%)
- Shows current status
- Displays real-time log entries
- Cannot be cancelled once started

#### Results Screen
- Shows summary cards (status, accounts, errors, warnings)
- Lists migrated accounts with status
- Displays errors and warnings if any
- Shows backup file location
- Provides "Continue to App" and "View Backup" buttons

### 3. Preload Script

**Location**: `src/single-window/renderer/preload-migration.js`

**Exposed API**:
```javascript
window.electronAPI = {
  send(channel, data),      // Send to main process
  on(channel, callback),    // Listen to main process
  invoke(channel, ...args), // Invoke and wait for response
  removeListener(channel, callback)
}
```

**Allowed Channels**:
- `migration:start` - Start migration process
- `migration:cancel` - Cancel migration
- `migration:continue` - Continue to app after migration
- `migration:open-backup` - Open backup file location
- `migration:progress` - Receive progress updates
- `migration:log` - Receive log entries
- `migration:complete` - Receive completion event
- `migration:error` - Receive error event

## IPC Communication Flow

### Starting Migration

```
Renderer                    Main Process
   |                             |
   |-- migration:start --------->|
   |                             |
   |                        [Perform migration]
   |                             |
   |<-- migration:progress ------|  (Multiple times)
   |<-- migration:log ----------|  (Multiple times)
   |                             |
   |<-- migration:complete ------|  (On success)
   |     OR                      |
   |<-- migration:error ---------|  (On failure)
```

### Progress Updates

```javascript
// Main process sends:
{
  progress: 60,           // 0-100
  status: 'Migrating accounts...',
  step: 'Processing account 3 of 5'
}
```

### Log Entries

```javascript
// Main process sends:
{
  level: 'info',          // 'info', 'success', 'warning', 'error'
  message: 'Backup created successfully',
  timestamp: '2024-01-01T12:00:00.000Z'
}
```

### Completion Data

```javascript
// Main process sends:
{
  success: true,
  errors: [],
  warnings: ['Session data not found for account X'],
  migratedAccounts: [
    { id: 'acc_001', name: 'Personal', error: null },
    { id: 'acc_002', name: 'Work', error: null }
  ],
  backupPath: '/path/to/backup/accounts.json.backup-2024-01-01'
}
```

## Integration with Main Process

### Basic Integration

```javascript
const { app } = require('electron');
const MigrationManager = require('./src/single-window/migration/MigrationManager');
const MigrationDialog = require('./src/single-window/migration/MigrationDialog');

app.on('ready', async () => {
  // Check if migration is needed
  const migrationManager = new MigrationManager();
  const detection = await migrationManager.detectMigrationNeeded();
  
  if (detection.needed) {
    // Show migration dialog
    const migrationDialog = new MigrationDialog();
    await migrationDialog.show(migrationManager);
    
    // Wait for migration to complete before continuing
    // The dialog will close automatically when user clicks "Continue"
  } else {
    // No migration needed, proceed normally
    createMainWindow();
  }
});
```

### Advanced Integration with Callbacks

```javascript
const migrationDialog = new MigrationDialog();

// Show dialog
await migrationDialog.show(migrationManager);

// Listen for dialog close
migrationDialog.window.on('closed', () => {
  console.log('Migration dialog closed');
  // Continue with app initialization
  createMainWindow();
});
```

## Styling

The migration UI uses a consistent design language with:
- WhatsApp green (#25d366) for primary actions
- Progress bars with animated shimmer effect
- Color-coded status indicators
- Responsive layout for different window sizes

### CSS Classes

**Info Boxes**:
- `.info-box` - Base info box
- `.info-box.warning` - Warning style (orange)
- `.info-box.error` - Error style (red)
- `.info-box.success` - Success style (green)
- `.info-box.info` - Info style (purple)

**Progress**:
- `.progress-bar` - Progress bar container
- `.progress-fill` - Animated progress fill
- `.progress-text` - Percentage text

**Status Items**:
- `.status-item` - Status entry
- `.status-item.active` - Currently active step
- `.status-item.completed` - Completed step
- `.status-item.error` - Failed step

**Results**:
- `.summary-card` - Summary statistic card
- `.account-result-item` - Individual account result
- `.account-result-item.success` - Successful migration
- `.account-result-item.error` - Failed migration

## Error Handling

### Graceful Error Handling

The migration UI handles errors gracefully:

1. **Network Errors**: Retries automatically
2. **File Access Errors**: Shows clear error message
3. **Validation Errors**: Lists specific issues
4. **Unexpected Errors**: Shows error screen with details

### Error Display

Errors are displayed in multiple ways:
- Progress screen: Red status indicator
- Results screen: Error summary card
- Results screen: Detailed error list
- Results screen: Per-account error status

### Recovery Options

When errors occur:
- User can view backup location
- User can cancel and try again
- User can continue to app (if partial success)
- Backup is always created before migration

## Testing

### Manual Testing

Run the test script:
```bash
npm run test:migration-ui
# or
node scripts/test-migration-ui.js
```

This will:
1. Create a test window
2. Show the migration dialog
3. Allow you to test the UI interactively

### Automated Testing

The dialog includes a simulation mode for testing without actual migration:
- Automatically runs when `electronAPI` is not available
- Simulates progress updates
- Shows sample results

## Best Practices

### 1. Always Create Backup First

```javascript
const backupResult = await migrationManager.detectAndBackup();
if (!backupResult.success) {
  // Handle backup failure
  return;
}
```

### 2. Provide Detailed Progress Updates

```javascript
migrationDialog.sendProgress(40, 'Migrating accounts...', 'Processing account 2 of 5');
migrationDialog.sendLog('info', 'Migrating account: Personal WhatsApp');
```

### 3. Handle Partial Success

```javascript
// Even if some accounts fail, show what succeeded
const migratedAccounts = accounts.map(account => ({
  id: account.id,
  name: account.name,
  error: account.migrationError || null
}));
```

### 4. Preserve User Data

```javascript
// Never delete original data until migration is confirmed successful
if (migrationResult.success) {
  // Only then consider cleanup
}
```

## Troubleshooting

### Dialog Not Showing

**Problem**: Migration dialog doesn't appear

**Solutions**:
1. Check if parent window is provided and valid
2. Verify preload script path is correct
3. Check console for errors
4. Ensure `show()` is awaited

### Progress Not Updating

**Problem**: Progress bar stuck at 0%

**Solutions**:
1. Verify IPC channels are registered
2. Check if `sendProgress()` is being called
3. Ensure window is not destroyed
4. Check renderer console for errors

### Styles Not Loading

**Problem**: Dialog appears unstyled

**Solutions**:
1. Verify CSS file path in HTML
2. Check Content Security Policy
3. Ensure CSS file exists
4. Check for CSS syntax errors

### IPC Communication Failing

**Problem**: Events not received in renderer

**Solutions**:
1. Verify channel names match exactly
2. Check preload script is loaded
3. Ensure channels are whitelisted
4. Check for typos in channel names

## Future Enhancements

Potential improvements:
1. **Pause/Resume**: Allow pausing long migrations
2. **Rollback**: One-click rollback to previous state
3. **Detailed Logs**: Export full migration log
4. **Dry Run**: Preview migration without applying
5. **Selective Migration**: Choose which accounts to migrate
6. **Progress Estimation**: Show estimated time remaining
7. **Notifications**: System notifications for completion
8. **Themes**: Support for dark mode

## Related Documentation

- [Migration Detection Quick Reference](./MIGRATION_DETECTION_QUICK_REFERENCE.md)
- [Configuration Migration Quick Reference](./CONFIGURATION_MIGRATION_QUICK_REFERENCE.md)
- [Session Data Migration Quick Reference](./SESSION_DATA_MIGRATION_QUICK_REFERENCE.md)
- [Migration Flow](./MIGRATION_FLOW.md)

