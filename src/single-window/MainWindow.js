/**
 * MainWindow - Single Window Architecture Main Window Manager
 * 
 * Manages the single main application window that contains both the account
 * management sidebar and the session display area for BrowserViews.
 */

const { BrowserWindow, screen, desktopCapturer } = require('electron');
const Store = require('electron-store');
const path = require('path');

/**
 * MainWindow class
 */
class MainWindow {
  /**
   * Create MainWindow instance
   * @param {Object} [options] - Configuration options
   * @param {number} [options.width] - Initial window width
   * @param {number} [options.height] - Initial window height
   * @param {number} [options.minWidth] - Minimum window width
   * @param {number} [options.minHeight] - Minimum window height
   * @param {string} [options.title] - Window title
   * @param {string} [options.preloadPath] - Path to preload script
   * @param {string} [options.htmlPath] - Path to HTML file to load
   */
  constructor(options = {}) {
    this.options = {
      width: options.width || 1400,
      height: options.height || 900,
      minWidth: options.minWidth || 1000,
      minHeight: options.minHeight || 600,
      title: options.title || 'WhatsApp Desktop',
      preloadPath: options.preloadPath || path.join(__dirname, 'renderer', 'preload-main.js'),
      htmlPath: options.htmlPath || path.join(__dirname, 'renderer', 'app.html'),
      ...options
    };

    this.window = null;
    this.devToolsWindow = null; // 独立的开发者工具窗口
    this.isInitialized = false;

    // Initialize state store for window bounds persistence
    this.stateStore = new Store({
      name: 'window-state',
      defaults: {
        bounds: {
          x: undefined,
          y: undefined,
          width: this.options.width,
          height: this.options.height
        },
        isMaximized: false,
        sidebarWidth: 280
      }
    });
  }

  /**
   * Initialize and create the main window
   * @returns {BrowserWindow} The created window instance
   */
  initialize() {
    if (this.isInitialized) {
      console.warn('MainWindow already initialized');
      return this.window;
    }

    // Load saved window state
    const savedState = this.stateStore.get('bounds');
    const isMaximized = this.stateStore.get('isMaximized', false);

    // Ensure window is visible on screen
    const bounds = this._ensureVisibleBounds(savedState);

    // Create the browser window
    this.window = new BrowserWindow({
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      minWidth: this.options.minWidth,
      minHeight: this.options.minHeight,
      title: this.options.title,
      show: false, // Don't show until ready
      backgroundColor: '#ffffff',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        preload: this.options.preloadPath
      }
    });

    // Load the HTML file
    this.window.loadFile(this.options.htmlPath);

    // Show window when ready
    this.window.once('ready-to-show', () => {
      if (isMaximized) {
        this.window.maximize();
      }
      this.window.show();

      // 在开发模式下自动打开开发者工具（独立窗口）
      if (process.env.NODE_ENV === 'development') {
        setTimeout(() => {
          this.openDeveloperToolsInDetachedWindow();
        }, 1000); // 延迟打开，等待窗口完全显示
      }
    });

    // Set up event handlers
    this._setupEventHandlers();

    this.isInitialized = true;

    return this.window;
  }

  /**
   * Set up window event handlers
   * @private
   */
  _setupEventHandlers() {
    // Save window state on resize
    this.window.on('resize', () => {
      this._saveWindowState();
      
      // Notify about window resize for view bounds recalculation
      this._notifyWindowResize();
    });

    // Save window state on move
    this.window.on('move', () => {
      this._saveWindowState();
    });

    // Save maximized state
    this.window.on('maximize', () => {
      this.stateStore.set('isMaximized', true);
      
      // Recalculate view bounds when maximized
      this._notifyWindowResize();
    });

    this.window.on('unmaximize', () => {
      this.stateStore.set('isMaximized', false);
      
      // Recalculate view bounds when unmaximized
      this._notifyWindowResize();
    });

    // Clean up on close
    this.window.on('closed', () => {
      // 关闭独立的开发者工具窗口
      if (this.devToolsWindow && !this.devToolsWindow.isDestroyed()) {
        this.devToolsWindow.close();
      }
      
      this.window = null;
      this.devToolsWindow = null;
      this.isInitialized = false;
    });

    // Handle console messages from renderer (for debugging)
    this.window.webContents.on('console-message', (_event, _level, message) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Renderer Console] ${message}`);
      }
    });

    // 设置开发者工具快捷键
    this._setupKeyboardShortcuts();
  }

  /**
   * Notify about window resize event
   * @private
   */
  _notifyWindowResize() {
    if (!this.window || this.window.isDestroyed()) {
      return;
    }

    // Send event to renderer
    this.window.webContents.send('window-resized', {
      bounds: this.window.getBounds(),
      timestamp: Date.now()
    });
  }

  /**
   * Save current window state to persistent storage
   * @private
   */
  _saveWindowState() {
    if (!this.window || this.window.isDestroyed()) {
      return;
    }

    // Don't save bounds if window is maximized or minimized
    if (this.window.isMaximized() || this.window.isMinimized()) {
      return;
    }

    const bounds = this.window.getBounds();
    this.stateStore.set('bounds', bounds);
  }

  /**
   * Ensure window bounds are visible on current displays
   * @param {Object} bounds - Window bounds to validate
   * @returns {Object} Validated bounds
   * @private
   */
  _ensureVisibleBounds(bounds) {
    const displays = screen.getAllDisplays();
    
    // If no saved bounds, center on primary display
    if (!bounds || bounds.x === undefined || bounds.y === undefined) {
      const primaryDisplay = screen.getPrimaryDisplay();
      const { width, height } = primaryDisplay.workAreaSize;
      
      return {
        x: Math.floor((width - this.options.width) / 2),
        y: Math.floor((height - this.options.height) / 2),
        width: this.options.width,
        height: this.options.height
      };
    }

    // Check if window is visible on any display
    const isVisible = displays.some(display => {
      const { x, y, width, height } = display.bounds;
      return (
        bounds.x >= x &&
        bounds.y >= y &&
        bounds.x + bounds.width <= x + width &&
        bounds.y + bounds.height <= y + height
      );
    });

    // If not visible, center on primary display
    if (!isVisible) {
      const primaryDisplay = screen.getPrimaryDisplay();
      const { width, height } = primaryDisplay.workAreaSize;
      
      return {
        x: Math.floor((width - bounds.width) / 2),
        y: Math.floor((height - bounds.height) / 2),
        width: bounds.width,
        height: bounds.height
      };
    }

    return bounds;
  }

  /**
   * Get the BrowserWindow instance
   * @returns {BrowserWindow|null}
   */
  getWindow() {
    return this.window;
  }

  /**
   * Get current window bounds
   * @returns {Object|null} Window bounds {x, y, width, height}
   */
  getBounds() {
    if (!this.window || this.window.isDestroyed()) {
      return null;
    }
    return this.window.getBounds();
  }

  /**
   * Set window bounds
   * @param {Object} bounds - Window bounds {x, y, width, height}
   */
  setBounds(bounds) {
    if (!this.window || this.window.isDestroyed()) {
      return;
    }
    this.window.setBounds(bounds);
  }

  /**
   * Show the window
   */
  show() {
    if (!this.window || this.window.isDestroyed()) {
      return;
    }
    this.window.show();
  }

  /**
   * Hide the window
   */
  hide() {
    if (!this.window || this.window.isDestroyed()) {
      return;
    }
    this.window.hide();
  }

  /**
   * Focus the window
   */
  focus() {
    if (!this.window || this.window.isDestroyed()) {
      return;
    }
    if (this.window.isMinimized()) {
      this.window.restore();
    }
    this.window.focus();
  }

  /**
   * Close the window
   */
  close() {
    if (!this.window || this.window.isDestroyed()) {
      return;
    }
    this.window.close();
  }

  /**
   * Check if window is destroyed
   * @returns {boolean}
   */
  isDestroyed() {
    return !this.window || this.window.isDestroyed();
  }

  /**
   * Send message to renderer process via IPC
   * @param {string} channel - IPC channel name
   * @param {*} data - Data to send
   */
  sendToRenderer(channel, data) {
    if (!this.window || this.window.isDestroyed()) {
      console.warn('Cannot send to renderer: window is destroyed');
      return;
    }
    this.window.webContents.send(channel, data);
  }

  /**
   * Get saved sidebar width
   * @returns {number} Sidebar width in pixels
   */
  getSidebarWidth() {
    return this.stateStore.get('sidebarWidth', 280);
  }

  /**
   * Save sidebar width
   * @param {number} width - Sidebar width in pixels
   */
  setSidebarWidth(width) {
    this.stateStore.set('sidebarWidth', width);
  }

  /**
   * Get window state store
   * @returns {Store} The electron-store instance
   */
  getStateStore() {
    return this.stateStore;
  }

  /**
   * Check if window is initialized
   * @returns {boolean}
   */
  isReady() {
    return this.isInitialized && this.window && !this.window.isDestroyed();
  }

  /**
   * Toggle developer tools
   */
  toggleDeveloperTools() {
    if (!this.window || this.window.isDestroyed()) {
      console.warn('Cannot toggle developer tools: window is destroyed');
      return;
    }

    if (this.window.webContents.isDevToolsOpened()) {
      this.window.webContents.closeDevTools();
      console.log('开发者工具已关闭');
    } else {
      // 使用独立的窗口打开开发者工具，避免被覆盖
      this.window.webContents.openDevTools({
        mode: 'detach',
        position: 'right' // 在右侧打开
      });
      console.log('开发者工具已打开（独立窗口）');
      
      // 等待开发者工具窗口打开后再聚焦到主窗口
      setTimeout(() => {
        if (this.window && !this.window.isDestroyed()) {
          this.window.focus();
        }
      }, 500);
    }
  }

  /**
   * Setup keyboard shortcuts for developer tools
   * @private
   */
  _setupKeyboardShortcuts() {
    if (!this.window || this.window.isDestroyed()) {
      return;
    }

    // 注册 F12 快捷键来切换开发者工具
    this.window.webContents.on('before-input-event', (event, input) => {
      // 只在开发模式下启用快捷键
      if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'debug') {
        return;
      }

      // F12 键切换独立开发者工具窗口
      if (input.key === 'F12' && input.type === 'keyDown' && !input.isAutoRepeat) {
        event.preventDefault();
        if (this.isDevToolsWindowOpen()) {
          this.closeDevToolsWindow();
          console.log('独立开发者工具窗口已关闭');
        } else {
          this.openDeveloperToolsInDetachedWindow();
        }
      }

      // Ctrl+Shift+I 快捷键（Windows/Linux）或 Cmd+Opt+I（macOS）
      if (input.key === 'I' && input.control && input.shift && input.type === 'keyDown' && !input.isAutoRepeat) {
        event.preventDefault();
        if (this.isDevToolsWindowOpen()) {
          this.closeDevToolsWindow();
          console.log('独立开发者工具窗口已关闭');
        } else {
          this.openDeveloperToolsInDetachedWindow();
        }
      }
      if (input.key === 'I' && input.meta && input.alt && input.type === 'keyDown' && !input.isAutoRepeat) {
        event.preventDefault();
        if (this.isDevToolsWindowOpen()) {
          this.closeDevToolsWindow();
          console.log('独立开发者工具窗口已关闭');
        } else {
          this.openDeveloperToolsInDetachedWindow();
        }
      }
    });
  }

  /**
   * Check if developer tools are open
   * @returns {boolean}
   */
  isDevToolsOpened() {
    // 检查传统的开发者工具
    if (this.window && !this.window.isDestroyed()) {
      if (this.window.webContents.isDevToolsOpened()) {
        return true;
      }
    }
    
    // 检查新的独立开发者工具窗口
    return this.isDevToolsWindowOpen();
  }

  /**
   * Open developer tools in a completely separate window
   * This ensures the dev tools window is always visible and not covered by any interface
   */
  openDeveloperToolsInDetachedWindow() {
    if (!this.window || this.window.isDestroyed()) {
      console.warn('Cannot open developer tools: window is destroyed');
      return;
    }

    try {
      // 如果开发者工具窗口已存在，先关闭它
      if (this.devToolsWindow && !this.devToolsWindow.isDestroyed()) {
        this.devToolsWindow.close();
        this.devToolsWindow = null;
      }

      // 获取当前屏幕的工作区域
      const primaryDisplay = screen.getPrimaryDisplay();
      const { width, height, x, y } = primaryDisplay.workArea;
      
      // 计算开发者工具窗口的位置（右侧）
      const devToolsWidth = 800;
      const devToolsHeight = 700;
      
      const devToolsBounds = {
        x: width - devToolsWidth - 50, // 距离屏幕右边50像素
        y: 50, // 距离屏幕上边50像素
        width: devToolsWidth,
        height: devToolsHeight
      };

      // 创建一个独立的开发者工具窗口
      this.devToolsWindow = new BrowserWindow({
        ...devToolsBounds,
        title: 'WhatsApp Desktop - 开发者控制台',
        type: 'desktop', // 桌面窗口类型，确保在最前面
        frame: true, // 显示窗口边框和标题栏
        resizable: true,
        minimizable: true,
        maximizable: true,
        alwaysOnTop: true, // 始终在前面
        skipTaskbar: false, // 在任务栏显示
        show: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          sandbox: true,
          enableRemoteModule: false,
          webSecurity: true
        }
      });

      // 加载一个特殊的HTML页面，显示控制台日志
      const devToolsHTML = this._generateDevToolsHTML();
      this.devToolsWindow.loadFile('data:text/html;charset=utf-8,' + encodeURIComponent(devToolsHTML));

      // 显示开发者工具窗口
      this.devToolsWindow.once('ready-to-show', () => {
        this.devToolsWindow.show();
        console.log('独立开发者工具窗口已创建并显示');
      });

      // 设置关闭事件处理器
      this.devToolsWindow.on('closed', () => {
        this.devToolsWindow = null;
        console.log('开发者工具窗口已关闭');
      });

      // 聚焦到主窗口
      setTimeout(() => {
        if (this.window && !this.window.isDestroyed()) {
          this.window.focus();
        }
      }, 500);

      // 启动控制台日志捕获
      this._startConsoleCapture();

    } catch (error) {
      console.error('Failed to create standalone developer tools window:', error);
      
      // 回退到传统的开发者工具方法
      this._fallbackToTraditionalDevTools();
    }
  }

  /**
   * Generate HTML content for the standalone dev tools window
   * @private
   */
  _generateDevToolsHTML() {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>WhatsApp Desktop - 开发者控制台</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            background: #1e1e1e;
            color: #d4d4d4;
            font-size: 14px;
        }
        
        .header {
            background: #2d2d30;
            padding: 10px 15px;
            border-bottom: 1px solid #3e3e42;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .title {
            font-weight: bold;
            color: #ffffff;
        }
        
        .status {
            color: #4ec9b0;
        }
        
        .controls button {
            background: #0e639c;
            color: white;
            border: none;
            padding: 5px 10px;
            margin-left: 10px;
            border-radius: 3px;
            cursor: pointer;
        }
        
        .controls button:hover {
            background: #1177bb;
        }
        
        .console {
            height: calc(100vh - 60px);
            overflow-y: auto;
            padding: 10px;
            background: #1e1e1e;
        }
        
        .log-entry {
            margin: 2px 0;
            padding: 2px 0;
            border-left: 3px solid transparent;
            padding-left: 10px;
        }
        
        .log-entry.info {
            border-left-color: #4ec9b0;
        }
        
        .log-entry.warn {
            border-left-color: #dcdcaa;
        }
        
        .log-entry.error {
            border-left-color: #f48771;
        }
        
        .timestamp {
            color: #858585;
            margin-right: 10px;
        }
        
        .message {
            color: #d4d4d4;
        }
        
        .clear-btn {
            background: #c586c0;
        }
        
        .clear-btn:hover {
            background: #b573c0;
        }
        
        .auto-scroll {
            background: #1e1e1e;
            color: #d4d4d4;
        }
        
        .auto-scroll.selected {
            background: #0e639c;
        }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <span class="title">WhatsApp Desktop - 开发者控制台</span>
            <span class="status" id="status">已连接</span>
        </div>
        <div class="controls">
            <button class="clear-btn" onclick="clearConsole()">清空</button>
            <button id="autoScrollBtn" class="auto-scroll" onclick="toggleAutoScroll()">自动滚动: 开</button>
        </div>
    </div>
    <div class="console" id="console">
        <div class="log-entry info">
            <span class="timestamp">[${new Date().toLocaleTimeString()}]</span>
            <span class="message">开发者控制台已启动 - 等待应用日志输出...</span>
        </div>
    </div>

    <script>
        let autoScroll = true;
        let logBuffer = [];
        let isConnected = true;
        
        const console = document.getElementById('console');
        const status = document.getElementById('status');
        const autoScrollBtn = document.getElementById('autoScrollBtn');
        
        function addLog(level, message, timestamp = Date.now()) {
            const time = new Date(timestamp).toLocaleTimeString();
            const logEntry = document.createElement('div');
            logEntry.className = 'log-entry ' + level;
            logEntry.innerHTML = \`
                <span class="timestamp">[\${time}]</span>
                <span class="message">\${escapeHtml(message)}</span>
            \`;
            
            console.appendChild(logEntry);
            
            if (autoScroll) {
                console.scrollTop = console.scrollHeight;
            }
            
            // 限制显示条目数量
            const entries = console.children.length;
            if (entries > 1000) {
                console.removeChild(console.firstChild);
            }
        }
        
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
        
        function clearConsole() {
            console.innerHTML = '<div class="log-entry info"><span class="timestamp">[' + new Date().toLocaleTimeString() + ']</span><span class="message">控制台已清空</span></div>';
        }
        
        function toggleAutoScroll() {
            autoScroll = !autoScroll;
            if (autoScroll) {
                autoScrollBtn.classList.add('selected');
                autoScrollBtn.textContent = '自动滚动: 开';
            } else {
                autoScrollBtn.classList.remove('selected');
                autoScrollBtn.textContent = '自动滚动: 关';
            }
        }
        
        // 模拟日志输出（实际实现中会通过IPC或WebSocket接收）
        function connectToMainApp() {
            // 这里会与主应用建立连接来接收实时日志
            console.log('正在连接到主应用...');
        }
        
        // 模拟一些测试日志
        setTimeout(() => {
            addLog('info', '主应用启动中...');
        }, 1000);
        
        setTimeout(() => {
            addLog('info', '管理器初始化完成');
        }, 2000);
        
        setTimeout(() => {
            addLog('warn', '检测到网络连接延迟');
        }, 3000);
        
        // 连接状态检查
        setInterval(() => {
            if (!isConnected) {
                status.textContent = '连接断开';
                status.style.color = '#f48771';
            }
        }, 5000);
        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'l') {
                e.preventDefault();
                clearConsole();
            }
            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                location.reload();
            }
        });
        
        // 页面加载完成后连接
        window.addEventListener('load', () => {
            connectToMainApp();
        });
    </script>
</body>
</html>
    `;
  }

  /**
   * Start capturing console logs from the main app
   * @private
   */
  _startConsoleCapture() {
    try {
      // 通过IPC监听来自主窗口的日志消息
      this.window.webContents.once('dom-ready', () => {
        // 设置控制台日志监听
        this.window.webContents.executeJavaScript(`
          (function() {
            const originalLog = console.log;
            const originalWarn = console.warn;
            const originalError = console.error;
            
            console.log = function(...args) {
              originalLog.apply(console, args);
              window.postMessage({ type: 'console', level: 'info', message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ') });
            };
            
            console.warn = function(...args) {
              originalWarn.apply(console, args);
              window.postMessage({ type: 'console', level: 'warn', message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ') });
            };
            
            console.error = function(...args) {
              originalError.apply(console, args);
              window.postMessage({ type: 'console', level: 'error', message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ') });
            };
            
            return true;
          })();
        `).then((result) => {
          console.log('控制台日志捕获已启用');
        }).catch((error) => {
          console.error('启用控制台日志捕获失败:', error);
        });
      });

      // 设置消息监听器来接收渲染进程的控制台输出
      const { ipcMain } = require('electron');
      
      // 创建一次性监听器
      const logListener = (event, logData) => {
        if (this.devToolsWindow && !this.devToolsWindow.isDestroyed()) {
          this.devToolsWindow.webContents.executeJavaScript(`
            (function() {
              if (window.addLog) {
                addLog('${logData.level || 'info'}', '${logData.message || ''}', ${logData.timestamp || Date.now()});
              }
            })();
          `).catch(() => {}); // 忽略执行错误
        }
      };

      // 这里我们需要通过一个方法来将日志从渲染进程传递到独立的开发者工具窗口
      // 为了简化，我们可以直接通过控制台方法
      
    } catch (error) {
      console.error('设置控制台捕获时出错:', error);
    }
  }

  /**
   * Fallback to traditional developer tools if standalone window fails
   * @private
   */
  _fallbackToTraditionalDevTools() {
    try {
      if (this.window && !this.window.isDestroyed()) {
        this.window.webContents.openDevTools({
          mode: 'detach',
          width: 800,
          height: 600
        });
        console.log('回退到传统开发者工具模式');
      }
    } catch (error) {
      console.error('传统开发者工具模式也失败了:', error);
    }
  }

  /**
   * Force focus on the main window
   */
  forceFocus() {
    if (!this.window || this.window.isDestroyed()) {
      return;
    }
    this.window.focus();
    this.window.moveTo(100, 100); // 确保窗口在前台
  }

  /**
   * Close standalone developer tools window
   */
  closeDevToolsWindow() {
    if (this.devToolsWindow && !this.devToolsWindow.isDestroyed()) {
      this.devToolsWindow.close();
      this.devToolsWindow = null;
    }
  }

  /**
   * Check if developer tools window exists and is open
   * @returns {boolean}
   */
  isDevToolsWindowOpen() {
    return this.devToolsWindow && !this.devToolsWindow.isDestroyed();
  }
}

module.exports = MainWindow;
