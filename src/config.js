/**
 * 应用程序配置
 */

module.exports = {
  // 会话数据存储路径
  sessionPath: process.env.SESSION_PATH || './session-data',
  
  // Electron 窗口配置
  windowConfig: {
    width: 1200,
    height: 800,
    title: 'WhatsApp Desktop',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  },
  
  // Puppeteer 配置参数
  puppeteerArgs: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--disable-gpu',
    '--disable-software-rasterizer'
  ],
  
  // 日志级别
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // 控制台过滤配置
  consoleFilter: {
    // 是否过滤 WhatsApp Web 的内部错误
    enabled: process.env.FILTER_CONSOLE !== 'false',
    // 要过滤的错误模式
    ignoredPatterns: [
      'ErrorUtils caught an error',
      'x-storagemutated',
      'Subsequent non-fatal errors',
      'debugjs',
      'fburl.com'
    ]
  },
  
  // 重连配置
  reconnect: {
    enabled: true,
    delay: 5000, // 5秒后重连
    maxAttempts: 5
  }
};
