# Recovery Mechanisms Quick Reference

## Overview

Recovery mechanisms for handling transient failures, session recovery, account reset, and automatic reconnection.

## Key Files

- `src/utils/RecoveryManager.js` - Main recovery manager
- `src/single-window/recoveryHandlers.js` - IPC handlers
- `src/single-window/renderer/recoveryUI.js` - UI components
- `src/single-window/renderer/recoveryUI.css` - UI styles
- `docs/RECOVERY_MECHANISMS_GUIDE.md` - Full documentation

## Quick API Reference

### Retry Operation

```javascript
const result = await recoveryManager.retryOperation(operation, {
  maxRetries: 3,
  initialDelay: 1000,
  operationName: 'my-operation'
});
```

### Recover Session Data

```javascript
const result = await recoveryManager.recoverSessionData(accountId, {
  createBackup: true,
  preserveSettings: true
});
```

### Reset Account

```javascript
const result = await recoveryManager.resetAccount(accountId, {
  createBackup: true,
  preserveSettings: true,
  reloadView: true
});
```

### Reconnect Account

```javascript
const result = await recoveryManager.reconnectAccount(accountId);
```

### Auto-Reconnect

```javascript
const controller = recoveryManager.startAutoReconnect(accountId, {
  interval: 30000,
  maxAttempts: 0
});

// Stop
controller.stop();
```

### Connection Monitor

```javascript
const controller = recoveryManager.startConnectionMonitor(accountId, {
  interval: 60000,
  autoReconnect: true,
  onStatusChange: (statusInfo) => {
    console.log('Status changed:', statusInfo);
  }
});

// Stop
controller.stop();
```

## IPC API (Renderer)

### Recover Session
```javascript
await window.electronAPI.recovery.recoverSession(accountId, options);
```

### Reset Account
```javascript
await window.electronAPI.recovery.resetAccount(accountId, options);
```

### Reconnect
```javascript
await window.electronAPI.recovery.reconnect(accountId);
```

### Start Auto-Reconnect
```javascript
await window.electronAPI.recovery.startAutoReconnect(accountId, options);
```

### Stop Auto-Reconnect
```javascript
await window.electronAPI.recovery.stopAutoReconnect(accountId);
```

### Start Monitor
```javascript
await window.electronAPI.recovery.startMonitor(accountId, options);
```

### Stop Monitor
```javascript
await window.electronAPI.recovery.stopMonitor(accountId);
```

### Get Status
```javascript
const result = await window.electronAPI.recovery.getStatus(accountId);
```

### Get All Status
```javascript
const result = await window.electronAPI.recovery.getAllStatus();
```

## Events (Renderer)

### Session Recovered
```javascript
window.electronAPI.on('recovery:session-recovered', (data) => {
  // Handle event
});
```

### Account Reset
```javascript
window.electronAPI.on('recovery:account-reset', (data) => {
  // Handle event
});
```

### Reconnected
```javascript
window.electronAPI.on('recovery:reconnected', (data) => {
  // Handle event
});
```

### Status Changed
```javascript
window.electronAPI.on('recovery:status-changed', (data) => {
  // Handle event
});
```

## UI Components

### Show Recovery Dialog
```javascript
showRecoveryDialog(accountId, accountInfo);
```

### Add Recovery Button
```javascript
addRecoveryButton(accountItem, accountId, accountInfo);
```

### Show Recovery Status
```javascript
showRecoveryStatus(accountId, status);
```

### Initialize Recovery UI
```javascript
initializeRecoveryUI();
```

## Default Configuration

```javascript
{
  maxRetries: 3,
  initialRetryDelay: 1000,
  maxRetryDelay: 10000,
  reconnectInterval: 30000,
  connectionCheckInterval: 60000
}
```

## Testing

Run tests:
```bash
node scripts/test-recovery-mechanisms.js
```

## Common Use Cases

### Handle Network Failure
```javascript
// Auto-reconnect on network issues
recoveryManager.startAutoReconnect(accountId);
```

### Recover Corrupted Session
```javascript
// Recover with backup
await recoveryManager.recoverSessionData(accountId, {
  createBackup: true
});
```

### Fresh Start
```javascript
// Reset account completely
await recoveryManager.resetAccount(accountId, {
  createBackup: true,
  reloadView: true
});
```

### Monitor Connection
```javascript
// Start monitoring with auto-reconnect
recoveryManager.startConnectionMonitor(accountId, {
  autoReconnect: true,
  onStatusChange: (info) => {
    console.log(`${info.accountId}: ${info.status}`);
  }
});
```

## Error Handling

All operations return result objects:

```javascript
{
  success: boolean,
  error?: string,
  // Additional fields based on operation
}
```

## Cleanup

Always cleanup on app shutdown:

```javascript
recoveryManager.cleanup();
```

## See Also

- [Full Recovery Mechanisms Guide](./RECOVERY_MECHANISMS_GUIDE.md)
- [Error Handling Guide](./ERROR_HANDLING_GUIDE.md)
- [Session Persistence Guide](./SESSION_PERSISTENCE.md)
