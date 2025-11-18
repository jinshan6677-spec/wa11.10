/**
 * 配置管理器
 * 负责翻译系统的配置加载、保存和管理
 */

const { DEFAULT_CONFIG } = require('../constants/config');

class ConfigManager {
  constructor(eventManager) {
    this.eventManager = eventManager;
    this.config = { ...DEFAULT_CONFIG };
    this.accountId = 'default';
    this.initialized = false;
  }

  /**
   * 初始化配置管理器
   */
  async init() {
    if (this.initialized) {
      console.log('[ConfigManager] Already initialized');
      return;
    }

    try {
      await this.loadConfig();
      this.initialized = true;
      console.log('[ConfigManager] Initialized successfully');
    } catch (error) {
      console.error('[ConfigManager] Initialization failed:', error);
      this.config = { ...DEFAULT_CONFIG };
    }
  }

  /**
   * 加载配置
   */
  async loadConfig() {
    try {
      if (window.translationAPI) {
        const response = await window.translationAPI.getConfig(this.accountId);
        if (response.success && (response.config || response.data)) {
          this.config = { ...DEFAULT_CONFIG, ...(response.config || response.data) };
          console.log('[ConfigManager] Config loaded:', this.config);
        } else {
          console.error('[ConfigManager] Failed to load config:', response.error);
          this.config = { ...DEFAULT_CONFIG };
        }
      } else {
        console.warn('[ConfigManager] translationAPI not available, using default config');
        this.config = { ...DEFAULT_CONFIG };
      }
    } catch (error) {
      console.error('[ConfigManager] Error loading config:', error);
      this.config = { ...DEFAULT_CONFIG };
    }
  }

  /**
   * 保存配置
   */
  async saveConfig() {
    try {
      if (window.translationAPI) {
        const response = await window.translationAPI.updateConfig(this.accountId, this.config);
        if (response.success) {
          console.log('[ConfigManager] Config saved successfully');
          this.eventManager.emit('config:saved', this.config);
          return true;
        } else {
          console.error('[ConfigManager] Failed to save config:', response.error);
          return false;
        }
      } else {
        console.warn('[ConfigManager] translationAPI not available, config not saved');
        return false;
      }
    } catch (error) {
      console.error('[ConfigManager] Error saving config:', error);
      return false;
    }
  }

  /**
   * 获取完整配置
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * 获取指定配置项
   */
  get(path, defaultValue = null) {
    const keys = path.split('.');
    let current = this.config;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return defaultValue;
      }
    }
    
    return current;
  }

  /**
   * 设置配置项
   */
  set(path, value) {
    const keys = path.split('.');
    let current = this.config;
    
    // 导航到最后一个路径
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    
    // 设置值
    current[keys[keys.length - 1]] = value;
    
    // 触发配置变更事件
    this.eventManager.emit('config:changed', {
      path,
      value,
      oldValue: this.get(path)
    });
    
    console.log(`[ConfigManager] Config updated: ${path} = ${value}`);
  }

  /**
   * 获取联系人配置（智能配置获取）
   */
  getContactConfig(contactId) {
    console.log('[ConfigManager] getContactConfig called with contactId:', contactId);
    console.log('[ConfigManager] friendIndependent enabled:', this.get('advanced.friendIndependent'));
    console.log('[ConfigManager] friendConfigs:', this.get('friendConfigs'));
    
    // 如果没有启用好友独立配置，返回全局配置
    if (!this.get('advanced.friendIndependent')) {
      console.log('[ConfigManager] Friend independent config is disabled, using global config');
      return this.getConfig();
    }
    
    // 检查是否有该联系人的独立配置
    const friendConfig = this.get(`friendConfigs.${contactId}`);
    if (friendConfig && friendConfig.enabled) {
      const mergedConfig = {
        ...this.getConfig(),
        targetLang: friendConfig.targetLang || this.get('global.targetLang'),
        blockChinese: friendConfig.blockChinese !== undefined ? friendConfig.blockChinese : this.get('advanced.blockChinese')
      };
      console.log('[ConfigManager] ✓ Using friend-specific config:', mergedConfig);
      return mergedConfig;
    }
    
    // 返回全局配置
    console.log('[ConfigManager] Using global config');
    return this.getConfig();
  }

  /**
   * 获取输入框翻译配置（清晰优先级逻辑）
   */
  getInputTranslationConfig(contactId) {
    try {
      // 第1优先级：语言选择器（用户手动选择）
      const langSelector = document.getElementById('wa-lang-selector');
      let targetLang = langSelector ? langSelector.value : null;
      
      // 第2优先级：好友独立配置（如果启用且存在）
      if (!targetLang || targetLang === 'auto') {
        if (this.get('advanced.friendIndependent') && 
            contactId && 
            this.get('friendConfigs') && 
            this.get(`friendConfigs.${contactId}`) &&
            this.get(`friendConfigs.${contactId}.enabled`)) {
          targetLang = this.get(`friendConfigs.${contactId}.targetLang`);
          console.log('[ConfigManager] ✓ Using friend independent config:', targetLang);
        }
      }
      
      // 第3优先级：全局输入框配置
      if (!targetLang || targetLang === 'auto') {
        targetLang = this.get('inputBox.targetLang') || 'auto';
        console.log('[ConfigManager] ✓ Using global input config:', targetLang);
      }
      
      // 返回完整的翻译配置
      return {
        targetLang: targetLang,
        engine: this.get('inputBox.engine') || this.get('global.engine'),
        style: this.get('inputBox.style') || '通用'
      };
    } catch (error) {
      console.error('[ConfigManager] Error getting input translation config:', error);
      return {
        targetLang: 'auto',
        engine: this.get('global.engine'),
        style: '通用'
      };
    }
  }

  /**
   * 更新好友配置
   */
  updateFriendConfig(contactId, config) {
    const currentFriendConfigs = this.get('friendConfigs') || {};
    currentFriendConfigs[contactId] = {
      ...currentFriendConfigs[contactId],
      ...config
    };
    
    this.set('friendConfigs', currentFriendConfigs);
    console.log(`[ConfigManager] Friend config updated for ${contactId}:`, config);
  }

  /**
   * 获取好友配置
   */
  getFriendConfig(contactId) {
    return this.get(`friendConfigs.${contactId}`);
  }

  /**
   * 删除好友配置
   */
  deleteFriendConfig(contactId) {
    const currentFriendConfigs = this.get('friendConfigs') || {};
    delete currentFriendConfigs[contactId];
    this.set('friendConfigs', currentFriendConfigs);
    console.log(`[ConfigManager] Friend config deleted for ${contactId}`);
  }

  /**
   * 重置配置到默认值
   */
  resetConfig() {
    this.config = { ...DEFAULT_CONFIG };
    console.log('[ConfigManager] Config reset to defaults');
    
    this.eventManager.emit('config:reset', this.config);
  }

  /**
   * 验证配置
   */
  validateConfig(config) {
    const errors = [];
    
    // 验证必要字段
    if (!config.global) errors.push('Missing global config');
    if (!config.inputBox) errors.push('Missing inputBox config');
    if (!config.advanced) errors.push('Missing advanced config');
    
    // 验证引擎名称
    const validEngines = ['google', 'baidu', 'youdao', 'ai_translation'];
    if (config.global && !validEngines.includes(config.global.engine)) {
      errors.push('Invalid global engine: ' + config.global.engine);
    }
    
    if (config.inputBox && !validEngines.includes(config.inputBox.engine)) {
      errors.push('Invalid inputBox engine: ' + config.inputBox.engine);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 获取配置摘要
   */
  getSummary() {
    return {
      initialized: this.initialized,
      accountId: this.accountId,
      globalEngine: this.get('global.engine'),
      autoTranslate: this.get('global.autoTranslate'),
      friendIndependent: this.get('advanced.friendIndependent'),
      blockChinese: this.get('advanced.blockChinese'),
      realtime: this.get('advanced.realtime'),
      friendConfigCount: Object.keys(this.get('friendConfigs') || {}).length
    };
  }
}

module.exports = ConfigManager;