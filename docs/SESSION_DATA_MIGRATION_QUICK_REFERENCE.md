# Session Data Migration Quick Reference

## Overview

Session data migration is part of the migration process from multi-window to single-window architecture. It verifies that session data directories are accessible and validates their integrity without moving any files.

## Key Concepts

### Session Data Directory
- Each account has a session data directory (e.g., `session-data/account-{accountId}`)
- Contains browser data: IndexedDB, Local Storage, Cookies, Cache, etc.
- Session files remain in place during migration (no file movement)

### Migration Process
1. **Verify Accessibility**: Check if session directory exists and is readable
2. **Validate Integrity**: Check if directory contains valid session data
3. **Update Paths**: Ensure configuration has correct session directory paths
4. **Report Status**: Generate warnings for missing or empty session data

## API Reference

### MigrationManager Methods

#### `verifySessionDataAccessible(sessionDir)`
Checks if a session data directory exists and is accessible.

**Parameters:**
- `sessionDir` (string): Session directory path (relative or absolute)

**Returns:**
```javascript
{
  accessible: boolean,  // Can the directory be accessed?
  exists: boolean,      // Does the directory exist?
  path: string,         // Absolute path to directory
  error?: string        // Error message if not accessible
}
```

**Example:**
```javascript
const result = await manager.verifySessionDataAccessible('session-data/account-acc-001');
if (result.accessible) {
  console.log(`Session data accessible at: ${result.path}`);
} else {
  console.log(`Session data not accessible: ${result.error}`);
}
```

#### `validateSessionDataIntegrity(sessionDir)`
Validates that a session directory contains actual session data.

**Parameters:**
- `sessionDir` (string): Session directory path

**Returns:**
```javascript
{
  valid: boolean,       // Is the session data valid?
  hasData: boolean,     // Does the directory contain data?
  details: {
    accessible: boolean,
    exists: boolean,
    path: string,
    foundPaths: string[]  // List of found session data paths
  },
  error?: string
}
```

**Checked Paths:**
- `IndexedDB` - Primary WhatsApp Web storage
- `Local Storage` - Browser local storage
- `Cookies` - Session cookies
- `Session Storage` - Session-specific storage
- `Cache` - Browser cache

**Example:**
```javascript
const result = await manager.validateSessionDataIntegrity('session-data/account-acc-001');
if (result.valid) {
  console.log(`Valid session data found: ${result.details.foundPaths.join(', ')}`);
} else {
  console.log('No valid session data found');
}
```

#### `migrateSessionData(migratedConfig)`
Migrates session data for all accounts in the configuration.

**Parameters:**
- `migratedConfig` (Object): Migrated configuration object with accounts

**Returns:**
```javascript
{
  success: boolean,     // Overall success status
  updated: number,      // Number of accounts processed
  errors: string[],     // List of errors
  warnings: string[]    // List of warnings
}
```

**Process:**
1. Iterates through all accounts
2. Verifies each account's session directory
3. Validates session data integrity
4. Updates session paths if needed
5. Generates warnings for missing/empty data

**Example:**
```javascript
const result = await manager.migrateSessionData(migratedConfig);
console.log(`Processed ${result.updated} accounts`);
console.log(`Warnings: ${result.warnings.length}`);
console.log(`Errors: ${result.errors.length}`);
```

## Common Scenarios

### Scenario 1: Account with Valid Session Data
```javascript
// Account has logged in before, session data exists
const result = await manager.validateSessionDataIntegrity('session-data/account-001');
// result.valid = true
// result.hasData = true
// result.details.foundPaths = ['IndexedDB', 'Local Storage', 'Cookies', 'Cache']
```

### Scenario 2: New Account (No Session Data)
```javascript
// Account created but never logged in
const result = await manager.verifySessionDataAccessible('session-data/account-002');
// result.accessible = false
// result.exists = false
// Warning: "Session data does not exist yet (new account or not logged in)"
```

### Scenario 3: Empty Session Directory
```javascript
// Directory exists but contains no data
const result = await manager.validateSessionDataIntegrity('session-data/account-003');
// result.valid = false
// result.hasData = false
// result.details.exists = true
// Warning: "Session directory exists but contains no data (not logged in yet)"
```

### Scenario 4: Partial Session Data
```javascript
// Some session data exists (e.g., only IndexedDB and Cookies)
const result = await manager.validateSessionDataIntegrity('session-data/account-004');
// result.valid = true
// result.hasData = true
// result.details.foundPaths = ['IndexedDB', 'Cookies']
```

## Integration with Full Migration

Session data migration is automatically included in the full migration process:

```javascript
const manager = new MigrationManager({
  userDataPath: app.getPath('userData'),
  configFileName: 'accounts.json'
});

const result = await manager.performFullMigration();
// Includes:
// 1. Configuration migration
// 2. Session data migration (verification)
// 3. Saving migrated configuration
```

## Error Handling

### Non-Fatal Warnings
These are logged but don't stop migration:
- Session directory doesn't exist (new account)
- Session directory is empty (not logged in)
- Partial session data found

### Fatal Errors
These stop migration:
- Session directory exists but not readable (permission issue)
- Configuration corruption
- File system errors

## Testing

Run session data migration tests:
```bash
node scripts/test-session-data-migration.js
```

**Test Coverage:**
- Session accessibility verification
- Session integrity validation
- Full migration with various session states
- Error handling and warnings

## Important Notes

1. **No File Movement**: Session data files are never moved during migration
2. **Path Preservation**: Session directory paths remain unchanged
3. **Graceful Handling**: Missing or empty session data generates warnings, not errors
4. **Validation Only**: Migration only validates accessibility and integrity
5. **User Data Safety**: Original session data is never modified or deleted

## Troubleshooting

### Issue: "Session data not accessible"
**Cause**: Directory exists but can't be read
**Solution**: Check file permissions on session directory

### Issue: "Session directory exists but contains no data"
**Cause**: Account created but never logged in
**Solution**: Normal behavior, user needs to scan QR code

### Issue: "Session data does not exist yet"
**Cause**: New account or session directory not created
**Solution**: Normal behavior, session will be created on first login

## Related Documentation

- [Migration Detection Quick Reference](./MIGRATION_DETECTION_QUICK_REFERENCE.md)
- [Configuration Migration Quick Reference](./CONFIGURATION_MIGRATION_QUICK_REFERENCE.md)
- [Session Persistence](./SESSION_PERSISTENCE.md)
- [Migration Guide](./MIGRATION_GUIDE.md)
