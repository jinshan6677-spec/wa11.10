# Session Isolation Documentation

## Overview

This document describes the session isolation implementation for the WhatsApp Desktop single-window architecture. Each account maintains completely isolated browser sessions, ensuring that cookies, localStorage, IndexedDB, cache, and other browser data do not interfere between accounts.

## Architecture

### Session Partitions

Each account uses a unique Electron session partition:

```javascript
const partition = `persist:account_${accountId}`;
const accountSession = session.fromPartition(partition);
```

The `persist:` prefix ensures that session data is persisted to disk, allowing login states to survive application restarts.

### Isolation Layers

1. **Session Partition**: Each account has a unique partition identifier
2. **User Data Directory**: Separate storage directories per account
3. **BrowserView Context**: Each BrowserView uses its own isolated session
4. **Proxy Configuration**: Independent proxy settings per account

## Implementation Details

### SessionManager

The `SessionManager` class (`src/managers/SessionManager.js`) is responsible for:

- Creating isolated sessions with unique partitions
- Managing session persistence
- Configuring per-account proxy settings
- Validating session isolation
- Clearing session data

Key methods:

```javascript
// Create or get a session for an account
createSession(accountId, config)

// Get existing session
getSession(accountId)

// Configure proxy for a specific account
configureProxy(accountId, proxyConfig)

// Verify session isolation
verifySessionIsolation(accountId)

// Clear session data
clearSessionData(accountId)
```

### ViewManager

The `ViewManager` class (`src/single-window/ViewManager.js`) is responsible for:

- Creating BrowserViews with isolated sessions
- Validating session isolation on view creation
- Managing view lifecycle while maintaining session isolation
- Testing session isolation

Key methods:

```javascript
// Create view with isolated session
createView(accountId, config)

// Validate session isolation
_validateSessionIsolation(accountId, accountSession)

// Verify all sessions are isolated
verifyAllSessionIsolation()

// Test session isolation for an account
testSessionIsolation(accountId)
```

## Isolation Guarantees

### 1. Cookie Isolation

Each account maintains its own cookie store:

- Cookies set in one account are not accessible to other accounts
- Cookie domains and paths are isolated per session
- Cookie expiration is managed independently

**Verification**: The `testSessionIsolation` method sets and retrieves test cookies to verify isolation.

### 2. LocalStorage Isolation

LocalStorage is completely isolated between accounts:

- Each account has its own localStorage namespace
- Data stored in one account is not visible to others
- Storage quotas are managed per account

**Verification**: The test script sets unique localStorage values per account and verifies they remain isolated.

### 3. IndexedDB Isolation

IndexedDB databases are isolated per account:

- Each account can create databases with the same name without conflicts
- Database schemas and data are completely separate
- Storage quotas are managed independently

**Verification**: The test script creates IndexedDB databases with identical names in different accounts and verifies data isolation.

### 4. Cache Isolation

Browser cache is isolated per account:

- HTTP cache is separate for each account
- Service Workers are isolated
- Cache storage is managed independently

**Verification**: Each session has its own cache directory under the account's user data path.

### 5. Proxy Isolation

Network proxy settings are configured per account:

- Each account can use different proxy servers
- Proxy authentication is handled separately
- Proxy bypass rules are account-specific

**Implementation**: The `SessionManager.configureProxy` method applies proxy settings only to the specified account's session.

## Session Validation

### On View Creation

When a BrowserView is created, the following validations are performed:

1. **Partition Check**: Verify the session uses the correct partition
2. **Storage Path Check**: Ensure the session has a valid storage path
3. **Uniqueness Check**: Confirm the session is not shared with other accounts
4. **Session Match**: Verify the BrowserView's session matches the expected session

```javascript
// Validation is performed automatically in ViewManager.createView()
const isolationValidation = await this._validateSessionIsolation(accountId, accountSession);
if (!isolationValidation.valid) {
  this.log('warn', `Session isolation validation warning: ${isolationValidation.message}`);
}
```

### Runtime Verification

You can verify session isolation at runtime:

```javascript
// Verify all sessions
const results = await viewManager.verifyAllSessionIsolation();
console.log(`Verified: ${results.verified}, Failed: ${results.failed}`);

// Test specific account
const testResults = await viewManager.testSessionIsolation(accountId);
console.log(`Test passed: ${testResults.success}`);
```

## Storage Structure

Each account's data is stored in a separate directory:

```
userData/
├── profiles/
│   ├── account-001/
│   │   ├── Cookies
│   │   ├── Local Storage/
│   │   ├── IndexedDB/
│   │   ├── Cache/
│   │   └── Session Storage/
│   ├── account-002/
│   │   ├── Cookies
│   │   ├── Local Storage/
│   │   ├── IndexedDB/
│   │   ├── Cache/
│   │   └── Session Storage/
│   └── ...
```

## Testing

### Verification Script

Run the verification script to check that session isolation is properly implemented:

```bash
npm run verify:isolation
```

This script checks:
- SessionManager uses unique partitions
- ViewManager creates isolated BrowserViews
- Session validation is implemented
- Proxy isolation is supported
- Storage isolation is configured
- Session persistence is enabled

### Integration Test

Run the full integration test (requires Electron):

```bash
npm run test:isolation
```

This test:
- Creates multiple test accounts
- Sets unique data in each account (cookies, localStorage, IndexedDB)
- Verifies data isolation between accounts
- Tests session validation
- Tests cache isolation

## Best Practices

### 1. Always Use SessionManager

Never create sessions directly. Always use `SessionManager.getSession()` or `SessionManager.createSession()`:

```javascript
// ✓ Correct
const accountSession = sessionManager.getSession(accountId);

// ✗ Incorrect
const accountSession = session.fromPartition(`persist:account_${accountId}`);
```

### 2. Validate on View Creation

Always validate session isolation when creating views:

```javascript
const view = await viewManager.createView(accountId, config);
// Validation is performed automatically
```

### 3. Clean Up Sessions

When deleting an account, clean up its session data:

```javascript
// Clear session data
await sessionManager.clearSessionData(accountId);

// Optionally delete user data directory
await sessionManager.deleteUserDataDir(accountId);
```

### 4. Monitor Session Isolation

Periodically verify session isolation in production:

```javascript
// On app startup or periodically
const results = await viewManager.verifyAllSessionIsolation();
if (results.failed > 0) {
  console.error('Session isolation issues detected:', results.details);
}
```

## Troubleshooting

### Issue: Sessions Appear to Share Data

**Symptoms**: Data from one account appears in another account

**Possible Causes**:
1. Incorrect partition naming
2. Session object reuse
3. Cache not cleared between accounts

**Solution**:
```javascript
// Verify session isolation
const results = await viewManager.verifyAllSessionIsolation();
console.log(results);

// Clear and recreate sessions if needed
await sessionManager.clearSessionData(accountId);
await viewManager.destroyView(accountId);
await viewManager.createView(accountId, config);
```

### Issue: Login State Not Persisting

**Symptoms**: Accounts require re-login after app restart

**Possible Causes**:
1. Using non-persistent partition (missing `persist:` prefix)
2. Session data directory not writable
3. Session data being cleared on exit

**Solution**:
```javascript
// Check if session data exists
const hasData = await sessionManager.hasSessionData(accountId);
console.log(`Session data exists: ${hasData}`);

// Check session partition
const session = sessionManager.getSession(accountId);
console.log(`Partition: ${session.partition}`);
// Should be: persist:account_${accountId}
```

### Issue: Proxy Not Working for Specific Account

**Symptoms**: Proxy settings not applied or affecting wrong account

**Possible Causes**:
1. Proxy configured on wrong session
2. Proxy settings not validated
3. Session created before proxy configuration

**Solution**:
```javascript
// Configure proxy before creating view
await sessionManager.configureProxy(accountId, proxyConfig);

// Then create view
await viewManager.createView(accountId, config);

// Verify proxy is set
const session = sessionManager.getSession(accountId);
// Check session.proxy settings
```

## Security Considerations

### 1. Session Isolation is Critical

Session isolation prevents:
- Cross-account data leakage
- Authentication token sharing
- Cookie theft between accounts
- Privacy violations

### 2. Validate All Sessions

Always validate session isolation, especially:
- On application startup
- After creating new accounts
- After system updates
- Periodically during runtime

### 3. Secure Session Data

- Session data directories should have appropriate file permissions
- Consider encrypting sensitive session data at rest
- Clear session data when accounts are deleted
- Implement session timeout for inactive accounts

## Performance Considerations

### Memory Usage

Each isolated session consumes memory:
- Base session overhead: ~50-100 MB
- Active BrowserView: ~150-200 MB
- Total per account: ~200-300 MB

**Recommendation**: Limit concurrent active accounts based on available system memory.

### Storage Usage

Each account's session data grows over time:
- Cookies: ~1-10 MB
- LocalStorage: ~5-10 MB
- IndexedDB: ~10-100 MB (WhatsApp data)
- Cache: ~50-200 MB

**Recommendation**: Implement periodic cache cleanup and provide users with storage management tools.

## References

- [Electron Session API](https://www.electronjs.org/docs/latest/api/session)
- [Electron BrowserView API](https://www.electronjs.org/docs/latest/api/browser-view)
- [Requirements Document](../requirements.md) - Requirements 4.1-4.4
- [Design Document](../design.md) - Session Isolation section

## Changelog

### 2024-11-17
- Initial implementation of session isolation
- Added validation methods to ViewManager
- Created verification and test scripts
- Documented isolation guarantees and best practices
