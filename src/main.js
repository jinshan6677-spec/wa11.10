/**
 * WhatsApp Desktop - Electron 主进程
 * 
 * 这个应用将 WhatsApp Web 封装为桌面应用，并使用 whatsapp-web.js
 * 在后台处理认证和提供 API 支持。
 */

const { app, BrowserWindow } = require('electron');
const { Client, LocalAuth } = require('whatsapp-web.js');
const config = require('./config');
const path = require('path');

// 全局变量
let mainWindow = null;
let client = null;
let reconnectAttempts = 0;

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
 * 初始化 WhatsApp 客户端
 */
async function initializeWhatsApp() {
  log('info', '初始化 WhatsApp 客户端...');

  try {
    // 创建 whatsapp-web.js 客户端
    client = new Client({
      authStrategy: new LocalAuth({
        dataPath: config.sessionPath
      }),
      puppeteer: {
        headless: true,
        args: config.puppeteerArgs
      }
    });

    // 注册事件监听器
    registerClientEvents();

    // 初始化客户端
    await client.initialize();
    log('info', 'WhatsApp 客户端初始化完成');

  } catch (error) {
    log('error', 'WhatsApp 客户端初始化失败:', error);
    throw error;
  }
}

/**
 * 注册 WhatsApp 客户端事件监听器
 */
function registerClientEvents() {
  // QR 码事件
  client.on('qr', (qr) => {
    log('info', 'QR 码已生成，请使用手机扫描登录');
    log('debug', 'QR 码内容:', qr);
  });

  // 认证成功事件
  client.on('authenticated', () => {
    log('info', '认证成功');
    reconnectAttempts = 0; // 重置重连计数
  });

  // 认证失败事件
  client.on('auth_failure', (message) => {
    log('error', '认证失败:', message);
  });

  // 客户端就绪事件
  client.on('ready', () => {
    log('info', 'WhatsApp 客户端已就绪，可以正常使用');
  });

  // 消息事件（为未来扩展预留）
  client.on('message', async (msg) => {
    log('debug', `收到消息: ${msg.from} - ${msg.body}`);

    // 这里可以添加自定义逻辑，例如：
    // - 消息翻译
    // - 自动回复
    // - 消息记录
    // - 关键词触发
  });

  // 断开连接事件
  client.on('disconnected', (reason) => {
    log('warn', '客户端已断开连接:', reason);

    // 如果启用了自动重连
    if (config.reconnect.enabled && reconnectAttempts < config.reconnect.maxAttempts) {
      reconnectAttempts++;
      log('info', `尝试重新连接 (${reconnectAttempts}/${config.reconnect.maxAttempts})...`);

      setTimeout(() => {
        log('info', '开始重新连接...');
        client.initialize().catch((error) => {
          log('error', '重新连接失败:', error);
        });
      }, config.reconnect.delay);
    } else if (reconnectAttempts >= config.reconnect.maxAttempts) {
      log('error', '已达到最大重连次数，请手动重启应用');
    }
  });

  // 加载中事件
  client.on('loading_screen', (percent, message) => {
    log('debug', `加载中: ${percent}% - ${message}`);
  });

  // 状态变化事件
  client.on('change_state', (state) => {
    log('debug', '状态变化:', state);
  });
}

/**
 * 清理资源
 */
async function cleanup() {
  log('info', '开始清理资源...');

  if (client) {
    try {
      await client.destroy();
      log('info', 'WhatsApp 客户端已销毁');
    } catch (error) {
      log('error', '销毁客户端时出错:', error);
    }
  }

  log('info', '资源清理完成');
}

/**
 * 应用程序就绪事件
 */
app.whenReady().then(async () => {
  log('info', 'Electron 应用已就绪');

  try {
    // 创建窗口
    createWindow();

    // 初始化 WhatsApp 客户端
    await initializeWhatsApp();

  } catch (error) {
    log('error', '应用启动失败:', error);
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
app.on('before-quit', async (event) => {
  log('info', '应用即将退出');

  if (client) {
    event.preventDefault();
    await cleanup();
    app.exit(0);
  }
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
