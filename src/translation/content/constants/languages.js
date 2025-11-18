/**
 * 语言常量定义
 * WhatsApp Web 翻译系统语言支持
 */

/**
 * 语言代码到语言名称的映射
 */
const LANGUAGE_NAMES = {
  'zh-CN': '简体中文',
  'zh-TW': '繁体中文', 
  'en': '英语',
  'ja': '日语',
  'ko': '韩语',
  'vi': '越南语',
  'th': '泰语',
  'id': '印尼语',
  'ms': '马来语',
  'es': '西班牙语',
  'fr': '法语',
  'de': '德语',
  'it': '意大利语',
  'pt': '葡萄牙语',
  'ru': '俄语',
  'ar': '阿拉伯语',
  'hi': '印地语',
  'bn': '孟加拉语'
};

/**
 * 语言优先级（智能翻译时使用）
 */
const LANGUAGE_PRIORITY = {
  'zh-CN': 1,
  'zh-TW': 1,
  'en': 2,
  'ja': 3,
  'ko': 3,
  'vi': 4,
  'th': 4,
  'id': 4,
  'ms': 4,
  'es': 5,
  'fr': 5,
  'de': 5,
  'it': 5,
  'pt': 5,
  'ru': 5,
  'ar': 5,
  'hi': 5,
  'bn': 5
};

/**
 * 支持的翻译引擎
 */
const TRANSLATION_ENGINES = {
  GOOGLE: 'google',
  BAIDU: 'baidu',
  YOUDAO: 'youdao',
  AI_TRANSLATION: 'ai_translation'
};

/**
 * 翻译模式
 */
const TRANSLATION_MODES = {
  SMART: 'smart',     // 智能模式
  MANUAL: 'manual',   // 手动模式
  REALTIME: 'realtime' // 实时模式
};

/**
 * 中文检测的正则表达式
 */
const CHINESE_REGEX = /[\u4e00-\u9fff]/g;

/**
 * 常用英文词汇（用于中文检测排除）
 */
const COMMON_ENGLISH_WORDS = [
  'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
  'hello', 'hi', 'yes', 'no', 'ok', 'good', 'bad', 'thank', 'you', 'please',
  'call', 'message', 'chat', 'time', 'today', 'yesterday', 'tomorrow'
];

module.exports = {
  LANGUAGE_NAMES,
  LANGUAGE_PRIORITY,
  TRANSLATION_ENGINES,
  TRANSLATION_MODES,
  CHINESE_REGEX,
  COMMON_ENGLISH_WORDS
};