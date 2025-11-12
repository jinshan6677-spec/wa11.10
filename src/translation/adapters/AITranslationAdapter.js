/**
 * AI 翻译适配器
 * 支持 OpenAI GPT-4, Google Gemini, DeepSeek 等兼容 OpenAI API 格式的服务
 */

const TranslationAdapter = require('./TranslationAdapter');
const https = require('https');
const { URL } = require('url');

class AITranslationAdapter extends TranslationAdapter {
  constructor(config = {}) {
    super(config);
    
    this.apiKey = config.apiKey || '';
    this.apiEndpoint = config.endpoint || 'https://api.openai.com/v1/chat/completions';
    this.model = config.model || 'gpt-4';
    this.maxTokens = config.maxTokens || 2000;
    this.temperature = config.temperature || 0.3;
  }

  /**
   * 翻译文本
   * @param {string} text - 待翻译文本
   * @param {string} sourceLang - 源语言
   * @param {string} targetLang - 目标语言
   * @param {Object} options - 翻译选项
   * @returns {Promise<Object>} 翻译结果
   */
  async translate(text, sourceLang, targetLang, options = {}) {
    try {
      // 验证配置
      if (!this.validateConfig()) {
        throw new Error('Invalid API configuration');
      }

      // 验证文本长度
      this.validateTextLength(text, 5000);

      // 标准化语言代码
      const source = this.normalizeLanguageCode(sourceLang);
      const target = this.normalizeLanguageCode(targetLang);

      // 构建提示词
      const style = options.style || '通用';
      const prompt = this.buildPrompt(text, source, target, style);

      // 调用 AI API
      const translatedText = await this.callAIAPI(prompt);

      return {
        translatedText: translatedText.trim(),
        detectedLang: source,
        engineUsed: this.name
      };

    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * 构建翻译提示词
   * @param {string} text - 文本
   * @param {string} sourceLang - 源语言
   * @param {string} targetLang - 目标语言
   * @param {string} style - 翻译风格
   * @returns {string} 提示词
   */
  buildPrompt(text, sourceLang, targetLang, style) {
    const stylePrompts = {
      '通用': '请将以下文本翻译成{targetLang}，保持原意。',
      '正式': '请将以下文本翻译成{targetLang}，使用正式、专业的语气。',
      '口语化': '请将以下文本翻译成{targetLang}，使用口语化、轻松的表达方式。',
      '亲切': '请将以下文本翻译成{targetLang}，使用亲切、友好的语气。',
      '幽默': '请将以下文本翻译成{targetLang}，在适当的地方加入幽默感。',
      '礼貌': '请将以下文本翻译成{targetLang}，使用礼貌、尊重的语气。',
      '强硬': '请将以下文本翻译成{targetLang}，使用坚定、有力的语气。',
      '简洁': '请将以下文本翻译成{targetLang}，使用简洁明了的表达。',
      '激励': '请将以下文本翻译成{targetLang}，使用积极、鼓舞人心的语气。',
      '中立': '请将以下文本翻译成{targetLang}，保持中立、客观的态度。',
      '专业': '请将以下文本翻译成{targetLang}，使用专业、技术性的表达。'
    };

    const targetLangName = this.getLanguageName(targetLang);
    const styleInstruction = (stylePrompts[style] || stylePrompts['通用'])
      .replace('{targetLang}', targetLangName);

    return `${styleInstruction}

原文：
${text}

重要：只输出翻译结果，不要包含任何解释、说明或额外内容。`;
  }

  /**
   * 获取语言名称
   * @param {string} langCode - 语言代码
   * @returns {string} 语言名称
   */
  getLanguageName(langCode) {
    const names = {
      'zh-CN': '中文简体',
      'zh-TW': '中文繁体',
      'en': '英语',
      'ja': '日语',
      'ko': '韩语',
      'es': '西班牙语',
      'fr': '法语',
      'de': '德语',
      'ru': '俄语',
      'ar': '阿拉伯语',
      'pt': '葡萄牙语',
      'it': '意大利语'
    };
    return names[langCode] || langCode;
  }

  /**
   * 调用 AI API
   * @param {string} prompt - 提示词
   * @returns {Promise<string>} 翻译结果
   */
  async callAIAPI(prompt) {
    const url = new URL(this.apiEndpoint);
    
    const requestBody = JSON.stringify({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'You are a professional translator. Translate the text accurately and naturally.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: this.maxTokens,
      temperature: this.temperature
    });

    return new Promise((resolve, reject) => {
      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Length': Buffer.byteLength(requestBody)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            if (res.statusCode !== 200) {
              reject(new Error(`HTTP ${res.statusCode}: ${data}`));
              return;
            }

            const parsed = JSON.parse(data);
            
            if (parsed.error) {
              reject(new Error(`API Error: ${parsed.error.message}`));
              return;
            }

            const translatedText = parsed.choices?.[0]?.message?.content;
            
            if (!translatedText) {
              reject(new Error('No translation result in response'));
              return;
            }

            resolve(translatedText);

          } catch (error) {
            reject(new Error(`Failed to parse response: ${error.message}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Network error: ${error.message}`));
      });

      req.setTimeout(30000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.write(requestBody);
      req.end();
    });
  }

  /**
   * 验证配置
   * @returns {boolean} 配置是否有效
   */
  validateConfig() {
    if (!this.apiKey || this.apiKey.trim() === '') {
      console.error(`[${this.name}] API key is required`);
      return false;
    }

    if (!this.apiEndpoint || this.apiEndpoint.trim() === '') {
      console.error(`[${this.name}] API endpoint is required`);
      return false;
    }

    return true;
  }

  /**
   * 检查引擎是否可用
   * @returns {boolean} 是否可用
   */
  isAvailable() {
    return super.isAvailable() && this.validateConfig();
  }
}

module.exports = AITranslationAdapter;
