# Configuration Migration Quick Reference

## Overview

The Configuration Migration system transforms old multi-window account configurations to the new single-window format. It preserves all account settings while removing window-specific data and adding the new `order` field for sidebar positioning.

## Key Changes

### Old Format (Multi-Window)
```javascript
{
  id: 'acc-001',
  name: 'Personal WhatsApp',
  window: {           // ← Removed in new format
    x: 100,
    y: 100,
    width: 1200,
    height: 800
  },
  proxy: { ... },
  translation: { ... },
  sessionDir: 'session-data/account-acc-001'
}
```

### New Format (Single-Window)
```javascript
{
  id: 'acc-001',
  name: 'Personal WhatsApp',
  order: 0,           // ← New field for sidebar position
  proxy: { ... },     // ← Preserved
  translation: { ... }, // ← Preserved
  sessionDir: 'session-data/account-acc-001' // ← Preserved
}
```

## Migration Process

### 1. Detection
```javascript
const manager = new MigrationManager();
const detection = await manager.detectMigrationNeeded();

if (detection.needed) {
  console.log('Migration required:', detection.reason);
}
```

### 2. Backup
```javascript
const backupResult = await manager.createBackup();
// Creates: migration-backups/accounts.json.backup-{timestamp}
```

### 3. Migration
```javascript
const oldConfig = await manager.readOldConfig();
const migrationResult = await manager.migrateConfiguration(oldConfig.data);
```

### 4. Save
```javascript
await manager.saveMigratedConfig(migrationResult.migratedConfig);
```

### Full Migration (All Steps)
```javascript
const result = await manager.performFullMigration();
```

## What Gets Migrated

### ✅ Preserved Fields
- `id` - Account identifier
- `name` - Account name
- `note` - Account notes
- `sessionDir` - Session data directory path
- `proxy` - Complete proxy configuration
  - `enabled`, `protocol`, `host`, `port`
  - `username`, `password`, `bypass`
- `translation` - Complete translation configuration
  - `enabled`, `targetLanguage`, `engine`
  - `apiKey`, `autoTranslate`, `translateInput`
  - `friendSettings` - Per-contact settings
- `notifications` - Notification settings
- `createdAt` - Creation timestamp
- `lastActiveAt` - Last active timestamp
- `autoStart` - Auto-start preference

### ❌ Removed Fields
- `window` - Window position and size
  - `x`, `y`, `width`, `height`
  - `minimized`, `maximized`

### ➕ Added Fields
- `order` - Sidebar display order (0, 1, 2, ...)
  - Determined by window position (Y then X)
  - Sequential numbering starting from 0

## Order Field Calculation

Accounts are sorted by window position to determine sidebar order:

1. **Primary Sort**: Y coordinate (top to bottom)
2. **Secondary Sort**: X coordinate (left to right)

Example:
```
Window at (100, 100)   → order: 0
Window at (1320, 100)  → order: 1
Window at (100, 920)   → order: 2
```

## Validation

Each migrated account is validated for:

### Required Fields
- `id` (string, non-empty)
- `name` (string, non-empty)
- `order` (number, >= 0)
- `sessionDir` (string, non-empty)

### Proxy Configuration (if enabled)
- `protocol` (socks5, http, or https)
- `host` (string, non-empty)
- `port` (number, 1-65535)

### Translation Configuration (if enabled)
- `engine` (google, gpt4, gemini, or deepseek)
- `targetLanguage` (string, non-empty)

## Backup Files Created

### 1. Configuration Backup
```
migration-backups/accounts.json.backup-{timestamp}
```
Complete copy of original configuration file.

### 2. Window State Backup
```
migration-backups/window-states.backup-{timestamp}.json
```
Extracted window positions for reference:
```json
{
  "acc-001": {
    "name": "Personal WhatsApp",
    "window": { "x": 100, "y": 100, "width": 1200, "height": 800 }
  }
}
```

### 3. Migration Start Log
```
migration-backups/migration-log-{timestamp}.txt
```
Detailed log of migration start with account details.

### 4. Migration Complete Log
```
migration-backups/migration-complete-{timestamp}.txt
```
Summary of migration results.

## Error Handling

### Migration Errors
- Invalid configuration format
- Missing required fields
- Validation failures
- File I/O errors

### Recovery
All errors are logged and the original configuration is preserved in backups.

```javascript
const result = await manager.performFullMigration();

if (!result.success) {
  console.error('Migration failed:', result.errors);
  // Original config is backed up and unchanged
}
```

## Testing

Run the migration test suite:
```bash
node scripts/test-configuration-migration.js
```

Tests verify:
- ✓ Migration detection
- ✓ Configuration backup
- ✓ Configuration migration
- ✓ Field preservation
- ✓ Window config removal
- ✓ Order field generation
- ✓ Full migration process

## API Reference

### MigrationManager

#### Constructor
```javascript
new MigrationManager({
  userDataPath: string,    // User data directory
  configFileName: string,  // Config file name (default: 'accounts.json')
  backupDir: string       // Backup directory name (default: 'migration-backups')
})
```

#### Methods

##### detectMigrationNeeded()
```javascript
await manager.detectMigrationNeeded()
// Returns: { needed: boolean, reason: string, configPath?: string }
```

##### createBackup()
```javascript
await manager.createBackup()
// Returns: { success: boolean, backupPath?: string, error?: string }
```

##### readOldConfig()
```javascript
await manager.readOldConfig()
// Returns: { success: boolean, data?: Object, error?: string }
```

##### migrateConfiguration(oldConfig)
```javascript
await manager.migrateConfiguration(oldConfig)
// Returns: {
//   success: boolean,
//   migratedConfig?: Object,
//   errors?: string[],
//   warnings?: string[]
// }
```

##### saveMigratedConfig(migratedConfig, targetPath?)
```javascript
await manager.saveMigratedConfig(migratedConfig, targetPath)
// Returns: { success: boolean, configPath?: string, error?: string }
```

##### performFullMigration()
```javascript
await manager.performFullMigration()
// Returns: {
//   success: boolean,
//   migratedConfig?: Object,
//   backupPath?: string,
//   errors?: string[],
//   warnings?: string[]
// }
```

## Integration Example

```javascript
const MigrationManager = require('./src/single-window/migration/MigrationManager');

async function initializeApp() {
  const migrationManager = new MigrationManager();
  
  // Check if migration is needed
  const detection = await migrationManager.detectMigrationNeeded();
  
  if (detection.needed) {
    console.log('Migrating configuration...');
    
    // Perform full migration
    const result = await migrationManager.performFullMigration();
    
    if (result.success) {
      console.log('Migration completed successfully');
      console.log(`Backup saved to: ${result.backupPath}`);
    } else {
      console.error('Migration failed:', result.errors);
      // Handle migration failure
    }
  }
  
  // Continue with app initialization
  // Load accounts using AccountConfigManager
}
```

## Notes

- Migration is **non-destructive** - original config is always backed up
- Session data directories are **not moved** - only paths are preserved
- Window positions are **logged** but not migrated
- Migration can be **run multiple times** safely (idempotent)
- Accounts are automatically **sorted by position** for sidebar order

## Related Files

- `src/single-window/migration/MigrationManager.js` - Migration implementation
- `scripts/test-configuration-migration.js` - Test suite
- `docs/MIGRATION_DETECTION_QUICK_REFERENCE.md` - Detection documentation
