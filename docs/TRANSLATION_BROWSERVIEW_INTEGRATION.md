# Translation BrowserView Integration

## Overview

The `TranslationIntegration` class has been updated to support both multi-window architecture (BrowserWindow) and single-window architecture (BrowserView). This document describes the changes and how to use the updated API.

## Key Changes

### 1. Support for BrowserView

The translation service now works with both `BrowserWindow` and `BrowserView` instances. Methods automatically detect the type and extract the `webContents` appropriately.

### 2. Optional InstanceManager

The `instanceManager` parameter in the constructor is now optional. This allows the service to be used in single-window architecture without the multi-window instance manager.

```javascript
// Multi-window architecture (with instanceManager)
const translationService = new TranslationIntegration(instanceManager);

// Single-window architecture (without instanceManager)
const translationService = new TranslationIntegration();
```

### 3. Account ID Injection

The service now injects `window.ACCOUNT_ID` into each BrowserView context, allowing translation scripts to identify which account they're running in.

```javascript
// Injected into each BrowserView
window.ACCOUNT_ID = 'account-123';
```

### 4. Script Injection Timing

Scripts are injected at the right time:
- On `did-finish-load` event (for new page loads)
- Immediately if page is already loaded (for existing views)

## API Reference

### Constructor

```javascript
new TranslationIntegration([instanceManager])
```

**Parameters:**
- `instanceManager` (Object, optional): Instance manager reference for backward compatibility

### Core Methods

#### injectScripts(accountId, target, [translationConfig])

Inject translation scripts into a BrowserWindow or BrowserView.

**Parameters:**
- `accountId` (string): Account identifier
- `target` (BrowserWindow|BrowserView): Target window or view
- `translationConfig` (Object, optional): Translation configuration

**Returns:** `Promise<{success: boolean, error?: string}>`

**Example:**
```javascript
// Inject into BrowserView
const result = await translationService.injectScripts(
  'account-001',
  browserView,
  {
    enabled: true,
    targetLanguage: 'zh-CN',
    engine: 'google',
    autoTranslate: false
  }
);

if (result.success) {
  console.log('Scripts injected successfully');
}
```

#### configureTranslation(accountId, config, [target])

Configure translation settings for an account.

**Parameters:**
- `accountId` (string): Account identifier
- `config` (Object): Translation configuration
- `target` (BrowserWindow|BrowserView, optional): Target window or view

**Returns:** `Promise<{success: boolean, error?: string}>`

**Example:**
```javascript
// Configure translation for BrowserView
const result = await translationService.configureTranslation(
  'account-001',
  {
    enabled: true,
    targetLanguage: 'en',
    engine: 'gpt4',
    autoTranslate: true
  },
  browserView
);
```

#### clearCache(accountId, [target])

Clear translation cache for an account.

**Parameters:**
- `accountId` (string): Account identifier
- `target` (BrowserWindow|BrowserView, optional): Target window or view

**Returns:** `Promise<{success: boolean, error?: string}>`

#### removeAccount(accountId)

Remove translation configuration and status for an account.

**Parameters:**
- `accountId` (string): Account identifier

**Example:**
```javascript
translationService.removeAccount('account-001');
```

### Query Methods

#### getTranslationStatus(accountId)

Get translation injection status for an account.

**Returns:** `Object|null`

```javascript
const status = translationService.getTranslationStatus('account-001');
// {
//   injected: true,
//   lastInjectionTime: Date,
//   error: null
// }
```

#### getTranslationConfig(accountId)

Get translation configuration for an account.

**Returns:** `TranslationConfig|null`

#### isInjected(accountId)

Check if translation scripts are injected for an account.

**Returns:** `boolean`

#### getAllTranslationConfigs()

Get all translation configurations.

**Returns:** `Map<string, TranslationConfig>`

## Integration with ViewManager

The TranslationIntegration works seamlessly with ViewManager in single-window architecture:

```javascript
const { ViewManager } = require('./single-window/ViewManager');
const TranslationIntegration = require('./managers/TranslationIntegration');

// Initialize services
const viewManager = new ViewManager(mainWindow, sessionManager);
const translationService = new TranslationIntegration();

await translationService.initialize();

// Create view and inject translation
const accountId = 'account-001';
const view = await viewManager.createView(accountId, {
  url: 'https://web.whatsapp.com'
});

// Inject translation scripts
await translationService.injectScripts(accountId, view, {
  enabled: true,
  targetLanguage: 'zh-CN',
  engine: 'google'
});

// Later, update configuration
await translationService.configureTranslation(
  accountId,
  { targetLanguage: 'en' },
  view
);
```

## Script Injection Process

1. **Account ID Injection**: `window.ACCOUNT_ID` is set first
2. **Optimizer Script**: Performance optimizer is injected
3. **Content Script**: Main translation script is injected
4. **Initialization**: Translation system is initialized with account ID

```javascript
// Injection sequence
window.ACCOUNT_ID = 'account-001';
// ... optimizer script ...
// ... content script ...
window.WhatsAppTranslation.accountId = 'account-001';
await window.WhatsAppTranslation.init();
```

## Translation Configuration Schema

```javascript
{
  enabled: boolean,              // Enable/disable translation
  targetLanguage: string,        // Target language code (e.g., 'zh-CN', 'en')
  engine: string,                // Translation engine ('google', 'gpt4', 'gemini', 'deepseek')
  apiKey: string,                // API key for paid engines (optional)
  autoTranslate: boolean,        // Auto-translate incoming messages
  translateInput: boolean,       // Enable input box translation
  friendSettings: Object         // Per-contact translation settings
}
```

## Error Handling

All methods return a result object with success status:

```javascript
const result = await translationService.injectScripts(accountId, view);

if (!result.success) {
  console.error('Injection failed:', result.error);
  // Handle error appropriately
}
```

## Backward Compatibility

The service maintains backward compatibility with multi-window architecture:

- Methods accept optional `target` parameter
- If `target` is not provided, falls back to `instanceManager`
- Old method names are aliased (e.g., `removeInstance` → `removeAccount`)

## Testing

Run the test script to verify BrowserView integration:

```bash
npm run test:translation-integration
```

Or manually:

```bash
node scripts/test-translation-integration.js
```

## Requirements Satisfied

This implementation satisfies the following requirements from the spec:

- **Requirement 7.1**: Translation scripts are injected into BrowserViews
- **Requirement 7.2**: `window.ACCOUNT_ID` is injected into each BrowserView context
- Scripts are injected on page load (timing handled correctly)
- Both optimizer and content scripts are injected
- Per-account translation configuration is maintained

## Notes

- Scripts are cached on initialization for performance
- Each account maintains independent translation state
- Translation cache is per-account
- WebContents validity is checked before operations
- Event listeners are set up for automatic injection on page loads
