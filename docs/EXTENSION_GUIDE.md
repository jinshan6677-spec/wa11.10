# 扩展开发指南

## 目录

- [概述](#概述)
- [创建翻译引擎插件](#创建翻译引擎插件)
- [创建 UI 扩展](#创建-ui-扩展)
- [创建功能扩展](#创建功能扩展)
- [插件系统](#插件系统)
- [发布扩展](#发布扩展)

---

## 概述

WhatsApp 翻译系统支持通过插件扩展功能。您可以：

- 添加新的翻译引擎
- 自定义 UI 组件
- 扩展翻译功能
- 集成第三方服务

### 扩展类型

1. **翻译引擎插件**: 添加新的翻译服务
2. **UI 扩展**: 自定义界面组件
3. **功能扩展**: 添加新功能（如语音翻译、OCR 等）
4. **集成插件**: 与其他服务集成

---

## 创建翻译引擎插件

### 步骤 1: 创建适配器类

创建一个继承自 `TranslationAdapter` 的类：

```javascript
// plugins/my-translator/MyTranslatorAdapter.js
const TranslationAdapter = require('../../src/translation/adapters/TranslationAdapter');

class MyTranslatorAdapter extends TranslationAdapter {
  constructor(config) {
    super(config);
    this.apiKey = config.apiKey;
    this.endpoint = config.endpoint || 'https://api.mytranslator.com/translate';
  }
  
  /**
   * 翻译文本
   */
  async translate(text, sourceLang, targetLang, options = {}) {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          source_language: sourceLang,
          target_language: targetLang,
          style: options.style
        })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        translatedText: data.translated_text,
        detectedLang: data.detected_language,
        confidence: data.confidence
      };
    } catch (error) {
      throw new TranslationError(
        'TRANSLATION_FAILED',
        `MyTranslator failed: ${error.message}`,
        { originalError: error }
      );
    }
  }
  
  /**
   * 检测语言
   */
  async detectLanguage(text) {
    try {
      const response = await fetch(`${this.endpoint}/detect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      });
      
      const data = await response.json();
      
      return {
        language: data.language,
        confidence: data.confidence
      };
    } catch (error) {
      throw new Error(`Language detection failed: ${error.message}`);
    }
  }
  
  /**
   * 检查引擎是否可用
   */
  isAvailable() {
    return !!this.apiKey;
  }
  
  /**
   * 获取支持的语言列表
   */
  async getSupportedLanguages() {
    try {
      const response = await fetch(`${this.endpoint}/languages`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      
      const data = await response.json();
      return data.languages;
    } catch (error) {
      console.error('Failed to get supported languages:', error);
      return [];
    }
  }
}

module.exports = MyTranslatorAdapter;
```

### 步骤 2: 创建插件配置

创建插件配置文件：

```javascript
// plugins/my-translator/plugin.json
{
  "name": "my-translator",
  "version": "1.0.0",
  "displayName": "My Translator",
  "description": "A custom translation engine",
  "author": "Your Name",
  "type": "translation-engine",
  "main": "MyTranslatorAdapter.js",
  "config": {
    "apiKey": {
      "type": "string",
      "required": true,
      "secure": true,
      "label": "API Key",
      "description": "Your MyTranslator API key"
    },
    "endpoint": {
      "type": "string",
      "required": false,
      "default": "https://api.mytranslator.com/translate",
      "label": "API Endpoint",
      "description": "Custom API endpoint (optional)"
    }
  },
  "features": {
    "translation": true,
    "languageDetection": true,
    "styleSupport": true,
    "batchTranslation": false
  }
}
```

### 步骤 3: 注册插件

在主进程中注册插件：

```javascript
// src/main.js
const MyTranslatorAdapter = require('../plugins/my-translator/MyTranslatorAdapter');

// 加载插件配置
const pluginConfig = configManager.get('engines.my-translator', {});

// 创建适配器实例
const myTranslator = new MyTranslatorAdapter({
  apiKey: pluginConfig.apiKey,
  endpoint: pluginConfig.endpoint
});

// 注册到翻译管理器
translationManager.registerEngine('my-translator', myTranslator);
```

### 步骤 4: 添加 UI 配置

在设置面板中添加配置选项：

```javascript
// src/translation/contentScript.js
function renderEngineSettings() {
  const engines = [
    { value: 'google', label: 'Google 翻译' },
    { value: 'gpt4', label: 'GPT-4' },
    { value: 'my-translator', label: 'My Translator' }  // 添加新引擎
  ];
  
  // 渲染引擎选择下拉框
  // ...
}
```

---

## 创建 UI 扩展

### 自定义翻译结果显示

```javascript
// plugins/custom-ui/TranslationResultRenderer.js
class TranslationResultRenderer {
  constructor(options = {}) {
    this.theme = options.theme || 'default';
  }
  
  /**
   * 渲染翻译结果
   */
  render(messageNode, result) {
    const container = document.createElement('div');
    container.className = `wa-translation-result theme-${this.theme}`;
    
    // 创建头部
    const header = this.createHeader(result);
    container.appendChild(header);
    
    // 创建翻译文本
    const text = this.createText(result);
    container.appendChild(text);
    
    // 创建操作按钮
    const actions = this.createActions(result);
    container.appendChild(actions);
    
    // 插入到消息下方
    const messageContent = messageNode.querySelector('.message-in, .message-out');
    messageContent.appendChild(container);
  }
  
  createHeader(result) {
    const header = document.createElement('div');
    header.className = 'translation-header';
    header.innerHTML = `
      <span class="translation-icon">🌐</span>
      <span class="translation-lang">${result.detectedLang} → ${result.targetLang}</span>
      ${result.cached ? '<span class="cached-badge">缓存</span>' : ''}
    `;
    return header;
  }
  
  createText(result) {
    const text = document.createElement('div');
    text.className = 'translation-text';
    text.textContent = result.translatedText;
    return text;
  }
  
  createActions(result) {
    const actions = document.createElement('div');
    actions.className = 'translation-actions';
    
    // 复制按钮
    const copyBtn = document.createElement('button');
    copyBtn.textContent = '复制';
    copyBtn.onclick = () => this.copyToClipboard(result.translatedText);
    
    // 反向翻译按钮
    const reverseBtn = document.createElement('button');
    reverseBtn.textContent = '反向翻译';
    reverseBtn.onclick = () => this.reverseTranslate(result);
    
    actions.appendChild(copyBtn);
    actions.appendChild(reverseBtn);
    
    return actions;
  }
  
  copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    // 显示提示
  }
  
  async reverseTranslate(result) {
    // 实现反向翻译
  }
}

module.exports = TranslationResultRenderer;
```

### 自定义设置面板

```javascript
// plugins/custom-ui/SettingsPanel.js
class CustomSettingsPanel {
  constructor() {
    this.panel = null;
  }
  
  /**
   * 创建设置面板
   */
  create() {
    this.panel = document.createElement('div');
    this.panel.className = 'wa-translation-settings-panel';
    this.panel.innerHTML = `
      <div class="settings-header">
        <h2>翻译设置</h2>
        <button class="close-btn">×</button>
      </div>
      <div class="settings-content">
        ${this.renderBasicSettings()}
        ${this.renderAdvancedSettings()}
        ${this.renderEngineSettings()}
      </div>
      <div class="settings-footer">
        <button class="save-btn">保存设置</button>
        <button class="cancel-btn">取消</button>
      </div>
    `;
    
    this.attachEventListeners();
    return this.panel;
  }
  
  renderBasicSettings() {
    return `
      <div class="settings-section">
        <h3>基础设置</h3>
        <label>
          <input type="checkbox" id="auto-translate" />
          自动翻译
        </label>
        <label>
          翻译引擎
          <select id="engine-select">
            <option value="google">Google 翻译</option>
            <option value="gpt4">GPT-4</option>
            <option value="my-translator">My Translator</option>
          </select>
        </label>
        <!-- 更多设置 -->
      </div>
    `;
  }
  
  renderAdvancedSettings() {
    // 实现高级设置
  }
  
  renderEngineSettings() {
    // 实现引擎配置
  }
  
  attachEventListeners() {
    // 绑定事件监听器
  }
  
  show() {
    this.panel.style.display = 'block';
  }
  
  hide() {
    this.panel.style.display = 'none';
  }
}

module.exports = CustomSettingsPanel;
```

---

## 创建功能扩展

### 语音翻译扩展

```javascript
// plugins/voice-translation/VoiceTranslationExtension.js
class VoiceTranslationExtension {
  constructor(translationManager) {
    this.translationManager = translationManager;
    this.recognizer = null;
  }
  
  /**
   * 初始化语音识别
   */
  async initialize() {
    // 使用 Web Speech API 或 Whisper API
    this.recognizer = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    this.recognizer.continuous = false;
    this.recognizer.interimResults = false;
  }
  
  /**
   * 处理语音消息
   */
  async handleVoiceMessage(audioUrl) {
    try {
      // 1. 下载音频文件
      const audioBlob = await this.downloadAudio(audioUrl);
      
      // 2. 语音转文本
      const text = await this.speechToText(audioBlob);
      
      // 3. 翻译文本
      const translation = await this.translationManager.translate(
        text,
        'auto',
        'zh-CN',
        'google'
      );
      
      return {
        originalText: text,
        translatedText: translation.translatedText,
        detectedLang: translation.detectedLang
      };
    } catch (error) {
      console.error('Voice translation failed:', error);
      throw error;
    }
  }
  
  async downloadAudio(url) {
    const response = await fetch(url);
    return await response.blob();
  }
  
  async speechToText(audioBlob) {
    return new Promise((resolve, reject) => {
      this.recognizer.onresult = (event) => {
        const text = event.results[0][0].transcript;
        resolve(text);
      };
      
      this.recognizer.onerror = (event) => {
        reject(new Error(`Speech recognition error: ${event.error}`));
      };
      
      // 开始识别
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
      this.recognizer.start();
    });
  }
  
  /**
   * 显示语音翻译结果
   */
  displayResult(messageNode, result) {
    const container = document.createElement('div');
    container.className = 'voice-translation-result';
    container.innerHTML = `
      <div class="voice-text">
        <strong>识别文本:</strong> ${result.originalText}
      </div>
      <div class="voice-translation">
        <strong>翻译:</strong> ${result.translatedText}
      </div>
    `;
    
    messageNode.appendChild(container);
  }
}

module.exports = VoiceTranslationExtension;
```

### OCR 翻译扩展

```javascript
// plugins/ocr-translation/OCRTranslationExtension.js
const Tesseract = require('tesseract.js');

class OCRTranslationExtension {
  constructor(translationManager) {
    this.translationManager = translationManager;
    this.worker = null;
  }
  
  /**
   * 初始化 OCR
   */
  async initialize() {
    this.worker = await Tesseract.createWorker();
    await this.worker.loadLanguage('eng+chi_sim');
    await this.worker.initialize('eng+chi_sim');
  }
  
  /**
   * 处理图片消息
   */
  async handleImageMessage(imageUrl) {
    try {
      // 1. 下载图片
      const imageBlob = await this.downloadImage(imageUrl);
      
      // 2. OCR 识别
      const text = await this.recognizeText(imageBlob);
      
      // 3. 翻译文本
      const translation = await this.translationManager.translate(
        text,
        'auto',
        'zh-CN',
        'google'
      );
      
      return {
        originalText: text,
        translatedText: translation.translatedText,
        detectedLang: translation.detectedLang
      };
    } catch (error) {
      console.error('OCR translation failed:', error);
      throw error;
    }
  }
  
  async downloadImage(url) {
    const response = await fetch(url);
    return await response.blob();
  }
  
  async recognizeText(imageBlob) {
    const { data: { text } } = await this.worker.recognize(imageBlob);
    return text.trim();
  }
  
  /**
   * 显示 OCR 翻译结果
   */
  displayResult(messageNode, result) {
    const container = document.createElement('div');
    container.className = 'ocr-translation-result';
    container.innerHTML = `
      <div class="ocr-text">
        <strong>识别文本:</strong> ${result.originalText}
      </div>
      <div class="ocr-translation">
        <strong>翻译:</strong> ${result.translatedText}
      </div>
    `;
    
    messageNode.appendChild(container);
  }
  
  /**
   * 清理资源
   */
  async cleanup() {
    if (this.worker) {
      await this.worker.terminate();
    }
  }
}

module.exports = OCRTranslationExtension;
```

---

## 插件系统

### 插件加载器

```javascript
// src/translation/PluginLoader.js
const fs = require('fs');
const path = require('path');

class PluginLoader {
  constructor(pluginsDir) {
    this.pluginsDir = pluginsDir;
    this.plugins = new Map();
  }
  
  /**
   * 加载所有插件
   */
  async loadAll() {
    const pluginDirs = fs.readdirSync(this.pluginsDir);
    
    for (const dir of pluginDirs) {
      try {
        await this.loadPlugin(dir);
      } catch (error) {
        console.error(`Failed to load plugin ${dir}:`, error);
      }
    }
  }
  
  /**
   * 加载单个插件
   */
  async loadPlugin(pluginName) {
    const pluginDir = path.join(this.pluginsDir, pluginName);
    const configPath = path.join(pluginDir, 'plugin.json');
    
    // 读取插件配置
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    // 加载插件主文件
    const mainPath = path.join(pluginDir, config.main);
    const PluginClass = require(mainPath);
    
    // 创建插件实例
    const plugin = new PluginClass(config);
    
    // 初始化插件
    if (plugin.initialize) {
      await plugin.initialize();
    }
    
    // 保存插件
    this.plugins.set(pluginName, {
      config,
      instance: plugin
    });
    
    console.log(`Plugin loaded: ${config.displayName} v${config.version}`);
  }
  
  /**
   * 获取插件
   */
  getPlugin(name) {
    return this.plugins.get(name);
  }
  
  /**
   * 获取所有插件
   */
  getAllPlugins() {
    return Array.from(this.plugins.values());
  }
  
  /**
   * 卸载插件
   */
  async unloadPlugin(name) {
    const plugin = this.plugins.get(name);
    if (plugin && plugin.instance.cleanup) {
      await plugin.instance.cleanup();
    }
    this.plugins.delete(name);
  }
}

module.exports = PluginLoader;
```

### 使用插件加载器

```javascript
// src/main.js
const PluginLoader = require('./translation/PluginLoader');

// 创建插件加载器
const pluginLoader = new PluginLoader(path.join(__dirname, '../plugins'));

// 加载所有插件
await pluginLoader.loadAll();

// 注册翻译引擎插件
const plugins = pluginLoader.getAllPlugins();
for (const { config, instance } of plugins) {
  if (config.type === 'translation-engine') {
    translationManager.registerEngine(config.name, instance);
  }
}
```

---

## 发布扩展

### 打包插件

创建插件包：

```bash
# 进入插件目录
cd plugins/my-translator

# 创建压缩包
zip -r my-translator-1.0.0.zip .
```

### 插件目录结构

```
my-translator/
├── plugin.json           # 插件配置
├── MyTranslatorAdapter.js # 主文件
├── README.md             # 说明文档
├── LICENSE               # 许可证
└── package.json          # npm 配置（可选）
```

### 发布到 npm

```bash
# 初始化 npm 包
npm init

# 发布
npm publish
```

### 插件市场（计划中）

未来将提供官方插件市场，用户可以：
- 浏览和搜索插件
- 一键安装插件
- 自动更新插件
- 评价和反馈

---

## 最佳实践

### 1. 错误处理

```javascript
async translate(text, sourceLang, targetLang, options) {
  try {
    // 翻译逻辑
  } catch (error) {
    // 记录错误
    console.error('Translation failed:', error);
    
    // 抛出标准错误
    throw new TranslationError(
      'TRANSLATION_FAILED',
      error.message,
      { originalError: error }
    );
  }
}
```

### 2. 配置验证

```javascript
constructor(config) {
  super(config);
  
  // 验证必需配置
  if (!config.apiKey) {
    throw new Error('API key is required');
  }
  
  // 设置默认值
  this.endpoint = config.endpoint || 'https://api.default.com';
}
```

### 3. 资源清理

```javascript
async cleanup() {
  // 清理资源
  if (this.worker) {
    await this.worker.terminate();
    this.worker = null;
  }
  
  // 取消订阅
  if (this.subscription) {
    this.subscription.unsubscribe();
  }
}
```

### 4. 性能优化

```javascript
// 使用缓存
async translate(text, sourceLang, targetLang, options) {
  const cacheKey = this.generateCacheKey(text, sourceLang, targetLang);
  
  // 检查缓存
  if (this.cache.has(cacheKey)) {
    return this.cache.get(cacheKey);
  }
  
  // 执行翻译
  const result = await this.doTranslate(text, sourceLang, targetLang, options);
  
  // 缓存结果
  this.cache.set(cacheKey, result);
  
  return result;
}
```

### 5. 安全性

```javascript
// 验证输入
function validateInput(text) {
  if (typeof text !== 'string') {
    throw new Error('Text must be a string');
  }
  
  if (text.length > 10000) {
    throw new Error('Text too long');
  }
  
  // XSS 过滤
  return text.replace(/<script[^>]*>.*?<\/script>/gi, '');
}
```

---

## 示例插件

### 完整示例：DeepL 翻译插件

```javascript
// plugins/deepl-translator/DeepLAdapter.js
const TranslationAdapter = require('../../src/translation/adapters/TranslationAdapter');
const fetch = require('node-fetch');

class DeepLAdapter extends TranslationAdapter {
  constructor(config) {
    super(config);
    this.apiKey = config.apiKey;
    this.endpoint = config.endpoint || 'https://api-free.deepl.com/v2/translate';
  }
  
  async translate(text, sourceLang, targetLang, options = {}) {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `DeepL-Auth-Key ${this.apiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          text,
          source_lang: this.mapLanguageCode(sourceLang),
          target_lang: this.mapLanguageCode(targetLang)
        })
      });
      
      if (!response.ok) {
        throw new Error(`DeepL API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        translatedText: data.translations[0].text,
        detectedLang: data.translations[0].detected_source_language
      };
    } catch (error) {
      throw new TranslationError(
        'TRANSLATION_FAILED',
        `DeepL translation failed: ${error.message}`,
        { originalError: error }
      );
    }
  }
  
  async detectLanguage(text) {
    // DeepL 在翻译时自动检测语言
    const result = await this.translate(text, 'auto', 'EN');
    return {
      language: result.detectedLang,
      confidence: 1.0
    };
  }
  
  isAvailable() {
    return !!this.apiKey;
  }
  
  mapLanguageCode(code) {
    const mapping = {
      'zh-CN': 'ZH',
      'en': 'EN',
      'ja': 'JA',
      'ko': 'KO',
      // 更多映射...
    };
    return mapping[code] || code.toUpperCase();
  }
}

module.exports = DeepLAdapter;
```

```json
// plugins/deepl-translator/plugin.json
{
  "name": "deepl-translator",
  "version": "1.0.0",
  "displayName": "DeepL Translator",
  "description": "High-quality translation using DeepL API",
  "author": "Your Name",
  "type": "translation-engine",
  "main": "DeepLAdapter.js",
  "config": {
    "apiKey": {
      "type": "string",
      "required": true,
      "secure": true,
      "label": "DeepL API Key",
      "description": "Your DeepL API key (get it from https://www.deepl.com/pro-api)"
    },
    "endpoint": {
      "type": "string",
      "required": false,
      "default": "https://api-free.deepl.com/v2/translate",
      "label": "API Endpoint",
      "description": "Use https://api.deepl.com/v2/translate for Pro account"
    }
  },
  "features": {
    "translation": true,
    "languageDetection": true,
    "styleSupport": false,
    "batchTranslation": false
  },
  "supportedLanguages": [
    "zh-CN", "en", "ja", "ko", "fr", "de", "es", "it", "pt", "ru"
  ]
}
```

---

## 调试插件

### 启用调试日志

```javascript
// 在插件中
class MyPlugin {
  constructor(config) {
    this.debug = config.debug || false;
  }
  
  log(...args) {
    if (this.debug) {
      console.log('[MyPlugin]', ...args);
    }
  }
  
  async translate(text, sourceLang, targetLang) {
    this.log('Translating:', text);
    // ...
  }
}
```

### 使用断点

在插件代码中添加 `debugger;` 语句，然后在 DevTools 中调试。

---

## 获取帮助

- 📖 查看 [开发者文档](DEVELOPER_GUIDE.md)
- 📖 查看 [API 文档](API.md)
- 💬 在 GitHub Discussions 提问
- 🐛 报告 Bug 到 GitHub Issues

---

**最后更新**: 2024-01-15  
**版本**: 1.0.0

祝您开发愉快！🚀
