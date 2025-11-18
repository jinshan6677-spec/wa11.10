/**
 * 语言检测器
 * 负责智能语言检测和趋势分析
 */

const { 
  LANGUAGE_NAMES, 
  LANGUAGE_PRIORITY, 
  CHINESE_REGEX, 
  COMMON_ENGLISH_WORDS 
} = require('../constants/languages');
const { CACHE_DURATION, SMART_TRANSLATION } = require('../constants/config');

class LanguageDetector {
  constructor(eventManager) {
    this.eventManager = eventManager;
    this.languageTrendCache = new Map(); // 语言趋势缓存
    this.messageCache = new Map(); // 消息缓存
    this.groupStats = new Map(); // 群组语言统计
    this.senderIdCache = new Map(); // 发言人ID缓存
  }

  /**
   * 检测文本语言
   * @param {string} text - 要检测的文本
   * @returns {Promise<string>} 检测到的语言代码
   */
  async detectLanguage(text) {
    if (!text || !text.trim()) {
      return 'unknown';
    }

    try {
      if (window.translationAPI) {
        const result = await window.translationAPI.detectLanguage(text.trim());
        if (result.success && result.data.language) {
          return result.data.language;
        }
      }
    } catch (error) {
      console.warn('[LanguageDetector] Language detection failed:', error);
    }

    // 备选方案：简单中文检测
    if (this.isChinese(text)) {
      return 'zh-CN';
    }

    return 'en'; // 默认英语
  }

  /**
   * 改进的中文检测算法
   * @param {string} text - 要检测的文本
   * @returns {boolean} 是否为中文
   */
  isChinese(text) {
    if (!text || text.length === 0) return false;
    
    // 1. 严格中文字符检测
    const chineseChars = text.match(CHINESE_REGEX) || [];
    const totalChars = text.length;
    const chineseRatio = chineseChars.length / totalChars;
    
    // 2. 排除数字和英文词汇
    const englishWords = text.match(/\b[a-zA-Z]+\b/g) || [];
    const hasNumbers = /\d/.test(text);
    const hasPunctuation = /[.,!?;:()]/.test(text);
    
    // 3. 检测是否为纯英文或混合语言
    const isPureEnglish = /^[\s\w.,!?;:()'"-]*$/.test(text) && englishWords.length > 2;
    
    // 4. 综合判断逻辑
    const isChinese = chineseRatio > 0.6 && // 中文字符占比超过60%
                     englishWords.length < 2 && // 英文单词少于2个
                     !hasNumbers && // 不含数字
                     !isPureEnglish; // 不是纯英文
    
    console.log(`[LanguageDetector] 🔍 智能中文检测: "${text.substring(0, 20)}..." 中文字符占比=${chineseRatio.toFixed(2)}, 英文词=${englishWords.length}, 结果=${isChinese}`);
    
    return isChinese;
  }

  /**
   * 获取相反语言
   * @param {string} lang - 当前语言
   * @returns {string} 相反语言
   */
  getOppositeLanguage(lang) {
    const opposites = {
      'zh-CN': 'en', 'zh-TW': 'en', 'en': 'zh-CN',
      'vi': 'zh-CN', 'ja': 'zh-CN', 'ko': 'zh-CN',
      'th': 'zh-CN', 'id': 'zh-CN', 'ms': 'zh-CN',
      'es': 'zh-CN', 'fr': 'zh-CN', 'de': 'zh-CN',
      'it': 'zh-CN', 'pt': 'zh-CN', 'ru': 'zh-CN',
      'ar': 'zh-CN', 'hi': 'zh-CN', 'bn': 'zh-CN'
    };
    
    return opposites[lang] || 'zh-CN';
  }

  /**
   * 智能目标语言选择（增强版）
   * @param {string} contactId - 联系人ID
   * @param {string} messageText - 消息文本
   * @param {object} senderInfo - 发送者信息
   * @returns {Promise<string>} 智能选择的目标语言
   */
  async getSmartTargetLang(contactId, messageText, senderInfo = null) {
    try {
      // 1. 基础配置获取（这里需要从ConfigManager获取，简化处理）
      const baseLang = 'zh-CN'; // 默认目标语言
      
      // 2. 群组模式下的特殊处理
      if (senderInfo && senderInfo.isGroupMessage && senderInfo.senderId) {
        const groupSuggestion = await this.getGroupSmartSuggestion(contactId, senderInfo.senderId, messageText);
        if (groupSuggestion) {
          console.log(`[LanguageDetector] 👥 群组智能建议: ${groupSuggestion.reason} - ${groupSuggestion.targetLang}`);
          return groupSuggestion.targetLang;
        }
      }
      
      // 3. 检查缓存的语言趋势
      const cacheKey = `trend_${contactId}`;
      const cachedTrend = this.languageTrendCache.get(cacheKey);
      
      if (cachedTrend && Date.now() - cachedTrend.timestamp < CACHE_DURATION.LANGUAGE_TREND) {
        const { primaryLanguage, confidence } = cachedTrend;
        
        // 高置信度时跟随对方主要语言
        if (confidence > SMART_TRANSLATION.MIN_CONFIDENCE) {
          console.log(`[LanguageDetector] 🎯 使用缓存的语言趋势: ${primaryLanguage} (置信度: ${confidence.toFixed(2)})`);
          return this.getOppositeLanguage(primaryLanguage);
        }
      }

      // 4. 分析当前语言趋势
      const trend = await this.analyzeLanguageTrend(contactId);
      
      // 5. 缓存结果
      this.languageTrendCache.set(cacheKey, {
        ...trend,
        timestamp: Date.now()
      });

      // 6. 基于趋势调整目标语言
      if (trend.confidence > SMART_TRANSLATION.MIN_CONFIDENCE) {
        console.log(`[LanguageDetector] 📊 基于趋势调整目标语言: ${trend.primaryLanguage} → ${this.getOppositeLanguage(trend.primaryLanguage)}`);
        return this.getOppositeLanguage(trend.primaryLanguage);
      }

      // 7. 消息级检测
      const msgLang = await this.detectLanguage(messageText);
      if (msgLang !== baseLang) {
        console.log(`[LanguageDetector] 🔍 消息语言检测: ${msgLang} ≠ ${baseLang}，调整为目标: ${this.getOppositeLanguage(msgLang)}`);
        return this.getOppositeLanguage(msgLang);
      }

      console.log(`[LanguageDetector] 使用默认目标语言: ${baseLang}`);
      return baseLang;
      
    } catch (error) {
      console.error('[LanguageDetector] Error in smart target language selection:', error);
      return 'zh-CN';
    }
  }

  /**
   * 获取群组智能翻译建议
   * @param {string} groupId - 群组ID
   * @param {string} senderId - 发言人ID
   * @param {string} messageText - 消息文本
   * @returns {Promise<object|null>} 群组建议
   */
  async getGroupSmartSuggestion(groupId, senderId, messageText) {
    try {
      const groupStats = this.getGroupLanguageStats(groupId);
      if (!groupStats) {
        return null;
      }
      
      // 1. 基于总体语言趋势
      const languages = Array.from(groupStats.languageTrends.entries())
        .sort((a, b) => b[1] - a[1]);
      
      if (languages.length > 0) {
        const [primaryLang, count] = languages[0];
        const confidence = count / groupStats.totalMessages;
        
        if (confidence > SMART_TRANSLATION.GROUP_TREND_THRESHOLD) {
          return {
            targetLang: this.getOppositeLanguage(primaryLang),
            confidence: confidence,
            reason: `群组主要语言趋势 (${primaryLang}, ${(confidence * 100).toFixed(1)}%)`
          };
        }
      }
      
      // 2. 基于当前消息的快速检测
      if (messageText && messageText.length > 10) {
        try {
          const msgLang = await this.detectLanguage(messageText);
          if (!msgLang.startsWith('zh')) {
            return {
              targetLang: this.getOppositeLanguage(msgLang),
              confidence: 0.8,
              reason: `当前消息语言检测 (${msgLang})`
            };
          }
        } catch (error) {
          console.warn('[LanguageDetector] Failed to detect current message language:', error);
        }
      }
      
      return null;
    } catch (error) {
      console.error('[LanguageDetector] Error getting group smart suggestion:', error);
      return null;
    }
  }

  /**
   * 分析语言趋势
   * @param {string} contactId - 联系人ID
   * @returns {Promise<object>} 趋势分析结果
   */
  async analyzeLanguageTrend(contactId) {
    try {
      // 获取最近消息
      const recentMessages = await this.getRecentMessages(contactId, SMART_TRANSLATION.MAX_RECENT_MESSAGES);
      const languages = {};
      
      for (const message of recentMessages) {
        if (message.text && message.text.trim()) {
          const lang = await this.detectLanguage(message.text);
          languages[lang] = (languages[lang] || 0) + 1;
        }
      }
      
      // 返回主要语言和置信度
      const langEntries = Object.entries(languages);
      if (langEntries.length === 0) {
        return { primaryLanguage: 'en', confidence: 0.5, allLanguages: {} };
      }
      
      const primaryLang = langEntries.reduce((a, b) => languages[a[0]] > languages[b[0]] ? a : b)[0];
      const confidence = languages[primaryLang] / recentMessages.length;
      
      console.log(`[LanguageDetector] 📈 语言趋势分析: 主要语言=${primaryLang}, 置信度=${confidence.toFixed(2)}, 所有语言=`, languages);
      
      return {
        primaryLanguage: primaryLang,
        confidence: confidence,
        allLanguages: languages
      };
    } catch (error) {
      console.error('[LanguageDetector] Error analyzing language trend:', error);
      return { primaryLanguage: 'en', confidence: 0.5, allLanguages: {} };
    }
  }

  /**
   * 获取对方最近消息
   * @param {string} contactId - 联系人ID
   * @param {number} count - 获取数量
   * @returns {Promise<Array>} 消息列表
   */
  async getRecentMessages(contactId, count = 10) {
    try {
      const cacheKey = `recent_${contactId}`;
      const cached = this.messageCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION.MESSAGE_CACHE) {
        return cached.messages;
      }

      // 从DOM中获取最近的接收消息
      const incomingMessages = Array.from(document.querySelectorAll('.message-in'))
        .slice(-count * 2) // 获取更多消息以确保有足够的接收消息
        .filter(msg => {
          const textElement = msg.querySelector('.selectable-text');
          return textElement && textElement.textContent.trim();
        })
        .slice(-count); // 只取最后count条

      const messages = incomingMessages.map(msg => ({
        text: msg.querySelector('.selectable-text').textContent.trim(),
        timestamp: Date.now() // 简化处理
      }));

      // 缓存结果
      this.messageCache.set(cacheKey, {
        messages,
        timestamp: Date.now()
      });

      return messages;
    } catch (error) {
      console.error('[LanguageDetector] Error getting recent messages:', error);
      return [];
    }
  }

  /**
   * 更新群组语言统计
   * @param {string} groupId - 群组ID
   * @param {string} messageText - 消息文本
   */
  async updateGroupLanguageStats(groupId, messageText) {
    try {
      if (!groupId || !messageText) {
        return;
      }
      
      // 初始化群组统计
      if (!this.groupStats.has(groupId)) {
        this.groupStats.set(groupId, {
          totalMessages: 0,
          senderStats: new Map(),
          languageTrends: new Map(),
          lastUpdate: Date.now()
        });
      }
      
      const groupStat = this.groupStats.get(groupId);
      
      // 检测消息语言
      let detectedLang = 'unknown';
      try {
        detectedLang = await this.detectLanguage(messageText);
      } catch (error) {
        console.warn('[LanguageDetector] Language detection failed for group stats:', error);
      }
      
      // 更新总体统计
      groupStat.totalMessages++;
      groupStat.languageTrends.set(detectedLang, 
        (groupStat.languageTrends.get(detectedLang) || 0) + 1);
      groupStat.lastUpdate = Date.now();
      
      // 限制内存使用，清理过旧的统计
      if (groupStat.totalMessages > 1000) {
        this.cleanupOldGroupStats(groupId);
      }
      
    } catch (error) {
      console.error('[LanguageDetector] Error updating group language stats:', error);
    }
  }

  /**
   * 清理过旧的群组统计数据
   * @param {string} groupId - 群组ID
   */
  cleanupOldGroupStats(groupId) {
    try {
      const groupStat = this.groupStats.get(groupId);
      if (!groupStat) return;
      
      // 重置统计但保留最近的趋势
      const recentLanguages = new Map();
      const languages = Array.from(groupStat.languageTrends.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5); // 只保留前5种语言
      
      languages.forEach(([lang, count]) => {
        recentLanguages.set(lang, count);
      });
      
      groupStat.languageTrends = recentLanguages;
      groupStat.totalMessages = Array.from(recentLanguages.values()).reduce((a, b) => a + b, 0);
      
      console.log(`[LanguageDetector] Cleaned up old group stats for ${groupId}, kept ${recentLanguages.size} languages`);
    } catch (error) {
      console.error('[LanguageDetector] Error cleaning up group stats:', error);
    }
  }

  /**
   * 获取群组语言统计
   * @param {string} groupId - 群组ID
   * @returns {object|null} 群组统计
   */
  getGroupLanguageStats(groupId) {
    try {
      if (!groupId || !this.groupStats.has(groupId)) {
        return null;
      }
      
      return this.groupStats.get(groupId);
    } catch (error) {
      console.error('[LanguageDetector] Error getting group language stats:', error);
      return null;
    }
  }

  /**
   * 获取发言人ID（为群组统计和管理）
   * @param {string} senderName - 发送者名称
   * @param {string} groupId - 群组ID
   * @returns {string} 发言人ID
   */
  getSenderId(senderName, groupId = null) {
    try {
      if (!groupId) {
        return senderName; // 单聊直接使用名称
      }
      
      // 创建群组发言人缓存键
      const cacheKey = `group_${groupId}_sender_${senderName}`;
      
      // 检查缓存
      const cachedSenderId = this.senderIdCache.get(cacheKey);
      if (cachedSenderId) {
        return cachedSenderId;
      }
      
      // 生成稳定的发言人ID
      const senderId = `group_${groupId}_${senderName.replace(/[^a-zA-Z0-9]/g, '_')}`;
      
      // 缓存结果（缓存30分钟）
      this.senderIdCache.set(cacheKey, senderId);
      setTimeout(() => {
        this.senderIdCache.delete(cacheKey);
      }, CACHE_DURATION.SENDER_ID);
      
      return senderId;
    } catch (error) {
      console.error('[LanguageDetector] Error getting sender ID:', error);
      return senderName;
    }
  }

  /**
   * 清理所有缓存
   */
  clearAllCaches() {
    this.languageTrendCache.clear();
    this.messageCache.clear();
    this.groupStats.clear();
    this.senderIdCache.clear();
    console.log('[LanguageDetector] All caches cleared');
  }

  /**
   * 获取检测器统计信息
   */
  getStats() {
    return {
      languageTrendCacheSize: this.languageTrendCache.size,
      messageCacheSize: this.messageCache.size,
      groupStatsSize: this.groupStats.size,
      senderIdCacheSize: this.senderIdCache.size
    };
  }
}

module.exports = LanguageDetector;