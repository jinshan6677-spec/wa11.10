# Per-Account Translation Configuration - Quick Reference

## Quick Start

### Initialize ViewManager with Translation Support

```javascript
const translationIntegration = new TranslationIntegration();
await translationIntegration.initialize();

const viewManager = new ViewManager(mainWindow, sessionManager, {
  translationIntegration
});
```

### Create Account with Translation Config

```javascript
await accountManager.createAccount({
  name: 'My Account',
  translation: {
    enabled: true,
    targetLanguage: 'zh-CN',
    engine: 'google',
    autoTranslate: true,
    translateInput: true,
    friendSettings: {}
  }
});
```

### Update Translation Config

```javascript
// Update in AccountManager (persists to disk)
await accountManager.updateAccount(accountId, {
  translation: {
    targetLanguage: 'es',
    engine: 'gpt4',
    apiKey: 'your-key'
  }
});

// If view exists, config is automatically applied
```

### Get Translation Config

```javascript
// From ViewManager (active views only)
const config = viewManager.getTranslationConfig(accountId);

// From AccountManager (all accounts)
const account = await accountManager.getAccount(accountId);
const config = account.translation;
```

## Translation Config Schema

```javascript
{
  enabled: boolean,              // Enable/disable translation
  targetLanguage: string,        // 'zh-CN', 'en', 'es', 'fr', etc.
  engine: string,                // 'google', 'gpt4', 'gemini', 'deepseek'
  apiKey: string,                // Required for gpt4, gemini, deepseek
  autoTranslate: boolean,        // Auto-translate incoming messages
  translateInput: boolean,       // Enable input box translation
  friendSettings: Object         // Per-contact settings
}
```

## Common Use Cases

### Different Languages Per Account

```javascript
// Account 1: Chinese
await accountManager.createAccount({
  name: 'Chinese Account',
  translation: { enabled: true, targetLanguage: 'zh-CN', engine: 'google' }
});

// Account 2: Spanish  
await accountManager.createAccount({
  name: 'Spanish Account',
  translation: { enabled: true, targetLanguage: 'es', engine: 'google' }
});
```

### Different Engines Per Account

```javascript
// Account 1: Google Translate (free)
await accountManager.createAccount({
  name: 'Free Account',
  translation: { enabled: true, engine: 'google' }
});

// Account 2: GPT-4 (paid, higher quality)
await accountManager.createAccount({
  name: 'Premium Account',
  translation: { 
    enabled: true, 
    engine: 'gpt4',
    apiKey: 'sk-...'
  }
});
```

### Disable Translation for Specific Account

```javascript
await accountManager.updateAccount(accountId, {
  translation: { enabled: false }
});
```

## API Quick Reference

### ViewManager

| Method | Description |
|--------|-------------|
| `updateTranslationConfig(accountId, config)` | Update translation config for account |
| `getTranslationConfig(accountId)` | Get translation config for account |
| `isTranslationEnabled(accountId)` | Check if translation is enabled |

### AccountConfigManager

| Method | Description |
|--------|-------------|
| `createAccount(config)` | Create account with translation config |
| `updateAccount(accountId, updates)` | Update account including translation |
| `getAccount(accountId)` | Get account with translation config |

### TranslationIntegration

| Method | Description |
|--------|-------------|
| `injectScripts(accountId, view, config)` | Inject translation scripts into view |
| `configureTranslation(accountId, config, view)` | Update translation config for view |
| `getTranslationConfig(accountId)` | Get stored translation config |

## Events

### Renderer Events

```javascript
// Translation config updated
window.api.on('view-manager:translation-config-updated', (data) => {
  console.log('Config updated for account:', data.accountId);
  console.log('New config:', data.config);
});
```

## Troubleshooting

### Translation Not Working

1. Check if translation is enabled:
   ```javascript
   const enabled = viewManager.isTranslationEnabled(accountId);
   ```

2. Verify TranslationIntegration is initialized:
   ```javascript
   if (!viewManager.translationIntegration) {
     console.error('TranslationIntegration not available');
   }
   ```

3. Check if scripts are injected:
   ```javascript
   const status = translationIntegration.getTranslationStatus(accountId);
   console.log('Injected:', status.injected);
   ```

### Config Not Updating

1. Ensure view exists:
   ```javascript
   if (!viewManager.hasView(accountId)) {
     console.error('View does not exist');
   }
   ```

2. Check update result:
   ```javascript
   const result = await viewManager.updateTranslationConfig(accountId, config);
   if (!result.success) {
     console.error('Update failed:', result.error);
   }
   ```

### Different Accounts Sharing Config

This should not happen - each account has isolated config. If it does:

1. Verify account IDs are different
2. Check session isolation
3. Review TranslationIntegration config storage

## Best Practices

1. **Initialize TranslationIntegration Early**: Initialize before creating ViewManager
2. **Pass Config on View Creation**: Always include translation config when creating views
3. **Update Through AccountManager**: Use AccountManager.updateAccount() for persistence
4. **Check Success Status**: Always check result.success when updating configs
5. **Handle Errors Gracefully**: Provide fallback behavior if translation fails

## Performance Tips

1. **Lazy Loading**: Views are created only when needed
2. **Config Caching**: Translation configs are cached in memory
3. **Script Caching**: Translation scripts are loaded once and reused
4. **Debounced Updates**: Frequent config updates are debounced

## Security Considerations

1. **API Key Storage**: API keys are stored in encrypted electron-store
2. **Session Isolation**: Each account has isolated session and translation cache
3. **Config Validation**: Translation configs are validated before saving
4. **Secure Transmission**: API keys are not logged or exposed to renderer

## Related Documentation

- [Task 17 Implementation Summary](./TASK_17_IMPLEMENTATION_SUMMARY.md)
- [Translation BrowserView Integration](./TRANSLATION_BROWSERVIEW_INTEGRATION.md)
- [Translation Integration Quick Reference](./TRANSLATION_INTEGRATION_QUICK_REFERENCE.md)
- [Task 16 Implementation Summary](./TASK_16_IMPLEMENTATION_SUMMARY.md)
