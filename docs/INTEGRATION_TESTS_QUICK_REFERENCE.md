# Integration Tests - Quick Reference

## Running Tests

```bash
# Run all integration tests
npx electron scripts/test-integration.js

# View test output
npx electron scripts/test-integration.js 2>&1 | more
```

## Test Suite Structure

### Test 1: Account Creation Flow
- Creates 3 test accounts with different configurations
- Validates account → session → view → translation flow
- **Expected**: 3 passed

### Test 2: Account Switching
- Tests switching between multiple accounts
- Validates state preservation
- Tests rapid switching
- **Expected**: 5 passed

### Test 3: Translation Integration
- Tests translation configuration
- Validates per-account settings
- **Expected**: 2 passed

### Test 4: Proxy & Isolation
- Tests proxy configuration
- Validates session isolation
- **Expected**: 3 passed

### Test 5: Session Persistence
- Tests session data persistence
- Validates restoration after restart
- **Expected**: 3 passed

## Expected Results

```
Test 1 Results: 3 passed, 0 failed
Test 2 Results: 5 passed, 0 failed
Test 3 Results: 2 passed, 0 failed
Test 4 Results: 3 passed, 0 failed
Test 5 Results: 3 passed, 0 failed

Total: 16 passed, 0 failed (100%)
```

## Test Data

Tests use isolated test directory:
- **Location**: `{userData}/integration-test`
- **Cleanup**: Automatic before and after tests
- **Isolation**: No impact on production data

## Common Issues

### Proxy Connection Failures
**Expected behavior** - Test proxies don't exist
```
ERR_PROXY_CONNECTION_FAILED
```

### WhatsApp Web Timeouts
**Expected behavior** - Network dependent, tests skip actual loading
```
Navigation timeout
```

### Session Warnings
**Expected behavior** - First-time session creation
```
Partition mismatch warning
```

## Test Configuration

### Test Accounts
1. **Test Account 1**: HTTP proxy, Chinese translation
2. **Test Account 2**: SOCKS5 proxy, English translation  
3. **Test Account 3**: No proxy, no translation

### Timeouts
- View creation: 2s
- Account switching: 500ms
- Rapid switching: 100ms

## Debugging

### Enable Verbose Logging
Set environment variable:
```bash
$env:NODE_ENV="development"
npx electron scripts/test-integration.js
```

### Check Specific Test
Modify test file to run only specific test:
```javascript
// Comment out other tests
// const test1Results = await test1_AccountCreationToViewFlow();
const test2Results = await test2_AccountSwitchingAndState();
```

### Inspect Test Data
Test data persists briefly after failure:
```bash
# Windows
dir $env:APPDATA\Electron\integration-test

# macOS/Linux  
ls ~/Library/Application\ Support/Electron/integration-test
```

## Integration with CI/CD

### GitHub Actions Example
```yaml
- name: Run Integration Tests
  run: |
    npm install
    xvfb-run --auto-servernum npx electron scripts/test-integration.js
```

### Exit Codes
- **0**: All tests passed
- **1**: One or more tests failed

## Related Files

- `scripts/test-integration.js` - Main test suite
- `src/managers/AccountConfigManager.js` - Account management
- `src/managers/SessionManager.js` - Session management
- `src/single-window/ViewManager.js` - View management
- `src/managers/TranslationIntegration.js` - Translation system

## Requirements Coverage

✓ Account creation to view creation flow  
✓ Account switching and state preservation  
✓ Translation injection and configuration  
✓ Proxy application and isolation  
✓ Session persistence and restoration
