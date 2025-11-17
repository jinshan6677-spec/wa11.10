# Login Status Detection - Quick Reference

## Overview

The login status detection feature automatically detects whether WhatsApp accounts are logged in or require QR code scanning, and displays appropriate indicators in the sidebar.

## Visual Indicators

### Status Types

| Status | Indicator | Text | Meaning |
|--------|-----------|------|---------|
| Logged In | 🟢 Green dot | "Online" | Account is logged in and connected |
| Login Required | 🟠 Orange pulsing dot | "Login Required" | Account needs QR code scan |
| Loading | 🟠 Orange dot | "Loading..." | Status is being determined |
| Error | 🔴 Red dot | "Error" | Connection or loading error |

### Login Required Indicator

When an account shows "Login Required":
- **Orange pulsing indicator** draws attention
- **Bold text** emphasizes the need for action
- **Tooltip**: "Click to scan QR code and login"
- **Action**: Click the account to switch and scan QR code

## How It Works

### Automatic Detection

The system automatically detects login status by checking for:

1. **QR Code Presence**: Looks for WhatsApp's QR code canvas element
2. **Chat List Presence**: Looks for the chat list interface
3. **Element Visibility**: Checks if elements are actually visible (not just in DOM)

### Detection Triggers

Login status is checked:
- When a view finishes loading
- When navigating within WhatsApp Web
- Periodically (every 30 seconds by default)
- On manual request

## User Workflow

### Logging In to a New Account

1. **Create Account**: Add a new account in the sidebar
2. **Switch to Account**: Click on the account
3. **See Login Prompt**: Sidebar shows "Login Required"
4. **Scan QR Code**: Use WhatsApp mobile app to scan
5. **Status Updates**: Indicator changes to "Online" automatically

### Handling Session Expiration

1. **Status Changes**: Indicator changes from "Online" to "Login Required"
2. **Click Account**: Switch to the account
3. **Re-scan QR Code**: Scan the QR code again
4. **Reconnected**: Status returns to "Online"

## API Reference

### ViewManager Methods

#### Check Login Status
```javascript
// Manual check
const result = await viewManager.checkLoginStatus(accountId);
// Returns: { success, accountId, isLoggedIn, loginInfo, timestamp }
```

#### Get Current Status
```javascript
// Get cached status
const isLoggedIn = viewManager.getLoginStatus(accountId);
// Returns: true | false | null

// Get detailed info
const loginInfo = viewManager.getLoginInfo(accountId);
// Returns: { hasQRCode, qrCodeVisible, hasChatPane, chatPaneVisible, ... }
```

#### Start Monitoring
```javascript
// Monitor single account
const monitor = viewManager.startLoginStatusMonitoring(accountId, {
  interval: 30000 // Check every 30 seconds
});

// Stop monitoring
monitor.stop();
// or
viewManager.stopLoginStatusMonitoring(accountId);
```

#### Monitor All Accounts
```javascript
// Start monitoring all
const result = viewManager.startAllLoginStatusMonitoring({
  interval: 30000
});
// Returns: { started, failed, total }

// Stop monitoring all
const result = viewManager.stopAllLoginStatusMonitoring();
// Returns: { stopped, total }
```

### IPC Handlers

#### From Renderer Process

```javascript
// Check login status
const result = await window.electronAPI.invoke('account:check-login-status', accountId);

// Start monitoring
await window.electronAPI.invoke('account:start-login-status-monitoring', accountId, {
  interval: 30000
});

// Stop monitoring
await window.electronAPI.invoke('account:stop-login-status-monitoring', accountId);

// Monitor all accounts
await window.electronAPI.invoke('account:start-all-login-status-monitoring', {
  interval: 30000
});

// Stop all monitoring
await window.electronAPI.invoke('account:stop-all-login-status-monitoring');
```

### Events

#### Listen for Status Changes

```javascript
// In renderer process
window.electronAPI.on('view-manager:login-status-changed', (data) => {
  const { accountId, isLoggedIn, hasQRCode, loginInfo } = data;
  console.log(`Account ${accountId} login status: ${isLoggedIn}`);
});

window.electronAPI.on('view-manager:connection-status-changed', (data) => {
  const { accountId, connectionStatus, isLoggedIn, hasQRCode } = data;
  console.log(`Account ${accountId} connection: ${connectionStatus}`);
});
```

## Configuration

### Monitoring Interval

Default: 30 seconds

To change:
```javascript
viewManager.startLoginStatusMonitoring(accountId, {
  interval: 60000 // Check every 60 seconds
});
```

### Detection Selectors

The detection uses multiple selectors for robustness:

**QR Code Selectors**:
- `canvas[aria-label*="QR"]`
- `canvas[aria-label*="Code"]`
- `[data-ref][data-ref*="qr"]`
- `div[data-ref="qr-code"]`

**Chat Pane Selectors**:
- `[data-testid="chat-list"]`
- `#pane-side`
- `[data-testid="conversation-panel-wrapper"]`
- `div[data-testid="chat"]`

## Troubleshooting

### Status Not Updating

**Problem**: Login status doesn't update after scanning QR code

**Solutions**:
1. Wait a few seconds for automatic detection
2. Manually trigger check: `viewManager.checkLoginStatus(accountId)`
3. Reload the view: `viewManager.reloadView(accountId)`

### False Positives

**Problem**: Shows "Online" but QR code is visible

**Solutions**:
1. Check if WhatsApp Web UI has changed
2. Update detection selectors if needed
3. Clear session data and re-login

### Monitoring Not Working

**Problem**: Status doesn't update periodically

**Solutions**:
1. Verify monitoring is started: `viewManager.startLoginStatusMonitoring(accountId)`
2. Check console for errors
3. Ensure view is not destroyed

## Performance Tips

### Optimize Monitoring

1. **Adjust Interval**: Increase interval for stable accounts
   ```javascript
   // For stable accounts, check less frequently
   viewManager.startLoginStatusMonitoring(accountId, {
     interval: 60000 // 1 minute
   });
   ```

2. **Stop Monitoring**: Stop monitoring for inactive accounts
   ```javascript
   viewManager.stopLoginStatusMonitoring(accountId);
   ```

3. **Conditional Monitoring**: Only monitor active or recently used accounts

### Reduce Overhead

- Detection uses lightweight DOM queries
- Only notifies renderer on status changes
- Monitoring stops when view is destroyed
- Cached results prevent redundant checks

## Testing

### Manual Testing

1. **Test QR Detection**:
   ```bash
   # Create new account and verify "Login Required" appears
   ```

2. **Test Login Detection**:
   ```bash
   # Scan QR code and verify status changes to "Online"
   ```

3. **Test Monitoring**:
   ```bash
   # Log out and verify status updates automatically
   ```

### Automated Testing

Run the test script:
```bash
node scripts/test-login-status-detection.js
```

## Best Practices

### For Users

1. **Check Status Before Use**: Look at sidebar indicator before switching accounts
2. **Respond to Prompts**: Act on "Login Required" promptly
3. **Keep Accounts Active**: Regularly use accounts to maintain sessions

### For Developers

1. **Handle Errors Gracefully**: Always check result.success
2. **Clean Up Monitors**: Stop monitoring when views are destroyed
3. **Use Events**: Listen for status changes rather than polling
4. **Cache Results**: Use getLoginStatus() for quick checks

## Related Documentation

- [Task 20 Implementation Summary](./TASK_20_IMPLEMENTATION_SUMMARY.md)
- [Session Persistence Guide](./SESSION_PERSISTENCE.md)
- [Status Monitoring Guide](./TASK_19_IMPLEMENTATION_SUMMARY.md)

## Support

For issues or questions:
1. Check console logs for errors
2. Review implementation summary
3. Run test script for diagnostics
4. Check ViewManager and SessionManager logs

