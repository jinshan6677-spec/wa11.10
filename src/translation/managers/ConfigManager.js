/**
 * 配置管理器
 * 使用 electron-store 管理翻译配置
 */

const Store = require('electron-store');

class ConfigManager {
  constructor() {
    this.store = new Store({
      name: 'translation-config',
      defaults: {
        accounts: {},
        engines: {
          google: {
            type: 'google',
            enabled: true
          }
        }
      }
    });
  }

  /**
   * 获取账号配置
   * @param {string} accountId - 账号ID
   * @returns {Object} 配置对象
   */
  getConfig(accountId) {
    const accountConfig = this.store.get(`accounts.${accountId}`);
    
    if (!accountConfig) {
      // 返回默认配置
      return this.getDefaultConfig();
    }
    
    return accountConfig;
  }

  /**
   * 保存账号配置
   * @param {string} accountId - 账号ID
   * @param {Object} config - 配置对象
   */
  saveConfig(accountId, config) {
    this.store.set(`accounts.${accountId}`, config);
  }

  /**
   * 获取默认配置
   * @returns {Object} 默认配置
   */
  getDefaultConfig() {
    return {
      global: {
        autoTranslate: false,
        engine: 'google',
        sourceLang: 'auto',
        targetLang: 'zh-CN',
        groupTranslation: false
      },
      inputBox: {
        enabled: false,
        style: '通用'
      },
      advanced: {
        friendIndependent: false,
        blockChinese: false,
        realtime: false,
        reverseTranslation: false,
        voiceTranslation: false,
        imageTranslation: false
      },
      friendConfigs: {}
    };
  }

  /**
   * 获取引擎配置
   * @param {string} engineName - 引擎名称
   * @returns {Object|null} 引擎配置
   */
  getEngineConfig(engineName) {
    return this.store.get(`engines.${engineName}`) || null;
  }

  /**
   * 保存引擎配置
   * @param {string} engineName - 引擎名称
   * @param {Object} config - 引擎配置
   */
  saveEngineConfig(engineName, config) {
    this.store.set(`engines.${engineName}`, config);
  }

  /**
   * 获取所有引擎配置
   * @returns {Object} 所有引擎配置
   */
  getAllEngineConfigs() {
    return this.store.get('engines') || {};
  }

  /**
   * 获取好友独立配置
   * @param {string} accountId - 账号ID
   * @param {string} contactId - 联系人ID
   * @returns {Object|null} 好友配置
   */
  getFriendConfig(accountId, contactId) {
    return this.store.get(`accounts.${accountId}.friendConfigs.${contactId}`) || null;
  }

  /**
   * 保存好友独立配置
   * @param {string} accountId - 账号ID
   * @param {string} contactId - 联系人ID
   * @param {Object} config - 好友配置
   */
  saveFriendConfig(accountId, contactId, config) {
    this.store.set(`accounts.${accountId}.friendConfigs.${contactId}`, config);
  }

  /**
   * 删除好友独立配置
   * @param {string} accountId - 账号ID
   * @param {string} contactId - 联系人ID
   */
  deleteFriendConfig(accountId, contactId) {
    this.store.delete(`accounts.${accountId}.friendConfigs.${contactId}`);
  }

  /**
   * 清除所有配置
   */
  clearAll() {
    this.store.clear();
  }

  /**
   * 导出配置
   * @returns {Object} 所有配置
   */
  exportConfig() {
    return this.store.store;
  }

  /**
   * 导入配置
   * @param {Object} config - 配置对象
   */
  importConfig(config) {
    this.store.store = config;
  }
}

module.exports = ConfigManager;
