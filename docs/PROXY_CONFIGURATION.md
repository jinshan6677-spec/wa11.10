# Proxy Configuration Guide

This guide explains how to configure proxy settings for individual WhatsApp accounts in the single-window architecture.

## Overview

Each WhatsApp account can have its own independent proxy configuration, allowing you to:
- Route different accounts through different network paths
- Use proxies for privacy or access requirements
- Configure authentication for proxy servers
- Test proxy connectivity before applying

## Supported Proxy Protocols

The application supports the following proxy protocols:
- **HTTP**: Standard HTTP proxy
- **HTTPS**: Secure HTTP proxy
- **SOCKS5**: SOCKS version 5 proxy (recommended for best compatibility)
- **SOCKS4**: SOCKS version 4 proxy

## Proxy Configuration Structure

```javascript
{
  enabled: true,                    // Enable/disable proxy
  protocol: 'socks5',               // Proxy protocol
  host: '127.0.0.1',                // Proxy server host
  port: 1080,                       // Proxy server port
  username: 'user',                 // Optional: proxy username
  password: 'pass',                 // Optional: proxy password
  bypass: '<local>',                // Optional: bypass rules
  validateConnectivity: false       // Optional: test before applying
}
```

## Configuration Fields

### Required Fields

- **protocol** (string): Must be one of: `http`, `https`, `socks5`, `socks4`
- **host** (string): Proxy server hostname or IP address
  - Valid hostname: `proxy.example.com`
  - Valid IP: `192.168.1.100`
- **port** (number): Port number between 1 and 65535

### Optional Fields

- **username** (string): Username for proxy authentication
- **password** (string): Password for proxy authentication
  - Note: If you provide username, you must also provide password (and vice versa)
- **bypass** (string): Proxy bypass rules (default: `<local>`)
  - `<local>`: Bypass proxy for local addresses
  - Custom rules: `*.example.com;192.168.0.0/16`
- **validateConnectivity** (boolean): Test proxy before applying (default: `false`)
  - When enabled, the system will test the proxy connection before applying it
  - If the test fails, the system will fall back to direct connection

## Usage Examples

### Example 1: Basic HTTP Proxy

```javascript
const proxyConfig = {
  enabled: true,
  protocol: 'http',
  host: '127.0.0.1',
  port: 8080
};

await sessionManager.configureProxy(accountId, proxyConfig);
```

### Example 2: SOCKS5 Proxy with Authentication

```javascript
const proxyConfig = {
  enabled: true,
  protocol: 'socks5',
  host: 'proxy.example.com',
  port: 1080,
  username: 'myuser',
  password: 'mypassword'
};

await sessionManager.configureProxy(accountId, proxyConfig);
```

### Example 3: Proxy with Connectivity Validation

```javascript
const proxyConfig = {
  enabled: true,
  protocol: 'https',
  host: '192.168.1.100',
  port: 3128,
  validateConnectivity: true  // Test before applying
};

const result = await sessionManager.configureProxy(accountId, proxyConfig);
if (result.fallbackApplied) {
  console.log('Proxy test failed, using direct connection');
}
```

### Example 4: Test Proxy Before Using

```javascript
const proxyConfig = {
  protocol: 'socks5',
  host: 'proxy.example.com',
  port: 1080,
  username: 'user',
  password: 'pass'
};

// Test without applying
const testResult = await sessionManager.testProxyConfig(proxyConfig);
if (testResult.valid) {
  console.log(`Proxy is valid, latency: ${testResult.latency}ms`);
  // Now apply it
  await sessionManager.configureProxy(accountId, proxyConfig);
} else {
  console.error(`Proxy test failed: ${testResult.error}`);
}
```

## API Reference

### SessionManager Methods

#### `configureProxy(accountId, proxyConfig)`

Configure proxy for a specific account.

**Parameters:**
- `accountId` (string): Account identifier
- `proxyConfig` (object): Proxy configuration object

**Returns:**
```javascript
{
  success: boolean,
  error?: string,
  fallbackApplied?: boolean
}
```

**Example:**
```javascript
const result = await sessionManager.configureProxy('acc_001', {
  enabled: true,
  protocol: 'socks5',
  host: '127.0.0.1',
  port: 1080
});

if (result.success) {
  console.log('Proxy configured successfully');
} else {
  console.error('Failed:', result.error);
}
```

#### `testProxyConfig(proxyConfig)`

Test a proxy configuration without applying it.

**Parameters:**
- `proxyConfig` (object): Proxy configuration to test

**Returns:**
```javascript
{
  valid: boolean,
  error?: string,
  latency?: number  // Response time in milliseconds
}
```

**Example:**
```javascript
const result = await sessionManager.testProxyConfig({
  protocol: 'http',
  host: '127.0.0.1',
  port: 8080
});

if (result.valid) {
  console.log(`Proxy works! Latency: ${result.latency}ms`);
}
```

#### `getProxyConfig(accountId)`

Get the current proxy configuration for an account.

**Parameters:**
- `accountId` (string): Account identifier

**Returns:**
- Proxy configuration object or `null` if not configured

**Example:**
```javascript
const config = sessionManager.getProxyConfig('acc_001');
if (config) {
  console.log(`Using ${config.protocol} proxy at ${config.host}:${config.port}`);
}
```

#### `clearProxy(accountId)`

Remove proxy configuration and use direct connection.

**Parameters:**
- `accountId` (string): Account identifier

**Returns:**
```javascript
{
  success: boolean,
  error?: string
}
```

**Example:**
```javascript
const result = await sessionManager.clearProxy('acc_001');
if (result.success) {
  console.log('Proxy cleared, using direct connection');
}
```

## Error Handling

The proxy configuration system includes comprehensive error handling:

### Validation Errors

If the proxy configuration is invalid, you'll receive a descriptive error:

```javascript
const result = await sessionManager.configureProxy(accountId, {
  protocol: 'invalid',
  host: '127.0.0.1',
  port: 8080
});

// result.error: "Invalid proxy configuration: Invalid protocol: invalid. Must be one of: http, https, socks5, socks4"
```

### Connectivity Errors

If proxy connectivity validation fails, the system can automatically fall back to direct connection:

```javascript
const result = await sessionManager.configureProxy(accountId, {
  enabled: true,
  protocol: 'http',
  host: 'unreachable-proxy.example.com',
  port: 8080,
  validateConnectivity: true
});

if (result.fallbackApplied) {
  console.log('Proxy unreachable, using direct connection');
  console.log('Error:', result.error);
}
```

## Common Validation Errors

| Error | Cause | Solution |
|-------|-------|----------|
| Invalid protocol | Protocol not in allowed list | Use: http, https, socks5, or socks4 |
| Invalid host | Empty or malformed hostname | Provide valid hostname or IP |
| Invalid port | Port outside 1-65535 range | Use valid port number |
| Invalid host format | Host contains invalid characters | Use alphanumeric, dots, or hyphens only |
| Both username and password required | Only one provided | Provide both or neither |

## Best Practices

1. **Test Before Applying**: Use `testProxyConfig()` to verify proxy works before applying
2. **Enable Validation**: Set `validateConnectivity: true` for automatic fallback
3. **Use SOCKS5**: Recommended for best compatibility with WhatsApp Web
4. **Secure Credentials**: Store proxy credentials securely
5. **Monitor Status**: Check account status indicators for proxy-related issues
6. **Bypass Local**: Use `bypass: '<local>'` to avoid proxying local connections

## Troubleshooting

### Proxy Not Working

1. Verify proxy server is running and accessible
2. Check firewall rules allow connection to proxy
3. Test proxy with `testProxyConfig()` method
4. Check proxy credentials if authentication is required
5. Try different proxy protocol (SOCKS5 vs HTTP)

### Authentication Failures

1. Verify username and password are correct
2. Check if proxy requires specific authentication method
3. Some proxies may not support authentication with certain protocols

### Connection Timeouts

1. Increase timeout if proxy is slow
2. Check network connectivity to proxy server
3. Verify proxy server is not overloaded
4. Consider using a different proxy server

## Security Considerations

1. **Credential Storage**: Proxy credentials are stored in memory and configuration files
2. **Encryption**: Use HTTPS or SOCKS5 for encrypted proxy connections
3. **Isolation**: Each account's proxy is completely isolated from others
4. **Authentication**: Basic authentication is used for proxy credentials
5. **Bypass Rules**: Configure bypass rules to avoid proxying sensitive local traffic

## Integration with Account Configuration

Proxy settings are part of the account configuration:

```javascript
const accountConfig = {
  id: 'acc_001',
  name: 'Business Account',
  proxy: {
    enabled: true,
    protocol: 'socks5',
    host: '127.0.0.1',
    port: 1080,
    username: 'user',
    password: 'pass'
  },
  // ... other account settings
};

// Create session with proxy
const result = await sessionManager.createSession(accountConfig.id, {
  proxy: accountConfig.proxy
});
```

## Logging

The SessionManager logs all proxy-related operations:

```
[2024-01-15T10:30:00.000Z] [SessionManager] [INFO] Configuring proxy for account acc_001
[2024-01-15T10:30:00.100Z] [SessionManager] [INFO] Proxy configured successfully for account acc_001: socks5://127.0.0.1:1080
```

Enable debug logging to see detailed proxy operations and troubleshoot issues.
