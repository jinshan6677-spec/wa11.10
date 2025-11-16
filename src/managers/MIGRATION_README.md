# Migration Manager

## Overview

The Migration Manager handles the transition from single-instance architecture to multi-instance architecture. It automatically detects old session data and migrates it to the new structure while preserving all user settings.

## Quick Start

### Automatic Migration (Recommended)

Add this to your `main.js`:

```javascript
const { app } = require('electron');
const { autoMigrate } = require('./managers/autoMigration');

app.whenReady().then(async () => {
  // Auto-migrate on startup
  await autoMigrate({
    userDataPath: app.getPath('userData'),
    silent: false
  });

  // Continue with app initialization...
});
```

### Manual Migration

Run the migration script:

```bash
npm run migrate
```

Or programmatically:

```javascript
const MigrationManager = require('./managers/MigrationManager');
const AccountConfigManager = require('./managers/AccountConfigManager');

const accountConfigManager = new AccountConfigManager({
  cwd: userDataPath
});

const migrationManager = new MigrationManager({
  userDataPath,
  accountConfigManager
});

const result = await migrationManager.migrate();
console.log(result);
```

## What Gets Migrated

1. **Session Data**: `session-data/session/` → `profiles/default/`
2. **Translation Config**: `enable-translation-config.json` → account configuration
3. **Account Config**: Creates default account with migrated settings

## API Reference

### MigrationManager

#### Constructor

```javascript
new MigrationManager(options)
```

**Parameters:**
- `options.userDataPath` (string): Path to user data directory
- `options.accountConfigManager` (AccountConfigManager): Account config manager instance

#### Methods

##### needsMigration()

Check if migration is needed.

```javascript
const needsMigration = await migrationManager.needsMigration();
// Returns: boolean
```

##### migrate()

Execute the migration process.

```javascript
const result = await migrationManager.migrate();
// Returns: {
//   success: boolean,
//   message: string,
//   details?: {
//     steps: string[],
//     oldSessionPath: string,
//     newProfilePath: string
//   }
// }
```

##### getMigrationStatus()

Get current migration status.

```javascript
const status = await migrationManager.getMigrationStatus();
// Returns: {
//   completed: boolean,
//   needsMigration: boolean,
//   migrationDate?: string,
//   version?: string
// }
```

##### resetMigration()

Reset migration status (for testing).

```javascript
await migrationManager.resetMigration();
```

### autoMigrate Function

Simplified auto-migration function.

```javascript
const { autoMigrate } = require('./managers/autoMigration');

const result = await autoMigrate({
  userDataPath: '/path/to/user/data',
  silent: false
});

// Returns: {
//   migrated: boolean,
//   message: string,
//   details?: Object,
//   error?: boolean
// }
```

## Migration Process

1. **Check Status**: Verify if migration is needed
2. **Create Directories**: Create `profiles/` directory structure
3. **Copy Session Data**: Copy session files to `profiles/default/`
4. **Load Translation Config**: Read existing translation settings
5. **Create Account**: Create default account with migrated settings
6. **Mark Complete**: Create `.migration-completed` marker file

## Directory Structure

### Before Migration

```
userData/
├── session-data/
│   └── session/
│       ├── Cookies
│       ├── Local Storage/
│       └── IndexedDB/
└── enable-translation-config.json
```

### After Migration

```
userData/
├── session-data/          (preserved as backup)
│   └── session/
├── profiles/
│   └── default/
│       ├── Cookies
│       ├── Local Storage/
│       └── IndexedDB/
├── accounts.json          (new)
├── .migration-completed   (new)
└── enable-translation-config.json
```

## Error Handling

The migration process is designed to be safe:

- **Non-destructive**: Original data is copied, not moved
- **Idempotent**: Can be run multiple times safely
- **Atomic**: Either completes fully or fails cleanly
- **Reversible**: Original data preserved for rollback

### Common Errors

#### Permission Denied

```javascript
// Error: EACCES: permission denied
```

**Solution**: Ensure app has write permissions to user data directory.

#### Disk Space

```javascript
// Error: ENOSPC: no space left on device
```

**Solution**: Free up disk space before migration.

#### Invalid JSON

```javascript
// Error: Unexpected token in JSON
```

**Solution**: Check translation config file is valid JSON.

## Testing

Run the migration tests:

```bash
npm test -- --testPathPattern=MigrationManager
```

### Test Coverage

- ✓ Detection of migration need
- ✓ Session data copying
- ✓ Translation config loading
- ✓ Account creation
- ✓ Migration marker creation
- ✓ Idempotency
- ✓ Error handling

## Integration Examples

See `src/examples/migration-integration-example.js` for complete examples:

1. Basic integration
2. Migration with progress UI
3. Manual migration trigger
4. Error handling
5. Silent migration

## Troubleshooting

### Migration Not Running

Check:
1. Is `.migration-completed` marker present?
2. Does `session-data/session/` exist?
3. Does `profiles/` already exist?

### Session Not Preserved

Check:
1. Was `session-data/session/` directory present?
2. Were files successfully copied to `profiles/default/`?
3. Check migration logs for errors

### Translation Settings Lost

Check:
1. Does `enable-translation-config.json` exist?
2. Is the file valid JSON?
3. Check migration logs for parsing errors

## Best Practices

1. **Run Early**: Execute migration before any other initialization
2. **Handle Errors**: Always check migration result and handle errors
3. **Log Everything**: Keep detailed logs for debugging
4. **Test Thoroughly**: Test migration with various data states
5. **Backup First**: Consider backing up user data before migration

## Migration Checklist

- [ ] Add auto-migration to app startup
- [ ] Test with existing session data
- [ ] Test with no session data
- [ ] Test with translation config
- [ ] Test error scenarios
- [ ] Update user documentation
- [ ] Add migration notification (optional)
- [ ] Test rollback procedure

## Support

For issues or questions:

1. Check migration logs
2. Review this documentation
3. Check `docs/MIGRATION_GUIDE.md`
4. Report issues with logs attached

## Related Files

- `src/managers/MigrationManager.js` - Core migration logic
- `src/managers/autoMigration.js` - Auto-migration helper
- `scripts/migrate-to-multi-instance.js` - CLI migration script
- `src/examples/migration-integration-example.js` - Integration examples
- `docs/MIGRATION_GUIDE.md` - User-facing migration guide
- `src/managers/__tests__/MigrationManager.test.js` - Unit tests
