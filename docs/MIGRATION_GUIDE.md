# Migration Guide: Single Instance to Multi-Instance Architecture

## Overview

This guide explains the migration process from the old single-instance architecture to the new multi-instance architecture that supports multiple WhatsApp accounts.

## What Gets Migrated

The migration process handles the following:

1. **Session Data**: Your existing WhatsApp login session is preserved
2. **Translation Configuration**: All translation settings are migrated
3. **Account Configuration**: A default account is created with your existing settings

## Migration Process

### Automatic Migration

The application will automatically detect if migration is needed when you start it for the first time after upgrading. The migration happens transparently in the background.

**What happens:**
1. The app checks for the old `session-data` directory
2. If found, it copies the session data to `profiles/default`
3. It loads your translation settings from `enable-translation-config.json`
4. It creates a default account configuration
5. It marks the migration as completed

### Manual Migration

If you prefer to run the migration manually, you can use the migration script:

```bash
node scripts/migrate-to-multi-instance.js
```

This is useful if you want to:
- Verify the migration before starting the app
- Troubleshoot migration issues
- Re-run the migration after making changes

## Directory Structure

### Before Migration (Single Instance)

```
session-data/
  └── session/
      ├── Cookies
      ├── Local Storage/
      ├── IndexedDB/
      └── ...
```

### After Migration (Multi-Instance)

```
profiles/
  └── default/
      ├── Cookies
      ├── Local Storage/
      ├── IndexedDB/
      └── ...

accounts.json (account configurations)
.migration-completed (migration marker)
```

## Configuration Migration

### Translation Settings

Your existing translation configuration is automatically migrated:

**Old Format** (`enable-translation-config.json`):
```json
{
  "accounts": {
    "default": {
      "global": {
        "autoTranslate": true,
        "engine": "google",
        "targetLang": "zh-CN"
      },
      "inputBox": {
        "enabled": true
      }
    }
  }
}
```

**New Format** (in account configuration):
```json
{
  "id": "default",
  "name": "Default Account",
  "translation": {
    "enabled": true,
    "targetLanguage": "zh-CN",
    "engine": "google",
    "autoTranslate": true,
    "translateInput": true
  }
}
```

## Verification

After migration, verify that everything works:

1. **Check Session**: Start the app and verify you're still logged in
2. **Check Translation**: Verify translation settings are preserved
3. **Check Files**: Verify the new directory structure exists

### Check Migration Status

You can check the migration status programmatically:

```javascript
const { getMigrationStatus } = require('./src/managers/autoMigration');

const status = await getMigrationStatus(userDataPath);
console.log(status);
// {
//   completed: true,
//   migrationDate: "2024-01-01T00:00:00.000Z",
//   version: "1.0.0"
// }
```

## Troubleshooting

### Migration Fails

If migration fails, check:

1. **Permissions**: Ensure the app has write permissions to the user data directory
2. **Disk Space**: Ensure sufficient disk space for copying session data
3. **File Locks**: Close any other instances of the app

### Session Not Preserved

If your session is not preserved after migration:

1. Check if the old `session-data/session` directory existed
2. Verify the `profiles/default` directory was created
3. Check the migration logs for errors

### Translation Settings Not Migrated

If translation settings are not migrated:

1. Check if `enable-translation-config.json` exists
2. Verify the file is valid JSON
3. Check the migration logs for parsing errors

## Rollback

If you need to rollback to the old architecture:

1. Stop the application
2. Delete the `profiles` directory
3. Delete the `.migration-completed` marker file
4. Delete the `accounts.json` file
5. Your original `session-data` directory is preserved as a backup

## Data Safety

The migration process is designed to be safe:

- **Non-Destructive**: Original session data is copied, not moved
- **Idempotent**: Can be run multiple times safely
- **Atomic**: Either completes fully or fails without partial changes
- **Reversible**: Original data is preserved for rollback

## Integration with Application

### In main.js

To integrate automatic migration into your application:

```javascript
const { app } = require('electron');
const { autoMigrate } = require('./src/managers/autoMigration');

app.whenReady().then(async () => {
  // Run auto-migration
  const migrationResult = await autoMigrate({
    userDataPath: app.getPath('userData'),
    silent: false
  });

  if (migrationResult.migrated) {
    console.log('Migration completed:', migrationResult.message);
  }

  // Continue with app initialization...
});
```

## API Reference

### MigrationManager

```javascript
const MigrationManager = require('./src/managers/MigrationManager');

const manager = new MigrationManager({
  userDataPath: '/path/to/user/data',
  accountConfigManager: accountConfigManagerInstance
});

// Check if migration is needed
const needsMigration = await manager.needsMigration();

// Execute migration
const result = await manager.migrate();

// Get migration status
const status = await manager.getMigrationStatus();

// Reset migration (for testing)
await manager.resetMigration();
```

### autoMigrate Function

```javascript
const { autoMigrate } = require('./src/managers/autoMigration');

const result = await autoMigrate({
  userDataPath: '/path/to/user/data',
  silent: false // Set to true to suppress logs
});

// result: {
//   migrated: boolean,
//   message: string,
//   details?: Object,
//   error?: boolean
// }
```

## FAQ

### Q: Will I lose my WhatsApp login?
**A:** No, your session data is preserved during migration.

### Q: Can I use the old version after migration?
**A:** Yes, the old session data is preserved. However, any changes made in the new version won't be reflected in the old version.

### Q: What happens if migration is interrupted?
**A:** The migration is designed to be safe. If interrupted, you can simply run it again.

### Q: How long does migration take?
**A:** Usually less than a few seconds, depending on the size of your session data.

### Q: Can I migrate multiple times?
**A:** The migration only runs once. After completion, a marker file prevents re-running. You can manually reset this for testing.

### Q: What if I don't have old session data?
**A:** The migration will skip gracefully and you can start fresh with the new architecture.

## Support

If you encounter issues during migration:

1. Check the console logs for detailed error messages
2. Review this guide for troubleshooting steps
3. Report issues with migration logs attached

## Next Steps

After successful migration:

1. **Add More Accounts**: Use the account management UI to add additional WhatsApp accounts
2. **Configure Proxies**: Set up independent proxies for each account
3. **Customize Translation**: Configure translation settings per account
4. **Explore Features**: Try the new multi-instance features

For more information, see:
- [User Guide](./USER_GUIDE.md)
- [Developer Guide](./DEVELOPER_GUIDE.md)
- [API Documentation](./API.md)
