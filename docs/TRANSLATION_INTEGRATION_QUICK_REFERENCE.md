# Translation Integration Quick Reference

## Quick Start

### Initialize Service

```javascript
const TranslationIntegration = require('./managers/TranslationIntegration');

// Single-window architecture
const translationService = new TranslationIntegration();
await translationService.initialize();
```

### Inject Scripts into BrowserView

```javascript
// After creating a BrowserView
const result = await translationService.injectScripts(
  accountId,
  browserView,
  {
    enabled: true,
    targetLanguage: 'zh-CN',
    engine: 'google',
    autoTranslate: false
  }
);
```

### Update Configuration

```javascript
await translationService.configureTranslation(
  accountId,
  { targetLanguage: 'en', autoTranslate: true },
  browserView
);
```

### Check Status

```javascript
const status = translationService.getTranslationStatus(accountId);
const config = translationService.getTranslationConfig(accountId);
const isInjected = translationService.isInjected(accountId);
```

### Cleanup

```javascript
await translationService.clearCache(accountId, browserView);
translationService.removeAccount(accountId);
```

## Common Patterns

### Pattern 1: View Creation with Translation

```javascript
// Create view
const view = await viewManager.createView(accountId, config);

// Inject translation
await translationService.injectScripts(accountId, view, translationConfig);
```

### Pattern 2: Update Translation on View Switch

```javascript
// Switch to account
await viewManager.switchView(accountId);

// Update translation config if needed
const view = viewManager.getView(accountId);
await translationService.configureTranslation(accountId, newConfig, view);
```

### Pattern 3: Handle View Reload

```javascript
// Listen for view reload
view.webContents.on('did-finish-load', async () => {
  // Re-inject scripts
  await translationService.injectScripts(accountId, view);
});
```

## Key Points

1. **Account ID is injected**: `window.ACCOUNT_ID` is available in each BrowserView
2. **Scripts are cached**: Loaded once on initialization for performance
3. **Auto-injection**: Scripts inject automatically on page load
4. **Independent configs**: Each account has separate translation settings
5. **Backward compatible**: Works with both BrowserWindow and BrowserView

## Troubleshooting

### Scripts not injecting?

Check if:
- Service is initialized: `await translationService.initialize()`
- WebContents is valid: `!view.webContents.isDestroyed()`
- Page is loaded: Wait for `did-finish-load` event

### Configuration not applying?

Ensure:
- Scripts are injected first
- Target view is provided: `configureTranslation(id, config, view)`
- WhatsApp Web is fully loaded

### Cache not clearing?

Verify:
- View is active and loaded
- contentScriptOptimizer is available in window context
