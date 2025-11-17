# Frequently Asked Questions (FAQ)

## Table of Contents

1. [General Questions](#general-questions)
2. [Account Management](#account-management)
3. [Migration](#migration)
4. [Proxy Configuration](#proxy-configuration)
5. [Translation Features](#translation-features)
6. [Performance](#performance)
7. [Troubleshooting](#troubleshooting)
8. [Security & Privacy](#security--privacy)
9. [Technical Questions](#technical-questions)

---

## General Questions

### What is the single-window architecture?

The single-window architecture consolidates all your WhatsApp accounts into one unified window with a sidebar for account management. Instead of having multiple separate windows (one per account), you now have one window with all accounts accessible from a sidebar.

### Why did you change from multi-window to single-window?

The single-window architecture provides several benefits:
- **Less clutter**: One window instead of many
- **Faster switching**: Instant account switching without window management
- **Better organization**: All accounts visible in one place
- **Improved performance**: Optimized memory usage and resource management
- **Modern UX**: Consistent with modern multi-account applications

### Is this a mandatory update?

Yes, the single-window architecture is the new standard. However, your data and accounts will be automatically migrated, and you won't lose any information.

### Can I still use the old multi-window version?

While the old version may still work, it's no longer supported. We recommend migrating to the single-window version for the best experience and continued updates.

### Will I lose my chat history?

No, your chat history is stored by WhatsApp on their servers and on your phone. The desktop application only displays this data. Migration only affects the application configuration, not your WhatsApp data.

---

## Account Management

### How many accounts can I have?

Technically, you can have up to 50 accounts, but we recommend keeping it under 10 for optimal performance. Each account consumes memory and system resources.

### Do I need to re-scan QR codes after migration?

No, your login states are preserved during migration. You should remain logged in to all your accounts after the migration completes.

### Can I use the same WhatsApp account on multiple profiles?

No, WhatsApp only allows one active desktop session per account. If you log in on another device or profile, you'll be logged out from the previous session.

### How do I organize my accounts?

You can:
- **Drag and drop** accounts to reorder them in the sidebar
- **Use descriptive names** like "Work - Sales" or "Personal"
- **Add notes** to provide additional context
- **Order by priority** with most-used accounts at the top

### Can I export my account configurations?

Yes, go to **Settings → Export Configuration** to save your account configurations to a JSON file. This is useful for backups or transferring to another computer.

### What happens to my session data when I delete an account?

When deleting an account, you'll be asked whether to:
- **Keep session data**: You can re-add the account later without re-logging in
- **Delete session data**: Completely removes all data (requires re-login if re-added)

### Can I rename an account after creating it?

Yes, click the **⚙️** (settings) button next to the account, change the name, and click **Save**.

### How do I log out of an account?

To log out:
1. Click **⚙️** next to the account
2. Scroll to **Session Management**
3. Click **"Clear Session Data"**
4. Confirm the action

This will log you out and you'll need to scan the QR code again.

---

## Migration

### How long does migration take?

Migration typically takes 1-2 minutes for most users. The time depends on:
- Number of accounts (more accounts = longer time)
- System performance
- Size of session data

### What if migration fails?

If migration fails:
1. Check the migration log for specific errors
2. Try manual migration (see [Migration Guide](MIGRATION_GUIDE.md))
3. Restore from the automatic backup
4. Contact support with the log file

### Can I rollback to the old version?

Yes, you can rollback using the backup created during migration. See the [Rollback Instructions](MIGRATION_GUIDE.md#rollback-instructions) in the Migration Guide.

### Will my window positions be preserved?

No, window positions are replaced by the sidebar order. Accounts are ordered based on their previous window positions (left to right, top to bottom).

### What gets backed up during migration?

The migration process creates a backup of:
- Old configuration file (`accounts-old.json`)
- Window state data
- Migration log

Session data is NOT backed up (it's not modified during migration).

### Can I migrate on multiple computers?

Yes, you can migrate on each computer independently. If you want to sync configurations:
1. Export configuration from one computer
2. Import it on another computer
3. You'll still need to log in on each computer

---

## Proxy Configuration

### Why would I use a proxy?

Proxies are useful for:
- **Privacy**: Masking your IP address
- **Access**: Bypassing network restrictions
- **Geographic routing**: Accessing region-specific features
- **Security**: Routing through secure networks
- **Testing**: Simulating different network conditions

### What proxy protocols are supported?

We support:
- **HTTP**: Standard HTTP proxy
- **HTTPS**: Secure HTTP proxy
- **SOCKS5**: Most versatile, supports any protocol

SOCKS5 is recommended for most use cases.

### Can each account have a different proxy?

Yes! Each account can have its own independent proxy configuration. This allows you to route different accounts through different networks.

### How do I test if my proxy is working?

1. Configure the proxy in account settings
2. Click **"Test Connection"** button
3. The application will verify the proxy is reachable
4. If successful, click **"Save"** to apply

You can also check by:
- Visiting a "What's my IP" website in the account
- Checking connection status in the sidebar

### My proxy requires authentication, how do I set it up?

When configuring the proxy:
1. Enable the proxy
2. Enter host and port
3. Fill in the **Username** field
4. Fill in the **Password** field
5. Test and save

The credentials are stored securely and encrypted.

### Can I use a local proxy like Shadowsocks?

Yes! Configure it as:
```
Protocol: SOCKS5
Host: 127.0.0.1
Port: 1080 (or your Shadowsocks port)
```

### What if my proxy stops working?

If your proxy fails:
1. Check the proxy server is running
2. Verify credentials are correct
3. Test with another application
4. Try disabling and re-enabling
5. Check the error message in the account status

The account will show an error indicator if the proxy fails.

### Can I bypass the proxy for certain domains?

Currently, bypass rules are not supported in the UI, but you can manually edit the configuration file to add bypass rules.

---

## Translation Features

### Which translation engines are supported?

We support:
- **Google Translate** (Free): No API key required, fast and reliable
- **GPT-4** (Paid): Requires OpenAI API key, high-quality translations
- **Gemini** (Paid): Requires Google AI API key, good balance
- **DeepSeek** (Paid): Requires DeepSeek API key, cost-effective

### Do I need an API key for translation?

- **Google Translate**: No API key required
- **GPT-4, Gemini, DeepSeek**: API key required

### Can each account have different translation settings?

Yes! Each account can have:
- Different target language
- Different translation engine
- Different API keys
- Different auto-translate settings

### How do I translate a message?

**Manual translation:**
1. Right-click on any message
2. Select **"Translate Message"**
3. The translation appears below the original

**Auto-translation:**
1. Enable auto-translate in account settings
2. Incoming messages are automatically translated
3. Toggle on/off with the button in chat header

### Are translations cached?

Yes, translations are cached per account to improve performance and reduce API calls. You can clear the cache in account settings if needed.

### Can I translate my outgoing messages?

Yes, enable **"Translate Input"** in translation settings. Then:
1. Type your message in your native language
2. Click the **"Translate"** button
3. The translated message is sent

### How much do paid translation engines cost?

Costs vary by provider:
- **GPT-4**: ~$0.03 per 1K tokens (varies by model)
- **Gemini**: ~$0.001 per 1K characters
- **DeepSeek**: ~$0.001 per 1K tokens

Check each provider's pricing page for current rates.

### Can I use different languages for different contacts?

Yes! You can configure per-contact translation settings:
1. Open a chat with the contact
2. Click **"⋮"** (more) menu
3. Select **"Translation Settings"**
4. Configure contact-specific settings

### Why are my translations poor quality?

Translation quality depends on:
- **Engine choice**: Paid engines generally provide better quality
- **Language pair**: Some language pairs are better supported
- **Context**: Short messages may lack context
- **Slang/idioms**: May not translate well

Try a different engine or language setting.

---

## Performance

### How much memory does the application use?

Typical memory usage:
- **Base application**: ~200MB
- **Per account**: ~150-200MB
- **10 accounts**: ~2GB total

Memory usage varies based on:
- Number of active accounts
- Chat history loaded
- Media cached
- Translation cache size

### Why is the application slow?

Common causes:
- **Too many accounts**: Reduce to under 10
- **Low system resources**: Close other applications
- **Large cache**: Clear browser cache
- **Network issues**: Check internet connection
- **Outdated version**: Update to latest version

### How can I improve performance?

1. **Limit accounts**: Keep only what you need
2. **Close unused accounts**: Delete accounts you don't use
3. **Clear cache**: Regularly clear browser and translation cache
4. **Restart periodically**: Restart every few days
5. **Update regularly**: Keep application up to date
6. **Optimize system**: Ensure adequate RAM and CPU

### Does having many accounts slow down switching?

No, account switching is optimized to be instant. However, having many accounts increases overall memory usage, which can affect system performance.

### Can I limit memory usage per account?

Currently, memory limits are set automatically. Future versions may allow manual configuration.

### Why does the application use so much disk space?

Disk space is used for:
- **Session data**: Cookies, cache, local storage per account
- **Media cache**: Images, videos, documents
- **Translation cache**: Cached translations
- **Logs**: Application and error logs

You can clear cache to free up space.

---

## Troubleshooting

### Account won't load / shows blank screen

**Try these steps:**
1. Right-click account → **Reload**
2. Check internet connection
3. Disable proxy (if enabled)
4. Clear session data and re-login
5. Check for error messages in logs

### Can't switch between accounts

**Try these steps:**
1. Check for error indicator on account
2. Restart the application
3. Try keyboard shortcut (`Ctrl+1`, etc.)
4. Check application logs for errors
5. Verify account is not in error state

### QR code won't scan

**Try these steps:**
1. Ensure phone has internet connection
2. Update WhatsApp on your phone
3. Try scanning again (QR code refreshes)
4. Clear session data and try again
5. Check if WhatsApp Web is supported in your region

### Messages not sending/receiving

**Try these steps:**
1. Check internet connection
2. Verify account shows as online
3. Check proxy settings (if enabled)
4. Reload the account
5. Check WhatsApp service status

### Application crashes on startup

**Try these steps:**
1. Check system requirements
2. Delete window state file
3. Restore from backup
4. Reinstall application
5. Check logs for error details

### Sidebar is too narrow/wide

**To resize:**
1. Hover over the right edge of the sidebar
2. Cursor changes to resize handle
3. Click and drag to desired width
4. Release to set

**To reset:**
1. Go to **Settings → Reset Layout**
2. Sidebar returns to default width

### Translation not working

**Try these steps:**
1. Verify translation is enabled
2. Check API key (for paid engines)
3. Test with different engine
4. Clear translation cache
5. Check internet connection
6. Verify API key has credits

### High CPU usage

**Try these steps:**
1. Check which account is active
2. Close unused accounts
3. Disable hardware acceleration
4. Update graphics drivers
5. Restart application
6. Check for malware

---

## Security & Privacy

### Is my data secure?

Yes, your data is secure:
- **Session isolation**: Each account has separate storage
- **Encrypted storage**: Sensitive data is encrypted
- **No cloud sync**: Data stays on your device
- **Secure connections**: HTTPS for all communications

### Are my proxy credentials stored securely?

Yes, proxy credentials are:
- Encrypted at rest
- Never transmitted except to the proxy server
- Stored in secure system keychain (where available)
- Not included in logs or error reports

### Can other accounts see my messages?

No, each account has complete session isolation. Accounts cannot access each other's data, cookies, or storage.

### Are my API keys secure?

Yes, API keys are:
- Encrypted in the configuration file
- Never logged or transmitted except to the API provider
- Stored separately per account
- Can be removed at any time

### Does the application collect telemetry?

The application does not collect telemetry or usage data by default. You can opt-in to anonymous crash reporting to help improve the application.

### Can I use the application offline?

You need an internet connection to use WhatsApp Web. However, the application itself can start offline, and you can manage account configurations without internet.

### Is end-to-end encryption maintained?

Yes, WhatsApp's end-to-end encryption is maintained. The desktop application is just a client for WhatsApp Web, which uses the same encryption as the mobile app.

### What data is stored locally?

Local storage includes:
- Account configurations
- Session data (cookies, cache, local storage)
- Translation cache
- Application logs
- Window state and preferences

### How do I completely remove all data?

To remove all data:
1. Delete all accounts from the application
2. Choose "Delete session data" for each
3. Uninstall the application
4. Manually delete the data directory:
   - Windows: `%APPDATA%/whatsapp-desktop/`
   - macOS: `~/Library/Application Support/whatsapp-desktop/`
   - Linux: `~/.config/whatsapp-desktop/`

---

## Technical Questions

### What technology is this built with?

The application is built with:
- **Electron**: Cross-platform desktop framework
- **BrowserView**: For embedding WhatsApp Web
- **Node.js**: Backend logic
- **HTML/CSS/JavaScript**: UI components

### What's the difference between BrowserWindow and BrowserView?

- **BrowserWindow**: A complete window with its own frame
- **BrowserView**: An embedded view within a window

The new architecture uses one BrowserWindow (main window) with multiple BrowserViews (one per account).

### How is session isolation achieved?

Session isolation uses Electron's partition API:
- Each account gets a unique partition: `persist:account_{id}`
- Partitions have separate storage for cookies, localStorage, IndexedDB, etc.
- Network requests are isolated per partition

### Can I access the DevTools?

Yes, you can open DevTools:
- **Main window**: `Ctrl+Shift+I` or `F12`
- **Account view**: Right-click in account → **Inspect Element**

### Where are logs stored?

Logs are stored in:
- Windows: `%APPDATA%/whatsapp-desktop/logs/`
- macOS: `~/Library/Application Support/whatsapp-desktop/logs/`
- Linux: `~/.config/whatsapp-desktop/logs/`

### Can I run multiple instances of the application?

No, only one instance can run at a time to prevent conflicts. If you try to launch a second instance, it will focus the existing window.

### What ports does the application use?

The application doesn't listen on any ports. It only makes outbound connections to:
- WhatsApp Web servers (HTTPS)
- Translation API servers (HTTPS)
- Proxy servers (if configured)

### Can I customize the application?

Limited customization is available:
- Sidebar width
- Account order
- Keyboard shortcuts (in settings)
- Theme (if supported)

Advanced customization requires modifying the source code.

### Is the source code available?

Check the project repository for source code availability and contribution guidelines.

### How do I report a bug?

To report a bug:
1. Check if it's already reported in the issue tracker
2. Gather information:
   - Application version
   - Operating system
   - Steps to reproduce
   - Error messages
   - Log files
3. Submit a detailed bug report

### How do I request a feature?

To request a feature:
1. Check if it's already requested
2. Describe the feature clearly
3. Explain the use case
4. Submit a feature request in the issue tracker

---

## Still Have Questions?

If your question isn't answered here:

1. **Check the documentation**:
   - [User Guide](SINGLE_WINDOW_USER_GUIDE.md)
   - [Migration Guide](MIGRATION_GUIDE.md)
   - [Account Management Reference](ACCOUNT_MANAGEMENT_QUICK_REFERENCE.md)

2. **Search the community**:
   - [Community Forum](https://community.example.com)
   - [GitHub Issues](https://github.com/your-repo/issues)

3. **Contact support**:
   - Email: support@example.com
   - Include: version, OS, detailed description, logs

---

*Last updated: 2024-01-15*
