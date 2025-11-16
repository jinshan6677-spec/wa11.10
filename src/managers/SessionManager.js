/**
 * SessionManager - 会话管理器
 * 
 * 负责管理 WhatsApp 账号的会话持久化和恢复
 * 包括登录状态检测、会话数据保存和清除
 */

const { session } = require('electron');
const path = require('path');
const fs = require('fs').promises;

/**
 * SessionManager 类
 */
class SessionManager {
  /**
   * 创建会话管理器
   * @param {Object} [options] - 配置选项
   * @param {string} [options.userDataPath] - 用户数据根目录
   */
  constructor(options = {}) {
    this.userDataPath = options.userDataPath;
    
    // 登录状态缓存 Map: instanceId -> boolean
    this.loginStatusCache = new Map();
    
    // 日志函数
    this.log = this._createLogger();
  }

  /**
   * 创建日志记录器
   * @private
   * @returns {Function}
   */
  _createLogger() {
    return (level, message, ...args) => {
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] [SessionManager] [${level.toUpperCase()}] ${message}`;
      
      if (level === 'error') {
        console.error(logMessage, ...args);
      } else if (level === 'warn') {
        console.warn(logMessage, ...args);
      } else {
        console.log(logMessage, ...args);
      }
    };
  }

  /**
   * 获取实例的 session 对象
   * @param {string} instanceId - 实例 ID
   * @returns {Electron.Session}
   */
  getInstanceSession(instanceId) {
    const partition = `persist:account_${instanceId}`;
    return session.fromPartition(partition);
  }

  /**
   * 获取实例的用户数据目录路径
   * @param {string} instanceId - 实例 ID
   * @returns {string}
   */
  getUserDataDir(instanceId) {
    return path.join(this.userDataPath, 'profiles', instanceId);
  }

  /**
   * 检查会话数据是否存在
   * @param {string} instanceId - 实例 ID
   * @returns {Promise<boolean>}
   */
  async hasSessionData(instanceId) {
    try {
      const userDataDir = this.getUserDataDir(instanceId);
      
      // 检查用户数据目录是否存在
      try {
        await fs.access(userDataDir);
      } catch {
        return false;
      }
      
      // 检查关键的会话文件是否存在
      // WhatsApp Web 使用 IndexedDB 存储会话数据
      const indexedDBPath = path.join(userDataDir, 'IndexedDB');
      const localStoragePath = path.join(userDataDir, 'Local Storage');
      
      try {
        await fs.access(indexedDBPath);
        this.log('info', `Session data found for instance ${instanceId}`);
        return true;
      } catch {
        try {
          await fs.access(localStoragePath);
          this.log('info', `Session data found for instance ${instanceId}`);
          return true;
        } catch {
          this.log('info', `No session data found for instance ${instanceId}`);
          return false;
        }
      }
    } catch (error) {
      this.log('error', `Error checking session data for instance ${instanceId}:`, error);
      return false;
    }
  }

  /**
   * 检测实例的登录状态
   * @param {string} instanceId - 实例 ID
   * @param {BrowserWindow} window - 浏览器窗口
   * @returns {Promise<boolean>}
   */
  async detectLoginStatus(instanceId, window) {
    try {
      if (!window || window.isDestroyed()) {
        this.log('warn', `Window for instance ${instanceId} is destroyed`);
        return false;
      }

      // 执行 JavaScript 检测登录状态
      // WhatsApp Web 在登录后会有特定的 DOM 元素
      const isLoggedIn = await window.webContents.executeJavaScript(`
        (function() {
          try {
            // 检查是否存在二维码（未登录）
            const qrCode = document.querySelector('[data-ref], canvas[aria-label*="QR"], div[data-testid="qrcode"]');
            if (qrCode && qrCode.offsetParent !== null) {
              return false;
            }
            
            // 检查是否存在聊天列表（已登录）
            const chatList = document.querySelector('[data-testid="chat-list"], #pane-side, div[role="grid"]');
            if (chatList && chatList.offsetParent !== null) {
              return true;
            }
            
            // 检查是否存在主界面容器
            const mainContainer = document.querySelector('#app .app-wrapper-web, #app > div > div');
            if (mainContainer) {
              // 如果主容器存在但没有二维码，可能已登录
              const hasQR = document.querySelector('[data-ref], canvas[aria-label*="QR"]');
              return !hasQR;
            }
            
            return false;
          } catch (error) {
            console.error('Login detection error:', error);
            return false;
          }
        })();
      `).catch(error => {
        this.log('error', `Failed to execute login detection script for instance ${instanceId}:`, error);
        return false;
      });

      // 更新缓存
      this.loginStatusCache.set(instanceId, isLoggedIn);
      
      this.log('info', `Login status for instance ${instanceId}: ${isLoggedIn ? 'logged in' : 'not logged in'}`);
      
      return isLoggedIn;
    } catch (error) {
      this.log('error', `Error detecting login status for instance ${instanceId}:`, error);
      return false;
    }
  }

  /**
   * 获取缓存的登录状态
   * @param {string} instanceId - 实例 ID
   * @returns {boolean|null}
   */
  getCachedLoginStatus(instanceId) {
    return this.loginStatusCache.get(instanceId) ?? null;
  }

  /**
   * 设置登录状态缓存
   * @param {string} instanceId - 实例 ID
   * @param {boolean} isLoggedIn - 是否已登录
   */
  setLoginStatus(instanceId, isLoggedIn) {
    this.loginStatusCache.set(instanceId, isLoggedIn);
  }

  /**
   * 清除实例的登录状态缓存
   * @param {string} instanceId - 实例 ID
   */
  clearLoginStatusCache(instanceId) {
    this.loginStatusCache.delete(instanceId);
  }

  /**
   * 配置 session 持久化选项
   * @param {string} instanceId - 实例 ID
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async configureSessionPersistence(instanceId) {
    try {
      const instanceSession = this.getInstanceSession(instanceId);
      
      // Electron 的 session.fromPartition('persist:xxx') 已经自动启用持久化
      // 这里可以配置额外的选项
      
      // 设置缓存大小限制（可选）
      // instanceSession.setCache({ maxSize: 100 * 1024 * 1024 }); // 100MB
      
      this.log('info', `Session persistence configured for instance ${instanceId}`);
      
      return { success: true };
    } catch (error) {
      this.log('error', `Failed to configure session persistence for instance ${instanceId}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 获取会话数据统计信息
   * @param {string} instanceId - 实例 ID
   * @returns {Promise<{size: number, files: number, error?: string}>}
   */
  async getSessionDataStats(instanceId) {
    try {
      const userDataDir = this.getUserDataDir(instanceId);
      
      // 检查目录是否存在
      try {
        await fs.access(userDataDir);
      } catch {
        return { size: 0, files: 0 };
      }
      
      // 递归计算目录大小和文件数
      const stats = await this._calculateDirectorySize(userDataDir);
      
      this.log('info', `Session data stats for instance ${instanceId}: ${stats.size} bytes, ${stats.files} files`);
      
      return stats;
    } catch (error) {
      this.log('error', `Failed to get session data stats for instance ${instanceId}:`, error);
      return {
        size: 0,
        files: 0,
        error: error.message
      };
    }
  }

  /**
   * 递归计算目录大小
   * @private
   * @param {string} dirPath - 目录路径
   * @returns {Promise<{size: number, files: number}>}
   */
  async _calculateDirectorySize(dirPath) {
    let totalSize = 0;
    let totalFiles = 0;
    
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          const subStats = await this._calculateDirectorySize(fullPath);
          totalSize += subStats.size;
          totalFiles += subStats.files;
        } else if (entry.isFile()) {
          const stat = await fs.stat(fullPath);
          totalSize += stat.size;
          totalFiles++;
        }
      }
    } catch (error) {
      // 忽略权限错误等
      this.log('warn', `Error calculating directory size for ${dirPath}:`, error.message);
    }
    
    return { size: totalSize, files: totalFiles };
  }

  /**
   * 清除实例的所有会话数据
   * @param {string} instanceId - 实例 ID
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async clearSessionData(instanceId) {
    try {
      this.log('info', `Clearing session data for instance ${instanceId}`);
      
      const instanceSession = this.getInstanceSession(instanceId);
      
      // 清除所有缓存和存储数据
      await instanceSession.clearStorageData({
        storages: [
          'appcache',
          'cookies',
          'filesystem',
          'indexdb',
          'localstorage',
          'shadercache',
          'websql',
          'serviceworkers',
          'cachestorage'
        ]
      });
      
      // 清除缓存
      await instanceSession.clearCache();
      
      // 清除登录状态缓存
      this.clearLoginStatusCache(instanceId);
      
      this.log('info', `Session data cleared for instance ${instanceId}`);
      
      return { success: true };
    } catch (error) {
      this.log('error', `Failed to clear session data for instance ${instanceId}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 删除实例的用户数据目录
   * @param {string} instanceId - 实例 ID
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async deleteUserDataDir(instanceId) {
    try {
      const userDataDir = this.getUserDataDir(instanceId);
      
      this.log('info', `Deleting user data directory for instance ${instanceId}: ${userDataDir}`);
      
      // 删除目录
      await fs.rm(userDataDir, { recursive: true, force: true });
      
      // 清除登录状态缓存
      this.clearLoginStatusCache(instanceId);
      
      this.log('info', `User data directory deleted for instance ${instanceId}`);
      
      return { success: true };
    } catch (error) {
      this.log('error', `Failed to delete user data directory for instance ${instanceId}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 备份实例的会话数据
   * @param {string} instanceId - 实例 ID
   * @param {string} backupPath - 备份目录路径
   * @returns {Promise<{success: boolean, backupPath?: string, error?: string}>}
   */
  async backupSessionData(instanceId, backupPath) {
    try {
      const userDataDir = this.getUserDataDir(instanceId);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupDir = path.join(backupPath, `backup-${instanceId}-${timestamp}`);
      
      this.log('info', `Backing up session data for instance ${instanceId} to ${backupDir}`);
      
      // 复制目录
      await this._copyDirectory(userDataDir, backupDir);
      
      this.log('info', `Session data backed up for instance ${instanceId}`);
      
      return {
        success: true,
        backupPath: backupDir
      };
    } catch (error) {
      this.log('error', `Failed to backup session data for instance ${instanceId}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 恢复实例的会话数据
   * @param {string} instanceId - 实例 ID
   * @param {string} backupPath - 备份目录路径
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async restoreSessionData(instanceId, backupPath) {
    try {
      const userDataDir = this.getUserDataDir(instanceId);
      
      this.log('info', `Restoring session data for instance ${instanceId} from ${backupPath}`);
      
      // 删除现有数据
      await fs.rm(userDataDir, { recursive: true, force: true });
      
      // 复制备份数据
      await this._copyDirectory(backupPath, userDataDir);
      
      // 清除登录状态缓存，需要重新检测
      this.clearLoginStatusCache(instanceId);
      
      this.log('info', `Session data restored for instance ${instanceId}`);
      
      return { success: true };
    } catch (error) {
      this.log('error', `Failed to restore session data for instance ${instanceId}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 递归复制目录
   * @private
   * @param {string} src - 源目录
   * @param {string} dest - 目标目录
   */
  async _copyDirectory(src, dest) {
    await fs.mkdir(dest, { recursive: true });
    
    const entries = await fs.readdir(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        await this._copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }
}

module.exports = SessionManager;
