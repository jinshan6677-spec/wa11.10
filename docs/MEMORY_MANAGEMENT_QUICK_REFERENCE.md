# Memory Management Quick Reference

## Configuration

```javascript
const viewManager = new ViewManager(mainWindow, sessionManager, {
  // View pooling
  viewPoolSize: 2,                    // Pool size
  
  // View limits
  maxConcurrentViews: 10,             // Max active views
  
  // Memory limits
  memoryWarningThreshold: 300,        // Warning at 300MB
  maxMemoryPerView: 500,              // Max 500MB per view
  autoMemoryCleanup: true             // Auto cleanup enabled
});
```

## Common Operations

### Get Memory Usage

```javascript
// All views
const usage = await viewManager.getMemoryUsage();

// Specific view
const viewMemory = await viewManager.getViewMemoryUsage('account1');

// Summary stats
const stats = await viewManager.getMemoryStats();
```

### Set Memory Limits

```javascript
viewManager.setMemoryLimits({
  warningThreshold: 250,
  maxMemory: 450,
  autoCleanupEnabled: true
});
```

### Optimize Memory

```javascript
// Manual optimization
await viewManager.optimizeMemory({
  inactiveThreshold: 5 * 60 * 1000  // 5 minutes
});

// Clear cache
await viewManager.clearViewCache('account1');

// Force GC
await viewManager.forceGarbageCollection('account1');
```

### View Pooling

```javascript
// Get pool stats
const poolStats = viewManager.getPoolStats();

// Clear pool
viewManager.clearViewPool();

// Clean stale views
viewManager.cleanupStalePooledViews(5 * 60 * 1000);
```

### Performance Stats

```javascript
const stats = viewManager.getPerformanceStats();
console.log('Total views:', stats.totalViews);
console.log('Pooled views:', stats.pooledViews);
console.log('Memory monitoring:', stats.memoryMonitoring);
```

## Memory Events

```javascript
// Warning event
ipcMain.on('view-manager:memory-warning', (event, data) => {
  console.warn(`Memory warning: ${data.accountId} - ${data.usage}MB`);
});

// Critical event
ipcMain.on('view-manager:memory-critical', (event, data) => {
  console.error(`Memory critical: ${data.accountId} - ${data.usage}MB`);
});
```

## Recommended Settings

### Low Memory Systems (< 8GB RAM)

```javascript
{
  maxConcurrentViews: 5,
  viewPoolSize: 2,
  memoryWarningThreshold: 200,
  maxMemoryPerView: 350,
  autoMemoryCleanup: true
}
```

### Normal Systems (8-16GB RAM)

```javascript
{
  maxConcurrentViews: 10,
  viewPoolSize: 2,
  memoryWarningThreshold: 300,
  maxMemoryPerView: 500,
  autoMemoryCleanup: true
}
```

### High Memory Systems (>= 16GB RAM)

```javascript
{
  maxConcurrentViews: 15,
  viewPoolSize: 3,
  memoryWarningThreshold: 400,
  maxMemoryPerView: 600,
  autoMemoryCleanup: true
}
```

## Troubleshooting

### High Memory Usage

```javascript
// Check stats
const stats = await viewManager.getMemoryStats();

// Optimize
await viewManager.optimizeMemory({ inactiveThreshold: 3 * 60 * 1000 });

// Clear caches
for (const view of stats.highMemoryViews) {
  await viewManager.clearViewCache(view.accountId);
}
```

### Memory Leaks

```javascript
// Enable auto cleanup
viewManager.setMemoryLimits({ autoCleanupEnabled: true });

// Periodic cleanup
setInterval(async () => {
  await viewManager.optimizeMemory();
  viewManager.cleanupStalePooledViews();
}, 30 * 60 * 1000);
```

## Testing

```bash
# Run memory management tests
node scripts/test-memory-management.js
```

## Key Features

- ✅ View pooling for faster creation
- ✅ Automatic memory monitoring
- ✅ Configurable memory limits
- ✅ Automatic cleanup of high-memory views
- ✅ View limit enforcement
- ✅ Cache management
- ✅ Performance statistics
- ✅ Stale pool cleanup

## See Also

- [Memory Management Guide](./MEMORY_MANAGEMENT_GUIDE.md)
- [Performance Optimization Guide](./PERFORMANCE_OPTIMIZATION_GUIDE.md)
