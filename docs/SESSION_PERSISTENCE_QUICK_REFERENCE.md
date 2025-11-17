# Session Persistence Quick Reference

Quick reference guide for using session persistence and restoration features.

## Common Operations

### Check if Session Data Exists

```javascript
const hasData = await sessionManager.hasSessionData(accountId);
```

### Restore Login State on App Start

```javascript
const result = await sessionManager.restoreLoginState(accountId, browserView);
if (result.isLoggedIn) {
  console.log('User is logged in');
} else {
  console.log('User needs to log in');
}
```

### Force Logout

```javascript
// From main process
await viewManager.forceLogout(accountId);

// From renderer process
await ipcRenderer.invoke('account:force-logout', accountId);
```

### Handle Session Expiration

```javascript
// Check if expired
const check = await viewManager.checkSessionExpiration(accountId);
if (check.expired) {
  // Handle expiration
  await viewManager.handleSessionExpiration(accountId, { clearCache: true });
}
```

### Monitor Session Health

```javascript
const monitor = viewManager.startSessionHealthMonitoring(accountId);
// Stop later: monitor.stop();
```

### Get Session Status

```javascript
const status = await viewManager.getSessionPersistenceStatus(accountId);
console.log(`Data size: ${status.dataSize} bytes`);
console.log(`Persisted: ${status.persisted}`);
```

## IPC Handlers (Renderer → Main)

```javascript
// Force logout
await ipcRenderer.invoke('account:force-logout', accountId);

// Check expiration
await ipcRenderer.invoke('account:check-session-expiration', accountId);

// Get persistence status
await ipcRenderer.invoke('account:session-persistence-status', accountId);

// Restore all login states
await ipcRenderer.invoke('account:restore-all-login-states');

// Start monitoring
await ipcRenderer.invoke('account:start-session-monitoring', accountId);
```

## Events (Main → Renderer)

```javascript
// Listen for login status restored
ipcRenderer.on('view-manager:login-status-restored', (event, data) => {
  console.log(`Account ${data.accountId} login status: ${data.isLoggedIn}`);
});

// Listen for session expired
ipcRenderer.on('view-manager:session-expired', (event, data) => {
  console.log(`Session expired for ${data.accountId}`);
});

// Listen for logout
ipcRenderer.on('view-manager:account-logged-out', (event, data) => {
  console.log(`Account ${data.accountId} logged out`);
});

// Listen for health updates
ipcRenderer.on('view-manager:session-health-update', (event, data) => {
  console.log(`Health update: ${data.status}`);
});
```

## Typical Workflows

### App Startup

```javascript
// 1. Load accounts
const accounts = await accountManager.getAccountsSorted();

// 2. Restore active account
const result = await viewManager.restoreActiveAccount(accounts.map(a => a.id));

// 3. Restore all login states (optional)
await viewManager.restoreAllLoginStates();
```

### User Logout

```javascript
// 1. Force logout
await viewManager.forceLogout(accountId);

// 2. Notify user
showNotification('Logged out successfully');

// 3. Update UI
updateAccountStatus(accountId, 'logged-out');
```

### Session Expiration

```javascript
// 1. Detect expiration
const check = await viewManager.checkSessionExpiration(accountId);

if (check.expired && check.needsReauth) {
  // 2. Handle expiration
  await viewManager.handleSessionExpiration(accountId);
  
  // 3. Notify user
  showNotification('Session expired. Please log in again.');
}
```

### Account Deletion

```javascript
// 1. Destroy view
await viewManager.destroyView(accountId);

// 2. Delete account config
await accountManager.deleteAccount(accountId, {
  deleteUserData: true,
  userDataPath: app.getPath('userData')
});

// 3. Clean up session data (already done by deleteAccount)
```

## Error Handling

```javascript
try {
  const result = await sessionManager.restoreLoginState(accountId, view);
  if (!result.success) {
    console.error('Restoration failed:', result.error);
    // Handle failure
  }
} catch (error) {
  console.error('Unexpected error:', error);
  // Handle exception
}
```

## Best Practices

1. **Always check success**: Check `result.success` before proceeding
2. **Handle timeouts**: Set appropriate timeouts for restoration
3. **Monitor critical accounts**: Use health monitoring for important accounts
4. **Clear on logout**: Always clear session data on explicit logout
5. **Notify users**: Keep users informed about session status changes

## Debugging

```javascript
// Enable detailed logging
process.env.NODE_ENV = 'development';

// Check session data
const stats = await sessionManager.getSessionDataStats(accountId);
console.log('Session stats:', stats);

// Verify isolation
const isolation = await sessionManager.verifySessionIsolation(accountId);
console.log('Isolation:', isolation);

// Get persistence status
const status = await sessionManager.getSessionPersistenceStatus(accountId);
console.log('Persistence:', status);
```

## Testing

```bash
# Run test script
electron scripts/test-session-persistence.js

# Or add to package.json
npm run test:session-persistence
```

## Related Documentation

- [SESSION_PERSISTENCE.md](./SESSION_PERSISTENCE.md) - Full documentation
- [SESSION_ISOLATION.md](./SESSION_ISOLATION.md) - Session isolation details
- [MULTI_ACCOUNT_GUIDE.md](./MULTI_ACCOUNT_GUIDE.md) - Multi-account setup
