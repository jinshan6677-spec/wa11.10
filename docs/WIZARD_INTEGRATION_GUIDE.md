# First Run Wizard Integration Guide

## 快速开始

本指南将帮助您在 5 分钟内将首次启动向导集成到您的应用中。

## 步骤 1: 导入模块

在 `src/main.js` 文件顶部添加导入：

```javascript
const { checkAndShowWizard } = require('./managers/FirstRunWizardIntegration');
```

## 步骤 2: 修改应用启动逻辑

将现有的 `app.whenReady()` 修改为：

```javascript
app.whenReady().then(async () => {
  log('info', 'Electron 应用已就绪');

  const userDataPath = app.getPath('userData');

  try {
    // 检查并显示首次启动向导
    const wizardResult = await checkAndShowWizard({
      userDataPath,
      onComplete: () => {
        log('info', '向导完成，启动主应用...');
        initializeApplication();
      },
      onSkip: () => {
        log('info', '用户跳过向导，启动主应用...');
        initializeApplication();
      }
    });

    if (!wizardResult.shown) {
      // 不需要显示向导，直接启动应用
      log('info', '无需显示向导，直接启动主应用');
      initializeApplication();
    }
  } catch (error) {
    log('error', '向导执行失败:', error);
    // 即使向导失败，也尝试启动应用
    initializeApplication();
  }
});
```

## 步骤 3: 提取应用初始化逻辑

将原来在 `app.whenReady()` 中的初始化代码提取到一个函数中：

```javascript
async function initializeApplication() {
  try {
    // 初始化翻译服务
    await translationService.initialize();
    log('info', '翻译服务初始化完成');

    // 注册 IPC 处理器
    registerIPCHandlers();
    log('info', 'IPC 处理器注册完成');

    // 创建窗口
    createWindow();

  } catch (error) {
    log('error', '应用启动失败:', error);
    log('error', '错误堆栈:', error.stack);
    app.quit();
  }
}
```

## 完整示例

这是一个完整的 `main.js` 修改示例：

```javascript
/**
 * WhatsApp Desktop - Electron 主进程
 */

const { app, BrowserWindow } = require('electron');
const config = require('./config');
const path = require('path');
const translationService = require('./translation/translationService');
const { registerIPCHandlers, unregisterIPCHandlers } = require('./translation/ipcHandlers');
const { checkAndShowWizard } = require('./managers/FirstRunWizardIntegration');

// 全局变量
let mainWindow = null;

/**
 * 注入翻译内容脚本
 */
function injectTranslationScript() {
  // ... 现有代码保持不变 ...
}

/**
 * 日志记录函数
 */
function log(level, message, ...args) {
  // ... 现有代码保持不变 ...
}

/**
 * 创建 Electron 主窗口
 */
function createWindow() {
  // ... 现有代码保持不变 ...
}

/**
 * 初始化应用程序
 */
async function initializeApplication() {
  try {
    // 初始化翻译服务
    await translationService.initialize();
    log('info', '翻译服务初始化完成');

    // 注册 IPC 处理器
    registerIPCHandlers();
    log('info', 'IPC 处理器注册完成');

    // 创建窗口
    createWindow();

  } catch (error) {
    log('error', '应用启动失败:', error);
    log('error', '错误堆栈:', error.stack);
    app.quit();
  }
}

/**
 * 清理资源
 */
async function cleanup() {
  // ... 现有代码保持不变 ...
}

/**
 * 应用程序就绪事件
 */
app.whenReady().then(async () => {
  log('info', 'Electron 应用已就绪');

  const userDataPath = app.getPath('userData');

  try {
    // 检查并显示首次启动向导
    const wizardResult = await checkAndShowWizard({
      userDataPath,
      onComplete: () => {
        log('info', '向导完成，启动主应用...');
        initializeApplication();
      },
      onSkip: () => {
        log('info', '用户跳过向导，启动主应用...');
        initializeApplication();
      }
    });

    if (!wizardResult.shown) {
      // 不需要显示向导，直接启动应用
      log('info', '无需显示向导，直接启动主应用');
      initializeApplication();
    }
  } catch (error) {
    log('error', '向导执行失败:', error);
    // 即使向导失败，也尝试启动应用
    initializeApplication();
  }

  // macOS 特定：点击 dock 图标时重新创建窗口
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

/**
 * 所有窗口关闭事件
 */
app.on('window-all-closed', async () => {
  // ... 现有代码保持不变 ...
});

/**
 * 应用退出前事件
 */
app.on('before-quit', async () => {
  // ... 现有代码保持不变 ...
});

// ... 其他现有代码保持不变 ...
```

## 测试集成

### 1. 测试首次启动（需要迁移）

```bash
# 1. 创建旧的 session-data 目录
mkdir -p userData/session-data/session
echo "test" > userData/session-data/session/test.txt

# 2. 删除迁移标记（如果存在）
rm userData/.migration-completed

# 3. 启动应用
npm start
```

**预期结果**: 应该看到首次启动向导界面

### 2. 测试已完成迁移

```bash
# 启动应用（迁移已完成）
npm start
```

**预期结果**: 不显示向导，直接启动主应用

### 3. 测试全新安装

```bash
# 1. 清空用户数据目录
rm -rf userData/*

# 2. 启动应用
npm start
```

**预期结果**: 不显示向导，直接启动主应用

## 常见问题

### Q1: 向导显示后应用没有启动

**原因**: `onComplete` 或 `onSkip` 回调没有正确调用 `initializeApplication()`

**解决方案**: 确保回调函数中调用了应用初始化逻辑

### Q2: 向导一直显示

**原因**: 迁移标记文件没有正确创建

**解决方案**: 检查 `userData/.migration-completed` 文件是否存在

### Q3: 迁移失败

**原因**: 可能是权限问题或磁盘空间不足

**解决方案**: 
1. 检查应用日志
2. 确保有足够的磁盘空间
3. 检查文件权限

### Q4: 想要重新显示向导

**解决方案**:
```bash
# 删除迁移标记
rm userData/.migration-completed

# 重启应用
npm start
```

## 高级配置

### 使用静默迁移

如果您不想显示向导界面，可以使用静默迁移：

```javascript
const { autoMigrate } = require('./managers/FirstRunWizardIntegration');

app.whenReady().then(async () => {
  const userDataPath = app.getPath('userData');

  // 静默执行迁移
  const result = await autoMigrate({
    userDataPath,
    silent: false // 设置为 true 可以完全静默
  });

  if (result.migrated) {
    log('info', '迁移完成');
  }

  // 启动应用
  initializeApplication();
});
```

### 混合模式

先尝试自动迁移，失败时显示向导：

```javascript
app.whenReady().then(async () => {
  const userDataPath = app.getPath('userData');

  // 先尝试自动迁移
  const migrationResult = await autoMigrate({
    userDataPath,
    silent: true
  });

  if (migrationResult.migrated) {
    // 成功，直接启动
    initializeApplication();
  } else if (migrationResult.result && !migrationResult.result.success) {
    // 失败，显示向导
    await checkAndShowWizard({
      userDataPath,
      onComplete: () => initializeApplication(),
      onSkip: () => initializeApplication()
    });
  } else {
    // 不需要迁移
    initializeApplication();
  }
});
```

## 自定义向导

### 修改样式

编辑 `src/container/wizard.html` 中的 CSS：

```css
/* 修改主题颜色 */
.wizard-header {
  background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%);
}

/* 修改按钮颜色 */
.btn-primary {
  background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%);
}
```

### 修改文本

编辑 `src/container/wizard.html` 中的 HTML 内容：

```html
<h1>🎉 您的自定义标题</h1>
<p>您的自定义描述</p>
```

### 添加自定义步骤

1. 在 `wizard.html` 中添加新的步骤 div
2. 在 JavaScript 中更新步骤管理逻辑
3. 在 `FirstRunWizard.js` 中添加相应的处理逻辑

## 调试技巧

### 启用详细日志

```javascript
// 在 checkAndShowWizard 调用前添加
process.env.DEBUG = 'wizard:*';
```

### 查看迁移状态

```javascript
const { getMigrationStatus } = require('./managers/FirstRunWizardIntegration');

const status = await getMigrationStatus(app.getPath('userData'));
console.log('Migration status:', status);
```

### 重置迁移状态

```javascript
const MigrationManager = require('./managers/MigrationManager');
const AccountConfigManager = require('./managers/AccountConfigManager');

const accountConfigManager = new AccountConfigManager({
  userDataPath: app.getPath('userData')
});

const migrationManager = new MigrationManager({
  userDataPath: app.getPath('userData'),
  accountConfigManager
});

await migrationManager.resetMigration();
```

## 性能优化

### 1. 延迟加载

只在需要时加载向导模块：

```javascript
app.whenReady().then(async () => {
  const userDataPath = app.getPath('userData');
  
  // 先检查是否需要迁移
  const MigrationManager = require('./managers/MigrationManager');
  const AccountConfigManager = require('./managers/AccountConfigManager');
  
  const accountConfigManager = new AccountConfigManager({ userDataPath });
  const migrationManager = new MigrationManager({ userDataPath, accountConfigManager });
  
  const needsMigration = await migrationManager.needsMigration();
  
  if (needsMigration) {
    // 只在需要时加载向导
    const { checkAndShowWizard } = require('./managers/FirstRunWizardIntegration');
    await checkAndShowWizard({ userDataPath, ... });
  } else {
    initializeApplication();
  }
});
```

### 2. 并行初始化

在向导显示的同时预加载其他资源：

```javascript
const wizardPromise = checkAndShowWizard({ ... });
const resourcesPromise = preloadResources();

await Promise.all([wizardPromise, resourcesPromise]);
```

## 部署检查清单

- [ ] 测试首次安装场景
- [ ] 测试从旧版本升级场景
- [ ] 测试迁移失败场景
- [ ] 测试跳过向导场景
- [ ] 验证迁移标记文件创建
- [ ] 验证数据正确迁移
- [ ] 验证原始数据保留
- [ ] 测试多次启动不重复显示
- [ ] 检查日志输出
- [ ] 验证错误处理

## 相关资源

- [首次启动向导文档](FIRST_RUN_WIZARD.md)
- [迁移指南](MIGRATION_GUIDE.md)
- [迁移流程图](MIGRATION_FLOW.md)
- [API 文档](../src/container/FIRST_RUN_WIZARD_README.md)
- [集成示例](../src/examples/first-run-wizard-integration-example.js)

## 获取帮助

如果遇到问题：

1. 查看应用日志
2. 检查 [常见问题](FAQ.md)
3. 查看 [迁移指南](MIGRATION_GUIDE.md)
4. 提交 Issue 到 GitHub

## 总结

集成首次启动向导只需要三个简单步骤：

1. 导入 `checkAndShowWizard` 函数
2. 在 `app.whenReady()` 中调用它
3. 提取应用初始化逻辑到 `initializeApplication()` 函数

就这么简单！向导会自动处理所有的检测、显示和迁移逻辑。
