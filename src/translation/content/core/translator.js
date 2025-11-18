/**
 * 核心翻译器
 * 负责实际的翻译功能，包括API调用和结果处理
 */

const { TRANSLATION_ENGINES } = require('../constants/languages');
const { PERFORMANCE_THRESHOLDS } = require('../constants/config');

class Translator {
  constructor(eventManager, configManager) {
    this.eventManager = eventManager;
    this.configManager = configManager;
    this.isTranslating = false; // 防止重复翻译
    this.concurrentTranslations = 0; // 当前并发翻译数
    this.translationQueue = []; // 翻译队列
  }

  /**
   * 翻译文本
   * @param {string} text - 要翻译的文本
   * @param {object} options - 翻译选项
   * @param {string} options.sourceLang - 源语言
   * @param {string} options.targetLang - 目标语言
   * @param {string} options.engineName - 翻译引擎
   * @param {string} options.style - 翻译风格（仅输入框翻译使用）
   * @returns {Promise<object>} 翻译结果
   */
  async translate(text, options = {}) {
    if (!text || !text.trim()) {
      throw new Error('文本不能为空');
    }

    // 检查并发限制
    if (this.concurrentTranslations >= PERFORMANCE_THRESHOLDS.MAX_CONCURRENT_TRANSLATIONS) {
      console.log('[Translator] Translation queue full, adding to queue');
      return new Promise((resolve, reject) => {
        this.translationQueue.push({
          text,
          options,
          resolve,
          reject,
          timestamp: Date.now()
        });
      });
    }

    try {
      this.concurrentTranslations++;
      const result = await this.performTranslation(text, options);
      this.concurrentTranslations--;
      this.processQueue(); // 处理队列
      return result;
    } catch (error) {
      this.concurrentTranslations--;
      this.processQueue(); // 即使出错也处理队列
      throw error;
    }
  }

  /**
   * 执行实际翻译
   * @param {string} text - 要翻译的文本
   * @param {object} options - 翻译选项
   * @returns {Promise<object>} 翻译结果
   */
  async performTranslation(text, options) {
    const {
      sourceLang = 'auto',
      targetLang = 'zh-CN',
      engineName = this.configManager.get('global.engine'),
      style = null,
      timeout = PERFORMANCE_THRESHOLDS.TRANSLATION_TIMEOUT
    } = options;

    console.log(`[Translator] 🔄 开始翻译: "${text.substring(0, 50)}..." (${sourceLang} -> ${targetLang}, ${engineName})`);

    // 触发翻译开始事件
    this.eventManager.emit('translation:started', {
      text: text.substring(0, 100),
      sourceLang,
      targetLang,
      engineName
    });

    try {
      if (!window.translationAPI) {
        throw new Error('翻译API不可用');
      }

      // 构建翻译请求
      const translationRequest = {
        accountId: this.configManager.accountId,
        text: text.trim(),
        sourceLang: sourceLang,
        targetLang: targetLang,
        engineName: engineName,
        options: {}
      };

      // 只有输入框翻译才添加风格参数
      if (style && engineName !== TRANSLATION_ENGINES.GOOGLE) {
        translationRequest.options.style = style;
      }

      // 执行翻译请求（带超时）
      const translationPromise = window.translationAPI.translate(translationRequest);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('翻译超时')), timeout);
      });

      const response = await Promise.race([translationPromise, timeoutPromise]);

      if (response.success) {
        const result = {
          translatedText: response.data.translatedText,
          engineName: response.data.engineName || engineName,
          sourceLang: response.data.sourceLang || sourceLang,
          targetLang: response.data.targetLang || targetLang,
          timestamp: Date.now()
        };

        console.log(`[Translator] ✅ 翻译成功: "${result.translatedText}" (${result.engineName})`);

        // 触发翻译完成事件
        this.eventManager.emit('translation:completed', {
          originalText: text,
          result: result
        });

        return result;
      } else {
        const error = new Error(response.error || '翻译失败');
        console.error('[Translator] ❌ 翻译失败:', error.message);
        
        // 触发翻译错误事件
        this.eventManager.emit('translation:error', {
          error: error,
          originalText: text,
          options: options
        });

        throw error;
      }
    } catch (error) {
      console.error('[Translator] ❌ 翻译异常:', error.message);
      
      // 触发翻译错误事件
      this.eventManager.emit('translation:error', {
        error: error,
        originalText: text,
        options: options
      });

      throw error;
    }
  }

  /**
   * 批量翻译
   * @param {Array} texts - 要翻译的文本数组
   * @param {object} options - 翻译选项
   * @returns {Promise<Array>} 翻译结果数组
   */
  async batchTranslate(texts, options = {}) {
    console.log(`[Translator] 🔄 开始批量翻译 ${texts.length} 个文本`);
    
    const results = [];
    const promises = texts.map(async (text, index) => {
      try {
        const result = await this.translate(text, options);
        return { index, success: true, result };
      } catch (error) {
        return { index, success: false, error: error.message };
      }
    });

    const responses = await Promise.all(promises);
    
    // 按原始顺序排列结果
    responses.sort((a, b) => a.index - b.index);
    
    console.log(`[Translator] ✅ 批量翻译完成，成功: ${responses.filter(r => r.success).length}/${responses.length}`);
    
    return responses;
  }

  /**
   * 获取可用的翻译引擎
   * @returns {Array} 可用引擎列表
   */
  getAvailableEngines() {
    const engines = [
      {
        name: TRANSLATION_ENGINES.GOOGLE,
        displayName: 'Google Translate',
        hasApiKey: false,
        supportsStyle: false,
        description: '免费使用，无需API密钥'
      },
      {
        name: TRANSLATION_ENGINES.BAIDU,
        displayName: '百度翻译',
        hasApiKey: true,
        supportsStyle: true,
        description: '支持多种翻译风格'
      },
      {
        name: TRANSLATION_ENGINES.YOUDAO,
        displayName: '有道翻译',
        hasApiKey: true,
        supportsStyle: true,
        description: '支持多种翻译风格'
      },
      {
        name: TRANSLATION_ENGINES.AI_TRANSLATION,
        displayName: 'AI翻译',
        hasApiKey: true,
        supportsStyle: true,
        description: 'AI智能翻译，支持风格定制'
      }
    ];

    return engines;
  }

  /**
   * 验证翻译引擎配置
   * @param {string} engineName - 引擎名称
   * @param {object} config - 引擎配置
   * @returns {object} 验证结果
   */
  validateEngineConfig(engineName, config) {
    const engine = this.getAvailableEngines().find(e => e.name === engineName);
    if (!engine) {
      return { valid: false, error: '不支持的翻译引擎' };
    }

    // Google翻译不需要API密钥
    if (engineName === TRANSLATION_ENGINES.GOOGLE) {
      return { valid: true };
    }

    // 其他引擎需要API密钥
    if (!config || !config.apiKey || !config.apiKey.trim()) {
      return { valid: false, error: `${engine.displayName} 需要API密钥` };
    }

    return { valid: true };
  }

  /**
   * 获取翻译引擎的默认配置
   * @param {string} engineName - 引擎名称
   * @returns {object} 默认配置
   */
  getDefaultEngineConfig(engineName) {
    const defaults = {
      [TRANSLATION_ENGINES.GOOGLE]: {
        apiKey: '',
        hasApiKey: false,
        supportsStyle: false
      },
      [TRANSLATION_ENGINES.BAIDU]: {
        apiKey: '',
        appId: '',
        secretKey: '',
        hasApiKey: true,
        supportsStyle: true
      },
      [TRANSLATION_ENGINES.YOUDAO]: {
        apiKey: '',
        secretKey: '',
        hasApiKey: true,
        supportsStyle: true
      },
      [TRANSLATION_ENGINES.AI_TRANSLATION]: {
        apiKey: '',
        baseUrl: '',
        model: 'gpt-3.5-turbo',
        hasApiKey: true,
        supportsStyle: true
      }
    };

    return defaults[engineName] || {};
  }

  /**
   * 处理翻译队列
   */
  processQueue() {
    if (this.translationQueue.length === 0) {
      return;
    }

    if (this.concurrentTranslations >= PERFORMANCE_THRESHOLDS.MAX_CONCURRENT_TRANSLATIONS) {
      return; // 仍在满载状态
    }

    // 清理超时项目（5分钟）
    const now = Date.now();
    this.translationQueue = this.translationQueue.filter(item => 
      now - item.timestamp < 300000
    );

    // 处理队列中的下一个项目
    const nextItem = this.translationQueue.shift();
    if (nextItem) {
      this.translate(nextItem.text, nextItem.options)
        .then(nextItem.resolve)
        .catch(nextItem.reject);
    }
  }

  /**
   * 清理翻译队列
   */
  clearQueue() {
    this.translationQueue.forEach(item => {
      item.reject(new Error('翻译队列已清理'));
    });
    this.translationQueue = [];
    console.log('[Translator] Translation queue cleared');
  }

  /**
   * 获取翻译统计信息
   */
  getStats() {
    return {
      isTranslating: this.isTranslating,
      concurrentTranslations: this.concurrentTranslations,
      queueLength: this.translationQueue.length,
      maxConcurrent: PERFORMANCE_THRESHOLDS.MAX_CONCURRENT_TRANSLATIONS
    };
  }

  /**
   * 重置翻译器状态
   */
  reset() {
    this.isTranslating = false;
    this.concurrentTranslations = 0;
    this.clearQueue();
    console.log('[Translator] Reset complete');
  }
}

module.exports = Translator;