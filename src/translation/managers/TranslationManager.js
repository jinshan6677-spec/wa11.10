/**
 * 翻译服务管理器
 * 负责管理所有翻译引擎、配置和缓存
 */

const EventEmitter = require('events');

class TranslationManager extends EventEmitter {
  constructor(configManager, cacheManager) {
    super();
    this.engines = new Map();
    this.configManager = configManager;
    this.cacheManager = cacheManager;
    this.stats = {
      totalRequests: 0,
      successCount: 0,
      failureCount: 0,
      totalChars: 0
    };
  }

  /**
   * 注册翻译引擎
   * @param {string} name - 引擎名称
   * @param {TranslationAdapter} adapter - 引擎适配器实例
   */
  registerEngine(name, adapter) {
    if (!adapter || typeof adapter.translate !== 'function') {
      throw new Error(`Invalid adapter for engine: ${name}`);
    }
    this.engines.set(name, adapter);
    this.emit('engine-registered', name);
  }

  /**
   * 获取翻译引擎
   * @param {string} name - 引擎名称
   * @returns {TranslationAdapter|null}
   */
  getEngine(name) {
    return this.engines.get(name) || null;
  }

  /**
   * 执行翻译（带重试和降级）
   * @param {string} text - 待翻译文本
   * @param {string} sourceLang - 源语言
   * @param {string} targetLang - 目标语言
   * @param {string} engineName - 引擎名称
   * @param {Object} options - 翻译选项
   * @returns {Promise<Object>} 翻译结果
   */
  async translate(text, sourceLang, targetLang, engineName, options = {}) {
    const startTime = Date.now();
    this.stats.totalRequests++;
    const maxRetries = 3;
    let currentEngine = engineName;
    let lastError = null;

    // 尝试使用指定引擎和降级引擎
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // 检查缓存
        const cacheKey = this.cacheManager.generateKey(text, sourceLang, targetLang, currentEngine);
        const cached = await this.cacheManager.get(cacheKey);
        
        if (cached) {
          this.emit('cache-hit', { text, engineName: currentEngine });
          return { ...cached, cached: true };
        }

        // 获取引擎
        const engine = this.getEngine(currentEngine);
        if (!engine) {
          throw new Error(`Translation engine not found: ${currentEngine}`);
        }

        if (!engine.isAvailable()) {
          throw new Error(`Translation engine not available: ${currentEngine}`);
        }

        // 执行翻译
        const result = await engine.translate(text, sourceLang, targetLang, options);
      
        // 缓存结果
        await this.cacheManager.set(cacheKey, result);
        
        // 更新统计
        this.stats.successCount++;
        this.stats.totalChars += text.length;
        
        const responseTime = Date.now() - startTime;
        this.emit('translation-success', { 
          text, 
          engineName: currentEngine, 
          responseTime,
          charCount: text.length 
        });

        return { ...result, cached: false, responseTime };

      } catch (error) {
        lastError = error;
        console.error(`[TranslationManager] Attempt ${attempt + 1} failed with ${currentEngine}:`, error.message);

        // 如果是第一次失败，尝试降级到备用引擎
        if (attempt === 0) {
          const fallbackEngine = this.getFallbackEngine(currentEngine);
          if (fallbackEngine) {
            console.log(`[TranslationManager] Falling back to ${fallbackEngine}`);
            currentEngine = fallbackEngine;
            continue;
          }
        }

        // 如果还有重试次数，等待后重试
        if (attempt < maxRetries - 1) {
          const delay = Math.pow(2, attempt) * 1000; // 指数退避
          console.log(`[TranslationManager] Retrying in ${delay}ms...`);
          await this.delay(delay);
        }
      }
    }

    // 所有尝试都失败
    this.stats.failureCount++;
    this.emit('translation-error', { 
      text, 
      engineName, 
      error: lastError.message 
    });
    throw lastError;
  }

  /**
   * 获取降级引擎
   * @param {string} currentEngine - 当前引擎
   * @returns {string|null} 降级引擎名称
   */
  getFallbackEngine(currentEngine) {
    const fallbackOrder = ['google', 'gpt4', 'gemini', 'deepseek'];
    const currentIndex = fallbackOrder.indexOf(currentEngine);
    
    // 从当前引擎之后开始查找可用引擎
    for (let i = currentIndex + 1; i < fallbackOrder.length; i++) {
      const engine = this.getEngine(fallbackOrder[i]);
      if (engine && engine.isAvailable()) {
        return fallbackOrder[i];
      }
    }

    // 如果当前引擎不在列表中，尝试使用 Google
    if (currentIndex === -1) {
      const googleEngine = this.getEngine('google');
      if (googleEngine && googleEngine.isAvailable()) {
        return 'google';
      }
    }

    return null;
  }

  /**
   * 延迟函数
   * @param {number} ms - 延迟毫秒数
   * @returns {Promise}
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 检测语言
   * @param {string} text - 待检测文本
   * @returns {Promise<string>} 语言代码
   */
  async detectLanguage(text) {
    // 尝试使用第一个可用的引擎进行语言检测
    for (const [name, engine] of this.engines) {
      if (engine.isAvailable() && typeof engine.detectLanguage === 'function') {
        try {
          return await engine.detectLanguage(text);
        } catch (error) {
          console.warn(`Language detection failed with ${name}:`, error.message);
        }
      }
    }
    
    // 如果所有引擎都失败，返回 'auto'
    return 'auto';
  }

  /**
   * 获取配置
   * @param {string} accountId - 账号ID
   * @returns {Object} 配置对象
   */
  getConfig(accountId) {
    return this.configManager.getConfig(accountId);
  }

  /**
   * 保存配置
   * @param {string} accountId - 账号ID
   * @param {Object} config - 配置对象
   */
  saveConfig(accountId, config) {
    this.configManager.saveConfig(accountId, config);
    this.emit('config-updated', { accountId, config });
  }

  /**
   * 获取统计信息
   * @returns {Object} 统计数据
   */
  getStats() {
    return {
      ...this.stats,
      cacheStats: this.cacheManager.getStats(),
      engines: Array.from(this.engines.keys())
    };
  }

  /**
   * 重置统计信息
   */
  resetStats() {
    this.stats = {
      totalRequests: 0,
      successCount: 0,
      failureCount: 0,
      totalChars: 0
    };
    this.emit('stats-reset');
  }

  /**
   * 清理资源
   */
  async cleanup() {
    await this.cacheManager.cleanup();
    this.engines.clear();
    this.emit('cleanup-complete');
  }
}

module.exports = TranslationManager;
