# Recovery Mechanisms Guide

This guide explains the recovery mechanisms implemented in the WhatsApp Desktop application for handling transient failures, session data recovery, account reset, and automatic reconnection.

## Overview

The recovery system provides robust error handling and automatic recovery capabilities to ensure a smooth user experience even when issues occur. It includes:

- **Retry Logic**: Automatic retry with exponential backoff for transient failures
- **Session Data Recovery**: Recover corrupted session data with automatic backup
- **Account Reset**: Clear and restart accounts with data preservation options
- **Automatic Reconnection**: Auto-reconnect on network failures
- **Connection Monitoring**: Continuous monitoring with status change notifications

## Components

### RecoveryManager

The main recovery manager class that coordinates all recovery operations.

**Location**: `src/utils/RecoveryManager.js`

**Dependencies**:
- SessionManager
- ViewManager
- AccountConfigManager

### Recovery IPC Handlers

IPC handlers for recovery operations between main and renderer processes.

**Location**: `src/single-window/recoveryHandlers.js`

### Recovery UI

User interface components for recovery operations.

**Location**: `src/single-window/renderer/recoveryUI.js`

## Features

### 1. Retry Logic with Exponential Backoff

Automatically retries failed operations with increasing delays between attempts.

**Usage**:

```javascript
const result = await recoveryManager.retryOperation(
  async () => {
    // Your operation here
    return await someAsyncOperation();
  },
  {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    operationName: 'my-operation'
  }
);
```

**Features**:
- Configurable retry attempts
- Exponential backoff (delay doubles each attempt)
- Maximum delay cap
- Custom retry decision logic
- Automatic error logging

**Default Behavior**:
- Max retries: 3
- Initial delay: 1000ms (1 second)
- Max delay: 10000ms (10 seconds)
- Retries on network errors, timeouts
- Skips retry on validation/auth errors

### 2. Session Data Recovery

Recovers corrupted session data while preserving account settings.

**Usage**:

```javascript
const result = await recoveryManager.recoverSessionData(accountId, {
  createBackup: true,
  preserveSettings: true
});
```

**Process**:
1. Creates backup of existing session data
2. Clears corrupted session data
3. Destroys and recreates the view
4. Recreates session with preserved settings
5. Recreates view with account configuration

**Options**:
- `createBackup`: Create backup before recovery (default: true)
- `preserveSettings`: Preserve proxy and translation settings (default: true)

### 3. Account Reset

Completely resets an account, clearing all data and requiring re-authentication.

**Usage**:

```javascript
const result = await recoveryManager.resetAccount(accountId, {
  createBackup: true,
  preserveSettings: true,
  reloadView: true
});
```

**Process**:
1. Creates backup of session data (optional)
2. Forces logout (clears all session data)
3. Reloads view to show QR code (optional)
4. Preserves account settings (optional)

**Options**:
- `createBackup`: Create backup before reset (default: true)
- `preserveSettings`: Keep proxy/translation settings (default: true)
- `reloadView`: Reload view after reset (default: true)

### 4. Manual Reconnection

Manually trigger reconnection for an account.

**Usage**:

```javascript
const result = await recoveryManager.reconnectAccount(accountId);
```

**Behavior**:
- **Error state**: Reloads the page
- **Offline state**: Refreshes connection without full reload
- **Online state**: Returns success immediately

**Reconnection Strategies**:
- Page reload for error states
- Connection refresh for offline states
- Simulates user activity to trigger reconnection
- Clicks reconnect button if present in WhatsApp Web

### 5. Automatic Reconnection

Automatically attempts to reconnect accounts that lose connection.

**Usage**:

```javascript
const controller = recoveryManager.startAutoReconnect(accountId, {
  interval: 30000,
  maxAttempts: 0
});

// Stop auto-reconnect
controller.stop();
```

**Features**:
- Configurable reconnection interval
- Optional maximum attempts limit
- Automatic stop on successful reconnection
- Tracks reconnection attempts

**Options**:
- `interval`: Time between reconnection attempts (default: 30000ms)
- `maxAttempts`: Maximum attempts (0 = unlimited, default: 0)

### 6. Connection Monitoring

Continuously monitors connection status and triggers actions on changes.

**Usage**:

```javascript
const controller = recoveryManager.startConnectionMonitor(accountId, {
  interval: 60000,
  autoReconnect: true,
  onStatusChange: (statusInfo) => {
    console.log('Status changed:', statusInfo);
  }
});

// Stop monitoring
controller.stop();
```

**Features**:
- Periodic connection status checks
- Status change notifications
- Optional automatic reconnection
- Customizable check interval

**Options**:
- `interval`: Check interval in ms (default: 60000ms)
- `autoReconnect`: Auto-reconnect on failure (default: true)
- `onStatusChange`: Callback for status changes

## User Interface

### Recovery Dialog

The recovery dialog provides a user-friendly interface for recovery operations.

**Features**:
- Reconnect button
- Recover session button
- Reset account button (with confirmation)
- Status display with progress indicator
- Success/error messages

**Access**:
- Click the recovery button (🔧) on any account in the sidebar
- Or use the recovery API from renderer process

### Recovery Status Indicators

Visual indicators show recovery status in the sidebar:

- 🔄 Auto-reconnecting
- ⚠️ N Reconnection attempts

### Notifications

Toast notifications inform users of recovery events:
- Session recovered
- Account reset
- Reconnection successful

## IPC API

### Renderer to Main

**Recover Session**:
```javascript
await window.electronAPI.recovery.recoverSession(accountId, options);
```

**Reset Account**:
```javascript
await window.electronAPI.recovery.resetAccount(accountId, options);
```

**Reconnect**:
```javascript
await window.electronAPI.recovery.reconnect(accountId);
```

**Start Auto-Reconnect**:
```javascript
await window.electronAPI.recovery.startAutoReconnect(accountId, options);
```

**Stop Auto-Reconnect**:
```javascript
await window.electronAPI.recovery.stopAutoReconnect(accountId);
```

**Start Connection Monitor**:
```javascript
await window.electronAPI.recovery.startMonitor(accountId, options);
```

**Stop Connection Monitor**:
```javascript
await window.electronAPI.recovery.stopMonitor(accountId);
```

**Get Recovery Status**:
```javascript
const result = await window.electronAPI.recovery.getStatus(accountId);
```

**Get All Recovery Status**:
```javascript
const result = await window.electronAPI.recovery.getAllStatus();
```

### Main to Renderer

**Session Recovered**:
```javascript
window.electronAPI.on('recovery:session-recovered', (data) => {
  // Handle session recovered event
});
```

**Account Reset**:
```javascript
window.electronAPI.on('recovery:account-reset', (data) => {
  // Handle account reset event
});
```

**Reconnected**:
```javascript
window.electronAPI.on('recovery:reconnected', (data) => {
  // Handle reconnection event
});
```

**Status Changed**:
```javascript
window.electronAPI.on('recovery:status-changed', (data) => {
  // Handle status change event
});
```

## Error Handling

All recovery operations include comprehensive error handling:

- Errors are logged to the error log
- User-friendly error messages
- Graceful degradation
- Automatic cleanup on failure

## Best Practices

### When to Use Each Feature

**Retry Logic**:
- Network requests
- File operations
- Any transient failure

**Session Recovery**:
- Corrupted session data
- Login state issues
- Storage errors

**Account Reset**:
- Persistent login problems
- Complete fresh start needed
- User requests logout

**Auto-Reconnect**:
- Network instability
- Temporary connection loss
- Background accounts

**Connection Monitoring**:
- Critical accounts
- Real-time status tracking
- Proactive issue detection

### Configuration Recommendations

**Development**:
```javascript
{
  maxRetries: 2,
  initialRetryDelay: 500,
  reconnectInterval: 10000,
  connectionCheckInterval: 30000
}
```

**Production**:
```javascript
{
  maxRetries: 3,
  initialRetryDelay: 1000,
  reconnectInterval: 30000,
  connectionCheckInterval: 60000
}
```

## Testing

Run the recovery mechanisms test suite:

```bash
node scripts/test-recovery-mechanisms.js
```

**Tests Include**:
- Retry operation with exponential backoff
- Session data recovery
- Account reset
- Manual reconnection
- Automatic reconnection
- Connection monitoring
- Cleanup

## Troubleshooting

### Recovery Not Working

1. Check error logs in `logs/error.log`
2. Verify account exists
3. Check view state
4. Ensure session manager is initialized

### Auto-Reconnect Not Stopping

1. Call `stopAutoReconnect(accountId)`
2. Check for multiple instances
3. Verify controller.stop() is called

### Connection Monitor Issues

1. Verify view exists and is not destroyed
2. Check interval configuration
3. Ensure callback is properly defined

## Performance Considerations

- Auto-reconnect uses timers (minimal CPU)
- Connection monitoring is debounced
- Backups are created asynchronously
- View operations are batched

## Security

- Backups preserve session data securely
- No sensitive data in logs
- IPC channels are whitelisted
- Operations require valid account IDs

## Future Enhancements

- Configurable retry strategies
- Advanced backup management
- Recovery history tracking
- Predictive failure detection
- Batch recovery operations
