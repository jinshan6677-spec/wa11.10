/**
 * 语言工具函数
 */

/**
 * 语言代码映射表
 */
const LANGUAGE_MAP = {
  // 中文
  'zh': 'zh-CN',
  'zh-cn': 'zh-CN',
  'zh-hans': 'zh-CN',
  'zh-tw': 'zh-TW',
  'zh-hant': 'zh-TW',
  'chinese': 'zh-CN',
  
  // 英语
  'en': 'en',
  'en-us': 'en',
  'en-gb': 'en',
  'english': 'en',
  
  // 日语
  'ja': 'ja',
  'jp': 'ja',
  'japanese': 'ja',
  
  // 韩语
  'ko': 'ko',
  'kr': 'ko',
  'korean': 'ko',
  
  // 西班牙语
  'es': 'es',
  'spanish': 'es',
  
  // 法语
  'fr': 'fr',
  'french': 'fr',
  
  // 德语
  'de': 'de',
  'german': 'de',
  
  // 俄语
  'ru': 'ru',
  'russian': 'ru',
  
  // 阿拉伯语
  'ar': 'ar',
  'arabic': 'ar',
  
  // 葡萄牙语
  'pt': 'pt',
  'pt-br': 'pt',
  'portuguese': 'pt',
  
  // 意大利语
  'it': 'it',
  'italian': 'it',
  
  // 荷兰语
  'nl': 'nl',
  'dutch': 'nl',
  
  // 波兰语
  'pl': 'pl',
  'polish': 'pl',
  
  // 土耳其语
  'tr': 'tr',
  'turkish': 'tr',
  
  // 越南语
  'vi': 'vi',
  'vietnamese': 'vi',
  
  // 泰语
  'th': 'th',
  'thai': 'th',
  
  // 印尼语
  'id': 'id',
  'indonesian': 'id',
  
  // 自动检测
  'auto': 'auto',
  'detect': 'auto'
};

/**
 * 语言名称映射
 */
const LANGUAGE_NAMES = {
  'zh-CN': '中文简体',
  'zh-TW': '中文繁体',
  'en': 'English',
  'ja': '日本語',
  'ko': '한국어',
  'es': 'Español',
  'fr': 'Français',
  'de': 'Deutsch',
  'ru': 'Русский',
  'ar': 'العربية',
  'pt': 'Português',
  'it': 'Italiano',
  'nl': 'Nederlands',
  'pl': 'Polski',
  'tr': 'Türkçe',
  'vi': 'Tiếng Việt',
  'th': 'ไทย',
  'id': 'Bahasa Indonesia',
  'auto': '自动检测'
};

/**
 * 标准化语言代码
 * @param {string} lang - 语言代码
 * @returns {string} 标准化后的语言代码
 */
function normalizeLanguageCode(lang) {
  if (!lang) return 'auto';
  
  const normalized = lang.toLowerCase().trim();
  return LANGUAGE_MAP[normalized] || lang;
}

/**
 * 获取语言名称
 * @param {string} langCode - 语言代码
 * @returns {string} 语言名称
 */
function getLanguageName(langCode) {
  return LANGUAGE_NAMES[langCode] || langCode;
}

/**
 * 检测文本是否包含中文
 * @param {string} text - 文本
 * @returns {boolean} 是否包含中文
 */
function containsChinese(text) {
  return /[\u4e00-\u9fa5]/.test(text);
}

/**
 * 简单的语言检测（基于字符集）
 * @param {string} text - 文本
 * @returns {string} 检测到的语言代码
 */
function detectLanguageSimple(text) {
  if (!text || text.trim().length === 0) {
    return 'auto';
  }

  // 中文
  if (/[\u4e00-\u9fa5]/.test(text)) {
    // 检测繁体字
    const traditionalChars = /[繁體爲與臺灣]/;
    return traditionalChars.test(text) ? 'zh-TW' : 'zh-CN';
  }

  // 日文
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) {
    return 'ja';
  }

  // 韩文
  if (/[\uac00-\ud7af]/.test(text)) {
    return 'ko';
  }

  // 阿拉伯文
  if (/[\u0600-\u06ff]/.test(text)) {
    return 'ar';
  }

  // 泰文
  if (/[\u0e00-\u0e7f]/.test(text)) {
    return 'th';
  }

  // 西里尔字母（俄语等）
  if (/[\u0400-\u04ff]/.test(text)) {
    return 'ru';
  }

  // 默认英语
  return 'en';
}

/**
 * 获取所有支持的语言列表
 * @returns {Array} 语言列表
 */
function getSupportedLanguages() {
  return Object.keys(LANGUAGE_NAMES).map(code => ({
    code,
    name: LANGUAGE_NAMES[code]
  }));
}

module.exports = {
  normalizeLanguageCode,
  getLanguageName,
  containsChinese,
  detectLanguageSimple,
  getSupportedLanguages,
  LANGUAGE_MAP,
  LANGUAGE_NAMES
};
