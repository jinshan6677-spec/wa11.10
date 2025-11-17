# Error Handling Guide

## Overview

The WhatsApp Desktop application implements comprehensive error handling to ensure reliability, debuggability, and a good user experience. This guide covers the error handling architecture, usage patterns, and best practices.

## Architecture

### Components

1. **ErrorLogger** (`src/utils/ErrorLogger.js`)
   - Centralized error logging with file persistence
   - Log rotation and size management
   - User-friendly error message generation
   - Error categorization and severity levels

2. **ErrorHandler** (`src/utils/ErrorHandler.js`)
   - Async operation wrappers with automatic error handling
   - IPC handler wrappers
   - Global error handlers for uncaught exceptions
   - Retry mechanisms with exponential backoff

3. **ErrorDisplay** (`src/single-window/renderer/errorDisplay.js`)
   - UI component for displaying errors in the sidebar
   - Account-specific error indicators
   - Global error notifications
   - Error details modal

## Error Categories

```javascript
const ErrorCategory = {
  ACCOUNT: 'account',      // Account management errors
  SESSION: 'session',      // Session-related errors
  VIEW: 'view',           // BrowserView errors
  NETWORK: 'network',     // Network connectivity errors
  PROXY: 'proxy',         // Proxy configuration errors
  TRANSLATION: 'translation', // Translation service errors
  MIGRATION: 'migration', // Migration process errors
  IPC: 'ipc',            // IPC communication errors
  SYSTEM: 'system',      // System-level errors
  UNKNOWN: 'unknown'     // Uncategorized errors
};
```

## Error Severity Levels

```javascript
const ErrorLevel = {
  DEBUG: 'debug',   // Debug information
  INFO: 'info',     // Informational messages
  WARN: 'warn',     // Warnings
  ERROR: 'error',   // Errors
  FATAL: 'fatal'    // Fatal errors
};
```

## Usage

### Basic Error Logging

```javascript
const { getErrorLogger, ErrorCategory } = require('./utils/ErrorLogger');

const logger = getErrorLogger();

// Log different severity levels
await logger.debug(ErrorCategory.SYSTEM, 'Debug message', { details });
await logger.info(ErrorCategory.ACCOUNT, 'Info message', { accountId });
await logger.warn(ErrorCategory.SESSION, 'Warning message', { reason });
await logger.error(ErrorCategory.VIEW, 'Error message', { errorCode }, error);
await logger.fatal(ErrorCategory.SYSTEM, 'Fatal error', {}, error);
```

### Wrapping Async Operations

```javascript
const { wrapAsync, ErrorCategory } = require('./utils/ErrorHandler');

// Wrap an async function with automatic error handling
const safeCreateAccount = wrapAsync(
  async (config) => {
    // Your implementation
    return await accountManager.createAccount(config);
  },
  {
    category: ErrorCategory.ACCOUNT,
    operation: 'createAccount',
    onError: (error) => {
      // Optional custom error handler
      return { success: false, error: error.message };
    }
  }
);

// Use the wrapped function
const result = await safeCreateAccount(config);
```

### Wrapping IPC Handlers

```javascript
const { wrapIPCHandler, ErrorCategory } = require('./utils/ErrorHandler');

// Wrap IPC handler with automatic error handling
ipcMain.handle('create-account', wrapIPCHandler(
  async (event, config) => {
    const result = await accountManager.createAccount(config);
    return { success: true, account: result };
  },
  {
    channel: 'create-account',
    category: ErrorCategory.IPC
  }
));
```

### Retry with Backoff

```javascript
const { retryWithBackoff } = require('./utils/ErrorHandler');

// Retry an operation with exponential backoff
const result = await retryWithBackoff(
  async () => {
    return await fetchDataFromAPI();
  },
  {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    shouldRetry: (error, attempt) => {
      // Custom retry logic
      return error.code === 'ETIMEDOUT';
    }
  }
);
```

### Displaying Errors in UI

```javascript
// In renderer process
const errorDisplay = require('./errorDisplay');

// Initialize error display
errorDisplay.initialize();

// Show account-specific error
errorDisplay.showAccountError(
  accountId,
  'Failed to load WhatsApp Web',
  'view',
  { autoDismiss: true, dismissTimeout: 10000 }
);

// Show global error
errorDisplay.showGlobalError(
  'Network connection lost',
  'network',
  'error',
  { autoDismiss: true }
);

// Clear errors
errorDisplay.clearAccountError(accountId);
errorDisplay.clearGlobalErrors();
```

### Sending Errors from Main Process

```javascript
// In main process
const { sendAccountError, sendGlobalError } = require('./main');

// Send account-specific error to renderer
sendAccountError(
  accountId,
  'Failed to create view',
  ErrorCategory.VIEW,
  'error'
);

// Send global error to renderer
sendGlobalError(
  'Application initialization failed',
  ErrorCategory.SYSTEM,
  'fatal'
);
```

## Global Error Handlers

Global error handlers are automatically set up during application initialization:

```javascript
const { setupGlobalErrorHandlers } = require('./utils/ErrorHandler');

// Set up global handlers (called in main.js)
setupGlobalErrorHandlers();
```

This handles:
- Uncaught exceptions
- Unhandled promise rejections
- Process warnings

## User-Friendly Error Messages

The ErrorLogger provides user-friendly error messages for common error scenarios:

```javascript
const logger = getErrorLogger();

const userMessage = logger.getUserFriendlyMessage(
  ErrorCategory.ACCOUNT,
  'create_failed',
  { accountName: 'My Account' }
);

// Returns: "Failed to create account. Please check your input and try again. (Account: My Account)"
```

## Log File Management

### Log Location

Logs are stored in: `{userData}/logs/error.log`

### Log Rotation

- Maximum log file size: 10MB (configurable)
- Maximum number of log files: 5 (configurable)
- Automatic rotation when size limit is reached
- Old logs are numbered: `error.1.log`, `error.2.log`, etc.

### Reading Logs

```javascript
const logger = getErrorLogger();

// Get recent log entries
const recentLogs = await logger.getRecentLogs(100);

// Clear all logs
await logger.clearLogs();
```

## Best Practices

### 1. Always Use Try-Catch for Async Operations

```javascript
async function createAccount(config) {
  try {
    const result = await accountManager.createAccount(config);
    return { success: true, account: result };
  } catch (error) {
    await logger.error(
      ErrorCategory.ACCOUNT,
      'Failed to create account',
      { config },
      error
    );
    return { success: false, error: error.message };
  }
}
```

### 2. Provide Context in Error Logs

```javascript
await logger.error(
  ErrorCategory.VIEW,
  'Failed to load view',
  {
    accountId,
    url,
    attempt: retryCount,
    errorCode: error.code
  },
  error
);
```

### 3. Use Appropriate Error Categories

Choose the most specific error category for better organization and filtering.

### 4. Return Consistent Error Objects

```javascript
// Good
return {
  success: false,
  error: error.message,
  errorCode: 'CREATE_FAILED'
};

// Bad
throw error; // In IPC handlers
```

### 5. Display User-Friendly Messages

```javascript
// Get user-friendly message
const userMessage = logger.getUserFriendlyMessage(
  category,
  errorCode,
  context
);

// Show to user
errorDisplay.showGlobalError(userMessage, category, 'error');
```

### 6. Log Before Throwing

```javascript
async function criticalOperation() {
  try {
    // ... operation
  } catch (error) {
    // Log first
    await logger.error(
      ErrorCategory.SYSTEM,
      'Critical operation failed',
      {},
      error
    );
    
    // Then throw if needed
    throw error;
  }
}
```

### 7. Use Retry for Transient Failures

```javascript
const result = await retryWithBackoff(
  async () => await networkOperation(),
  {
    maxRetries: 3,
    shouldRetry: (error) => {
      // Only retry on network errors
      return error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET';
    }
  }
);
```

## Error Recovery Strategies

### 1. Graceful Degradation

```javascript
try {
  await translationService.inject(accountId, view);
} catch (error) {
  await logger.warn(
    ErrorCategory.TRANSLATION,
    'Translation injection failed, continuing without translation',
    { accountId },
    error
  );
  // Continue without translation
}
```

### 2. Fallback Options

```javascript
try {
  await sessionManager.configureProxy(accountId, proxyConfig);
} catch (error) {
  await logger.warn(
    ErrorCategory.PROXY,
    'Proxy configuration failed, using direct connection',
    { accountId },
    error
  );
  // Fall back to direct connection
  await sessionManager.clearProxy(accountId);
}
```

### 3. User Notification

```javascript
try {
  await viewManager.createView(accountId, config);
} catch (error) {
  await logger.error(
    ErrorCategory.VIEW,
    'View creation failed',
    { accountId },
    error
  );
  
  // Notify user
  sendAccountError(
    accountId,
    'Failed to create view. Please try again.',
    ErrorCategory.VIEW
  );
}
```

## Testing Error Handling

Run the error handling test suite:

```bash
node scripts/test-error-handling.js
```

This tests:
- Error logging functionality
- Async operation wrappers
- IPC handler wrappers
- Error result creation
- Error sanitization
- Retry with backoff
- Log rotation

## Troubleshooting

### Logs Not Being Written

1. Check log directory permissions
2. Verify disk space availability
3. Check ErrorLogger initialization

### Errors Not Displaying in UI

1. Verify errorDisplay is initialized
2. Check IPC communication
3. Verify CSS is loaded

### Global Error Handlers Not Working

1. Ensure `setupGlobalErrorHandlers()` is called early in main.js
2. Check for conflicting error handlers
3. Verify ErrorLogger is initialized before setup

## Configuration

### ErrorLogger Options

```javascript
const logger = getErrorLogger({
  logDir: path.join(app.getPath('userData'), 'logs'),
  logFileName: 'error.log',
  maxLogSize: 10 * 1024 * 1024, // 10MB
  maxLogFiles: 5,
  consoleOutput: true
});
```

### ErrorDisplay Options

```javascript
errorDisplay.showAccountError(accountId, message, category, {
  autoDismiss: true,
  dismissTimeout: 10000,
  severity: 'error'
});
```

## API Reference

See inline documentation in:
- `src/utils/ErrorLogger.js`
- `src/utils/ErrorHandler.js`
- `src/single-window/renderer/errorDisplay.js`

## Related Documentation

- [Developer Guide](./DEVELOPER_GUIDE.md)
- [API Documentation](./API.md)
- [Session Management](./SESSION_PERSISTENCE.md)
