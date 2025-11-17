# Memory Management Guide

## Overview

The ViewManager implements comprehensive memory management features to optimize resource usage in the single-window multi-account architecture. This guide explains how memory management works and how to configure it.

## Features

### 1. View Pooling

View pooling reduces the overhead of creating and destroying BrowserViews by reusing them.

**How it works:**
- When a view is no longer needed, it's added to a pool instead of being destroyed
- When a new view is needed, a pooled view is reused if available
- Pooled views are cleaned (cache cleared, navigated to blank page) before reuse
- Pool has a configurable maximum size

**Configuration:**
```javascript
const viewManager = new ViewManager(mainWindow, sessionManager, {
  viewPoolSize: 2  // Maximum number of views to keep in pool
});
```

**Benefits:**
- Faster view creation (reuse existing views)
- Reduced memory allocation overhead
- Smoother user experience when switching accounts

### 2. Memory Usage Monitoring

Automatic monitoring of memory usage for each BrowserView.

**Features:**
- Tracks JavaScript heap usage per view
- Calculates total memory usage across all views
- Identifies high-memory views
- Provides detailed memory statistics

**Usage:**
```javascript
// Get memory usage for all views
const memoryUsage = await viewManager.getMemoryUsage();
console.log(`Total memory: ${memoryUsage.totalMemory}MB`);

// Get memory usage for specific view
const viewMemory = await viewManager.getViewMemoryUsage('account1');
console.log(`View memory: ${viewMemory.usedJSHeapSize}MB`);

// Get memory statistics summary
const stats = await viewManager.getMemoryStats();
console.log(`Average memory per view: ${stats.averageMemoryMB}MB`);
console.log(`High memory views: ${stats.highMemoryViews.length}`);
```

### 3. Memory Limits

Configurable memory limits per BrowserView with automatic enforcement.

**Configuration:**
```javascript
const viewManager = new ViewManager(mainWindow, sessionManager, {
  memoryWarningThreshold: 300,  // Warning at 300MB
  maxMemoryPerView: 500,         // Maximum 500MB per view
  autoMemoryCleanup: true        // Enable automatic cleanup
});

// Update limits at runtime
viewManager.setMemoryLimits({
  warningThreshold: 250,
  maxMemory: 450,
  autoCleanupEnabled: true
});
```

**Behavior:**
- **Warning Threshold**: Logs warning and notifies renderer when exceeded
- **Maximum Memory**: Automatically reloads view when exceeded (if auto-cleanup enabled)
- **Auto Cleanup**: Enables/disables automatic memory management

### 4. Automatic View Cleanup

Automatically manages inactive views to free memory.

**Features:**
- Tracks last access time for each view
- Identifies inactive views based on configurable threshold
- Pools or destroys inactive views to free memory
- Never cleans up the active view

**Usage:**
```javascript
// Manual optimization
const results = await viewManager.optimizeMemory({
  inactiveThreshold: 5 * 60 * 1000  // 5 minutes
});

console.log(`Optimized: ${results.destroyed} destroyed, ${results.pooled} pooled`);
```

**Automatic optimization:**
Memory monitoring runs every minute and automatically handles high-memory views.

### 5. View Limit Enforcement

Limits the number of concurrent active views to prevent excessive memory usage.

**Configuration:**
```javascript
const viewManager = new ViewManager(mainWindow, sessionManager, {
  maxConcurrentViews: 10  // Maximum 10 active views
});
```

**Behavior:**
- When creating a new view would exceed the limit, least recently used views are pooled/destroyed
- Active view is never removed
- Ensures memory usage stays within reasonable bounds

### 6. Cache Management

Tools to clear caches and free memory for specific views.

**Usage:**
```javascript
// Clear cache for a view
await viewManager.clearViewCache('account1');

// Force garbage collection (if available)
await viewManager.forceGarbageCollection('account1');
```

## Memory Management Workflow

### Automatic Memory Management

1. **Monitoring** (every 60 seconds):
   - Check memory usage for all views
   - Identify views exceeding warning threshold
   - Identify views exceeding maximum limit

2. **Warning Phase**:
   - Log warning message
   - Notify renderer process
   - No automatic action taken

3. **Critical Phase**:
   - Log error message
   - Notify renderer process
   - Automatically reload view (if auto-cleanup enabled)
   - Clear cache and force garbage collection

4. **Cleanup Phase** (when creating new views):
   - Check if at view limit
   - Pool least recently used views
   - Destroy oldest pooled views if pool is full

### Manual Memory Management

```javascript
// Get current memory status
const stats = await viewManager.getMemoryStats();

// Optimize memory manually
const results = await viewManager.optimizeMemory({
  inactiveThreshold: 5 * 60 * 1000
});

// Clean up stale pooled views
const cleaned = viewManager.cleanupStalePooledViews(5 * 60 * 1000);

// Clear cache for specific view
await viewManager.clearViewCache('account1');

// Force garbage collection
await viewManager.forceGarbageCollection('account1');
```

## Performance Statistics

Get detailed performance and memory statistics:

```javascript
// Performance stats
const perfStats = viewManager.getPerformanceStats();
console.log('Total views:', perfStats.totalViews);
console.log('Pooled views:', perfStats.pooledViews);
console.log('Memory monitoring:', perfStats.memoryMonitoring);

// Pool stats
const poolStats = viewManager.getPoolStats();
console.log('Pool size:', poolStats.size);
console.log('Pool max size:', poolStats.maxSize);

// Memory stats
const memStats = await viewManager.getMemoryStats();
console.log('Total memory:', memStats.totalMemoryMB, 'MB');
console.log('Average memory:', memStats.averageMemoryMB, 'MB');
console.log('High memory views:', memStats.highMemoryViews);
```

## Best Practices

### 1. Configure Appropriate Limits

```javascript
// For systems with limited memory (< 8GB RAM)
const viewManager = new ViewManager(mainWindow, sessionManager, {
  maxConcurrentViews: 5,
  viewPoolSize: 2,
  memoryWarningThreshold: 200,
  maxMemoryPerView: 350
});

// For systems with ample memory (>= 16GB RAM)
const viewManager = new ViewManager(mainWindow, sessionManager, {
  maxConcurrentViews: 15,
  viewPoolSize: 3,
  memoryWarningThreshold: 400,
  maxMemoryPerView: 600
});
```

### 2. Monitor Memory Usage

```javascript
// Periodic memory checks
setInterval(async () => {
  const stats = await viewManager.getMemoryStats();
  
  if (stats.highMemoryViews.length > 0) {
    console.warn('High memory views detected:', stats.highMemoryViews);
  }
  
  if (stats.totalMemoryMB > 2000) {
    console.warn('Total memory usage high:', stats.totalMemoryMB, 'MB');
    await viewManager.optimizeMemory();
  }
}, 5 * 60 * 1000); // Every 5 minutes
```

### 3. Handle Memory Events

```javascript
// Listen for memory warnings from ViewManager
ipcMain.on('view-manager:memory-warning', (event, data) => {
  console.warn(`Memory warning for ${data.accountId}: ${data.usage}MB`);
  // Optionally notify user
});

ipcMain.on('view-manager:memory-critical', (event, data) => {
  console.error(`Critical memory for ${data.accountId}: ${data.usage}MB`);
  // View will be automatically reloaded
});
```

### 4. Clean Up on Exit

```javascript
// Proper cleanup when application closes
app.on('before-quit', async () => {
  // Stop memory monitoring
  viewManager.stopMemoryMonitoring();
  
  // Clear view pool
  viewManager.clearViewPool();
  
  // Destroy all views
  await viewManager.destroyAllViews();
});
```

### 5. Optimize for User Patterns

```javascript
// Pre-render frequently used accounts
const frequentAccounts = ['account1', 'account2', 'account3'];
for (const accountId of frequentAccounts) {
  await viewManager.preRenderView(accountId);
}

// Optimize memory based on usage patterns
setInterval(async () => {
  // Clean up views inactive for more than 10 minutes
  await viewManager.optimizeMemory({
    inactiveThreshold: 10 * 60 * 1000
  });
  
  // Clean up stale pooled views
  viewManager.cleanupStalePooledViews(5 * 60 * 1000);
}, 15 * 60 * 1000); // Every 15 minutes
```

## Troubleshooting

### High Memory Usage

**Symptoms:**
- Application becomes slow
- System memory usage is high
- Views become unresponsive

**Solutions:**
1. Check memory statistics:
   ```javascript
   const stats = await viewManager.getMemoryStats();
   console.log('High memory views:', stats.highMemoryViews);
   ```

2. Reduce concurrent views:
   ```javascript
   viewManager.setMemoryLimits({
     maxMemory: 400  // Lower limit
   });
   ```

3. Optimize memory manually:
   ```javascript
   await viewManager.optimizeMemory({
     inactiveThreshold: 3 * 60 * 1000  // More aggressive
   });
   ```

4. Clear caches:
   ```javascript
   for (const accountId of highMemoryAccounts) {
     await viewManager.clearViewCache(accountId);
   }
   ```

### Memory Leaks

**Symptoms:**
- Memory usage continuously increases
- Application performance degrades over time

**Solutions:**
1. Enable automatic cleanup:
   ```javascript
   viewManager.setMemoryLimits({
     autoCleanupEnabled: true
   });
   ```

2. Periodic cleanup:
   ```javascript
   setInterval(async () => {
     await viewManager.optimizeMemory();
     viewManager.cleanupStalePooledViews();
   }, 30 * 60 * 1000); // Every 30 minutes
   ```

3. Monitor for leaks:
   ```javascript
   const initialMemory = await viewManager.getMemoryStats();
   
   setTimeout(async () => {
     const currentMemory = await viewManager.getMemoryStats();
     const increase = currentMemory.totalMemoryMB - initialMemory.totalMemoryMB;
     
     if (increase > 500) {
       console.warn('Possible memory leak detected');
     }
   }, 60 * 60 * 1000); // After 1 hour
   ```

### Pool Not Working

**Symptoms:**
- Views are destroyed instead of pooled
- Pool size remains at 0

**Solutions:**
1. Check pool configuration:
   ```javascript
   const poolStats = viewManager.getPoolStats();
   console.log('Pool max size:', poolStats.maxSize);
   ```

2. Increase pool size:
   ```javascript
   // Recreate ViewManager with larger pool
   const viewManager = new ViewManager(mainWindow, sessionManager, {
     viewPoolSize: 3
   });
   ```

3. Check for errors during pooling:
   ```javascript
   const pooled = await viewManager._poolView('account1');
   if (!pooled) {
     console.error('Failed to pool view');
   }
   ```

## API Reference

### Configuration Options

```typescript
interface ViewManagerOptions {
  // View pooling
  viewPoolSize?: number;              // Default: 2
  
  // View limits
  maxConcurrentViews?: number;        // Default: 10
  
  // Memory limits
  memoryWarningThreshold?: number;    // Default: 300 (MB)
  maxMemoryPerView?: number;          // Default: 500 (MB)
  autoMemoryCleanup?: boolean;        // Default: true
  
  // Other options
  lazyLoadViews?: boolean;            // Default: true
  debounceDelay?: number;             // Default: 100 (ms)
}
```

### Memory Management Methods

```typescript
// Get memory usage
getMemoryUsage(): Promise<MemoryUsage>
getViewMemoryUsage(accountId: string): Promise<ViewMemory>
getMemoryStats(): Promise<MemoryStats>

// Memory limits
setMemoryLimits(limits: MemoryLimits): void
getMemoryLimits(): MemoryLimits

// Memory monitoring
stopMemoryMonitoring(): void

// Memory optimization
optimizeMemory(options?: OptimizeOptions): Promise<OptimizeResults>
clearViewCache(accountId: string): Promise<boolean>
forceGarbageCollection(accountId: string): Promise<boolean>

// View pooling
getPoolStats(): PoolStats
clearViewPool(): number
cleanupStalePooledViews(maxAge?: number): number

// Performance stats
getPerformanceStats(): PerformanceStats
```

## Conclusion

The memory management system provides comprehensive tools to optimize resource usage in the multi-account architecture. By configuring appropriate limits, monitoring memory usage, and leveraging automatic cleanup, you can ensure smooth performance even with many accounts.

For more information, see:
- [Performance Optimization Guide](./PERFORMANCE_OPTIMIZATION_GUIDE.md)
- [ViewManager API Documentation](./API.md#viewmanager)
