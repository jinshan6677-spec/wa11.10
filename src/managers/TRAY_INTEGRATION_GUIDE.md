# TrayManager 集成指南

## 概述

TrayManager 已更新以支持多实例架构。本指南说明如何将 TrayManager 与 InstanceManager 和 NotificationManager 集成。

## 功能特性

### 1. 多实例支持
- 显示所有运行中账号的列表
- 每个账号显示未读消息数
- 点击账号名称可聚焦到对应窗口

### 2. 未读消息总数
- 在托盘图标上显示所有账号的未读消息总数
- 自动更新托盘提示文本
- 支持 macOS Dock 徽章

### 3. 通知集成
- 点击通知自动聚焦到对应账号窗口
- 支持系统通知和托盘气泡通知
- 自动显示账号名称和未读消息数

## 集成步骤

### 步骤 1: 初始化管理器

```javascript
const TrayManager = require('./managers/TrayManager');
const InstanceManager = require('./managers/InstanceManager');
const NotificationManager = require('./managers/NotificationManager');
const AccountConfigManager = require('./managers/AccountConfigManager');

// 创建管理器实例
const accountConfigManager = new AccountConfigManager();
const notificationManager = new NotificationManager();
const instanceManager = new InstanceManager({
  notificationManager: notificationManager
});

// 创建托盘管理器
const trayManager = new TrayManager();

// 设置托盘管理器引用
notificationManager.setTrayManager(trayManager);
```

### 步骤 2: 初始化托盘

```javascript
const { app } = require('electron');
const config = require('./config');

app.whenReady().then(() => {
  // 创建主窗口
  const mainWindow = new MainApplicationWindow();
  mainWindow.initialize();

  // 初始化托盘（传入管理器引用）
  if (config.trayConfig.enabled) {
    trayManager.initialize(
      mainWindow.getWindow(),
      config.trayConfig,
      {
        instanceManager: instanceManager,
        notificationManager: notificationManager
      }
    );
  }
});
```

### 步骤 3: 注册账号实例

当创建新的账号实例时，注册到托盘管理器：

```javascript
// 在 InstanceManager.createInstance() 成功后
const result = await instanceManager.createInstance(accountConfig);

if (result.success) {
  // 注册到托盘管理器
  trayManager.registerAccountInstance(
    result.instanceId,
    accountConfig.name,
    result.window
  );
}
```

### 步骤 4: 注销账号实例

当销毁账号实例时，从托盘管理器注销：

```javascript
// 在 InstanceManager.destroyInstance() 成功后
const result = await instanceManager.destroyInstance(instanceId);

if (result.success) {
  // 从托盘管理器注销
  trayManager.unregisterAccountInstance(instanceId);
}
```

### 步骤 5: 自动更新未读消息数

NotificationManager 会自动更新托盘的未读消息数：

```javascript
// NotificationManager 内部会自动调用
// trayManager.updateAccountUnreadCount(instanceId, unreadCount)

// 无需手动调用，但如果需要手动更新：
trayManager.updateAccountUnreadCount(instanceId, 5);
```

## 完整示例

```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');

// 导入管理器
const TrayManager = require('./managers/TrayManager');
const InstanceManager = require('./managers/InstanceManager');
const NotificationManager = require('./managers/NotificationManager');
const AccountConfigManager = require('./managers/AccountConfigManager');
const MainApplicationWindow = require('./container/MainApplicationWindow');
const config = require('./config');

// 全局变量
let mainWindow = null;
let trayManager = null;
let instanceManager = null;
let notificationManager = null;
let accountConfigManager = null;

/**
 * 初始化应用
 */
async function initializeApp() {
  // 1. 创建账号配置管理器
  accountConfigManager = new AccountConfigManager();
  await accountConfigManager.initialize();

  // 2. 创建通知管理器
  notificationManager = new NotificationManager();

  // 3. 创建实例管理器
  instanceManager = new InstanceManager({
    notificationManager: notificationManager
  });

  // 4. 创建主窗口
  mainWindow = new MainApplicationWindow();
  mainWindow.initialize();

  // 5. 设置通知管理器的主窗口引用
  notificationManager.setMainWindow(mainWindow);

  // 6. 创建并初始化托盘管理器
  if (config.trayConfig.enabled) {
    trayManager = new TrayManager();
    trayManager.initialize(
      mainWindow.getWindow(),
      config.trayConfig,
      {
        instanceManager: instanceManager,
        notificationManager: notificationManager
      }
    );

    // 设置托盘管理器引用到通知管理器
    notificationManager.setTrayManager(trayManager);

    console.log('[App] 系统托盘初始化完成');
  }

  // 7. 加载所有账号配置
  const accounts = await accountConfigManager.loadAccounts();
  mainWindow.renderAccountList(accounts);

  // 8. 自动启动配置为自动启动的账号
  for (const account of accounts) {
    if (account.autoStart) {
      const result = await instanceManager.createInstance(account);
      if (result.success && trayManager) {
        trayManager.registerAccountInstance(
          result.instanceId,
          account.name,
          result.window
        );
      }
    }
  }
}

/**
 * 清理资源
 */
async function cleanup() {
  console.log('[App] 开始清理资源...');

  // 销毁托盘
  if (trayManager) {
    trayManager.destroy();
    trayManager = null;
  }

  // 销毁所有实例
  if (instanceManager) {
    await instanceManager.destroyAllInstances();
  }

  console.log('[App] 资源清理完成');
}

/**
 * 应用就绪事件
 */
app.whenReady().then(async () => {
  try {
    await initializeApp();
  } catch (error) {
    console.error('[App] 应用初始化失败:', error);
    app.quit();
  }
});

/**
 * 所有窗口关闭事件
 */
app.on('window-all-closed', async () => {
  await cleanup();
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * 应用退出前事件
 */
app.on('before-quit', async () => {
  await cleanup();
});
```

## API 参考

### TrayManager

#### `initialize(mainWindow, config, options)`
初始化系统托盘。

**参数:**
- `mainWindow` (BrowserWindow): 主窗口实例
- `config` (Object): 托盘配置
  - `enabled` (boolean): 是否启用托盘
  - `minimizeToTray` (boolean): 是否最小化到托盘
- `options` (Object): 额外选项
  - `instanceManager` (InstanceManager): 实例管理器
  - `notificationManager` (NotificationManager): 通知管理器

#### `registerAccountInstance(instanceId, name, window)`
注册账号实例到托盘。

**参数:**
- `instanceId` (string): 实例 ID
- `name` (string): 账号名称
- `window` (BrowserWindow): 浏览器窗口

#### `unregisterAccountInstance(instanceId)`
从托盘注销账号实例。

**参数:**
- `instanceId` (string): 实例 ID

#### `focusAccountWindow(instanceId)`
聚焦到指定账号窗口。

**参数:**
- `instanceId` (string): 实例 ID

#### `updateAccountUnreadCount(instanceId, count)`
更新账号的未读消息数。

**参数:**
- `instanceId` (string): 实例 ID
- `count` (number): 未读消息数

#### `showAccountNotification(instanceId, accountName, unreadCount)`
显示账号新消息通知。

**参数:**
- `instanceId` (string): 实例 ID
- `accountName` (string): 账号名称
- `unreadCount` (number): 未读消息数

#### `updateTotalUnreadCount()`
更新总未读消息数（自动从 NotificationManager 获取）。

#### `updateTrayMenu()`
更新托盘菜单（自动显示所有运行中的账号）。

## 注意事项

1. **初始化顺序**: 必须先创建 NotificationManager 和 InstanceManager，然后再创建 TrayManager。

2. **双向引用**: TrayManager 和 NotificationManager 需要相互引用：
   - TrayManager 需要 NotificationManager 来获取未读消息总数
   - NotificationManager 需要 TrayManager 来更新托盘显示

3. **实例注册**: 每次创建新实例时，必须调用 `registerAccountInstance()`，否则托盘菜单不会显示该账号。

4. **实例注销**: 每次销毁实例时，必须调用 `unregisterAccountInstance()`，否则托盘菜单会显示已关闭的账号。

5. **自动更新**: NotificationManager 会自动更新托盘的未读消息数，无需手动调用。

6. **通知点击**: 点击通知会自动聚焦到对应的账号窗口，无需额外配置。

## 故障排除

### 托盘菜单不显示账号列表

**原因**: 未正确传入 `instanceManager` 或未注册账号实例。

**解决方案**:
```javascript
// 确保初始化时传入 instanceManager
trayManager.initialize(mainWindow, config, {
  instanceManager: instanceManager,
  notificationManager: notificationManager
});

// 确保创建实例后注册
trayManager.registerAccountInstance(instanceId, name, window);
```

### 未读消息数不更新

**原因**: NotificationManager 未设置 TrayManager 引用。

**解决方案**:
```javascript
notificationManager.setTrayManager(trayManager);
```

### 点击通知无法聚焦窗口

**原因**: 未注册账号实例或窗口已销毁。

**解决方案**:
```javascript
// 确保实例已注册
trayManager.registerAccountInstance(instanceId, name, window);

// 确保窗口未销毁
if (!window.isDestroyed()) {
  trayManager.focusAccountWindow(instanceId);
}
```

## 向后兼容

TrayManager 保持了向后兼容性，仍然支持单实例模式：

```javascript
// 单实例模式（不传入 instanceManager）
trayManager.initialize(mainWindow, config);

// 手动更新未读消息数
trayManager.updateUnreadCount(5);

// 显示通知
trayManager.showNotification('标题', '内容', () => {
  console.log('通知被点击');
});
```
