# Migration Detection and Backup - Quick Reference

## Overview

The MigrationManager handles detection and backup of old multi-window configuration before migrating to the new single-window architecture.

## Key Components

### MigrationManager

Location: `src/single-window/migration/MigrationManager.js`

Responsible for:
- Detecting old multi-window configuration format
- Creating backups of configuration files
- Creating backups of window state data
- Logging migration process details

## Usage

### Basic Usage

```javascript
const MigrationManager = require('./src/single-window/migration/MigrationManager');

// Create migration manager
const migrationManager = new MigrationManager({
  userDataPath: app.getPath('userData'),
  configFileName: 'accounts.json',
  backupDir: 'migration-backups'
});

// Detect and backup in one call
const result = await migrationManager.detectAndBackup();

if (result.needed && result.success) {
  console.log('Migration backup created:', result.backupPath);
  console.log('Old config:', result.oldConfig);
  
  // Proceed with migration...
} else if (!result.needed) {
  console.log('No migration needed');
} else {
  console.error('Migration backup failed:', result.errors);
}
```

### Step-by-Step Usage

```javascript
// 1. Check if migration is needed
const detection = await migrationManager.detectMigrationNeeded();

if (detection.needed) {
  // 2. Read old configuration
  const configResult = await migrationManager.readOldConfig();
  
  // 3. Create configuration backup
  const backupResult = await migrationManager.createBackup();
  
  // 4. Create window state backup
  const windowBackup = await migrationManager.createWindowStateBackup(configResult.data);
  
  // 5. Log migration start
  const logResult = await migrationManager.logMigrationStart(configResult.data);
}
```

## API Reference

### detectMigrationNeeded()

Checks if migration is needed by detecting old configuration format.

**Returns:**
```javascript
{
  needed: boolean,
  configPath?: string,
  reason?: string
}
```

**Detection Logic:**
- Checks if `accounts.json` exists
- Reads configuration file
- Looks for `window` property in any account (indicates old format)

### createBackup()

Creates a timestamped backup of the configuration file.

**Returns:**
```javascript
{
  success: boolean,
  backupPath?: string,
  error?: string
}
```

**Backup Location:**
`{userDataPath}/migration-backups/accounts.json.backup-{timestamp}`

### createWindowStateBackup(configData)

Creates a backup of all window state information.

**Parameters:**
- `configData` - The old configuration data

**Returns:**
```javascript
{
  success: boolean,
  backupPath?: string,
  error?: string
}
```

**Backup Format:**
```json
{
  "acc-001": {
    "name": "Account Name",
    "window": {
      "x": 100,
      "y": 100,
      "width": 1200,
      "height": 800,
      "minimized": false
    }
  }
}
```

### logMigrationStart(configData)

Creates a detailed migration log file.

**Parameters:**
- `configData` - The old configuration data

**Returns:**
```javascript
{
  success: boolean,
  logPath?: string,
  error?: string
}
```

**Log Contents:**
- Migration start time
- User data path
- Configuration summary
- Account details (name, proxy, translation, window state)

### detectAndBackup()

Executes the complete detection and backup flow.

**Returns:**
```javascript
{
  needed: boolean,
  success: boolean,
  backupPath?: string,
  oldConfig?: Object,
  errors: string[],
  warnings: string[]
}
```

**Process:**
1. Detect if migration is needed
2. Read old configuration
3. Create configuration backup
4. Create window state backup
5. Log migration start

### listBackups()

Lists all backup files in the backup directory.

**Returns:**
```javascript
{
  success: boolean,
  backups?: Array<{
    name: string,
    path: string,
    size: number,
    created: Date,
    modified: Date
  }>,
  error?: string
}
```

### restoreBackup(backupPath)

Restores a configuration from a backup file.

**Parameters:**
- `backupPath` - Path to the backup file

**Returns:**
```javascript
{
  success: boolean,
  error?: string
}
```

## Configuration Format Detection

### Old Format (Multi-Window)

```json
{
  "version": "1.0.0",
  "accounts": {
    "acc-001": {
      "id": "acc-001",
      "name": "Account Name",
      "window": {
        "x": 100,
        "y": 100,
        "width": 1200,
        "height": 800
      },
      "proxy": { ... },
      "translation": { ... }
    }
  }
}
```

**Key Indicator:** Presence of `window` property in account objects

### New Format (Single-Window)

```json
{
  "version": "2.0.0",
  "accounts": {
    "acc-001": {
      "id": "acc-001",
      "name": "Account Name",
      "order": 0,
      "proxy": { ... },
      "translation": { ... }
    }
  }
}
```

**Key Indicator:** Presence of `order` property, absence of `window` property

## Backup Directory Structure

```
{userDataPath}/
├── accounts.json (current config)
└── migration-backups/
    ├── accounts.json.backup-2025-11-16T21-28-18-617Z
    ├── window-states.backup-2025-11-16T21-28-18-644Z.json
    └── migration-log-2025-11-16T21-28-18-695Z.txt
```

## Error Handling

### Common Errors

1. **Configuration file not found**
   - Not an error if this is a fresh install
   - Migration not needed

2. **Configuration file corrupted**
   - Cannot parse JSON
   - Migration detection fails gracefully

3. **Backup directory creation failed**
   - Check file system permissions
   - Check disk space

4. **Backup file write failed**
   - Check file system permissions
   - Check disk space

### Error Response Format

```javascript
{
  success: false,
  error: "Error message",
  errors: ["Error 1", "Error 2"],
  warnings: ["Warning 1"]
}
```

## Testing

Run the test script:

```bash
node scripts/test-migration-detection.js
```

**Test Coverage:**
- Detection with old config format
- Detection with new config format
- Backup creation
- Window state backup
- Migration log creation
- Complete detection and backup flow

## Integration Example

```javascript
const { app } = require('electron');
const MigrationManager = require('./src/single-window/migration/MigrationManager');

app.on('ready', async () => {
  // Create migration manager
  const migrationManager = new MigrationManager();
  
  // Check if migration is needed
  const result = await migrationManager.detectAndBackup();
  
  if (result.needed) {
    if (result.success) {
      console.log('Migration backup completed successfully');
      console.log('Backup location:', result.backupPath);
      
      // Show migration dialog to user
      // Proceed with migration (Task 22)
      
    } else {
      console.error('Migration backup failed:', result.errors);
      // Show error to user
      // Abort migration
    }
  } else {
    console.log('No migration needed, starting normally');
    // Start application normally
  }
});
```

## Best Practices

1. **Always create backups before migration**
   - Use `detectAndBackup()` for complete backup
   - Verify backup was created successfully

2. **Check for errors and warnings**
   - Errors indicate critical failures
   - Warnings indicate non-critical issues

3. **Preserve old configuration**
   - Don't delete old config until migration is verified
   - Keep backups for rollback capability

4. **Log migration details**
   - Use migration log for debugging
   - Include in bug reports if migration fails

5. **Test migration detection**
   - Run test script before deployment
   - Verify detection works with real configurations

## Next Steps

After successful detection and backup:
1. Task 22: Implement configuration migration
2. Task 23: Implement session data migration
3. Task 24: Create migration UI and progress feedback

## Related Files

- `src/single-window/migration/MigrationManager.js` - Main implementation
- `scripts/test-migration-detection.js` - Test script
- `src/managers/AccountConfigManager.js` - Account configuration management
- `src/models/AccountConfig.js` - Account data model
