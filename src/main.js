/**
 * WhatsApp Desktop - Electron 主进程
 * 
 * 这个应用将 WhatsApp Web 封装为桌面应用，提供翻译功能支持。
 */

const { app, BrowserWindow } = require('electron');
const config = require('./config');
const path = require('path');
const translationService = require('./translation/translationService');
const { registerIPCHandlers, unregisterIPCHandlers } = require('./translation/ipcHandlers');

// 全局变量
let mainWindow = null;

/**
 * 注入翻译内容脚本
 */
function injectTranslationScript() {
  if (!mainWindow || !mainWindow.webContents) {
    log('error', '无法注入翻译脚本：窗口不存在');
    return;
  }

  try {
    const fs = require('fs');
    const scriptPath = path.join(__dirname, 'translation', 'contentScript.js');
    const scriptContent = fs.readFileSync(scriptPath, 'utf8');

    mainWindow.webContents.executeJavaScript(scriptContent)
      .then(() => {
        log('info', '翻译脚本注入成功');
      })
      .catch((error) => {
        log('error', '翻译脚本注入失败:', error);
      });
  } catch (error) {
    log('error', '读取翻译脚本失败:', error);
  }
}

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
 * 创建 Electron 主窗口
 */
function createWindow() {
  log('info', '创建 Electron 窗口...');

  mainWindow = new BrowserWindow({
    width: config.windowConfig.width,
    height: config.windowConfig.height,
    title: config.windowConfig.title,
    webPreferences: config.windowConfig.webPreferences,
    icon: path.join(__dirname, '../resources/icon.png')
  });

  // 设置 User-Agent 以支持 WhatsApp Web
  // 使用与 Electron 版本匹配的 Chrome User-Agent
  // 这是标准做法，官方 WhatsApp Desktop 也是这样做的
  const chromeVersion = process.versions.chrome;
  const userAgent = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36`;
  mainWindow.webContents.setUserAgent(userAgent);

  log('info', `User-Agent: ${userAgent}`);

  // 加载 WhatsApp Web
  log('info', '加载 WhatsApp Web...');
  mainWindow.loadURL('https://web.whatsapp.com');

  // 注入翻译内容脚本
  mainWindow.webContents.on('did-finish-load', () => {
    log('info', 'WhatsApp Web 加载完成，注入翻译脚本...');
    injectTranslationScript();
  });

  // 过滤 WhatsApp Web 的内部错误（可选）
  // 这些错误来自 WhatsApp 自己的代码，不影响功能
  if (config.consoleFilter.enabled) {
    mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
      // 过滤已知的 WhatsApp 内部错误
      const shouldIgnore = config.consoleFilter.ignoredPatterns.some(
        pattern => message.includes(pattern)
      );
      
      if (!shouldIgnore && level >= 2) { // 只记录警告和错误
        log(level === 2 ? 'warn' : 'error', `[WhatsApp Web] ${message}`);
      }
    });
    
    log('info', 'WhatsApp Web 控制台过滤已启用');
  }

  // 窗口关闭事件
  mainWindow.on('closed', () => {
    log('info', '主窗口已关闭');
    mainWindow = null;
  });

  // 开发模式下打开开发者工具
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  log('info', 'Electron 窗口创建完成');
}

/**
 * 清理资源
 */
async function cleanup() {
  log('info', '开始清理资源...');

  // 注销 IPC 处理器
  try {
    unregisterIPCHandlers();
    log('info', 'IPC 处理器已注销');
  } catch (error) {
    log('error', '注销 IPC 处理器时出错:', error);
  }

  // 清理翻译服务
  try {
    await translationService.cleanup();
    log('info', '翻译服务已清理');
  } catch (error) {
    log('error', '清理翻译服务时出错:', error);
  }

  log('info', '资源清理完成');
}

/**
 * 应用程序就绪事件
 */
app.whenReady().then(async () => {
  log('info', 'Electron 应用已就绪');

  try {
    // 初始化翻译服务
    try {
      await translationService.initialize();
      log('info', '翻译服务初始化完成');
    } catch (error) {
      log('error', '翻译服务初始化失败:', error);
      log('error', '错误堆栈:', error.stack);
    }

    // 注册 IPC 处理器
    try {
      registerIPCHandlers();
      log('info', 'IPC 处理器注册完成');
    } catch (error) {
      log('error', 'IPC 处理器注册失败:', error);
    }

    // 创建窗口
    createWindow();

  } catch (error) {
    log('error', '应用启动失败:', error);
    log('error', '错误堆栈:', error.stack);
    app.quit();
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
  log('info', '所有窗口已关闭');

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
