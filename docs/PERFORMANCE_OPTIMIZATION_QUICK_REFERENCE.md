# Performance Optimization Quick Reference

## Quick Start

```javascript
// Create ViewManager with optimizations enabled
const viewManager = new ViewManager(mainWindow, sessionManager, {
  lazyLoadViews: true,        // ✅ Enable lazy loading
  maxConcurrentViews: 10,     // ✅ Limit concurrent views
  viewPoolSize: 2,            // ✅ Enable view pooling
  debounceDelay: 100          // ✅ Debounce resize operations
});
```

## Key Features

### 1. Lazy Loading
```javascript
// Views created only on first access
await viewManager.switchView('account-1');  // Creates view
await viewManager.switchView('account-1');  // Reuses view
```

### 2. Bounds Caching
```javascript
// Automatic caching
const bounds = viewManager._calculateViewBounds(280);

// Invalidate when needed
viewManager.invalidateBoundsCache();
```

### 3. Memory Management
```javascript
// Automatic enforcement of view limits
// Least recently used views are destroyed/pooled

// Manual optimization
await viewManager.optimizeMemory({
  inactiveThreshold: 5 * 60 * 1000  // 5 minutes
});

// Clear pool
viewManager.clearViewPool();
```

### 4. Pre-rendering
```javascript
// Pre-render for faster switching
await viewManager.preRenderView('account-2');
```

### 5. Performance Stats
```javascript
// Get statistics
const stats = viewManager.getPerformanceStats();
const memory = await viewManager.getMemoryUsage();
```

## Performance Utilities

```javascript
const PerformanceOptimizer = require('./utils/PerformanceOptimizer');

// Debounce
const debounced = PerformanceOptimizer.debounce(func, 100, 'key');

// Throttle
const throttled = PerformanceOptimizer.throttle(func, 1000, 'key');

// Memoize
const memoized = PerformanceOptimizer.memoize(func, {
  maxAge: 60000,
  maxSize: 100
});

// Lazy
const lazy = PerformanceOptimizer.lazy(() => expensiveComputation());
const value = lazy.get();

// Rate Limiter
const limiter = PerformanceOptimizer.createRateLimiter(10, 1000);
if (limiter.check()) { /* do operation */ }
```

## Sidebar Optimization

```javascript
// Use document fragment for batch updates
const fragment = document.createDocumentFragment();
accounts.forEach(account => {
  fragment.appendChild(createAccountItem(account));
});
accountList.appendChild(fragment);

// Targeted updates
function updateAccountStatus(accountId, status) {
  const statusElement = item.querySelector('.account-status');
  statusElement.classList.remove('online', 'offline', 'error');
  statusElement.classList.add(status);
}

// Debounced updates
const updateTimer = setTimeout(() => {
  renderAccountList();
}, 100);
```

## Configuration Recommendations

### Light Users (1-5 accounts)
```javascript
{
  lazyLoadViews: true,
  maxConcurrentViews: 5,
  viewPoolSize: 1,
  debounceDelay: 100
}
```

### Medium Users (5-10 accounts)
```javascript
{
  lazyLoadViews: true,
  maxConcurrentViews: 10,
  viewPoolSize: 2,
  debounceDelay: 100
}
```

### Heavy Users (10+ accounts)
```javascript
{
  lazyLoadViews: true,
  maxConcurrentViews: 15,
  viewPoolSize: 3,
  debounceDelay: 150
}
```

## Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| View switching | <100ms | ✅ |
| Sidebar render (50 accounts) | <50ms | ✅ |
| Memory per view | ~150-200MB | ✅ |
| Startup time | <2s | ✅ |
| Window resize | <50ms | ✅ |

## Common Operations

### Check Memory Usage
```javascript
const usage = await viewManager.getMemoryUsage();
console.log(`Total views: ${usage.totalViews}`);
console.log(`Pooled views: ${usage.pooledViews}`);
```

### Optimize Memory
```javascript
const results = await viewManager.optimizeMemory({
  inactiveThreshold: 5 * 60 * 1000
});
console.log(`Destroyed: ${results.destroyed}, Pooled: ${results.pooled}`);
```

### Get Performance Stats
```javascript
const stats = viewManager.getPerformanceStats();
console.log(`Active views: ${stats.totalViews}`);
console.log(`Lazy loading: ${stats.lazyLoadEnabled}`);
console.log(`Cache valid: ${stats.boundsCache.isValid}`);
```

### Pre-render View
```javascript
// Pre-render next likely view
await viewManager.preRenderView(nextAccountId);
```

### Clear View Pool
```javascript
const destroyed = viewManager.clearViewPool();
console.log(`Cleared ${destroyed} pooled views`);
```

## Testing

```bash
# Run performance tests
node scripts/test-performance-optimization.js
```

## Troubleshooting

### High Memory
```javascript
// 1. Check usage
const usage = await viewManager.getMemoryUsage();

// 2. Optimize
await viewManager.optimizeMemory();

// 3. Clear pool
viewManager.clearViewPool();

// 4. Lower limits
maxConcurrentViews: 5
```

### Slow Switching
```javascript
// 1. Pre-render
await viewManager.preRenderView(accountId);

// 2. Check stats
const stats = viewManager.getPerformanceStats();

// 3. Reduce views
maxConcurrentViews: 5
```

### Slow Sidebar
```javascript
// 1. Use targeted updates
updateAccountStatus(accountId, status);

// 2. Increase debounce
DEBOUNCE_DELAY = 200;

// 3. Use document fragments
const fragment = document.createDocumentFragment();
```

## API Reference

### ViewManager Methods
- `switchView(accountId, options)` - Switch to account (lazy loads if needed)
- `preRenderView(accountId)` - Pre-render view for faster switching
- `optimizeMemory(options)` - Clean up inactive views
- `getPerformanceStats()` - Get performance statistics
- `getMemoryUsage()` - Get memory usage info
- `clearViewPool()` - Clear pooled views
- `invalidateBoundsCache()` - Invalidate bounds cache

### PerformanceOptimizer Methods
- `debounce(func, wait, key)` - Debounce function
- `throttle(func, wait, key)` - Throttle function
- `memoize(func, options)` - Memoize function
- `lazy(factory)` - Create lazy value
- `createRateLimiter(max, window)` - Create rate limiter
- `getCacheStats()` - Get cache statistics
- `getMemoryUsage()` - Get memory usage (Node.js)

## See Also

- [Performance Optimization Guide](./PERFORMANCE_OPTIMIZATION_GUIDE.md) - Detailed guide
- [ViewManager API](./API.md#viewmanager) - Full API documentation
- [Testing Guide](./DEVELOPER_GUIDE.md#testing) - Testing documentation
