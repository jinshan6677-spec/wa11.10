# Account Management Quick Reference

## Quick Actions

### Add Account
```
Click [+ Add Account] → Enter name → Save → Scan QR code
```

### Switch Account
```
Click account in sidebar
OR
Ctrl+1 to Ctrl+9 (for accounts 1-9)
OR
Ctrl+Tab (cycle forward)
```

### Edit Account
```
Click ⚙️ next to account → Modify settings → Save
```

### Delete Account
```
Click 🗑️ next to account → Confirm → Choose data retention
```

### Reorder Accounts
```
Click and drag account → Drop in new position
```

---

## Account Configuration

### Basic Settings

| Field | Description | Required |
|-------|-------------|----------|
| Name | Display name for the account | Yes |
| Note | Additional information (visible on hover) | No |
| Auto-start | Launch this account on app startup | No |

### Proxy Settings

| Field | Description | Example |
|-------|-------------|---------|
| Protocol | HTTP, HTTPS, or SOCKS5 | SOCKS5 |
| Host | Proxy server address | 127.0.0.1 |
| Port | Proxy server port | 1080 |
| Username | Authentication username (optional) | user123 |
| Password | Authentication password (optional) | pass456 |

**Quick Setup:**
```javascript
{
  enabled: true,
  protocol: "socks5",
  host: "127.0.0.1",
  port: 1080
}
```

### Translation Settings

| Field | Description | Options |
|-------|-------------|---------|
| Enabled | Enable translation for this account | true/false |
| Target Language | Language to translate to | en, zh-CN, es, etc. |
| Engine | Translation service | Google, GPT-4, Gemini, DeepSeek |
| Auto-Translate | Automatically translate incoming messages | true/false |
| Translate Input | Translate outgoing messages | true/false |

**Quick Setup:**
```javascript
{
  enabled: true,
  targetLanguage: "en",
  engine: "google",
  autoTranslate: false,
  translateInput: false
}
```

---

## Account Status Indicators

| Indicator | Status | Meaning |
|-----------|--------|---------|
| 🟢 Green | Online | Connected and ready |
| ⚪ Gray | Offline | Not logged in or disconnected |
| 🔴 Red | Error | Connection or configuration error |
| 🟡 Yellow | Loading | Connecting or loading |

---

## Keyboard Shortcuts

### Navigation
- `Ctrl+1` to `Ctrl+9` - Switch to account 1-9
- `Ctrl+Tab` - Next account
- `Ctrl+Shift+Tab` - Previous account
- `Ctrl+N` - Add new account

### Management
- `Ctrl+E` - Edit current account
- `Ctrl+D` - Delete current account
- `Ctrl+R` - Reload current account

---

## Common Tasks

### Setting Up a New Account

1. Click **[+ Add Account]**
2. Enter account name (e.g., "Work")
3. (Optional) Add a note
4. Click **Save**
5. Scan QR code with your phone
6. Wait for WhatsApp to load

### Configuring a Proxy

1. Click **⚙️** next to account
2. Scroll to **Proxy Configuration**
3. Check **Enable Proxy**
4. Enter proxy details:
   - Protocol: SOCKS5
   - Host: 127.0.0.1
   - Port: 1080
5. Click **Test Connection**
6. Click **Save**

### Enabling Translation

1. Click **⚙️** next to account
2. Scroll to **Translation Settings**
3. Check **Enable Translation**
4. Select target language (e.g., English)
5. Choose engine (e.g., Google)
6. Click **Save**

### Organizing Accounts

1. **Reorder**: Drag accounts to desired position
2. **Name clearly**: Use descriptive names
3. **Add notes**: Include context in notes field
4. **Group by purpose**: Keep work/personal separate

---

## Troubleshooting

### Account Won't Load

**Quick Fix:**
1. Right-click account → Reload
2. Check internet connection
3. Verify proxy settings (if enabled)
4. Clear session data and re-login

### Can't Switch Accounts

**Quick Fix:**
1. Check for error indicator
2. Restart application
3. Try keyboard shortcut instead
4. Check application logs

### Proxy Not Working

**Quick Fix:**
1. Test proxy connection
2. Verify proxy server is running
3. Check credentials
4. Try different protocol
5. Disable and re-enable

### Translation Not Working

**Quick Fix:**
1. Verify translation is enabled
2. Check API key (for paid engines)
3. Try different engine
4. Clear translation cache
5. Reload account

---

## Best Practices

### Naming Conventions

✅ **Good:**
- "Personal"
- "Work - Sales"
- "Business - Support"
- "Family Group"

❌ **Avoid:**
- "Account 1"
- "Test"
- "asdf"
- Duplicate names

### Organization

1. **Order by priority**: Most-used accounts at top
2. **Use consistent naming**: Follow a pattern
3. **Add context in notes**: Include purpose or details
4. **Limit active accounts**: Keep only what you need

### Security

1. **Use proxies for sensitive accounts**: Route through secure networks
2. **Log out when not in use**: Prevent unauthorized access
3. **Separate work and personal**: Don't mix account types
4. **Regular backups**: Export configurations periodically

### Performance

1. **Close unused accounts**: Delete accounts you don't need
2. **Clear cache regularly**: Reduce memory usage
3. **Restart periodically**: Free up resources
4. **Limit concurrent accounts**: Keep under 10 for best performance

---

## Data Locations

### Configuration File
```
Windows: %APPDATA%/whatsapp-desktop/accounts.json
macOS: ~/Library/Application Support/whatsapp-desktop/accounts.json
Linux: ~/.config/whatsapp-desktop/accounts.json
```

### Session Data
```
Windows: %APPDATA%/whatsapp-desktop/session-data/account-{id}/
macOS: ~/Library/Application Support/whatsapp-desktop/session-data/account-{id}/
Linux: ~/.config/whatsapp-desktop/session-data/account-{id}/
```

### Logs
```
Windows: %APPDATA%/whatsapp-desktop/logs/
macOS: ~/Library/Application Support/whatsapp-desktop/logs/
Linux: ~/.config/whatsapp-desktop/logs/
```

---

## Account Limits

| Limit | Value | Notes |
|-------|-------|-------|
| Maximum accounts | 50 | Practical limit for performance |
| Recommended accounts | 10 | For optimal performance |
| Minimum accounts | 1 | At least one account required |
| Concurrent active | 10 | All can be connected simultaneously |

---

## Import/Export

### Export Accounts
```
Settings → Export Configuration → Save JSON file
```

### Import Accounts
```
Settings → Import Configuration → Select JSON file → Review → Import
```

### Backup
```
1. Close application
2. Copy entire data directory
3. Store in safe location
```

### Restore
```
1. Close application
2. Replace data directory with backup
3. Restart application
```

---

## API Reference

### Account Object Structure

```javascript
{
  id: "acc_001",                    // Unique identifier
  name: "Personal",                 // Display name
  note: "My personal account",      // Optional note
  order: 0,                         // Sidebar position
  sessionDir: "/path/to/session",   // Session data path
  proxy: {
    enabled: true,
    protocol: "socks5",
    host: "127.0.0.1",
    port: 1080,
    username: "",
    password: ""
  },
  translation: {
    enabled: true,
    targetLanguage: "en",
    engine: "google",
    autoTranslate: false,
    translateInput: false
  },
  createdAt: "2024-01-01T00:00:00Z",
  lastActiveAt: "2024-01-15T10:30:00Z",
  autoStart: false
}
```

---

## Command Line

### Launch with Specific Account
```bash
whatsapp-desktop --account=acc_001
```

### Enable Debug Mode
```bash
whatsapp-desktop --debug
```

### Disable GPU Acceleration
```bash
whatsapp-desktop --disable-gpu
```

---

## Support

### Getting Help

1. **Documentation**: [User Guide](SINGLE_WINDOW_USER_GUIDE.md)
2. **FAQ**: [Frequently Asked Questions](FAQ.md)
3. **Community**: [Forum](https://community.example.com)
4. **Support**: support@example.com

### Reporting Issues

Include:
- Account configuration (remove sensitive data)
- Error messages
- Steps to reproduce
- Application version
- Operating system

---

## Version History

### Current Version Features

- ✅ Single-window interface
- ✅ Unlimited accounts
- ✅ Per-account proxy
- ✅ Per-account translation
- ✅ Drag-to-reorder
- ✅ Keyboard shortcuts
- ✅ Status monitoring
- ✅ Session persistence

### Coming Soon

- 🔄 Account groups
- 🔄 Bulk operations
- 🔄 Advanced filtering
- 🔄 Cloud sync
- 🔄 Mobile companion

---

## Tips & Tricks

### Power User Tips

1. **Master keyboard shortcuts**: Navigate without mouse
2. **Use descriptive notes**: Add context for each account
3. **Set up auto-start**: Launch important accounts automatically
4. **Create naming conventions**: Use consistent patterns
5. **Regular maintenance**: Clean up unused accounts

### Productivity Hacks

1. **Order by frequency**: Most-used accounts at top
2. **Use Ctrl+Tab**: Quick cycling between accounts
3. **Resize sidebar**: Adjust to your preference
4. **Enable status indicators**: Monitor at a glance
5. **Set up proxies**: Route accounts efficiently

### Advanced Usage

1. **Script automation**: Use command line options
2. **Backup regularly**: Export configurations weekly
3. **Monitor logs**: Check for issues proactively
4. **Optimize performance**: Limit active accounts
5. **Customize shortcuts**: Modify keybindings

---

*Last updated: 2024-01-15*
