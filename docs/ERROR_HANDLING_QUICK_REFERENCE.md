# Error Handling Quick Reference

## Quick Start

### Initialize Error Logger (main.js)

```javascript
const { getErrorLogger } = require('./utils/ErrorLogger');
const { setupGlobalErrorHandlers } = require('./utils/ErrorHandler');

const errorLogger = getErrorLogger();
await errorLogger.initialize();
setupGlobalErrorHandlers();
```

### Log Errors

```javascript
const { getErrorLogger, ErrorCategory } = require('./utils/ErrorLogger');
const logger = getErrorLogger();

// Simple error
await logger.error(ErrorCategory.ACCOUNT, 'Operation failed', {}, error);

// With context
await logger.error(
  ErrorCategory.VIEW,
  'Failed to create view',
  { accountId, url },
  error
);
```

### Wrap Async Functions

```javascript
const { wrapAsync, ErrorCategory } = require('./utils/ErrorHandler');

const safeFunction = wrapAsync(
  async (param) => {
    // Your code
  },
  {
    category: ErrorCategory.ACCOUNT,
    operation: 'operationName'
  }
);
```

### Wrap IPC Handlers

```javascript
const { wrapIPCHandler, ErrorCategory } = require('./utils/ErrorHandler');

ipcMain.handle('channel-name', wrapIPCHandler(
  async (event, data) => {
    // Your code
    return { success: true, result };
  },
  {
    channel: 'channel-name',
    category: ErrorCategory.IPC
  }
));
```

### Display Errors in UI

```javascript
// Initialize (in app.js)
errorDisplay.initialize();

// Show account error
errorDisplay.showAccountError(accountId, 'Error message', 'account');

// Show global error
errorDisplay.showGlobalError('Error message', 'system', 'error');

// Clear errors
errorDisplay.clearAccountError(accountId);
errorDisplay.clearGlobalErrors();
```

### Send Errors from Main Process

```javascript
const { sendAccountError, sendGlobalError } = require('./main');

sendAccountError(accountId, 'Error message', ErrorCategory.VIEW);
sendGlobalError('Error message', ErrorCategory.SYSTEM, 'fatal');
```

## Error Categories

| Category | Use For |
|----------|---------|
| `ACCOUNT` | Account management operations |
| `SESSION` | Session creation, persistence |
| `VIEW` | BrowserView operations |
| `NETWORK` | Network connectivity |
| `PROXY` | Proxy configuration |
| `TRANSLATION` | Translation service |
| `MIGRATION` | Data migration |
| `IPC` | IPC communication |
| `SYSTEM` | System-level errors |

## Error Levels

| Level | Use For |
|-------|---------|
| `DEBUG` | Debug information |
| `INFO` | Informational messages |
| `WARN` | Warnings, non-critical issues |
| `ERROR` | Errors, operation failures |
| `FATAL` | Fatal errors, app crashes |

## Common Patterns

### Try-Catch with Logging

```javascript
try {
  await operation();
} catch (error) {
  await logger.error(category, 'Operation failed', { context }, error);
  return { success: false, error: error.message };
}
```

### Retry with Backoff

```javascript
const { retryWithBackoff } = require('./utils/ErrorHandler');

const result = await retryWithBackoff(
  async () => await operation(),
  { maxRetries: 3, initialDelay: 1000 }
);
```

### User-Friendly Messages

```javascript
const userMessage = logger.getUserFriendlyMessage(
  ErrorCategory.ACCOUNT,
  'create_failed'
);
```

### Error Result Object

```javascript
return {
  success: false,
  error: error.message,
  errorCode: 'OPERATION_FAILED',
  userMessage: 'User-friendly message'
};
```

## Testing

```bash
# Run error handling tests
node scripts/test-error-handling.js
```

## Log Files

- Location: `{userData}/logs/error.log`
- Max size: 10MB
- Max files: 5
- Rotation: Automatic

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Logs not written | Check permissions, disk space |
| Errors not displayed | Verify errorDisplay.initialize() |
| Global handlers not working | Call setupGlobalErrorHandlers() early |

## Full Documentation

See [Error Handling Guide](./ERROR_HANDLING_GUIDE.md) for complete documentation.
