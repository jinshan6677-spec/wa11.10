# WhatsApp Desktop - Single Window User Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Interface Overview](#interface-overview)
4. [Account Management](#account-management)
5. [Proxy Configuration](#proxy-configuration)
6. [Translation Features](#translation-features)
7. [Keyboard Shortcuts](#keyboard-shortcuts)
8. [Tips and Best Practices](#tips-and-best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Introduction

Welcome to the new single-window version of WhatsApp Desktop! This version consolidates all your WhatsApp accounts into one unified interface, making it easier to manage multiple accounts without the clutter of multiple windows.

### What's New?

- **Single Window Interface**: All accounts in one window with a sidebar
- **Quick Account Switching**: Switch between accounts instantly
- **Independent Sessions**: Each account maintains its own login state and data
- **Per-Account Settings**: Configure proxy and translation settings for each account
- **Improved Performance**: Optimized memory usage and faster switching

---

## Getting Started

### First Launch

When you first launch the application:

1. The main window will open with an empty account list
2. Click the **"+ Add Account"** button in the sidebar
3. Enter a name for your account (e.g., "Personal", "Work")
4. Click **"Save"** to create the account
5. The WhatsApp Web QR code will appear in the main area
6. Scan the QR code with your phone to log in

### Adding Multiple Accounts

To add more accounts:

1. Click the **"+ Add Account"** button
2. Give each account a unique name
3. Scan the QR code for each account
4. All accounts will appear in the sidebar

---

## Interface Overview

### Main Window Layout

```
┌─────────────────────────────────────────────┐
│  WhatsApp Desktop                      _ □ X │
├──────────┬──────────────────────────────────┤
│          │                                  │
│ Sidebar  │     Main Content Area            │
│          │                                  │
│ Account1 │  [WhatsApp Web for selected     │
│ Account2 │   account appears here]          │
│ Account3 │                                  │
│          │                                  │
│ [+ Add]  │                                  │
│          │                                  │
└──────────┴──────────────────────────────────┘
```

### Sidebar Components

**Account List**
- Each account shows:
  - Account name
  - Status indicator (●) - Green: Online, Gray: Offline, Red: Error
  - Optional note (hover to see)
  - Action buttons (⚙️ Settings, 🗑️ Delete)

**Add Account Button**
- Located at the bottom of the sidebar
- Click to create a new account

**Resize Handle**
- Drag the right edge of the sidebar to adjust width
- Width preference is saved automatically

### Main Content Area

- Displays WhatsApp Web for the selected account
- Shows QR code for accounts that aren't logged in
- Maintains connection even when switching to other accounts

---

## Account Management

### Creating an Account

1. Click **"+ Add Account"** in the sidebar
2. Fill in the account details:
   - **Name** (required): A friendly name like "Personal" or "Work"
   - **Note** (optional): Additional information about the account
3. Click **"Save"**
4. Scan the QR code to log in

### Editing an Account

1. Click the **⚙️** (settings) button next to the account
2. Modify the account details:
   - Change the name or note
   - Configure proxy settings
   - Configure translation settings
3. Click **"Save"** to apply changes

### Deleting an Account

1. Click the **🗑️** (delete) button next to the account
2. Confirm the deletion
3. Choose whether to:
   - **Keep session data**: You can re-add the account later without re-logging in
   - **Delete session data**: Completely remove all data (requires re-login)

### Switching Between Accounts

**Using Mouse:**
- Click on any account in the sidebar to switch to it

**Using Keyboard:**
- Press `Ctrl+1` through `Ctrl+9` to switch to accounts 1-9
- Press `Ctrl+Tab` to cycle through accounts
- Press `Ctrl+Shift+Tab` to cycle backwards

### Reordering Accounts

1. Click and hold on an account in the sidebar
2. Drag it to the desired position
3. Release to drop it in place
4. The new order is saved automatically

### Account Status Indicators

- **Green (●)**: Account is online and connected
- **Gray (○)**: Account is offline or not logged in
- **Red (●)**: Account has an error (hover for details)
- **Yellow (●)**: Account is connecting or loading

---

## Proxy Configuration

### Why Use a Proxy?

Proxies allow you to:
- Route different accounts through different network paths
- Access WhatsApp from restricted networks
- Enhance privacy by masking your IP address
- Use accounts from different geographic locations

### Configuring a Proxy

1. Click the **⚙️** button next to an account
2. Scroll to the **Proxy Configuration** section
3. Enable the proxy by checking **"Enable Proxy"**
4. Fill in the proxy details:
   - **Protocol**: HTTP, HTTPS, or SOCKS5
   - **Host**: Proxy server address (e.g., `proxy.example.com` or `127.0.0.1`)
   - **Port**: Proxy server port (e.g., `1080`, `8080`)
   - **Username** (optional): For authenticated proxies
   - **Password** (optional): For authenticated proxies
5. Click **"Test Connection"** to verify the proxy works
6. Click **"Save"** to apply the proxy

### Proxy Examples

**Local SOCKS5 Proxy:**
```
Protocol: SOCKS5
Host: 127.0.0.1
Port: 1080
Username: (leave empty)
Password: (leave empty)
```

**HTTP Proxy with Authentication:**
```
Protocol: HTTP
Host: proxy.company.com
Port: 8080
Username: your-username
Password: your-password
```

### Proxy Troubleshooting

**Connection Failed:**
- Verify the proxy server is running
- Check the host and port are correct
- Ensure your firewall allows the connection

**Authentication Failed:**
- Double-check your username and password
- Some proxies require specific authentication methods

**Slow Connection:**
- Try a different proxy server
- Check your proxy server's bandwidth
- Consider using a local proxy for better performance

### Disabling a Proxy

1. Click the **⚙️** button next to the account
2. Uncheck **"Enable Proxy"**
3. Click **"Save"**
4. The account will reconnect using your direct internet connection

---

## Translation Features

### Overview

The translation feature allows you to automatically translate WhatsApp messages to your preferred language. Each account can have its own translation settings.

### Enabling Translation

1. Click the **⚙️** button next to an account
2. Scroll to the **Translation Settings** section
3. Enable translation by checking **"Enable Translation"**
4. Configure your preferences:
   - **Target Language**: The language to translate messages into
   - **Translation Engine**: Choose from Google, GPT-4, Gemini, or DeepSeek
   - **Auto-Translate**: Automatically translate incoming messages
   - **Translate Input**: Translate your outgoing messages
5. Click **"Save"**

### Translation Engines

**Google Translate (Free)**
- No API key required
- Fast and reliable
- Supports 100+ languages
- Best for: General use

**GPT-4 (Paid)**
- Requires OpenAI API key
- High-quality translations
- Understands context better
- Best for: Professional communication

**Gemini (Paid)**
- Requires Google AI API key
- Good balance of quality and speed
- Supports multiple languages
- Best for: Balanced performance

**DeepSeek (Paid)**
- Requires DeepSeek API key
- Specialized in certain language pairs
- Cost-effective
- Best for: Budget-conscious users

### Using Translation

**Manual Translation:**
1. Right-click on any message
2. Select **"Translate Message"**
3. The translation appears below the original message

**Auto-Translation:**
- When enabled, incoming messages are automatically translated
- Original message is still visible
- Toggle translation on/off with the button in the chat header

**Translating Your Messages:**
1. Type your message in your native language
2. Click the **"Translate"** button before sending
3. The translated message is sent to the recipient

### Per-Contact Settings

You can configure translation settings for specific contacts:

1. Open a chat with the contact
2. Click the **"⋮"** (more) menu
3. Select **"Translation Settings"**
4. Configure contact-specific settings:
   - Enable/disable translation for this contact
   - Set a different target language
   - Choose a different translation engine

### Translation Cache

- Translations are cached to improve performance
- Cache is stored per account
- Clear cache from account settings if needed

### Translation Troubleshooting

**Translations Not Appearing:**
- Check that translation is enabled for the account
- Verify your internet connection
- Check the translation engine status

**Poor Translation Quality:**
- Try a different translation engine
- Check that the correct target language is selected
- Some languages may have better support than others

**API Key Errors:**
- Verify your API key is correct
- Check that your API key has sufficient credits
- Ensure the API key has the necessary permissions

---

## Keyboard Shortcuts

### Account Navigation

| Shortcut | Action |
|----------|--------|
| `Ctrl+1` to `Ctrl+9` | Switch to account 1-9 |
| `Ctrl+Tab` | Next account |
| `Ctrl+Shift+Tab` | Previous account |
| `Ctrl+N` | Add new account |

### Window Management

| Shortcut | Action |
|----------|--------|
| `Ctrl+W` | Close window |
| `Ctrl+M` | Minimize window |
| `F11` | Toggle fullscreen |
| `Ctrl+R` | Reload current account |

### Account Management

| Shortcut | Action |
|----------|--------|
| `Ctrl+E` | Edit current account |
| `Ctrl+D` | Delete current account |
| `Ctrl+,` | Open settings |

### Translation

| Shortcut | Action |
|----------|--------|
| `Ctrl+T` | Toggle translation for current chat |
| `Ctrl+Shift+T` | Translate selected message |

### General

| Shortcut | Action |
|----------|--------|
| `Ctrl+F` | Search in current chat |
| `Ctrl+Shift+F` | Global search |
| `Ctrl+Q` | Quit application |

---

## Tips and Best Practices

### Performance Tips

1. **Limit Active Accounts**: Keep only the accounts you actively use
2. **Close Unused Accounts**: Accounts remain connected even when hidden, so delete accounts you don't need
3. **Clear Cache Regularly**: Clear translation cache and browser cache periodically
4. **Restart Periodically**: Restart the application every few days to free up memory

### Organization Tips

1. **Use Descriptive Names**: Name accounts clearly (e.g., "Work - Sales", "Personal")
2. **Add Notes**: Use the note field to add context (e.g., "Customer support account")
3. **Order by Priority**: Drag accounts to reorder them by importance
4. **Use Keyboard Shortcuts**: Learn shortcuts for faster navigation

### Security Tips

1. **Use Proxies for Privacy**: Route sensitive accounts through proxies
2. **Log Out When Done**: Log out of accounts you're not actively using
3. **Separate Work and Personal**: Keep work and personal accounts separate
4. **Regular Backups**: Export your account configurations regularly

### Translation Tips

1. **Choose the Right Engine**: Use free engines for casual use, paid engines for professional communication
2. **Verify Important Messages**: Always review auto-translated messages before sending
3. **Use Per-Contact Settings**: Configure different settings for different contacts
4. **Cache Management**: Clear cache if translations seem outdated

---

## Troubleshooting

### Common Issues

#### Account Won't Load

**Symptoms**: Account shows loading spinner indefinitely

**Solutions**:
1. Check your internet connection
2. Reload the account (right-click → Reload)
3. Clear the account's session data
4. Try disabling proxy if enabled
5. Restart the application

#### Can't Log In

**Symptoms**: QR code won't scan or login fails

**Solutions**:
1. Ensure your phone has internet connection
2. Update WhatsApp on your phone
3. Try scanning the QR code again
4. Clear the account's session data and try again
5. Check if WhatsApp Web is supported in your region

#### Proxy Connection Failed

**Symptoms**: Account shows error after enabling proxy

**Solutions**:
1. Verify proxy server is running
2. Check proxy credentials are correct
3. Test proxy with another application
4. Try a different proxy protocol
5. Disable proxy and use direct connection

#### Translation Not Working

**Symptoms**: Messages aren't being translated

**Solutions**:
1. Check translation is enabled for the account
2. Verify your API key (for paid engines)
3. Check your internet connection
4. Try a different translation engine
5. Clear translation cache

#### High Memory Usage

**Symptoms**: Application uses too much RAM

**Solutions**:
1. Close unused accounts
2. Restart the application
3. Clear browser cache for all accounts
4. Reduce the number of active accounts
5. Check for memory leaks (report to developers)

#### Accounts Not Switching

**Symptoms**: Clicking accounts doesn't switch views

**Solutions**:
1. Restart the application
2. Check for error messages in the account status
3. Try using keyboard shortcuts instead
4. Reload the account
5. Check application logs for errors

### Getting Help

If you continue to experience issues:

1. **Check Logs**: Look in the application data directory for error logs
2. **Report Issues**: Submit bug reports with detailed information
3. **Community Support**: Ask questions in the community forums
4. **Documentation**: Review the full documentation for advanced topics

### Reporting Bugs

When reporting bugs, please include:

- Application version
- Operating system and version
- Steps to reproduce the issue
- Error messages or screenshots
- Log files (if available)

---

## Advanced Topics

### Session Data Location

Session data is stored in:
- **Windows**: `%APPDATA%/whatsapp-desktop/session-data/`
- **macOS**: `~/Library/Application Support/whatsapp-desktop/session-data/`
- **Linux**: `~/.config/whatsapp-desktop/session-data/`

Each account has its own subdirectory named `account-{id}`.

### Configuration File

Account configurations are stored in:
- **Windows**: `%APPDATA%/whatsapp-desktop/accounts.json`
- **macOS**: `~/Library/Application Support/whatsapp-desktop/accounts.json`
- **Linux**: `~/.config/whatsapp-desktop/accounts.json`

### Backup and Restore

**Backing Up:**
1. Close the application
2. Copy the entire `whatsapp-desktop` directory
3. Store the backup in a safe location

**Restoring:**
1. Close the application
2. Replace the `whatsapp-desktop` directory with your backup
3. Restart the application

### Command Line Options

Launch the application with options:

```bash
# Enable debug logging
whatsapp-desktop --debug

# Start with specific account
whatsapp-desktop --account=acc_001

# Disable hardware acceleration
whatsapp-desktop --disable-gpu
```

---

## Conclusion

The single-window architecture provides a streamlined experience for managing multiple WhatsApp accounts. With features like independent sessions, per-account proxies, and translation, you have full control over how you use WhatsApp Desktop.

For more information, visit the [official documentation](https://github.com/your-repo/docs) or join our [community forum](https://community.example.com).

**Happy messaging!** 📱💬
