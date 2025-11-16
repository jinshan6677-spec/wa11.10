/**
 * WhatsApp Desktop - Electron 主进程（多实例架构）
 * 
 * 这个应用支持同时运行多个 WhatsApp 账号，每个账号在独立的浏览器实例中运行
 * 提供完全的进程级隔离、存储隔离和网络隔离
 */

const { app } = require('electron');
const config = require('./config');
const path = require('path');

// 导入管理器
const AccountConfigManager = require('./managers/AccountConfigManager');
const InstanceManager = require('./managers/InstanceManager');
const MainApplicationWindow = require('./container/MainApplicationWindow');
const TranslationIntegration = require('./managers/TranslationIntegration');
const ErrorHandler = require('./managers/ErrorHandler');
const SessionManager = require('./managers/SessionManager');
const NotificationManager = require('./managers/NotificationManager');
const ResourceManager = require('./managers/ResourceManager');
const TrayManager = require('./managers/TrayManager');

// 导入 IPC 处理器
const { registerIPCHandlers: registerContainerIPCHandlers, unregisterIPCHandlers: unregisterContainerIPCHandlers } = require('./container/ipcHandlers');
const { registerIPCHandlers: registerTranslationIPCHandlers, unregisterIPCHandlers: unregisterTranslationIPCHandlers } = require('./translation/ipcHandlers');

// 导入迁移和首次运行向导
const { checkAndMigrate } = require('./managers/autoMigration');
const FirstRunWizardIntegration = require('./managers/FirstRunWizardIntegration');

// 全局管理器实例
let accountConfigManager = null;
let instanceManager = null;
let mainApplicationWindow = null;
let translationIntegration = null;
let errorHandler = null;
let sessionManager = null;
let notificationManager = null;
let resourceManager = null;
let trayManager = null;
let firstRunWizard = null;



/**
 * 日志记录函数
 */
function log(level, message, ...args) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

  if (level === 'error') {
    console.error(logMessage, ...args);
  } else if (level === 'warn') {
    console.warn(logMessage, ...args);
  } else {
    console.log(logMessage, ...args);
  }
}

/**
 * 初始化所有管理器
 */
async function initializeManagers() {
  log('info', '初始化管理器...');

  try {
    // 1. 初始化账号配置管理器
    accountConfigManager = new AccountConfigManager({
      cwd: app.getPath('userData')
    });
    log('info', '账号配置管理器初始化完成');

    // 2. 初始化会话管理器
    sessionManager = new SessionManager({
      userDataPath: app.getPath('userData')
    });
    log('info', '会话管理器初始化完成');

    // 3. 初始化通知管理器
    notificationManager = new NotificationManager();
    log('info', '通知管理器初始化完成');

    // 4. 初始化资源管理器
    resourceManager = new ResourceManager({
      limits: {
        maxInstances: config.maxConcurrentInstances || 30,
        maxMemoryUsagePercent: 90,
        maxCpuUsagePercent: 90,
        warningMemoryUsagePercent: 75,
        warningCpuUsagePercent: 75
      },
      onWarning: (type, resources) => {
        log('warn', `Resource warning: ${type} usage at ${type === 'memory' ? resources.memoryUsagePercent : resources.cpuUsage}%`);
      },
      onLimit: (type, resources) => {
        log('error', `Resource limit reached: ${type} usage at ${type === 'memory' ? resources.memoryUsagePercent : resources.cpuUsage}%`);
      }
    });
    log('info', '资源管理器初始化完成');

    // 5. 初始化翻译集成
    translationIntegration = new TranslationIntegration(null); // instanceManager 将在后面设置
    await translationIntegration.initialize();
    log('info', '翻译集成初始化完成');

    // 6. 初始化实例管理器
    instanceManager = new InstanceManager({
      userDataPath: app.getPath('userData'),
      maxInstances: config.maxConcurrentInstances || 30,
      translationIntegration: translationIntegration,
      sessionManager: sessionManager,
      notificationManager: notificationManager,
      resourceManager: resourceManager
    });
    
    // 设置 translationIntegration 的 instanceManager 引用
    translationIntegration.instanceManager = instanceManager;
    
    log('info', '实例管理器初始化完成');

    // 7. 初始化错误处理器
    errorHandler = new ErrorHandler(instanceManager, {
      maxCrashCount: 3,
      crashResetTime: 300000, // 5 分钟
      restartDelay: 5000, // 5 秒
      logPath: path.join(app.getPath('userData'), 'logs', 'errors.log')
    });
    
    // 设置 instanceManager 的 errorHandler 引用
    instanceManager.errorHandler = errorHandler;
    
    log('info', '错误处理器初始化完成');

    // 8. 初始化主应用窗口
    mainApplicationWindow = new MainApplicationWindow();
    mainApplicationWindow.initialize();
    log('info', '主应用窗口初始化完成');

    // 9. 设置通知管理器的主窗口引用
    notificationManager.setMainWindow(mainApplicationWindow);

    // 10. 初始化系统托盘（如果启用）
    if (config.trayConfig && config.trayConfig.enabled) {
      try {
        trayManager = new TrayManager();
        trayManager.initialize(mainApplicationWindow.getWindow(), config.trayConfig);
        
        // 设置托盘管理器引用
        notificationManager.setTrayManager(trayManager);
        
        log('info', '系统托盘初始化完成');
      } catch (error) {
        log('error', '系统托盘初始化失败:', error);
      }
    }

    // 11. 启动资源监控
    resourceManager.startMonitoring(10000); // 每 10 秒检查一次
    log('info', '资源监控已启动');

    // 12. 启动实例监控
    instanceManager.startGlobalMonitoring();
    log('info', '实例监控已启动');

    log('info', '所有管理器初始化完成');
  } catch (error) {
    log('error', '管理器初始化失败:', error);
    throw error;
  }
}

/**
 * 注册所有 IPC 处理器
 */
async function registerAllIPCHandlers() {
  log('info', '注册 IPC 处理器...');

  try {
    // 注册容器（账号管理）IPC 处理器
    registerContainerIPCHandlers(accountConfigManager, instanceManager, mainApplicationWindow);
    log('info', '容器 IPC 处理器注册完成');

    // 注册翻译 IPC 处理器（如果需要）
    // 注意：翻译功能现在通过 TranslationIntegration 集成到每个实例中
    // 但保留原有的 IPC 处理器以支持全局翻译配置
    await registerTranslationIPCHandlers();
    log('info', '翻译 IPC 处理器注册完成');

    log('info', '所有 IPC 处理器注册完成');
  } catch (error) {
    log('error', 'IPC 处理器注册失败:', error);
    throw error;
  }
}

/**
 * 自动启动配置的账号实例
 */
async function autoStartInstances() {
  log('info', '检查自动启动配置...');

  try {
    // 获取所有账号配置
    const accounts = await accountConfigManager.loadAccounts();
    
    // 过滤出配置了自动启动的账号
    const autoStartAccounts = accounts.filter(account => account.autoStart === true);
    
    if (autoStartAccounts.length === 0) {
      log('info', '没有配置自动启动的账号');
      return;
    }

    log('info', `找到 ${autoStartAccounts.length} 个自动启动账号`);

    // 依次启动账号（避免同时启动太多实例）
    for (const account of autoStartAccounts) {
      try {
        log('info', `自动启动账号: ${account.name} (${account.id})`);
        
        const result = await instanceManager.createInstance(account);
        
        if (result.success) {
          log('info', `账号 ${account.name} 启动成功`);
          
          // 更新主窗口状态
          if (mainApplicationWindow) {
            mainApplicationWindow.updateAccountStatus(account.id, { status: 'running' });
          }
        } else {
          log('error', `账号 ${account.name} 启动失败: ${result.error}`);
        }
        
        // 延迟一下，避免同时启动太多实例
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        log('error', `自动启动账号 ${account.name} 时出错:`, error);
      }
    }

    log('info', '自动启动完成');
  } catch (error) {
    log('error', '自动启动失败:', error);
  }
}

/**
 * 清理资源
 */
async function cleanup() {
  log('info', '开始清理资源...');

  // 1. 停止资源监控
  try {
    if (resourceManager) {
      resourceManager.stopMonitoring();
      log('info', '资源监控已停止');
    }
  } catch (error) {
    log('error', '停止资源监控时出错:', error);
  }

  // 2. 停止实例监控
  try {
    if (instanceManager) {
      instanceManager.stopGlobalMonitoring();
      log('info', '实例监控已停止');
    }
  } catch (error) {
    log('error', '停止实例监控时出错:', error);
  }

  // 3. 关闭所有运行中的实例（保存状态）
  try {
    if (instanceManager) {
      log('info', '关闭所有运行中的实例...');
      const result = await instanceManager.destroyAllInstances();
      log('info', `实例关闭完成: ${result.destroyed} 个成功, ${result.failed} 个失败`);
    }
  } catch (error) {
    log('error', '关闭实例时出错:', error);
  }

  // 4. 保存所有账号配置
  try {
    if (accountConfigManager && instanceManager) {
      log('info', '保存账号配置...');
      const accounts = await accountConfigManager.loadAccounts();
      
      for (const account of accounts) {
        const instance = instanceManager.instances.get(account.id);
        if (instance) {
          // 保存窗口状态
          const windowState = instanceManager.getWindowState(account.id);
          if (windowState.success) {
            account.window = windowState.bounds;
          }
          
          // 保存最后活跃时间
          account.lastActiveAt = new Date().toISOString();
          
          await accountConfigManager.saveAccount(account);
        }
      }
      
      log('info', '账号配置已保存');
    }
  } catch (error) {
    log('error', '保存账号配置时出错:', error);
  }

  // 5. 销毁系统托盘
  try {
    if (trayManager) {
      trayManager.destroy();
      trayManager = null;
      log('info', '系统托盘已销毁');
    }
  } catch (error) {
    log('error', '销毁系统托盘时出错:', error);
  }

  // 6. 注销 IPC 处理器
  try {
    unregisterContainerIPCHandlers();
    log('info', '容器 IPC 处理器已注销');
  } catch (error) {
    log('error', '注销容器 IPC 处理器时出错:', error);
  }

  try {
    unregisterTranslationIPCHandlers();
    log('info', '翻译 IPC 处理器已注销');
  } catch (error) {
    log('error', '注销翻译 IPC 处理器时出错:', error);
  }

  // 7. 清理翻译集成
  try {
    if (translationIntegration) {
      translationIntegration.cleanup();
      log('info', '翻译集成已清理');
    }
  } catch (error) {
    log('error', '清理翻译集成时出错:', error);
  }

  // 8. 清理通知管理器
  try {
    if (notificationManager) {
      notificationManager.clearAll();
      log('info', '通知管理器已清理');
    }
  } catch (error) {
    log('error', '清理通知管理器时出错:', error);
  }

  // 9. 清理临时资源
  try {
    // 清理错误处理器的重启定时器
    if (errorHandler) {
      errorHandler.clearAllCrashHistory();
      log('info', '错误处理器已清理');
    }
  } catch (error) {
    log('error', '清理错误处理器时出错:', error);
  }

  log('info', '资源清理完成');
}

/**
 * 应用程序就绪事件
 */
app.whenReady().then(async () => {
  log('info', 'Electron 应用已就绪');

  try {
    // 1. 检查并执行数据迁移
    try {
      log('info', '检查数据迁移...');
      const migrationResult = await checkAndMigrate(app.getPath('userData'));
      
      if (migrationResult.migrated) {
        log('info', '数据迁移完成');
      } else if (migrationResult.error) {
        log('warn', `数据迁移失败: ${migrationResult.error}`);
      } else {
        log('info', '无需迁移');
      }
    } catch (error) {
      log('error', '数据迁移检查失败:', error);
      // 不阻止应用启动
    }

    // 2. 初始化所有管理器
    await initializeManagers();

    // 3. 注册所有 IPC 处理器
    await registerAllIPCHandlers();

    // 4. 检查是否为首次运行
    try {
      firstRunWizard = new FirstRunWizardIntegration(
        mainApplicationWindow.getWindow(),
        accountConfigManager
      );
      
      const isFirstRun = await firstRunWizard.checkFirstRun();
      
      if (isFirstRun) {
        log('info', '检测到首次运行，显示欢迎向导');
        await firstRunWizard.showWelcomeWizard();
      }
    } catch (error) {
      log('error', '首次运行向导失败:', error);
      // 不阻止应用启动
    }

    // 5. 加载并显示账号列表
    try {
      const accounts = await accountConfigManager.loadAccounts();
      mainApplicationWindow.renderAccountList(accounts);
      log('info', `加载了 ${accounts.length} 个账号配置`);
    } catch (error) {
      log('error', '加载账号列表失败:', error);
    }

    // 6. 自动启动配置的账号（如果启用）
    if (config.autoStart !== false) {
      // 延迟一下，让主窗口先显示
      setTimeout(async () => {
        await autoStartInstances();
      }, 2000);
    }

    log('info', '应用启动完成');

  } catch (error) {
    log('error', '应用启动失败:', error);
    log('error', '错误堆栈:', error.stack);
    app.quit();
  }

  // macOS 特定：点击 dock 图标时显示主窗口
  app.on('activate', () => {
    if (mainApplicationWindow) {
      mainApplicationWindow.focus();
    }
  });
});

/**
 * 所有窗口关闭事件
 */
app.on('window-all-closed', async () => {
  log('info', '所有窗口已关闭');

  // 如果启用了最小化到托盘，不退出应用
  if (config.trayConfig && config.trayConfig.minimizeToTray && trayManager) {
    log('info', '应用最小化到托盘，继续运行');
    return;
  }

  // 清理资源
  await cleanup();

  // 在 macOS 上，除非用户明确退出，否则应用和菜单栏会保持活动状态
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * 应用退出前事件
 */
app.on('before-quit', async () => {
  log('info', '应用即将退出');
  await cleanup();
});

/**
 * 未捕获的异常处理
 */
process.on('uncaughtException', (error) => {
  log('error', '未捕获的异常:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  log('error', '未处理的 Promise 拒绝:', reason);
});

// 启动信息
log('info', '========================================');
log('info', 'WhatsApp Desktop Container');
log('info', `版本: ${app.getVersion()}`);
log('info', `Node.js: ${process.versions.node}`);
log('info', `Electron: ${process.versions.electron}`);
log('info', `Chromium: ${process.versions.chrome}`);
log('info', `平台: ${process.platform}`);
log('info', `环境: ${process.env.NODE_ENV || 'development'}`);
log('info', `会话路径: ${config.sessionPath}`);
log('info', '========================================');
