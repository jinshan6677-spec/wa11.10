/**
 * MainWindow 使用示例
 * 
 * 演示如何使用单窗口架构的主窗口管理类
 * 注意：此示例主要用于展示代码结构，实际使用时应该通过应用主入口启动
 */

const { app } = require('electron');
const MainWindow = require('../single-window/MainWindow');
const AccountConfigManager = require('../managers/AccountConfigManager');
const ViewManager = require('../single-window/ViewManager');
const TranslationIntegration = require('../managers/TranslationIntegration');
const SessionManager = require('../managers/SessionManager');
const { registerIPCHandlers } = require('../single-window/ipcHandlers');

// 初始化管理器
let mainWindow;
let configManager;
let viewManager;
let sessionManager;
let translationIntegration;

/**
 * 应用启动
 */
if (app && typeof app.whenReady === 'function') {
  app.whenReady().then(async () => {
    console.log('=== MainWindow 示例 ===\n');

    try {
      // 1. 创建配置管理器
      console.log('1. 初始化配置管理器...');
      configManager = new AccountConfigManager();
      await configManager.initialize();
      console.log('   ✓ 配置管理器初始化完成\n');

      // 2. 创建会话管理器
      console.log('2. 初始化会话管理器...');
      sessionManager = new SessionManager({
        userDataPath: app.getPath('userData')
      });
      console.log('   ✓ 会话管理器初始化完成\n');

      // 3. 创建翻译集成
      console.log('3. 初始化翻译集成...');
      translationIntegration = new TranslationIntegration(null);
      await translationIntegration.initialize();
      console.log('   ✓ 翻译集成初始化完成\n');

      // 4. 创建主窗口
      console.log('4. 创建主应用窗口...');
      mainWindow = new MainWindow();
      mainWindow.initialize();
      console.log('   ✓ 主窗口创建完成\n');

      // 5. 创建 ViewManager
      console.log('5. 初始化 ViewManager...');
      viewManager = new ViewManager(mainWindow, sessionManager, {
        defaultSidebarWidth: 280,
        translationIntegration: translationIntegration
      });
      console.log('   ✓ ViewManager 初始化完成\n');

      // 6. 注册 IPC 处理器
      console.log('6. 注册 IPC 处理器...');
      registerIPCHandlers(configManager, viewManager, mainWindow, translationIntegration);
      console.log('   ✓ IPC 处理器注册完成\n');

      // 7. 加载并渲染账号列表
      console.log('7. 加载账号列表...');
      const accounts = await configManager.loadAccounts();
      console.log(`   ✓ 加载了 ${accounts.length} 个账号\n`);

      // 显示账号信息（单窗口架构下使用 ViewManager 状态）
      const accountsWithStatus = accounts.map(account => {
        const hasView = viewManager.hasView(account.id);
        return {
          ...account,
          hasView: hasView,
          status: hasView ? 'loaded' : 'not-loaded',
          unreadCount: 0
        };
      });

      // 发送账号列表到渲染进程
      if (mainWindow.isReady()) {
        mainWindow.sendToRenderer('accounts-updated', accountsWithStatus);
        console.log('   ✓ 账号列表已发送到渲染进程\n');
      }

      // 8. 显示状态信息
      console.log('8. 设置状态监听...');
      console.log('   ✓ 状态监听已设置（通过 IPC 事件处理）\n');

      console.log('=== 主窗口已启动 ===');
      console.log('现在可以通过 UI 进行以下操作：');
      console.log('  • 添加新账号');
      console.log('  • 编辑账号配置');
      console.log('  • 切换账号视图');
      console.log('  • 删除账号');
      console.log('  • 查看账号状态');
      console.log('  • 配置翻译功能\n');

    } catch (error) {
      console.error('初始化失败:', error);
    }
  });
} else {
  console.log('=== MainWindow 示例 ===\n');
  console.log('此示例需要通过 Electron 应用启动');
  console.log('请通过主入口启动应用以运行此示例');
}

/**
 * 所有窗口关闭
 */
if (app) {
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  /**
   * 应用退出前清理
   */
  app.on('before-quit', async () => {
    console.log('\n清理资源...');

    // 关闭所有视图
    if (viewManager) {
      try {
        await viewManager.destroyAllViews();
        console.log('  ✓ 所有视图已关闭');
      } catch (error) {
        console.error('  ✗ 关闭视图失败:', error.message);
      }
    }

    // 清理翻译集成
    if (translationIntegration) {
      try {
        translationIntegration.cleanup();
        console.log('  ✓ 翻译集成已清理');
      } catch (error) {
        console.error('  ✗ 清理翻译集成失败:', error.message);
      }
    }

    console.log('清理完成');
  });
}

/**
 * 错误处理
 */
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise 拒绝:', reason);
});