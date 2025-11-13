# 开发者指南

## 目录

- [开发环境设置](#开发环境设置)
- [项目架构](#项目架构)
- [核心模块](#核心模块)
- [开发工作流](#开发工作流)
- [测试指南](#测试指南)
- [调试技巧](#调试技巧)
- [贡献指南](#贡献指南)

---

## 开发环境设置

### 系统要求

- **Node.js**: 18.x 或更高（推荐 20.x）
- **npm**: 9.x 或更高
- **Git**: 2.x 或更高
- **操作系统**: Windows 10+, macOS 12+, Linux (Ubuntu 20.04+)

### 克隆项目

```bash
git clone https://github.com/your-org/whatsapp-desktop-translation.git
cd whatsapp-desktop-translation
```

### 安装依赖

```bash
npm install
```

### 启动开发模式

```bash
# 启动应用（带调试）
npm run dev

# 或者普通启动
npm start
```

### 开发工具

推荐使用以下工具：

- **IDE**: VS Code, WebStorm
- **调试**: Chrome DevTools (内置在 Electron)
- **版本控制**: Git
- **API 测试**: Postman, Insomnia

---

## 项目架构

### 目录结构

```
whatsapp-desktop-container/
├── src/
│   ├── main.js                      # Electron 主进程入口
│   ├── preload.js                   # 预加载脚本
│   ├── config.js                    # 应用配置
│   └── translation/                 # 翻译模块
│       ├── managers/                # 管理器
│       │   ├── TranslationManager.js
│       │   ├── ConfigManager.js
│       │   └── CacheManager.js
│       ├── adapters/                # 翻译引擎适配器
│       │   ├── TranslationAdapter.js
│       │   ├── GoogleTranslateAdapter.js
│       │   ├── AITranslationAdapter.js
│       │   └── CustomAPIAdapter.js
│       ├── utils/                   # 工具类
│       │   ├── SecureStorage.js
│       │   ├── ContentSecurity.js
│       │   ├── PrivacyProtection.js
│       │   ├── PerformanceOptimizer.js
│       │   └── ContentScriptOptimizer.js
│       ├── ipcHandlers.js           # IPC 通信处理器
│       ├── contentScript.js         # 内容脚本
│       └── contentScriptWithOptimizer.js
├── scripts/                         # 工具脚本
├── docs/                            # 文档
├── .kiro/specs/                     # 规范文档
└── package.json
```


### 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    Electron 主进程                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           翻译服务管理器 (TranslationManager)         │  │
│  │  - 翻译引擎注册与管理                                 │  │
│  │  - 配置持久化                                         │  │
│  │  - IPC 通信处理                                       │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         翻译引擎适配器 (Translation Adapters)         │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐             │  │
│  │  │  Google  │ │   GPT-4  │ │  Gemini  │  ...        │  │
│  │  └──────────┘ └──────────┘ └──────────┘             │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            缓存管理器 (CacheManager)                  │  │
│  │  - LRU 缓存策略                                       │  │
│  │  - 持久化存储                                         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │ IPC
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Electron 渲染进程 (WhatsApp Web)            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         内容脚本 (Content Script)                     │  │
│  │  - DOM 监听与操作                                     │  │
│  │  - 消息拦截与注入                                     │  │
│  │  - UI 组件渲染                                        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 技术栈

- **Electron 39.x**: 桌面应用框架
- **Node.js 20.x**: 运行时环境
- **LRU Cache**: 内存缓存
- **electron-store**: 配置持久化
- **SQLite**: 缓存数据库（计划中）

---

## 核心模块

### 1. TranslationManager

翻译服务的核心管理器，负责协调所有翻译相关的操作。

**位置**: `src/translation/managers/TranslationManager.js`

**主要职责**:
- 注册和管理翻译引擎
- 处理翻译请求
- 管理缓存
- 错误处理和重试

**关键方法**:

```javascript
class TranslationManager {
  // 注册翻译引擎
  registerEngine(name, adapter)
  
  // 执行翻译
  async translate(text, sourceLang, targetLang, engineName, options)
  
  // 语言检测
  async detectLanguage(text)
  
  // 获取配置
  getConfig(accountId)
  
  // 保存配置
  saveConfig(accountId, config)
}
```

### 2. ConfigManager

配置管理器，使用 electron-store 持久化配置。

**位置**: `src/translation/managers/ConfigManager.js`

**主要职责**:
- 加载和保存配置
- 配置验证
- 默认配置管理

**配置结构**:

```javascript
{
  accounts: {
    [accountId]: {
      global: {
        autoTranslate: boolean,
        engine: string,
        sourceLang: string,
        targetLang: string,
        groupTranslation: boolean
      },
      inputBox: {
        enabled: boolean,
        style: string
      },
      advanced: {
        friendIndependent: boolean,
        blockChinese: boolean,
        realtime: boolean,
        reverseTranslation: boolean
      },
      friendConfigs: {
        [contactId]: {
          enabled: boolean,
          targetLang: string,
          blockChinese: boolean
        }
      }
    }
  },
  engines: {
    [engineName]: {
      type: string,
      enabled: boolean,
      apiKey: string,
      endpoint: string,
      model: string
    }
  }
}
```

### 3. CacheManager

缓存管理器，使用 LRU 缓存策略。

**位置**: `src/translation/managers/CacheManager.js`

**主要职责**:
- 缓存翻译结果
- 缓存键生成
- 缓存清理
- 统计信息

**关键方法**:

```javascript
class CacheManager {
  // 生成缓存键
  generateKey(text, sourceLang, targetLang, engine)
  
  // 获取缓存
  async get(text, sourceLang, targetLang, engine)
  
  // 设置缓存
  async set(text, sourceLang, targetLang, engine, result)
  
  // 清理过期缓存
  async cleanup()
  
  // 获取统计信息
  getStats()
}
```

### 4. Translation Adapters

翻译引擎适配器，提供统一的翻译接口。

**位置**: `src/translation/adapters/`

**基类**: `TranslationAdapter.js`

```javascript
class TranslationAdapter {
  constructor(config)
  
  // 翻译文本
  async translate(text, sourceLang, targetLang, options)
  
  // 检测语言
  async detectLanguage(text)
  
  // 检查可用性
  isAvailable()
}
```

**实现类**:
- `GoogleTranslateAdapter.js`: Google 翻译
- `AITranslationAdapter.js`: AI 翻译（GPT-4, Gemini, DeepSeek）
- `CustomAPIAdapter.js`: 自定义 API

### 5. Content Script

内容脚本，注入到 WhatsApp Web 页面。

**位置**: `src/translation/contentScript.js`

**主要职责**:
- 监听消息 DOM 变化
- 提取消息文本
- 显示翻译结果
- 处理输入框翻译
- 渲染设置面板

**关键功能**:

```javascript
window.WhatsAppTranslation = {
  // 初始化
  init()
  
  // 监听消息
  observeMessages()
  
  // 处理新消息
  handleNewMessage(messageNode)
  
  // 显示翻译
  displayTranslation(messageNode, result)
  
  // 监听输入框
  observeInputBox()
  
  // 翻译输入框
  translateInputBox()
  
  // 注入 UI
  injectUI()
}
```

### 6. IPC Handlers

IPC 通信处理器，连接主进程和渲染进程。

**位置**: `src/translation/ipcHandlers.js`

**注册的 IPC 通道**:

```javascript
// 翻译请求
ipcMain.handle('translation:translate', async (event, request) => {})

// 获取配置
ipcMain.handle('translation:getConfig', async (event, accountId) => {})

// 保存配置
ipcMain.handle('translation:saveConfig', async (event, accountId, config) => {})

// 语言检测
ipcMain.handle('translation:detectLanguage', async (event, text) => {})
```

---

## 开发工作流

### 添加新的翻译引擎

1. **创建适配器类**

```javascript
// src/translation/adapters/MyTranslationAdapter.js
const TranslationAdapter = require('./TranslationAdapter');

class MyTranslationAdapter extends TranslationAdapter {
  constructor(config) {
    super(config);
    this.apiKey = config.apiKey;
    this.endpoint = config.endpoint;
  }
  
  async translate(text, sourceLang, targetLang, options) {
    // 实现翻译逻辑
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        source: sourceLang,
        target: targetLang
      })
    });
    
    const data = await response.json();
    return {
      translatedText: data.translation,
      detectedLang: data.detected_language
    };
  }
  
  async detectLanguage(text) {
    // 实现语言检测逻辑
  }
  
  isAvailable() {
    return !!this.apiKey;
  }
}

module.exports = MyTranslationAdapter;
```

2. **注册引擎**

```javascript
// src/main.js
const MyTranslationAdapter = require('./translation/adapters/MyTranslationAdapter');

// 在初始化时注册
const myAdapter = new MyTranslationAdapter({
  apiKey: config.engines.myengine.apiKey,
  endpoint: config.engines.myengine.endpoint
});

translationManager.registerEngine('myengine', myAdapter);
```

3. **更新配置界面**

在内容脚本中添加新引擎的选项。

### 添加新功能

1. **规划功能**
   - 在 `.kiro/specs/` 中创建需求文档
   - 设计 API 接口
   - 评估影响范围

2. **实现功能**
   - 在相应模块中添加代码
   - 遵循现有代码风格
   - 添加错误处理

3. **编写测试**
   - 单元测试
   - 集成测试
   - 端到端测试

4. **更新文档**
   - API 文档
   - 用户指南
   - 开发者文档

### 修复 Bug

1. **复现问题**
   - 理解问题描述
   - 创建最小复现案例
   - 记录复现步骤

2. **定位问题**
   - 使用调试工具
   - 查看日志
   - 分析代码

3. **修复问题**
   - 编写修复代码
   - 添加测试防止回归
   - 验证修复效果

4. **提交修复**
   - 创建 Pull Request
   - 描述问题和解决方案
   - 等待代码审查

---

## 测试指南

### 单元测试

使用 Jest 进行单元测试。

**运行测试**:

```bash
npm test
```

**编写测试**:

```javascript
// src/translation/adapters/__tests__/GoogleTranslateAdapter.test.js
const GoogleTranslateAdapter = require('../GoogleTranslateAdapter');

describe('GoogleTranslateAdapter', () => {
  let adapter;
  
  beforeEach(() => {
    adapter = new GoogleTranslateAdapter({});
  });
  
  test('should translate text correctly', async () => {
    const result = await adapter.translate('Hello', 'en', 'zh-CN');
    expect(result.translatedText).toBeTruthy();
  });
  
  test('should detect language', async () => {
    const lang = await adapter.detectLanguage('Hello world');
    expect(lang).toBe('en');
  });
});
```

### 集成测试

测试多个模块的集成。

```javascript
// tests/integration/translation.test.js
const TranslationManager = require('../../src/translation/managers/TranslationManager');
const ConfigManager = require('../../src/translation/managers/ConfigManager');

describe('Translation Integration', () => {
  let manager;
  
  beforeEach(() => {
    const config = new ConfigManager();
    manager = new TranslationManager(config);
  });
  
  test('should translate with caching', async () => {
    // 第一次翻译
    const result1 = await manager.translate('Hello', 'en', 'zh-CN', 'google');
    expect(result1.cached).toBe(false);
    
    // 第二次翻译（应该使用缓存）
    const result2 = await manager.translate('Hello', 'en', 'zh-CN', 'google');
    expect(result2.cached).toBe(true);
  });
});
```

### 端到端测试

使用 Playwright 测试完整流程。

```javascript
// tests/e2e/translation.spec.js
const { test, expect } = require('@playwright/test');

test('should translate message automatically', async ({ page }) => {
  // 启动应用
  await page.goto('http://localhost:3000');
  
  // 等待 WhatsApp Web 加载
  await page.waitForSelector('[data-testid="conversation-panel-messages"]');
  
  // 模拟接收消息
  // ...
  
  // 验证翻译结果显示
  const translation = await page.locator('.wa-translation-result');
  await expect(translation).toBeVisible();
});
```

---

## 调试技巧

### 主进程调试

1. **启动调试模式**

```bash
npm run dev
```

2. **连接调试器**

在 Chrome 中打开 `chrome://inspect`，连接到 Electron 主进程。

3. **设置断点**

在代码中添加 `debugger;` 或在 DevTools 中设置断点。

### 渲染进程调试

1. **打开 DevTools**

在应用中按 `F12` 或 `Ctrl+Shift+I`。

2. **查看 Console**

查看日志输出和错误信息。

3. **使用 Sources 面板**

设置断点，单步调试。

### 日志记录

```javascript
// 在主进程中
console.log('[Translation]', 'Message:', message);

// 在渲染进程中
console.log('[ContentScript]', 'Translation result:', result);
```

### 性能分析

1. **使用 Performance 面板**

记录性能数据，分析瓶颈。

2. **使用 Memory 面板**

检查内存泄漏。

3. **使用 Network 面板**

分析网络请求。

---

## 贡献指南

### 代码规范

**JavaScript 风格**:
- 使用 2 空格缩进
- 使用单引号
- 使用分号
- 使用 camelCase 命名

**注释**:
- 为复杂逻辑添加注释
- 使用 JSDoc 注释公共 API
- 保持注释简洁明了

**示例**:

```javascript
/**
 * 翻译文本
 * @param {string} text - 要翻译的文本
 * @param {string} sourceLang - 源语言
 * @param {string} targetLang - 目标语言
 * @param {Object} options - 翻译选项
 * @returns {Promise<Object>} 翻译结果
 */
async translate(text, sourceLang, targetLang, options = {}) {
  // 检查缓存
  const cached = await this.cache.get(text, sourceLang, targetLang);
  if (cached) {
    return { ...cached, cached: true };
  }
  
  // 执行翻译
  const result = await this.engine.translate(text, sourceLang, targetLang, options);
  
  // 缓存结果
  await this.cache.set(text, sourceLang, targetLang, result);
  
  return { ...result, cached: false };
}
```

### 提交规范

使用 Conventional Commits 格式：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**类型**:
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式
- `refactor`: 重构
- `test`: 测试
- `chore`: 构建/工具

**示例**:

```
feat(translation): add DeepSeek adapter

- Implement DeepSeek API integration
- Add configuration options
- Update documentation

Closes #123
```

### Pull Request 流程

1. **Fork 项目**

2. **创建分支**

```bash
git checkout -b feature/my-feature
```

3. **提交更改**

```bash
git add .
git commit -m "feat: add my feature"
```

4. **推送分支**

```bash
git push origin feature/my-feature
```

5. **创建 PR**

在 GitHub 上创建 Pull Request，描述更改内容。

6. **代码审查**

等待维护者审查，根据反馈修改。

7. **合并**

审查通过后，PR 会被合并。

### 代码审查清单

- [ ] 代码符合规范
- [ ] 添加了测试
- [ ] 测试通过
- [ ] 更新了文档
- [ ] 没有引入新的警告
- [ ] 性能没有明显下降
- [ ] 安全性考虑充分

---

## 常见开发问题

### Q: 如何调试内容脚本？

**A**: 在 WhatsApp Web 页面中打开 DevTools（F12），在 Console 中可以访问 `window.WhatsAppTranslation` 对象。

### Q: 如何测试 IPC 通信？

**A**: 在主进程中添加日志，在渲染进程中调用 IPC 方法，查看日志输出。

### Q: 如何模拟 API 响应？

**A**: 使用 Jest 的 mock 功能：

```javascript
jest.mock('node-fetch');
const fetch = require('node-fetch');

fetch.mockResolvedValue({
  json: async () => ({ translation: '你好' })
});
```

### Q: 如何处理异步错误？

**A**: 使用 try-catch 包裹异步代码：

```javascript
try {
  const result = await this.translate(text);
} catch (error) {
  console.error('Translation failed:', error);
  // 处理错误
}
```

---

## 资源链接

- **Electron 文档**: https://www.electronjs.org/docs
- **Node.js 文档**: https://nodejs.org/docs
- **Jest 文档**: https://jestjs.io/docs
- **Playwright 文档**: https://playwright.dev/docs

---

**最后更新**: 2024-01-15  
**版本**: 1.0.0

欢迎贡献！🎉
