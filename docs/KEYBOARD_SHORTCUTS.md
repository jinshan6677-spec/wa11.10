# Keyboard Shortcuts

This document describes all available keyboard shortcuts in the WhatsApp Desktop application.

## Account Navigation

### Switch to Specific Account
- **Ctrl + 1-9**: Switch to account at position 1-9 in the sidebar
  - Example: `Ctrl + 1` switches to the first account
  - Example: `Ctrl + 5` switches to the fifth account
  - If no account exists at that position, the shortcut is ignored

### Cycle Through Accounts
- **Ctrl + Tab**: Switch to the next account in the list
  - Cycles back to the first account after the last one
  
- **Ctrl + Shift + Tab**: Switch to the previous account in the list
  - Cycles to the last account when at the first one

## Help and Documentation

### Keyboard Shortcuts Help
- **?** (Shift + /): Toggle the keyboard shortcuts help panel
  - Shows a floating panel with all available shortcuts
  - Press again or press Escape to close

- **Esc**: Close the keyboard shortcuts help panel
  - Only works when the help panel is visible

## UI Interactions

### Sidebar
- **Click**: Select and switch to an account
- **Drag and Drop**: Reorder accounts by dragging them to a new position
- **Hover**: Show tooltips with additional information

### Account Actions
- **⚙️ (Settings Icon)**: Edit account configuration
  - Opens the account configuration dialog
  
- **🗑️ (Delete Icon)**: Delete the account
  - Shows a confirmation dialog before deletion

## Tips

1. **Quick Switching**: Use `Ctrl + 1-9` for instant access to your most-used accounts
2. **Organize**: Drag accounts to reorder them, placing frequently used accounts at the top
3. **Learn Shortcuts**: Press `?` anytime to see the shortcuts help panel
4. **Efficient Navigation**: Use `Ctrl + Tab` to quickly cycle through all accounts

## Accessibility

All keyboard shortcuts are designed to be accessible and work with screen readers:
- Account items are focusable with Tab key
- Enter or Space key activates the focused account
- All buttons have proper ARIA labels
- Tooltips provide additional context

## Platform-Specific Notes

### Windows
- All shortcuts use the `Ctrl` key as the modifier

### macOS
- Shortcuts use `Cmd` instead of `Ctrl` (automatically handled by Electron)

### Linux
- All shortcuts use the `Ctrl` key as the modifier

## Future Enhancements

Planned keyboard shortcuts for future releases:
- `Ctrl + N`: Create new account
- `Ctrl + E`: Edit active account
- `Ctrl + R`: Reload active account view
- `Ctrl + L`: Force logout from active account
- `Ctrl + ,`: Open application settings

## Customization

Currently, keyboard shortcuts are not customizable. This feature may be added in a future release based on user feedback.

## Troubleshooting

### Shortcuts Not Working

1. **Check Focus**: Ensure the main window has focus
2. **Check Input Fields**: Shortcuts may not work when typing in input fields
3. **Check OS Conflicts**: Some shortcuts may conflict with system shortcuts
4. **Restart Application**: Try restarting the application if shortcuts stop working

### Conflicts with System Shortcuts

If a shortcut conflicts with your operating system or other applications:
1. The system shortcut will take precedence
2. Consider closing conflicting applications
3. Report the conflict as feedback for future customization features

## Feedback

Have suggestions for new keyboard shortcuts? Please submit feedback through:
- GitHub Issues
- Application feedback form
- Community forums

---

**Last Updated**: November 2025
**Version**: 1.0.0
