# Test Results Report

**Generated**: 2025-11-17T05:40:51.950Z

## Summary

- **Total Tests**: 23
- **Passed**: 7 ✓
- **Failed**: 11 ✗
- **Warnings**: 5 ⚠
- **Skipped**: 0 ⊘
- **Pass Rate**: 30.43%

## Verdict: ✗ NOT READY FOR RELEASE

11 critical test(s) failed.

## Passed Tests

- ✓ Migration Detection
- ✓ Configuration Migration
- ✓ Session Data Migration
- ✓ Preload Main
- ✓ Error Handling
- ✓ Edge Case Validation
- ✓ Recovery Mechanisms

## Failed Tests (Critical)

### ✗ Requirements Verification

**Error**: Command failed: node "E:\WhatsApps\wa11.9\wa11.10\scripts\verify-requirements.js"

**Output**:
```
================================================================================
REQUIREMENTS VERIFICATION
================================================================================


Requirement 1: Single Main Window Architecture
--------------------------------------------------------------------------------
  ✓ [1.1] Main Window created as sole primary window - PASS
  ✓ [1.2] Main Window contains Account Sidebar and Session Area - PASS
  ✓ [1.3] Main Window loads custom UI shell, not Wh
```

### ✗ Unit Tests

**Error**: spawnSync C:\WINDOWS\system32\cmd.exe ETIMEDOUT

**Output**:
```
============================================================
运行核心组件单元测试
============================================================


运行测试: src/managers/__tests__/AccountConfigManager.test.js
------------------------------------------------------------
✓ 通过: 0 个测试

运行测试: src/managers/__tests__/SessionManager.test.js
------------------------------------------------------------
✓ 通过: 0 个测试

运行测试: src/managers/__tests__/TranslationIntegration.test.js
-----------------------------------------------
```

### ✗ Account Management

**Error**: Command failed: node "E:\WhatsApps\wa11.9\wa11.10\scripts\test-setup.js"

**Output**:
```

============================================================
[34mWhatsApp Desktop - 测试环境检查[0m
============================================================

[34m1. 检查 Node.js 版本...[0m
[32m   ✓ Node.js 版本: v22.20.0 (满足要求)[0m
[34m
2. 检查 npm 版本...[0m
[32m   ✓ npm 版本: 11.6.1[0m
[34m
3. 检查项目依赖...[0m
[32m   ✓ package.json 存在[0m
[32m   ✓ node_modules 目录存在[0m
[32m   ✓ electron 已安装[0m
[31m   ✗ whatsapp-web.js 未安装[0m
[33m   提示: 运行 "npm install" 安装依赖[0m
[34m
4. 检查源代码文件...[0m
[32m  
```

### ✗ Session Isolation

**Error**: Command failed: node "E:\WhatsApps\wa11.9\wa11.10\scripts\test-session-isolation.js"
E:\WhatsApps\wa11.9\wa11.10\scripts\test-session-isolation.js:671
app.on('window-all-closed', () => {
    ^

TypeError: Cannot read properties of undefined (reading 'on')
    at Object.<anonymous> (E:\WhatsApps\wa11.9\wa11.10\scripts\test-session-isolation.js:671:5)
    at Module._compile (node:internal/modules/cjs/loader:1706:14)
    at Object..js (node:internal/modules/cjs/loader:1839:10)
    at Module.load (node:internal/modules/cjs/loader:1441:32)
    at Function._load (node:internal/modules/cjs/loader:1263:12)
    at TracingChannel.traceSync (node:diagnostics_channel:322:14)
    at wrapModuleLoad (node:internal/modules/cjs/loader:237:24)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:171:5)
    at node:internal/main/run_main_module:36:49

Node.js v22.20.0


**Output**:
```
E:\WhatsApps\wa11.9\wa11.10\scripts\test-session-isolation.js:671
app.on('window-all-closed', () => {
    ^

TypeError: Cannot read properties of undefined (reading 'on')
    at Object.<anonymous> (E:\WhatsApps\wa11.9\wa11.10\scripts\test-session-isolation.js:671:5)
    at Module._compile (node:internal/modules/cjs/loader:1706:14)
    at Object..js (node:internal/modules/cjs/loader:1839:10)
    at Module.load (node:internal/modules/cjs/loader:1441:32)
    at Function._load (node:interna
```

### ✗ Session Persistence

**Error**: Command failed: node "E:\WhatsApps\wa11.9\wa11.10\scripts\test-session-persistence.js"
This script must be run in an Electron environment


**Output**:
```
This script must be run in an Electron environment

```

### ✗ Proxy Configuration

**Error**: Command failed: node "E:\WhatsApps\wa11.9\wa11.10\scripts\test-proxy-config.js"
E:\WhatsApps\wa11.9\wa11.10\scripts\test-proxy-config.js:283
app.whenReady().then(() => {
    ^

TypeError: Cannot read properties of undefined (reading 'whenReady')
    at Object.<anonymous> (E:\WhatsApps\wa11.9\wa11.10\scripts\test-proxy-config.js:283:5)
    at Module._compile (node:internal/modules/cjs/loader:1706:14)
    at Object..js (node:internal/modules/cjs/loader:1839:10)
    at Module.load (node:internal/modules/cjs/loader:1441:32)
    at Function._load (node:internal/modules/cjs/loader:1263:12)
    at TracingChannel.traceSync (node:diagnostics_channel:322:14)
    at wrapModuleLoad (node:internal/modules/cjs/loader:237:24)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:171:5)
    at node:internal/main/run_main_module:36:49

Node.js v22.20.0


**Output**:
```
E:\WhatsApps\wa11.9\wa11.10\scripts\test-proxy-config.js:283
app.whenReady().then(() => {
    ^

TypeError: Cannot read properties of undefined (reading 'whenReady')
    at Object.<anonymous> (E:\WhatsApps\wa11.9\wa11.10\scripts\test-proxy-config.js:283:5)
    at Module._compile (node:internal/modules/cjs/loader:1706:14)
    at Object..js (node:internal/modules/cjs/loader:1839:10)
    at Module.load (node:internal/modules/cjs/loader:1441:32)
    at Function._load (node:internal/modules/
```

### ✗ Translation Integration

**Error**: Command failed: node "E:\WhatsApps\wa11.9\wa11.10\scripts\test-translation-integration.js"
E:\WhatsApps\wa11.9\wa11.10\scripts\test-translation-integration.js:310
app.whenReady().then(() => {
    ^

TypeError: Cannot read properties of undefined (reading 'whenReady')
    at Object.<anonymous> (E:\WhatsApps\wa11.9\wa11.10\scripts\test-translation-integration.js:310:5)
    at Module._compile (node:internal/modules/cjs/loader:1706:14)
    at Object..js (node:internal/modules/cjs/loader:1839:10)
    at Module.load (node:internal/modules/cjs/loader:1441:32)
    at Function._load (node:internal/modules/cjs/loader:1263:12)
    at TracingChannel.traceSync (node:diagnostics_channel:322:14)
    at wrapModuleLoad (node:internal/modules/cjs/loader:237:24)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:171:5)
    at node:internal/main/run_main_module:36:49

Node.js v22.20.0


**Output**:
```
E:\WhatsApps\wa11.9\wa11.10\scripts\test-translation-integration.js:310
app.whenReady().then(() => {
    ^

TypeError: Cannot read properties of undefined (reading 'whenReady')
    at Object.<anonymous> (E:\WhatsApps\wa11.9\wa11.10\scripts\test-translation-integration.js:310:5)
    at Module._compile (node:internal/modules/cjs/loader:1706:14)
    at Object..js (node:internal/modules/cjs/loader:1839:10)
    at Module.load (node:internal/modules/cjs/loader:1441:32)
    at Function._load (
```

### ✗ Translation Routing

**Error**: Command failed: node "E:\WhatsApps\wa11.9\wa11.10\scripts\test-translation-routing.js"
E:\WhatsApps\wa11.9\wa11.10\scripts\test-translation-routing.js:16
app.setPath('userData', testDataPath);
    ^

TypeError: Cannot read properties of undefined (reading 'setPath')
    at Object.<anonymous> (E:\WhatsApps\wa11.9\wa11.10\scripts\test-translation-routing.js:16:5)
    at Module._compile (node:internal/modules/cjs/loader:1706:14)
    at Object..js (node:internal/modules/cjs/loader:1839:10)
    at Module.load (node:internal/modules/cjs/loader:1441:32)
    at Function._load (node:internal/modules/cjs/loader:1263:12)
    at TracingChannel.traceSync (node:diagnostics_channel:322:14)
    at wrapModuleLoad (node:internal/modules/cjs/loader:237:24)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:171:5)
    at node:internal/main/run_main_module:36:49

Node.js v22.20.0


**Output**:
```
E:\WhatsApps\wa11.9\wa11.10\scripts\test-translation-routing.js:16
app.setPath('userData', testDataPath);
    ^

TypeError: Cannot read properties of undefined (reading 'setPath')
    at Object.<anonymous> (E:\WhatsApps\wa11.9\wa11.10\scripts\test-translation-routing.js:16:5)
    at Module._compile (node:internal/modules/cjs/loader:1706:14)
    at Object..js (node:internal/modules/cjs/loader:1839:10)
    at Module.load (node:internal/modules/cjs/loader:1441:32)
    at Function._load (no
```

### ✗ Status Monitoring

**Error**: Command failed: node "E:\WhatsApps\wa11.9\wa11.10\scripts\test-status-monitoring.js"
E:\WhatsApps\wa11.9\wa11.10\scripts\test-status-monitoring.js:291
app.whenReady().then(() => {
    ^

TypeError: Cannot read properties of undefined (reading 'whenReady')
    at Object.<anonymous> (E:\WhatsApps\wa11.9\wa11.10\scripts\test-status-monitoring.js:291:5)
    at Module._compile (node:internal/modules/cjs/loader:1706:14)
    at Object..js (node:internal/modules/cjs/loader:1839:10)
    at Module.load (node:internal/modules/cjs/loader:1441:32)
    at Function._load (node:internal/modules/cjs/loader:1263:12)
    at TracingChannel.traceSync (node:diagnostics_channel:322:14)
    at wrapModuleLoad (node:internal/modules/cjs/loader:237:24)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:171:5)
    at node:internal/main/run_main_module:36:49

Node.js v22.20.0


**Output**:
```
E:\WhatsApps\wa11.9\wa11.10\scripts\test-status-monitoring.js:291
app.whenReady().then(() => {
    ^

TypeError: Cannot read properties of undefined (reading 'whenReady')
    at Object.<anonymous> (E:\WhatsApps\wa11.9\wa11.10\scripts\test-status-monitoring.js:291:5)
    at Module._compile (node:internal/modules/cjs/loader:1706:14)
    at Object..js (node:internal/modules/cjs/loader:1839:10)
    at Module.load (node:internal/modules/cjs/loader:1441:32)
    at Function._load (node:interna
```

### ✗ Single Window Main

**Error**: Command failed: node "E:\WhatsApps\wa11.9\wa11.10\scripts\test-single-window-main.js"

**Output**:
```
========================================
Testing Single-Window Main.js Integration
========================================

Test 1: Checking main.js file...
✓ main.js file exists and is readable

Test 2: Checking single-window imports...
  ✓ MainWindow imported
  ✓ ViewManager imported
  ✓ MigrationManager imported
  ✓ MigrationDialog imported
  ✓ registerSingleWindowIPCHandlers imported
✓ All required imports present

Test 3: Checking old multi-window components removed...
  ✓ InstanceManager 
```

### ✗ Lifecycle Management

**Error**: Command failed: node "E:\WhatsApps\wa11.9\wa11.10\scripts\test-lifecycle-management.js"
E:\WhatsApps\wa11.9\wa11.10\scripts\test-lifecycle-management.js:352
app.whenReady().then(runTests);
    ^

TypeError: Cannot read properties of undefined (reading 'whenReady')
    at Object.<anonymous> (E:\WhatsApps\wa11.9\wa11.10\scripts\test-lifecycle-management.js:352:5)
    at Module._compile (node:internal/modules/cjs/loader:1706:14)
    at Object..js (node:internal/modules/cjs/loader:1839:10)
    at Module.load (node:internal/modules/cjs/loader:1441:32)
    at Function._load (node:internal/modules/cjs/loader:1263:12)
    at TracingChannel.traceSync (node:diagnostics_channel:322:14)
    at wrapModuleLoad (node:internal/modules/cjs/loader:237:24)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:171:5)
    at node:internal/main/run_main_module:36:49

Node.js v22.20.0


**Output**:
```
E:\WhatsApps\wa11.9\wa11.10\scripts\test-lifecycle-management.js:352
app.whenReady().then(runTests);
    ^

TypeError: Cannot read properties of undefined (reading 'whenReady')
    at Object.<anonymous> (E:\WhatsApps\wa11.9\wa11.10\scripts\test-lifecycle-management.js:352:5)
    at Module._compile (node:internal/modules/cjs/loader:1706:14)
    at Object..js (node:internal/modules/cjs/loader:1839:10)
    at Module.load (node:internal/modules/cjs/loader:1441:32)
    at Function._load (nod
```

## Warnings (Non-Critical)

### ⚠ Login Status Detection

**Error**: Command failed: node "E:\WhatsApps\wa11.9\wa11.10\scripts\test-login-status-detection.js"
E:\WhatsApps\wa11.9\wa11.10\scripts\test-login-status-detection.js:196
app.whenReady().then(initialize);
    ^

TypeError: Cannot read properties of undefined (reading 'whenReady')
    at Object.<anonymous> (E:\WhatsApps\wa11.9\wa11.10\scripts\test-login-status-detection.js:196:5)
    at Module._compile (node:internal/modules/cjs/loader:1706:14)
    at Object..js (node:internal/modules/cjs/loader:1839:10)
    at Module.load (node:internal/modules/cjs/loader:1441:32)
    at Function._load (node:internal/modules/cjs/loader:1263:12)
    at TracingChannel.traceSync (node:diagnostics_channel:322:14)
    at wrapModuleLoad (node:internal/modules/cjs/loader:237:24)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:171:5)
    at node:internal/main/run_main_module:36:49

Node.js v22.20.0


### ⚠ Migration UI

**Error**: Command failed: node "E:\WhatsApps\wa11.9\wa11.10\scripts\test-migration-ui.js"
E:\WhatsApps\wa11.9\wa11.10\scripts\test-migration-ui.js:84
app.on('ready', async () => {
    ^

TypeError: Cannot read properties of undefined (reading 'on')
    at Object.<anonymous> (E:\WhatsApps\wa11.9\wa11.10\scripts\test-migration-ui.js:84:5)
    at Module._compile (node:internal/modules/cjs/loader:1706:14)
    at Object..js (node:internal/modules/cjs/loader:1839:10)
    at Module.load (node:internal/modules/cjs/loader:1441:32)
    at Function._load (node:internal/modules/cjs/loader:1263:12)
    at TracingChannel.traceSync (node:diagnostics_channel:322:14)
    at wrapModuleLoad (node:internal/modules/cjs/loader:237:24)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:171:5)
    at node:internal/main/run_main_module:36:49

Node.js v22.20.0


### ⚠ Integration Tests

**Error**: Command failed: node "E:\WhatsApps\wa11.9\wa11.10\scripts\test-integration.js"
E:\WhatsApps\wa11.9\wa11.10\scripts\test-integration.js:26
const TEST_DATA_DIR = path.join(app.getPath('userData'), 'integration-test');
                                    ^

TypeError: Cannot read properties of undefined (reading 'getPath')
    at Object.<anonymous> (E:\WhatsApps\wa11.9\wa11.10\scripts\test-integration.js:26:37)
    at Module._compile (node:internal/modules/cjs/loader:1706:14)
    at Object..js (node:internal/modules/cjs/loader:1839:10)
    at Module.load (node:internal/modules/cjs/loader:1441:32)
    at Function._load (node:internal/modules/cjs/loader:1263:12)
    at TracingChannel.traceSync (node:diagnostics_channel:322:14)
    at wrapModuleLoad (node:internal/modules/cjs/loader:237:24)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:171:5)
    at node:internal/main/run_main_module:36:49

Node.js v22.20.0


### ⚠ Performance Optimization

**Error**: Command failed: node "E:\WhatsApps\wa11.9\wa11.10\scripts\test-performance-optimization.js"
[2025-11-17T05:40:51.659Z] [ViewManager] [WARN] Session isolation validation warning for test-account-1: Partition mismatch: expected persist:account_test-account-1, got persist:test
[2025-11-17T05:40:51.659Z] [ViewManager] [ERROR] Failed to create view for account test-account-1: Error: Session mismatch: BrowserView session does not match expected session for account test-account-1
    at ViewManager.createView (E:\WhatsApps\wa11.9\wa11.10\src\single-window\ViewManager.js:377:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async ViewManager.switchView (E:\WhatsApps\wa11.9\wa11.10\src\single-window\ViewManager.js:1444:11)
    at async runTests (E:\WhatsApps\wa11.9\wa11.10\scripts\test-performance-optimization.js:133:5)
[2025-11-17T05:40:51.660Z] [ViewManager] [ERROR] View creation failure details: Session mismatch: BrowserView session does not match expected session for account test-account-1
[2025-11-17T05:40:51.660Z] [ViewManager] [ERROR] Failed to switch to account test-account-1: Error: Session mismatch: BrowserView session does not match expected session for account test-account-1
    at ViewManager.createView (E:\WhatsApps\wa11.9\wa11.10\src\single-window\ViewManager.js:377:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async ViewManager.switchView (E:\WhatsApps\wa11.9\wa11.10\src\single-window\ViewManager.js:1444:11)
    at async runTests (E:\WhatsApps\wa11.9\wa11.10\scripts\test-performance-optimization.js:133:5)
❌ Test 1 FAILED: Expected 1 view after lazy load
Error: Expected 1 view after lazy load
    at runTests (E:\WhatsApps\wa11.9\wa11.10\scripts\test-performance-optimization.js:138:13)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
[2025-11-17T05:40:51.661Z] [ViewManager] [WARN] Session isolation validation warning for account-1: Partition mismatch: expected persist:account_account-1, got persist:test
[2025-11-17T05:40:51.661Z] [ViewManager] [ERROR] Failed to create view for account account-1: Error: Session mismatch: BrowserView session does not match expected session for account account-1
    at ViewManager.createView (E:\WhatsApps\wa11.9\wa11.10\src\single-window\ViewManager.js:377:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async ViewManager.switchView (E:\WhatsApps\wa11.9\wa11.10\src\single-window\ViewManager.js:1444:11)
    at async runTests (E:\WhatsApps\wa11.9\wa11.10\scripts\test-performance-optimization.js:214:5)
[2025-11-17T05:40:51.661Z] [ViewManager] [ERROR] View creation failure details: Session mismatch: BrowserView session does not match expected session for account account-1
[2025-11-17T05:40:51.661Z] [ViewManager] [ERROR] Failed to switch to account account-1: Error: Session mismatch: BrowserView session does not match expected session for account account-1
    at ViewManager.createView (E:\WhatsApps\wa11.9\wa11.10\src\single-window\ViewManager.js:377:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async ViewManager.switchView (E:\WhatsApps\wa11.9\wa11.10\src\single-window\ViewManager.js:1444:11)
    at async runTests (E:\WhatsApps\wa11.9\wa11.10\scripts\test-performance-optimization.js:214:5)
[2025-11-17T05:40:51.662Z] [ViewManager] [WARN] Session isolation validation warning for account-2: Partition mismatch: expected persist:account_account-2, got persist:test
[2025-11-17T05:40:51.662Z] [ViewManager] [ERROR] Failed to create view for account account-2: Error: Session mismatch: BrowserView session does not match expected session for account account-2
    at ViewManager.createView (E:\WhatsApps\wa11.9\wa11.10\src\single-window\ViewManager.js:377:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async ViewManager.switchView (E:\WhatsApps\wa11.9\wa11.10\src\single-window\ViewManager.js:1444:11)
    at async runTests (E:\WhatsApps\wa11.9\wa11.10\scripts\test-performance-optimization.js:215:5)
[2025-11-17T05:40:51.662Z] [ViewManager] [ERROR] View creation failure details: Session mismatch: BrowserView session does not match expected session for account account-2
[2025-11-17T05:40:51.662Z] [ViewManager] [ERROR] Failed to switch to account account-2: Error: Session mismatch: BrowserView session does not match expected session for account account-2
    at ViewManager.createView (E:\WhatsApps\wa11.9\wa11.10\src\single-window\ViewManager.js:377:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async ViewManager.switchView (E:\WhatsApps\wa11.9\wa11.10\src\single-window\ViewManager.js:1444:11)
    at async runTests (E:\WhatsApps\wa11.9\wa11.10\scripts\test-performance-optimization.js:215:5)
[2025-11-17T05:40:51.662Z] [ViewManager] [WARN] Session isolation validation warning for account-3: Partition mismatch: expected persist:account_account-3, got persist:test
[2025-11-17T05:40:51.662Z] [ViewManager] [ERROR] Failed to create view for account account-3: Error: Session mismatch: BrowserView session does not match expected session for account account-3
    at ViewManager.createView (E:\WhatsApps\wa11.9\wa11.10\src\single-window\ViewManager.js:377:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async ViewManager.switchView (E:\WhatsApps\wa11.9\wa11.10\src\single-window\ViewManager.js:1444:11)
    at async runTests (E:\WhatsApps\wa11.9\wa11.10\scripts\test-performance-optimization.js:216:5)
[2025-11-17T05:40:51.662Z] [ViewManager] [ERROR] View creation failure details: Session mismatch: BrowserView session does not match expected session for account account-3
[2025-11-17T05:40:51.662Z] [ViewManager] [ERROR] Failed to switch to account account-3: Error: Session mismatch: BrowserView session does not match expected session for account account-3
    at ViewManager.createView (E:\WhatsApps\wa11.9\wa11.10\src\single-window\ViewManager.js:377:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async ViewManager.switchView (E:\WhatsApps\wa11.9\wa11.10\src\single-window\ViewManager.js:1444:11)
    at async runTests (E:\WhatsApps\wa11.9\wa11.10\scripts\test-performance-optimization.js:216:5)
❌ Test 3 FAILED: Expected 3 views, got 0
Error: Expected 3 views, got 0
    at runTests (E:\WhatsApps\wa11.9\wa11.10\scripts\test-performance-optimization.js:219:13)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
[2025-11-17T05:40:51.663Z] [ViewManager] [WARN] Session isolation validation warning for account-1: Partition mismatch: expected persist:account_account-1, got persist:test
[2025-11-17T05:40:51.663Z] [ViewManager] [ERROR] Failed to create view for account account-1: Error: Session mismatch: BrowserView session does not match expected session for account account-1
    at ViewManager.createView (E:\WhatsApps\wa11.9\wa11.10\src\single-window\ViewManager.js:377:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async runTests (E:\WhatsApps\wa11.9\wa11.10\scripts\test-performance-optimization.js:255:5)
[2025-11-17T05:40:51.663Z] [ViewManager] [ERROR] View creation failure details: Session mismatch: BrowserView session does not match expected session for account account-1
❌ Test 4 FAILED: Session mismatch: BrowserView session does not match expected session for account account-1
Error: Session mismatch: BrowserView session does not match expected session for account account-1
    at ViewManager.createView (E:\WhatsApps\wa11.9\wa11.10\src\single-window\ViewManager.js:377:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async runTests (E:\WhatsApps\wa11.9\wa11.10\scripts\test-performance-optimization.js:255:5)
[2025-11-17T05:40:51.832Z] [ViewManager] [WARN] Session isolation validation warning for account-1: Partition mismatch: expected persist:account_account-1, got persist:test
[2025-11-17T05:40:51.832Z] [ViewManager] [ERROR] Failed to create view for account account-1: Error: Session mismatch: BrowserView session does not match expected session for account account-1
    at ViewManager.createView (E:\WhatsApps\wa11.9\wa11.10\src\single-window\ViewManager.js:377:15)
    at async ViewManager.switchView (E:\WhatsApps\wa11.9\wa11.10\src\single-window\ViewManager.js:1444:11)
    at async runTests (E:\WhatsApps\wa11.9\wa11.10\scripts\test-performance-optimization.js:384:5)
[2025-11-17T05:40:51.832Z] [ViewManager] [ERROR] View creation failure details: Session mismatch: BrowserView session does not match expected session for account account-1
[2025-11-17T05:40:51.832Z] [ViewManager] [ERROR] Failed to switch to account account-1: Error: Session mismatch: BrowserView session does not match expected session for account account-1
    at ViewManager.createView (E:\WhatsApps\wa11.9\wa11.10\src\single-window\ViewManager.js:377:15)
    at async ViewManager.switchView (E:\WhatsApps\wa11.9\wa11.10\src\single-window\ViewManager.js:1444:11)
    at async runTests (E:\WhatsApps\wa11.9\wa11.10\scripts\test-performance-optimization.js:384:5)
[2025-11-17T05:40:51.832Z] [ViewManager] [WARN] Session isolation validation warning for account-2: Partition mismatch: expected persist:account_account-2, got persist:test
[2025-11-17T05:40:51.832Z] [ViewManager] [ERROR] Failed to create view for account account-2: Error: Session mismatch: BrowserView session does not match expected session for account account-2
    at ViewManager.createView (E:\WhatsApps\wa11.9\wa11.10\src\single-window\ViewManager.js:377:15)
    at async ViewManager.switchView (E:\WhatsApps\wa11.9\wa11.10\src\single-window\ViewManager.js:1444:11)
    at async runTests (E:\WhatsApps\wa11.9\wa11.10\scripts\test-performance-optimization.js:385:5)
[2025-11-17T05:40:51.832Z] [ViewManager] [ERROR] View creation failure details: Session mismatch: BrowserView session does not match expected session for account account-2
[2025-11-17T05:40:51.832Z] [ViewManager] [ERROR] Failed to switch to account account-2: Error: Session mismatch: BrowserView session does not match expected session for account account-2
    at ViewManager.createView (E:\WhatsApps\wa11.9\wa11.10\src\single-window\ViewManager.js:377:15)
    at async ViewManager.switchView (E:\WhatsApps\wa11.9\wa11.10\src\single-window\ViewManager.js:1444:11)
    at async runTests (E:\WhatsApps\wa11.9\wa11.10\scripts\test-performance-optimization.js:385:5)
❌ Test 6 FAILED: Performance stats missing or incorrect
Error: Performance stats missing or incorrect
    at runTests (E:\WhatsApps\wa11.9\wa11.10\scripts\test-performance-optimization.js:390:13)


### ⚠ Memory Management

**Error**: Command failed: node "E:\WhatsApps\wa11.9\wa11.10\scripts\test-memory-management.js"
[2025-11-17T05:40:51.921Z] [ViewManager] [ERROR] Failed to create view for account account1: Error: Session mismatch: BrowserView session does not match expected session for account account1
    at ViewManager.createView (E:\WhatsApps\wa11.9\wa11.10\src\single-window\ViewManager.js:377:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async Object.testViewPooling [as fn] (E:\WhatsApps\wa11.9\wa11.10\scripts\test-memory-management.js:159:3)
    at async runTests (E:\WhatsApps\wa11.9\wa11.10\scripts\test-memory-management.js:426:7)
[2025-11-17T05:40:51.922Z] [ViewManager] [ERROR] View creation failure details: Session mismatch: BrowserView session does not match expected session for account account1
✗ View Pooling failed: Session mismatch: BrowserView session does not match expected session for account account1
Error: Session mismatch: BrowserView session does not match expected session for account account1
    at ViewManager.createView (E:\WhatsApps\wa11.9\wa11.10\src\single-window\ViewManager.js:377:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async Object.testViewPooling [as fn] (E:\WhatsApps\wa11.9\wa11.10\scripts\test-memory-management.js:159:3)
    at async runTests (E:\WhatsApps\wa11.9\wa11.10\scripts\test-memory-management.js:426:7)
[2025-11-17T05:40:51.923Z] [ViewManager] [ERROR] Failed to create view for account account1: Error: Session mismatch: BrowserView session does not match expected session for account account1
    at ViewManager.createView (E:\WhatsApps\wa11.9\wa11.10\src\single-window\ViewManager.js:377:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async Object.testMemoryMonitoring [as fn] (E:\WhatsApps\wa11.9\wa11.10\scripts\test-memory-management.js:201:3)
    at async runTests (E:\WhatsApps\wa11.9\wa11.10\scripts\test-memory-management.js:426:7)
[2025-11-17T05:40:51.923Z] [ViewManager] [ERROR] View creation failure details: Session mismatch: BrowserView session does not match expected session for account account1
✗ Memory Monitoring failed: Session mismatch: BrowserView session does not match expected session for account account1
Error: Session mismatch: BrowserView session does not match expected session for account account1
    at ViewManager.createView (E:\WhatsApps\wa11.9\wa11.10\src\single-window\ViewManager.js:377:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async Object.testMemoryMonitoring [as fn] (E:\WhatsApps\wa11.9\wa11.10\scripts\test-memory-management.js:201:3)
    at async runTests (E:\WhatsApps\wa11.9\wa11.10\scripts\test-memory-management.js:426:7)
[2025-11-17T05:40:51.924Z] [ViewManager] [ERROR] Failed to create view for account account1: Error: Session mismatch: BrowserView session does not match expected session for account account1
    at ViewManager.createView (E:\WhatsApps\wa11.9\wa11.10\src\single-window\ViewManager.js:377:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async Object.testMemoryOptimization [as fn] (E:\WhatsApps\wa11.9\wa11.10\scripts\test-memory-management.js:254:3)
    at async runTests (E:\WhatsApps\wa11.9\wa11.10\scripts\test-memory-management.js:426:7)
[2025-11-17T05:40:51.924Z] [ViewManager] [ERROR] View creation failure details: Session mismatch: BrowserView session does not match expected session for account account1
✗ Memory Optimization failed: Session mismatch: BrowserView session does not match expected session for account account1
Error: Session mismatch: BrowserView session does not match expected session for account account1
    at ViewManager.createView (E:\WhatsApps\wa11.9\wa11.10\src\single-window\ViewManager.js:377:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async Object.testMemoryOptimization [as fn] (E:\WhatsApps\wa11.9\wa11.10\scripts\test-memory-management.js:254:3)
    at async runTests (E:\WhatsApps\wa11.9\wa11.10\scripts\test-memory-management.js:426:7)
[2025-11-17T05:40:51.925Z] [ViewManager] [ERROR] Failed to create view for account account1: Error: Session mismatch: BrowserView session does not match expected session for account account1
    at ViewManager.createView (E:\WhatsApps\wa11.9\wa11.10\src\single-window\ViewManager.js:377:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async Object.testViewLimitEnforcement [as fn] (E:\WhatsApps\wa11.9\wa11.10\scripts\test-memory-management.js:294:3)
    at async runTests (E:\WhatsApps\wa11.9\wa11.10\scripts\test-memory-management.js:426:7)
[2025-11-17T05:40:51.925Z] [ViewManager] [ERROR] View creation failure details: Session mismatch: BrowserView session does not match expected session for account account1
✗ View Limit Enforcement failed: Session mismatch: BrowserView session does not match expected session for account account1
Error: Session mismatch: BrowserView session does not match expected session for account account1
    at ViewManager.createView (E:\WhatsApps\wa11.9\wa11.10\src\single-window\ViewManager.js:377:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async Object.testViewLimitEnforcement [as fn] (E:\WhatsApps\wa11.9\wa11.10\scripts\test-memory-management.js:294:3)
    at async runTests (E:\WhatsApps\wa11.9\wa11.10\scripts\test-memory-management.js:426:7)
[2025-11-17T05:40:51.925Z] [ViewManager] [ERROR] Failed to create view for account account1: Error: Session mismatch: BrowserView session does not match expected session for account account1
    at ViewManager.createView (E:\WhatsApps\wa11.9\wa11.10\src\single-window\ViewManager.js:377:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async Object.testPerformanceStats [as fn] (E:\WhatsApps\wa11.9\wa11.10\scripts\test-memory-management.js:324:3)
    at async runTests (E:\WhatsApps\wa11.9\wa11.10\scripts\test-memory-management.js:426:7)
[2025-11-17T05:40:51.925Z] [ViewManager] [ERROR] View creation failure details: Session mismatch: BrowserView session does not match expected session for account account1
✗ Performance Statistics failed: Session mismatch: BrowserView session does not match expected session for account account1
Error: Session mismatch: BrowserView session does not match expected session for account account1
    at ViewManager.createView (E:\WhatsApps\wa11.9\wa11.10\src\single-window\ViewManager.js:377:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async Object.testPerformanceStats [as fn] (E:\WhatsApps\wa11.9\wa11.10\scripts\test-memory-management.js:324:3)
    at async runTests (E:\WhatsApps\wa11.9\wa11.10\scripts\test-memory-management.js:426:7)
[2025-11-17T05:40:51.926Z] [ViewManager] [ERROR] Failed to create view for account account1: Error: Session mismatch: BrowserView session does not match expected session for account account1
    at ViewManager.createView (E:\WhatsApps\wa11.9\wa11.10\src\single-window\ViewManager.js:377:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async Object.testStalePoolCleanup [as fn] (E:\WhatsApps\wa11.9\wa11.10\scripts\test-memory-management.js:357:3)
    at async runTests (E:\WhatsApps\wa11.9\wa11.10\scripts\test-memory-management.js:426:7)
[2025-11-17T05:40:51.926Z] [ViewManager] [ERROR] View creation failure details: Session mismatch: BrowserView session does not match expected session for account account1
✗ Stale Pool Cleanup failed: Session mismatch: BrowserView session does not match expected session for account account1
Error: Session mismatch: BrowserView session does not match expected session for account account1
    at ViewManager.createView (E:\WhatsApps\wa11.9\wa11.10\src\single-window\ViewManager.js:377:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async Object.testStalePoolCleanup [as fn] (E:\WhatsApps\wa11.9\wa11.10\scripts\test-memory-management.js:357:3)
    at async runTests (E:\WhatsApps\wa11.9\wa11.10\scripts\test-memory-management.js:426:7)
[2025-11-17T05:40:51.926Z] [ViewManager] [ERROR] Failed to create view for account account1: Error: Session mismatch: BrowserView session does not match expected session for account account1
    at ViewManager.createView (E:\WhatsApps\wa11.9\wa11.10\src\single-window\ViewManager.js:377:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async Object.testCacheClearing [as fn] (E:\WhatsApps\wa11.9\wa11.10\scripts\test-memory-management.js:391:3)
    at async runTests (E:\WhatsApps\wa11.9\wa11.10\scripts\test-memory-management.js:426:7)
[2025-11-17T05:40:51.927Z] [ViewManager] [ERROR] View creation failure details: Session mismatch: BrowserView session does not match expected session for account account1
✗ Cache Clearing failed: Session mismatch: BrowserView session does not match expected session for account account1
Error: Session mismatch: BrowserView session does not match expected session for account account1
    at ViewManager.createView (E:\WhatsApps\wa11.9\wa11.10\src\single-window\ViewManager.js:377:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async Object.testCacheClearing [as fn] (E:\WhatsApps\wa11.9\wa11.10\scripts\test-memory-management.js:391:3)
    at async runTests (E:\WhatsApps\wa11.9\wa11.10\scripts\test-memory-management.js:426:7)


