# Edge Case Validation Quick Reference

## Overview

Quick reference for using the ValidationHelper module to handle edge cases and validation throughout the application.

## Import

```javascript
const {
  validateAccountConfig,
  validateProxyConfig,
  validateTranslationConfig,
  checkDuplicateAccountName,
  validateAccountId,
  validateNetworkConnectivity,
  sanitizeAccountName,
  sanitizeAccountNote,
  validateViewCreationParams,
  validateAccountSwitch,
  handleNetworkFailure,
  handleViewCreationFailure,
  validateOperationSafety
} = require('../utils/ValidationHelper');
```

## Common Use Cases

### 1. Validate Account Before Saving

```javascript
const accountConfig = {
  id: 'acc-123',
  name: 'My Account',
  note: 'Personal account',
  proxy: { enabled: false },
  translation: { enabled: false }
};

const validation = validateAccountConfig(accountConfig);
if (!validation.valid) {
  console.error('Validation failed:', validation.errors);
  return { success: false, errors: validation.errors };
}

// Proceed with saving
```

### 2. Check for Duplicate Account Names

```javascript
// When creating a new account
const existingAccounts = await accountManager.loadAccounts();
const duplicateCheck = checkDuplicateAccountName(newName, existingAccounts);

if (duplicateCheck.isDuplicate) {
  return {
    success: false,
    errors: [`An account with the name "${newName}" already exists`]
  };
}

// When updating an account
const duplicateCheck = checkDuplicateAccountName(
  updatedName,
  existingAccounts,
  currentAccountId // Exclude current account
);
```

### 3. Validate Proxy Configuration

```javascript
const proxyConfig = {
  enabled: true,
  protocol: 'http',
  host: '127.0.0.1',
  port: 8080,
  username: 'user',
  password: 'pass'
};

const validation = validateProxyConfig(proxyConfig);
if (!validation.valid) {
  console.error('Invalid proxy:', validation.errors);
  return { success: false, errors: validation.errors };
}
```

### 4. Handle Network Failures

```javascript
try {
  await someNetworkOperation();
} catch (error) {
  if (error.code || error.errno) {
    const failureInfo = handleNetworkFailure(error, {
      accountId,
      operation: 'connect'
    });
    
    // Show user-friendly message
    showErrorDialog(failureInfo.userMessage);
    
    // Log technical details
    console.error(failureInfo.technicalDetails);
    
    // Retry if possible
    if (failureInfo.retryable) {
      scheduleRetry();
    }
  }
}
```

### 5. Handle View Creation Failures

```javascript
try {
  await viewManager.createView(accountId, config);
} catch (error) {
  const failureInfo = handleViewCreationFailure(error, accountId);
  
  // Show user-friendly message and suggested action
  showErrorDialog(
    failureInfo.userMessage,
    failureInfo.suggestedAction
  );
  
  // Log technical details
  console.error(failureInfo.technicalDetails);
}
```

### 6. Validate Before Switching Accounts

```javascript
const availableAccountIds = Array.from(viewManager.getAllViews().keys());
const switchValidation = validateAccountSwitch(targetAccountId, availableAccountIds);

if (!switchValidation.valid) {
  return {
    success: false,
    error: switchValidation.error
  };
}

// Proceed with switch
```

### 7. Sanitize User Input

```javascript
// Sanitize account name
const sanitizedName = sanitizeAccountName(userInput.name);

// Sanitize account note
const sanitizedNote = sanitizeAccountNote(userInput.note);

// Use sanitized values
const accountConfig = {
  name: sanitizedName,
  note: sanitizedNote,
  // ...
};
```

### 8. Check Operation Safety

```javascript
// Before deleting an account
const safetyCheck = validateOperationSafety('delete-account', {
  isActive: viewManager.getActiveAccountId() === accountId,
  hasUnsavedData: viewState && viewState.isLoaded
});

// Show warnings to user
if (safetyCheck.warnings.length > 0) {
  const confirmed = await showWarningDialog(
    'Are you sure?',
    safetyCheck.warnings
  );
  if (!confirmed) return;
}

// Block if not safe
if (!safetyCheck.safe) {
  return {
    success: false,
    errors: safetyCheck.blockers
  };
}
```

## Validation Functions

### validateAccountConfig(config)

Validates complete account configuration.

**Returns:** `{valid: boolean, errors: string[]}`

**Checks:**
- Account ID (required, non-empty, valid format)
- Account name (required, non-empty, max 100 chars)
- Account note (optional, max 500 chars)
- Order (non-negative integer)
- Proxy config (if provided)
- Translation config (if provided)
- Session directory
- Dates (createdAt, lastActiveAt)
- autoStart flag

### validateProxyConfig(proxyConfig)

Validates proxy configuration.

**Returns:** `{valid: boolean, errors: string[]}`

**Checks:**
- Protocol (http, https, socks5, socks4)
- Host (valid hostname or IP)
- Port (1-65535)
- Authentication (both username and password if either provided)
- Bypass rules (optional)

**Note:** Skips validation if `enabled: false`

### validateTranslationConfig(translationConfig)

Validates translation configuration.

**Returns:** `{valid: boolean, errors: string[]}`

**Checks:**
- Target language (valid language code)
- Engine (google, gpt4, gemini, deepseek)
- autoTranslate flag
- translateInput flag
- friendSettings object

**Note:** Skips validation if `enabled: false`

### checkDuplicateAccountName(name, existingAccounts, excludeId?)

Checks for duplicate account names.

**Returns:** `{isDuplicate: boolean, conflictingAccount?: Object}`

**Features:**
- Case-insensitive comparison
- Whitespace normalization
- Optional exclusion of current account

### validateAccountId(accountId)

Validates account ID format.

**Returns:** `{valid: boolean, error?: string}`

**Checks:**
- Not empty
- Valid string
- No invalid characters (<>:"/\|?*\x00-\x1F)

### validateViewCreationParams(accountId, config)

Validates BrowserView creation parameters.

**Returns:** `{valid: boolean, errors: string[]}`

**Checks:**
- Account ID format
- URL format (if provided)
- User agent (if provided)
- Proxy config (if provided)
- Translation config (if provided)

### validateAccountSwitch(accountId, availableAccountIds)

Validates account switch operation.

**Returns:** `{valid: boolean, error?: string}`

**Checks:**
- Account ID format
- Account exists in available list

## Sanitization Functions

### sanitizeAccountName(name)

Sanitizes account name input.

**Returns:** `string`

**Actions:**
- Trims whitespace
- Removes control characters
- Limits to 100 characters

### sanitizeAccountNote(note)

Sanitizes account note input.

**Returns:** `string`

**Actions:**
- Trims whitespace
- Removes control characters (except newlines and tabs)
- Limits to 500 characters

## Error Handling Functions

### handleNetworkFailure(error, context?)

Handles network errors gracefully.

**Returns:** `{handled: boolean, userMessage: string, technicalDetails: string, retryable: boolean, context: Object}`

**Handles:**
- ETIMEDOUT (timeout)
- ECONNREFUSED (connection refused)
- ENOTFOUND (DNS failure)
- ENETUNREACH (network unreachable)
- EHOSTUNREACH (host unreachable)
- ECONNRESET (connection reset)

### handleViewCreationFailure(error, accountId)

Handles BrowserView creation failures.

**Returns:** `{handled: boolean, userMessage: string, technicalDetails: string, suggestedAction: string}`

**Handles:**
- Session creation failures
- Proxy configuration errors
- Memory allocation failures
- Unexpected view destruction

### validateOperationSafety(operation, state)

Validates operation safety.

**Returns:** `{safe: boolean, warnings: string[], blockers: string[]}`

**Operations:**
- `delete-account`
- `switch-account`
- `create-view`
- `clear-session`

**State Properties:**
- `isActive` - Is the account currently active
- `hasUnsavedData` - Does the account have unsaved data
- `viewCount` - Number of open views
- `accountExists` - Does the target account exist
- `lowMemory` - Is system memory low
- `isLoggedIn` - Is the account logged in

## Error Message Examples

### Validation Errors

```
"Account name is required and must be a non-empty string"
"Account name must not exceed 100 characters"
"An account with the name 'My Account' already exists"
"Proxy host must be a valid hostname or IP address"
"Proxy port must be a number between 1 and 65535"
"Translation engine must be one of: google, gpt4, gemini, deepseek"
```

### Network Errors

```
"The connection timed out. Please check your internet connection and try again."
"Connection was refused. The server may be down or unreachable."
"Could not resolve the hostname. Please check your DNS settings."
"Network is unreachable. Please check your internet connection."
```

### View Creation Errors

```
"Failed to create view for account X. There was a problem with the account session."
"Failed to create view for account X. There was a problem with the proxy configuration."
"Failed to create view for account X. Insufficient memory to create the view."
```

### Operation Safety Warnings

```
"This is the currently active account"
"Account may have unsaved data"
"Many accounts are open, performance may be affected"
"System memory is low"
"This will log out the account"
```

### Operation Safety Blockers

```
"Target account does not exist"
"Maximum recommended account limit reached"
```

## Best Practices

1. **Always validate before saving**: Use `validateAccountConfig()` before creating or updating accounts

2. **Check for duplicates**: Use `checkDuplicateAccountName()` to prevent duplicate account names

3. **Sanitize user input**: Always use `sanitizeAccountName()` and `sanitizeAccountNote()` on user input

4. **Handle network errors gracefully**: Use `handleNetworkFailure()` to provide user-friendly error messages

5. **Validate before operations**: Use `validateAccountSwitch()` before switching accounts

6. **Check operation safety**: Use `validateOperationSafety()` to warn users about potentially unsafe operations

7. **Provide suggested actions**: When handling errors, always provide suggested actions for recovery

8. **Log technical details**: Keep technical error details for debugging while showing user-friendly messages

9. **Respect warnings**: Show warnings to users but allow them to proceed if they choose

10. **Block on safety issues**: Don't allow operations that have blockers

## Testing

Run the comprehensive test suite:

```bash
node scripts/test-edge-case-validation.js
```

This runs 39 tests covering all validation scenarios.
