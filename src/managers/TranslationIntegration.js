/**
 * TranslationIntegration - 翻译系统集成
 * 
 * 负责为每个账号实例注入翻译脚本并管理独立的翻译配置
 * 确保现有翻译功能在多实例架构中正常工作
 */

const path = require('path');
const fs = require('fs').promises;

/**
 * @typedef {Object} TranslationConfig
 * @property {boolean} enabled - 是否启用翻译
 * @property {string} targetLanguage - 目标语言
 * @property {string} engine - 翻译引擎
 * @property {string} [apiKey] - API 密钥
 * @property {boolean} autoTranslate - 自动翻译
 * @property {boolean} translateInput - 翻译输入框
 * @property {Object} friendSettings - 好友独立设置
 */

/**
 * TranslationIntegration 类
 */
class TranslationIntegration {
  /**
   * 创建翻译集成实例
   * @param {Object} instanceManager - 实例管理器引用
   */
  constructor(instanceManager) {
    this.instanceManager = instanceManager;
    
    // 存储每个实例的翻译配置 Map: instanceId -> TranslationConfig
    this.translationConfigs = new Map();
    
    // 存储每个实例的翻译状态 Map: instanceId -> status
    this.translationStatuses = new Map();
    
    // 缓存翻译脚本内容
    this.scriptCache = {
      optimizer: null,
      contentScript: null
    };
    
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
      const logMessage = `[${timestamp}] [TranslationIntegration] [${level.toUpperCase()}] ${message}`;
      
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
   * 初始化翻译集成
   * @returns {Promise<void>}
   */
  async initialize() {
    this.log('info', 'Initializing translation integration');
    
    try {
      // 预加载翻译脚本到缓存
      await this._loadScriptsToCache();
      this.log('info', 'Translation scripts loaded to cache');
    } catch (error) {
      this.log('error', 'Failed to load translation scripts:', error);
      throw error;
    }
  }

  /**
   * 加载翻译脚本到缓存
   * @private
   * @returns {Promise<void>}
   */
  async _loadScriptsToCache() {
    try {
      // 加载性能优化器脚本
      const optimizerPath = path.join(__dirname, '../translation/contentScriptWithOptimizer.js');
      this.scriptCache.optimizer = await fs.readFile(optimizerPath, 'utf8');
      this.log('info', 'Loaded optimizer script');
      
      // 加载主翻译脚本
      const contentScriptPath = path.join(__dirname, '../translation/contentScript.js');
      this.scriptCache.contentScript = await fs.readFile(contentScriptPath, 'utf8');
      this.log('info', 'Loaded content script');
      
    } catch (error) {
      this.log('error', 'Failed to load scripts to cache:', error);
      throw new Error(`Failed to load translation scripts: ${error.message}`);
    }
  }

  /**
   * 为实例注入翻译脚本
   * @param {string} instanceId - 实例 ID
   * @param {BrowserWindow} window - 浏览器窗口
   * @param {TranslationConfig} [translationConfig] - 翻译配置
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async injectScripts(instanceId, window, translationConfig = null) {
    this.log('info', `Injecting translation scripts for instance ${instanceId}`);
    
    try {
      // 检查窗口是否有效
      if (!window || window.isDestroyed()) {
        return {
          success: false,
          error: 'Window is invalid or destroyed'
        };
      }

      // 存储翻译配置
      if (translationConfig) {
        this.translationConfigs.set(instanceId, translationConfig);
      }

      // 设置 did-finish-load 事件监听器
      window.webContents.on('did-finish-load', async () => {
        this.log('info', `Page loaded for instance ${instanceId}, injecting scripts`);
        
        try {
          // 注入性能优化器
          if (this.scriptCache.optimizer) {
            await window.webContents.executeJavaScript(this.scriptCache.optimizer);
            this.log('info', `Optimizer injected for instance ${instanceId}`);
          }
          
          // 注入主翻译脚本
          if (this.scriptCache.contentScript) {
            await window.webContents.executeJavaScript(this.scriptCache.contentScript);
            this.log('info', `Content script injected for instance ${instanceId}`);
          }
          
          // 初始化翻译系统
          await window.webContents.executeJavaScript(`
            (async function() {
              if (window.WhatsAppTranslation) {
                window.WhatsAppTranslation.accountId = '${instanceId}';
                await window.WhatsAppTranslation.init();
                console.log('[Translation] Initialized for account ${instanceId}');
              }
            })();
          `);
          
          // 更新状态
          this.translationStatuses.set(instanceId, {
            injected: true,
            lastInjectionTime: new Date(),
            error: null
          });
          
          this.log('info', `Translation scripts successfully injected for instance ${instanceId}`);
          
        } catch (error) {
          this.log('error', `Failed to inject scripts for instance ${instanceId}:`, error);
          
          // 更新状态
          this.translationStatuses.set(instanceId, {
            injected: false,
            lastInjectionTime: new Date(),
            error: error.message
          });
        }
      });

      // 如果页面已经加载，立即注入
      if (window.webContents.getURL().includes('web.whatsapp.com')) {
        this.log('info', `Page already loaded for instance ${instanceId}, injecting immediately`);
        
        try {
          // 注入性能优化器
          if (this.scriptCache.optimizer) {
            await window.webContents.executeJavaScript(this.scriptCache.optimizer);
          }
          
          // 注入主翻译脚本
          if (this.scriptCache.contentScript) {
            await window.webContents.executeJavaScript(this.scriptCache.contentScript);
          }
          
          // 初始化翻译系统
          await window.webContents.executeJavaScript(`
            (async function() {
              if (window.WhatsAppTranslation) {
                window.WhatsAppTranslation.accountId = '${instanceId}';
                await window.WhatsAppTranslation.init();
              }
            })();
          `);
          
          // 更新状态
          this.translationStatuses.set(instanceId, {
            injected: true,
            lastInjectionTime: new Date(),
            error: null
          });
          
        } catch (error) {
          this.log('error', `Failed to inject scripts immediately for instance ${instanceId}:`, error);
          
          // 更新状态
          this.translationStatuses.set(instanceId, {
            injected: false,
            lastInjectionTime: new Date(),
            error: error.message
          });
        }
      }

      return { success: true };
      
    } catch (error) {
      this.log('error', `Failed to setup script injection for instance ${instanceId}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 配置实例的翻译设置
   * @param {string} instanceId - 实例 ID
   * @param {TranslationConfig} config - 翻译配置
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async configureTranslation(instanceId, config) {
    this.log('info', `Configuring translation for instance ${instanceId}`);
    
    try {
      // 验证实例是否存在
      const instance = this.instanceManager.instances.get(instanceId);
      if (!instance) {
        return {
          success: false,
          error: 'Instance not found'
        };
      }

      const { window } = instance;
      
      // 检查窗口是否有效
      if (!window || window.isDestroyed()) {
        return {
          success: false,
          error: 'Window is invalid or destroyed'
        };
      }

      // 存储配置
      this.translationConfigs.set(instanceId, config);

      // 通过 IPC 将配置传递给渲染进程
      // 使用 executeJavaScript 直接更新配置
      await window.webContents.executeJavaScript(`
        (async function() {
          if (window.WhatsAppTranslation) {
            // 更新配置
            window.WhatsAppTranslation.config = ${JSON.stringify(config)};
            console.log('[Translation] Configuration updated for account ${instanceId}');
            
            // 重新初始化相关功能
            if (window.WhatsAppTranslation.initialized) {
              // 重新设置中文拦截
              window.WhatsAppTranslation.setupChineseBlock();
              
              // 重新设置实时翻译
              const inputBox = document.querySelector('footer [contenteditable="true"]') ||
                              document.querySelector('[data-testid="conversation-compose-box-input"]');
              if (inputBox) {
                window.WhatsAppTranslation.setupRealtimeTranslation(inputBox);
              }
              
              console.log('[Translation] Features reconfigured');
            }
          }
        })();
      `);

      this.log('info', `Translation configured successfully for instance ${instanceId}`);
      
      return { success: true };
      
    } catch (error) {
      this.log('error', `Failed to configure translation for instance ${instanceId}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 获取实例的翻译状态
   * @param {string} instanceId - 实例 ID
   * @returns {Object|null}
   */
  getTranslationStatus(instanceId) {
    return this.translationStatuses.get(instanceId) || null;
  }

  /**
   * 获取实例的翻译配置
   * @param {string} instanceId - 实例 ID
   * @returns {TranslationConfig|null}
   */
  getTranslationConfig(instanceId) {
    return this.translationConfigs.get(instanceId) || null;
  }

  /**
   * 清除实例的翻译缓存
   * @param {string} instanceId - 实例 ID
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async clearCache(instanceId) {
    this.log('info', `Clearing translation cache for instance ${instanceId}`);
    
    try {
      // 验证实例是否存在
      const instance = this.instanceManager.instances.get(instanceId);
      if (!instance) {
        return {
          success: false,
          error: 'Instance not found'
        };
      }

      const { window } = instance;
      
      // 检查窗口是否有效
      if (!window || window.isDestroyed()) {
        return {
          success: false,
          error: 'Window is invalid or destroyed'
        };
      }

      // 清除渲染进程中的翻译缓存
      await window.webContents.executeJavaScript(`
        (function() {
          if (window.contentScriptOptimizer) {
            window.contentScriptOptimizer.translationCache.clear();
            console.log('[Translation] Cache cleared for account ${instanceId}');
          }
        })();
      `);

      this.log('info', `Translation cache cleared for instance ${instanceId}`);
      
      return { success: true };
      
    } catch (error) {
      this.log('error', `Failed to clear cache for instance ${instanceId}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 移除实例的翻译配置和状态
   * @param {string} instanceId - 实例 ID
   */
  removeInstance(instanceId) {
    this.log('info', `Removing translation data for instance ${instanceId}`);
    
    this.translationConfigs.delete(instanceId);
    this.translationStatuses.delete(instanceId);
  }

  /**
   * 获取所有实例的翻译状态
   * @returns {Map<string, Object>}
   */
  getAllTranslationStatuses() {
    return new Map(this.translationStatuses);
  }

  /**
   * 重新加载翻译脚本缓存
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async reloadScripts() {
    this.log('info', 'Reloading translation scripts');
    
    try {
      await this._loadScriptsToCache();
      this.log('info', 'Translation scripts reloaded successfully');
      return { success: true };
    } catch (error) {
      this.log('error', 'Failed to reload translation scripts:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 更新实例的翻译配置（支持动态更新）
   * @param {string} instanceId - 实例 ID
   * @param {Partial<TranslationConfig>} updates - 配置更新
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async updateTranslationConfig(instanceId, updates) {
    this.log('info', `Updating translation config for instance ${instanceId}`);
    
    try {
      // 获取当前配置
      const currentConfig = this.translationConfigs.get(instanceId);
      if (!currentConfig) {
        return {
          success: false,
          error: 'Translation config not found for instance'
        };
      }

      // 合并更新
      const newConfig = {
        ...currentConfig,
        ...updates
      };

      // 应用新配置
      return await this.configureTranslation(instanceId, newConfig);
      
    } catch (error) {
      this.log('error', `Failed to update translation config for instance ${instanceId}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 为所有运行中的实例应用翻译配置
   * @param {TranslationConfig} config - 翻译配置
   * @returns {Promise<{success: boolean, applied: number, failed: number}>}
   */
  async applyConfigToAllInstances(config) {
    this.log('info', 'Applying translation config to all instances');
    
    let applied = 0;
    let failed = 0;

    const runningInstances = this.instanceManager.getRunningInstances();
    
    for (const instance of runningInstances) {
      const result = await this.configureTranslation(instance.instanceId, config);
      if (result.success) {
        applied++;
      } else {
        failed++;
      }
    }

    this.log('info', `Applied config to ${applied} instances, ${failed} failed`);
    
    return {
      success: failed === 0,
      applied,
      failed
    };
  }

  /**
   * 获取翻译性能统计
   * @param {string} instanceId - 实例 ID
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async getPerformanceStats(instanceId) {
    this.log('info', `Getting performance stats for instance ${instanceId}`);
    
    try {
      // 验证实例是否存在
      const instance = this.instanceManager.instances.get(instanceId);
      if (!instance) {
        return {
          success: false,
          error: 'Instance not found'
        };
      }

      const { window } = instance;
      
      // 检查窗口是否有效
      if (!window || window.isDestroyed()) {
        return {
          success: false,
          error: 'Window is invalid or destroyed'
        };
      }

      // 获取性能统计
      const stats = await window.webContents.executeJavaScript(`
        (function() {
          if (window.getTranslationPerformanceStats) {
            return window.getTranslationPerformanceStats();
          }
          return null;
        })();
      `);

      if (stats) {
        return {
          success: true,
          data: stats
        };
      } else {
        return {
          success: false,
          error: 'Performance stats not available'
        };
      }
      
    } catch (error) {
      this.log('error', `Failed to get performance stats for instance ${instanceId}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 清理资源
   */
  cleanup() {
    this.log('info', 'Cleaning up translation integration');
    
    this.translationConfigs.clear();
    this.translationStatuses.clear();
    this.scriptCache.optimizer = null;
    this.scriptCache.contentScript = null;
  }
}

module.exports = TranslationIntegration;
