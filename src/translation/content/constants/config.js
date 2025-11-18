/**
 * 默认配置常量
 * WhatsApp Web 翻译系统默认配置
 */

/**
 * 事件类型定义
 */
const EVENTS = {
  MESSAGE_DETECTED: 'message:detected',
  MESSAGE_TRANSLATED: 'message:translated',
  TRANSLATION_ERROR: 'translation:error',
  CONFIG_CHANGED: 'config:changed',
  LANGUAGE_DETECTED: 'language:detected',
  CHAT_SWITCHED: 'chat:switched',
  SETTINGS_OPENED: 'settings:opened',
  SETTINGS_CLOSED: 'settings:closed',
  BLOCK_CHINESE_TOGGLED: 'block:chinese:toggled',
  REALTIME_TOGGLED: 'realtime:toggled'
};

/**
 * 缓存有效期配置（毫秒）
 */
const CACHE_DURATION = {
  LANGUAGE_TREND: 60000,    // 语言趋势缓存 1分钟
  MESSAGE_CACHE: 30000,     // 消息缓存 30秒
  GROUP_STATS: 300000,      // 群组统计缓存 5分钟
  SENDER_ID: 1800000        // 发言人ID缓存 30分钟
};

/**
 * 性能阈值配置
 */
const PERFORMANCE_THRESHOLDS = {
  MAX_CONCURRENT_TRANSLATIONS: 3,      // 最大并发翻译数
  TRANSLATION_TIMEOUT: 10000,          // 翻译超时时间 10秒
  MAX_MESSAGES_PER_CHECK: 20,          // 每次检查的最大消息数
  CLEANUP_INTERVAL: 60000              // 清理间隔 1分钟
};

/**
 * 智能翻译配置
 */
const SMART_TRANSLATION = {
  MIN_CONFIDENCE: 0.7,         // 最小置信度阈值
  MAX_RECENT_MESSAGES: 10,     // 最近消息分析数量
  CHINESE_RATIO_THRESHOLD: 0.6, // 中文字符占比阈值
  GROUP_TREND_THRESHOLD: 0.6   // 群组趋势阈值
};

/**
 * UI配置
 */
const UI_CONFIG = {
  ANIMATION_DURATION: 300,      // 动画持续时间
  TOOLTIP_DELAY: 500,           // 工具提示延迟
  TOAST_DURATION: 3000,         // 提示持续时间
  SETTINGS_PANEL_WIDTH: 400,    // 设置面板宽度
  LANGUAGE_SELECTOR_WIDTH: 120  // 语言选择器宽度
};

/**
 * 默认翻译配置
 */
const DEFAULT_CONFIG = {
  global: {
    autoTranslate: false,
    engine: 'google',
    sourceLang: 'auto',
    targetLang: 'zh-CN',
    groupTranslation: false
  },
  inputBox: {
    enabled: false,
    engine: 'google',
    style: '通用',
    targetLang: 'auto'
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

module.exports = {
  EVENTS,
  CACHE_DURATION,
  PERFORMANCE_THRESHOLDS,
  SMART_TRANSLATION,
  UI_CONFIG,
  DEFAULT_CONFIG
};