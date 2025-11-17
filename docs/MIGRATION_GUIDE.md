# Migration Guide: Multi-Window to Single-Window Architecture

## Table of Contents

1. [Overview](#overview)
2. [What's Changing](#whats-changing)
3. [Before You Migrate](#before-you-migrate)
4. [Automatic Migration Process](#automatic-migration-process)
5. [Manual Migration](#manual-migration)
6. [After Migration](#after-migration)
7. [Troubleshooting](#troubleshooting)
8. [Rollback Instructions](#rollback-instructions)

---

## Overview

This guide helps you migrate from the old multi-window version of WhatsApp Desktop to the new single-window architecture. The migration process is designed to be automatic and seamless, preserving all your accounts, login states, and settings.

### What Gets Migrated?

✅ **Preserved:**
- All account configurations
- Login states (you won't need to re-scan QR codes)
- Session data (chat history, media cache)
- Proxy settings
- Translation settings
- Account names and notes

❌ **Not Preserved:**
- Window positions and sizes (replaced by sidebar order)
- Individual window states
- Multi-window specific settings

---

## What's Changing

### Old Architecture (Multi-Window)

```
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Account1 │  │ Account2 │  │ Account3 │
│  Window  │  │  Window  │  │  Window  │
└──────────┘  └──────────┘  └──────────┘
```

- Each account in a separate window
- Windows can be positioned independently
- Each window has its own taskbar entry

### New Architecture (Single-Window)

```
┌─────────────────────────────────────┐
│  WhatsApp Desktop                   │
├──────────┬──────────────────────────┤
│ Account1 │                          │
│ Account2 │   Active Account View    │
│ Account3 │                          │
└──────────┴──────────────────────────┘
```

- All accounts in one window
- Sidebar for account management
- Quick switching between accounts
- Single taskbar entry

### Benefits of the New Architecture

1. **Less Window Clutter**: One window instead of many
2. **Faster Switching**: Instant account switching
3. **Better Organization**: Sidebar shows all accounts at once
4. **Improved Performance**: Optimized memory usage
5. **Unified Interface**: Consistent experience across accounts

---

## Before You Migrate

### System Requirements

Ensure your system meets the requirements:
- **Operating System**: Windows 10+, macOS 10.13+, or Linux
- **RAM**: 4GB minimum, 8GB recommended
- **Disk Space**: 500MB free space
- **Internet**: Active internet connection

### Backup Your Data

While migration is safe, we recommend backing up your data:

1. **Close the application** completely
2. **Locate your data directory**:
   - Windows: `%APPDATA%/whatsapp-desktop/`
   - macOS: `~/Library/Application Support/whatsapp-desktop/`
   - Linux: `~/.config/whatsapp-desktop/`
3. **Copy the entire directory** to a safe location
4. **Label the backup** with the date

### Check Your Accounts

Before migrating:
- ✅ Ensure all accounts are logged in
- ✅ Verify all accounts are working properly
- ✅ Note any custom settings you've configured
- ✅ Export account configurations (optional)

---

## Automatic Migration Process

### First Launch

When you first launch the new version:

1. **Detection Phase**
   ```
   ┌─────────────────────────────────────┐
   │  Detecting existing configuration   │
   │  Found 3 accounts to migrate        │
   │                                     │
   │  [Continue]  [Cancel]               │
   └─────────────────────────────────────┘
   ```
   - The application detects your old configuration
   - Shows how many accounts will be migrated
   - Click **Continue** to proceed

2. **Backup Phase**
   ```
   ┌─────────────────────────────────────┐
   │  Creating backup...                 │
   │  ████████████████░░░░░░░░░  75%     │
   │                                     │
   │  Backing up configuration files     │
   └─────────────────────────────────────┘
   ```
   - Creates a backup of your old configuration
   - Stored in `backup-{timestamp}` directory
   - Takes a few seconds

3. **Migration Phase**
   ```
   ┌─────────────────────────────────────┐
   │  Migrating accounts...              │
   │  ████████████████████████  100%     │
   │                                     │
   │  ✓ Personal (acc_001)               │
   │  ✓ Work (acc_002)                   │
   │  ✓ Business (acc_003)               │
   └─────────────────────────────────────┘
   ```
   - Converts each account to the new format
   - Preserves all settings and session data
   - Shows progress for each account

4. **Verification Phase**
   ```
   ┌─────────────────────────────────────┐
   │  Verifying migration...             │
   │                                     │
   │  ✓ All accounts migrated            │
   │  ✓ Session data verified            │
   │  ✓ Settings preserved               │
   │                                     │
   │  [Launch Application]               │
   └─────────────────────────────────────┘
   ```
   - Verifies all accounts were migrated successfully
   - Checks session data integrity
   - Click **Launch Application** to start

### What Happens During Migration

**Account Configuration:**
```javascript
// Old Format
{
  id: "acc_001",
  name: "Personal",
  window: { x: 100, y: 100, width: 1200, height: 800 },
  proxy: { ... },
  translation: { ... }
}

// New Format
{
  id: "acc_001",
  name: "Personal",
  order: 0,  // Position in sidebar (based on window position)
  proxy: { ... },
  translation: { ... }
}
```

**Session Data:**
- Session directories remain in the same location
- No files are moved or modified
- Only configuration references are updated

**Settings:**
- Proxy settings are preserved exactly
- Translation settings are preserved exactly
- Account names and notes are preserved

---

## Manual Migration

If automatic migration fails or you prefer manual control:

### Step 1: Export Old Configuration

1. Launch the old version
2. Go to **Settings** → **Export Configuration**
3. Save the file as `accounts-backup.json`
4. Close the old version

### Step 2: Install New Version

1. Download the new version
2. Install it (may replace the old version)
3. Don't launch it yet

### Step 3: Prepare Migration

1. Locate your data directory
2. Find the old configuration file: `accounts.json`
3. Rename it to `accounts-old.json`
4. Copy your session data directories

### Step 4: Launch and Import

1. Launch the new version
2. Click **"Skip Migration"** if prompted
3. Go to **Settings** → **Import Configuration**
4. Select your `accounts-backup.json` file
5. Review the imported accounts
6. Click **"Import"**

### Step 5: Verify Accounts

1. Check that all accounts appear in the sidebar
2. Click each account to verify it loads
3. Check that you're still logged in
4. Verify proxy and translation settings

---

## After Migration

### First Steps

1. **Review Your Accounts**
   - Check that all accounts are present
   - Verify account names are correct
   - Ensure status indicators show online

2. **Test Each Account**
   - Click each account in the sidebar
   - Verify WhatsApp Web loads
   - Check that you're logged in
   - Send a test message

3. **Verify Settings**
   - Check proxy settings for each account
   - Verify translation settings
   - Test proxy connections
   - Test translation functionality

4. **Customize Layout**
   - Reorder accounts by dragging
   - Resize the sidebar to your preference
   - Set up keyboard shortcuts

### Cleanup Old Data

After confirming everything works:

1. **Old Configuration Backup**
   - Located in `backup-{timestamp}` directory
   - Can be deleted after 30 days
   - Keep if you want to rollback

2. **Old Application**
   - Uninstall the old version if separate
   - Remove old shortcuts
   - Clean up old logs

### New Features to Explore

1. **Quick Switching**
   - Use `Ctrl+1` through `Ctrl+9` for quick access
   - Try `Ctrl+Tab` to cycle through accounts

2. **Sidebar Customization**
   - Drag accounts to reorder
   - Resize sidebar width
   - Hover for account notes

3. **Enhanced Status**
   - Real-time status indicators
   - Connection monitoring
   - Error notifications

---

## Troubleshooting

### Migration Failed

**Symptoms**: Migration process shows errors

**Solutions**:
1. Check that the old configuration file exists
2. Verify you have write permissions
3. Ensure no other instance is running
4. Try manual migration instead
5. Restore from backup and try again

### Accounts Missing After Migration

**Symptoms**: Some accounts don't appear in sidebar

**Solutions**:
1. Check the migration log for errors
2. Verify the old configuration file
3. Try importing the backup manually
4. Re-add missing accounts manually
5. Contact support with log files

### Can't Log In After Migration

**Symptoms**: Accounts show QR code instead of logged-in state

**Solutions**:
1. Check that session data directories exist
2. Verify session data wasn't corrupted
3. Check file permissions on session directories
4. Try clearing and re-logging in
5. Restore session data from backup

### Proxy Settings Not Working

**Symptoms**: Proxy doesn't work after migration

**Solutions**:
1. Verify proxy settings were migrated
2. Re-enter proxy credentials
3. Test proxy connection
4. Check proxy server is running
5. Try disabling and re-enabling proxy

### Translation Not Working

**Symptoms**: Translation doesn't work after migration

**Solutions**:
1. Check translation settings were migrated
2. Verify API keys are present
3. Re-enter API keys if needed
4. Test with a different engine
5. Clear translation cache

### Performance Issues

**Symptoms**: Application is slow after migration

**Solutions**:
1. Restart the application
2. Clear browser cache for all accounts
3. Reduce number of active accounts
4. Check system resources
5. Update to latest version

### Window Size Issues

**Symptoms**: Window is too small or too large

**Solutions**:
1. Resize the window manually
2. Reset window size in settings
3. Delete window state file
4. Restart the application
5. Check display scaling settings

---

## Rollback Instructions

If you need to revert to the old version:

### Option 1: Restore from Backup

1. **Close the new version** completely
2. **Locate the backup directory**:
   - Look for `backup-{timestamp}` in your data directory
3. **Restore configuration**:
   - Copy `accounts-old.json` to `accounts.json`
4. **Restore session data** (if needed):
   - Session data should still be intact
5. **Install old version**:
   - Download and install the previous version
6. **Launch and verify**:
   - Check that all accounts work

### Option 2: Manual Rollback

1. **Export current configuration** (to save any changes)
2. **Uninstall new version**
3. **Install old version**
4. **Import old configuration**
5. **Verify accounts work**

### After Rollback

- Your session data remains intact
- You won't lose any messages or media
- You can try migrating again later
- Report issues to help improve migration

---

## Migration Checklist

Use this checklist to ensure a smooth migration:

### Before Migration

- [ ] Backup your data directory
- [ ] Export account configurations
- [ ] Note any custom settings
- [ ] Ensure all accounts are logged in
- [ ] Close all instances of the old version
- [ ] Check system requirements

### During Migration

- [ ] Read migration prompts carefully
- [ ] Don't interrupt the migration process
- [ ] Wait for verification to complete
- [ ] Note any error messages
- [ ] Take screenshots if issues occur

### After Migration

- [ ] Verify all accounts are present
- [ ] Test each account loads correctly
- [ ] Check you're still logged in
- [ ] Verify proxy settings
- [ ] Test translation functionality
- [ ] Customize sidebar layout
- [ ] Set up keyboard shortcuts
- [ ] Clean up old data (after 30 days)

---

## Getting Help

If you encounter issues during migration:

### Support Resources

1. **Documentation**: Review the [User Guide](SINGLE_WINDOW_USER_GUIDE.md)
2. **FAQ**: Check the [FAQ](FAQ.md) for common issues
3. **Community**: Ask in the [community forum](https://community.example.com)
4. **Support**: Contact support with migration logs

### Providing Information

When seeking help, include:
- Migration log file (in data directory)
- Error messages or screenshots
- Number of accounts being migrated
- Operating system and version
- Old and new application versions

### Migration Logs

Logs are stored in:
- Windows: `%APPDATA%/whatsapp-desktop/logs/migration.log`
- macOS: `~/Library/Application Support/whatsapp-desktop/logs/migration.log`
- Linux: `~/.config/whatsapp-desktop/logs/migration.log`

---

## Frequently Asked Questions

### Will I lose my chat history?

No, your chat history is stored by WhatsApp on their servers and on your phone. The migration only affects the desktop application configuration.

### Do I need to re-scan QR codes?

No, your login states are preserved. You should remain logged in after migration.

### Can I use both versions simultaneously?

No, it's recommended to use only one version at a time to avoid conflicts.

### How long does migration take?

Typically 1-2 minutes for most users. Time depends on the number of accounts and system performance.

### Can I migrate back to the old version?

Yes, you can rollback using the backup created during migration. See [Rollback Instructions](#rollback-instructions).

### What if migration fails?

You can try manual migration or restore from backup. Your data is safe and not modified during migration.

### Will my proxy settings be preserved?

Yes, all proxy settings are migrated exactly as configured in the old version.

### Will my translation settings be preserved?

Yes, all translation settings including API keys are migrated.

---

## Conclusion

The migration from multi-window to single-window architecture is designed to be seamless and automatic. Most users will experience a smooth transition with all their accounts, settings, and login states preserved.

If you encounter any issues, refer to the troubleshooting section or contact support. We're here to help ensure your migration is successful!

**Welcome to the new WhatsApp Desktop!** 🎉
