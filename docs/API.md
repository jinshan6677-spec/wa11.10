# API 接口文档

## 目录

- [IPC 通信接口](#ipc-通信接口)
- [翻译管理器 API](#翻译管理器-api)
- [配置管理器 API](#配置管理器-api)
- [缓存管理器 API](#缓存管理器-api)
- [翻译适配器 API](#翻译适配器-api)
- [内容脚本 API](#内容脚本-api)
- [数据类型定义](#数据类型定义)

---

## IPC 通信接口

### translation:translate

翻译文本。

**请求**:

```typescript
interface TranslationRequest {
  text: string;              // 要翻译的文本
  sourceLang: string;        // 源语言（'auto' 表示自动检测）
  targetLang: string;        // 目标语言
  engineName: string;        // 翻译引擎名称
  style?: string;            // 翻译风格（仅 AI 引擎）
  context?: string;          // 上下文信息
}
```

**响应**:

```typescript
interface TranslationResponse {
  translatedText: string;    // 翻译结果
  detectedLang?: string;     // 检测到的源语言
  confidence?: number;       // 置信度（0-1）
  cached: boolean;           // 是否来自缓存
  engineUsed: string;        // 使用的引擎
}
```

**示例**:

```javascript
// 渲染进程
const result = await window.electronAPI.translate({
  text: 'Hello, world!',
  sourceLang: 'auto',
  targetLang: 'zh-CN',
  engineName: 'google'
});

console.log(result.translatedText); // "你好，世界！"
```

### translation:getConfig

获取翻译配置。

**请求**:

```typescript
accountId: string  // 账户 ID
```

**响应**:

```typescript
interface TranslationConfig {
  accountId: string;
  global: GlobalConfig;
  inputBox: InputBoxConfig;
  advanced: AdvancedConfig;
  friendConfigs: Map<string, FriendConfig>;
}
```

**示例**:

```javascript
const config = await window.electronAPI.getConfig('account_1');
console.log(config.global.autoTranslate); // true
```

### translation:saveConfig

保存翻译配置。

**请求**:

```typescript
accountId: string
config: TranslationConfig
```

**响应**:

```typescript
{
  success: boolean;
  message?: string;
}
```

**示例**:

```javascript
const result = await window.electronAPI.saveConfig('account_1', {
  global: {
    autoTranslate: true,
    engine: 'google',
    sourceLang: 'auto',
    targetLang: 'zh-CN',
    groupTranslation: false
  },
  // ...
});
```

### translation:detectLanguage

检测文本语言。

**请求**:

```typescript
text: string  // 要检测的文本
```

**响应**:

```typescript
{
  language: string;      // 语言代码（如 'en', 'zh-CN'）
  confidence: number;    // 置信度（0-1）
}
```

**示例**:

```javascript
const result = await window.electronAPI.detectLanguage('Hello, world!');
console.log(result.language); // "en"
```

---

## 翻译管理器 API

### TranslationManager

翻译服务的核心管理器。

#### 构造函数

```javascript
constructor(configManager, cacheManager)
```

**参数**:
- `configManager`: ConfigManager 实例
- `cacheManager`: CacheManager 实例

#### registerEngine

注册翻译引擎。

```javascript
registerEngine(name, adapter)
```

**参数**:
- `name` (string): 引擎名称
- `adapter` (TranslationAdapter): 翻译适配器实例

**示例**:

```javascript
const googleAdapter = new GoogleTranslateAdapter({});
translationManager.registerEngine('google', googleAdapter);
```

#### translate

执行翻译。

```javascript
async translate(text, sourceLang, targetLang, engineName, options = {})
```

**参数**:
- `text` (string): 要翻译的文本
- `sourceLang` (string): 源语言
- `targetLang` (string): 目标语言
- `engineName` (string): 引擎名称
- `options` (Object): 翻译选项
  - `style` (string): 翻译风格
  - `context` (string): 上下文信息

**返回**: Promise<TranslationResponse>

**示例**:

```javascript
const result = await translationManager.translate(
  'Hello',
  'en',
  'zh-CN',
  'google',
  { style: '通用' }
);
```

#### detectLanguage

检测文本语言。

```javascript
async detectLanguage(text)
```

**参数**:
- `text` (string): 要检测的文本

**返回**: Promise<{ language: string, confidence: number }>

#### getConfig

获取配置。

```javascript
getConfig(accountId)
```

**参数**:
- `accountId` (string): 账户 ID

**返回**: TranslationConfig

#### saveConfig

保存配置。

```javascript
saveConfig(accountId, config)
```

**参数**:
- `accountId` (string): 账户 ID
- `config` (TranslationConfig): 配置对象

**返回**: { success: boolean, message?: string }

---

## 配置管理器 API

### ConfigManager

配置管理器，使用 electron-store 持久化配置。

#### 构造函数

```javascript
constructor(options = {})
```

**参数**:
- `options.name` (string): 配置文件名（默认：'translation-config'）
- `options.defaults` (Object): 默认配置

#### get

获取配置值。

```javascript
get(key, defaultValue)
```

**参数**:
- `key` (string): 配置键（支持点号路径，如 'accounts.account_1.global'）
- `defaultValue` (any): 默认值

**返回**: any

**示例**:

```javascript
const autoTranslate = configManager.get('accounts.account_1.global.autoTranslate', false);
```

#### set

设置配置值。

```javascript
set(key, value)
```

**参数**:
- `key` (string): 配置键
- `value` (any): 配置值

**示例**:

```javascript
configManager.set('accounts.account_1.global.autoTranslate', true);
```

#### has

检查配置键是否存在。

```javascript
has(key)
```

**参数**:
- `key` (string): 配置键

**返回**: boolean

#### delete

删除配置键。

```javascript
delete(key)
```

**参数**:
- `key` (string): 配置键

#### clear

清除所有配置。

```javascript
clear()
```

#### getAll

获取所有配置。

```javascript
getAll()
```

**返回**: Object

---

## 缓存管理器 API

### CacheManager

缓存管理器，使用 LRU 缓存策略。

#### 构造函数

```javascript
constructor(options = {})
```

**参数**:
- `options.maxSize` (number): 最大缓存条目数（默认：1000）
- `options.ttl` (number): 缓存过期时间（毫秒，默认：7 天）

#### generateKey

生成缓存键。

```javascript
generateKey(text, sourceLang, targetLang, engine)
```

**参数**:
- `text` (string): 文本
- `sourceLang` (string): 源语言
- `targetLang` (string): 目标语言
- `engine` (string): 引擎名称

**返回**: string (MD5 哈希)

**示例**:

```javascript
const key = cacheManager.generateKey('Hello', 'en', 'zh-CN', 'google');
// "a1b2c3d4e5f6..."
```

#### get

获取缓存。

```javascript
async get(text, sourceLang, targetLang, engine)
```

**参数**:
- `text` (string): 文本
- `sourceLang` (string): 源语言
- `targetLang` (string): 目标语言
- `engine` (string): 引擎名称

**返回**: Promise<TranslationResponse | null>

**示例**:

```javascript
const cached = await cacheManager.get('Hello', 'en', 'zh-CN', 'google');
if (cached) {
  console.log('Cache hit:', cached.translatedText);
}
```

#### set

设置缓存。

```javascript
async set(text, sourceLang, targetLang, engine, result)
```

**参数**:
- `text` (string): 文本
- `sourceLang` (string): 源语言
- `targetLang` (string): 目标语言
- `engine` (string): 引擎名称
- `result` (TranslationResponse): 翻译结果

**示例**:

```javascript
await cacheManager.set('Hello', 'en', 'zh-CN', 'google', {
  translatedText: '你好',
  detectedLang: 'en'
});
```

#### cleanup

清理过期缓存。

```javascript
async cleanup()
```

**返回**: Promise<number> (清理的条目数)

#### clear

清除所有缓存。

```javascript
clear()
```

#### getStats

获取缓存统计信息。

```javascript
getStats()
```

**返回**:

```typescript
{
  size: number;          // 当前缓存条目数
  maxSize: number;       // 最大缓存条目数
  hitRate: number;       // 缓存命中率（0-1）
  hits: number;          // 命中次数
  misses: number;        // 未命中次数
}
```

---

## 翻译适配器 API

### TranslationAdapter

翻译引擎适配器基类。

#### 构造函数

```javascript
constructor(config)
```

**参数**:
- `config` (Object): 引擎配置

#### translate

翻译文本（抽象方法，需要子类实现）。

```javascript
async translate(text, sourceLang, targetLang, options = {})
```

**参数**:
- `text` (string): 要翻译的文本
- `sourceLang` (string): 源语言
- `targetLang` (string): 目标语言
- `options` (Object): 翻译选项

**返回**: Promise<TranslationResponse>

#### detectLanguage

检测语言（抽象方法，需要子类实现）。

```javascript
async detectLanguage(text)
```

**参数**:
- `text` (string): 要检测的文本

**返回**: Promise<{ language: string, confidence: number }>

#### isAvailable

检查引擎是否可用。

```javascript
isAvailable()
```

**返回**: boolean

### GoogleTranslateAdapter

Google 翻译适配器。

**示例**:

```javascript
const adapter = new GoogleTranslateAdapter({});
const result = await adapter.translate('Hello', 'en', 'zh-CN');
```

### AITranslationAdapter

AI 翻译适配器（GPT-4, Gemini, DeepSeek）。

**配置**:

```javascript
{
  apiKey: string;      // API 密钥
  endpoint: string;    // API 端点
  model: string;       // 模型名称
}
```

**示例**:

```javascript
const adapter = new AITranslationAdapter({
  apiKey: 'sk-...',
  endpoint: 'https://api.openai.com/v1/chat/completions',
  model: 'gpt-4'
});

const result = await adapter.translate('Hello', 'en', 'zh-CN', {
  style: '正式'
});
```

### CustomAPIAdapter

自定义 API 适配器。

**配置**:

```javascript
{
  apiKey: string;      // API 密钥
  endpoint: string;    // API 端点
  model: string;       // 模型名称
}
```

---

## 内容脚本 API

### window.WhatsAppTranslation

内容脚本暴露的全局对象。

#### init

初始化翻译系统。

```javascript
init()
```

#### observeMessages

开始监听消息。

```javascript
observeMessages()
```

#### handleNewMessage

处理新消息。

```javascript
async handleNewMessage(messageNode)
```

**参数**:
- `messageNode` (HTMLElement): 消息 DOM 节点

#### displayTranslation

显示翻译结果。

```javascript
displayTranslation(messageNode, result)
```

**参数**:
- `messageNode` (HTMLElement): 消息 DOM 节点
- `result` (TranslationResponse): 翻译结果

#### observeInputBox

监听输入框。

```javascript
observeInputBox()
```

#### translateInputBox

翻译输入框内容。

```javascript
async translateInputBox()
```

#### injectUI

注入 UI 组件。

```javascript
injectUI()
```

---

## 数据类型定义

### TranslationRequest

```typescript
interface TranslationRequest {
  text: string;
  sourceLang: string;
  targetLang: string;
  engineName: string;
  style?: string;
  context?: string;
}
```

### TranslationResponse

```typescript
interface TranslationResponse {
  translatedText: string;
  detectedLang?: string;
  confidence?: number;
  cached: boolean;
  engineUsed: string;
}
```

### TranslationConfig

```typescript
interface TranslationConfig {
  accountId: string;
  global: GlobalConfig;
  inputBox: InputBoxConfig;
  advanced: AdvancedConfig;
  friendConfigs: Map<string, FriendConfig>;
}
```

### GlobalConfig

```typescript
interface GlobalConfig {
  autoTranslate: boolean;
  engine: string;
  sourceLang: string;
  targetLang: string;
  groupTranslation: boolean;
}
```

### InputBoxConfig

```typescript
interface InputBoxConfig {
  enabled: boolean;
  style: string;
}
```

### AdvancedConfig

```typescript
interface AdvancedConfig {
  friendIndependent: boolean;
  blockChinese: boolean;
  realtime: boolean;
  reverseTranslation: boolean;
  voiceTranslation: boolean;
  imageTranslation: boolean;
}
```

### FriendConfig

```typescript
interface FriendConfig {
  contactId: string;
  enabled: boolean;
  targetLang: string;
  blockChinese: boolean;
}
```

### EngineConfig

```typescript
interface EngineConfig {
  type: string;
  enabled: boolean;
  apiKey?: string;
  endpoint?: string;
  model?: string;
}
```

### CacheStats

```typescript
interface CacheStats {
  size: number;
  maxSize: number;
  hitRate: number;
  hits: number;
  misses: number;
}
```

---

## 错误处理

### TranslationError

```typescript
class TranslationError extends Error {
  code: string;
  details: Object;
}
```

### 错误代码

```typescript
enum ErrorCodes {
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_KEY_INVALID = 'API_KEY_INVALID',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  UNSUPPORTED_LANGUAGE = 'UNSUPPORTED_LANGUAGE',
  TEXT_TOO_LONG = 'TEXT_TOO_LONG',
  ENGINE_NOT_AVAILABLE = 'ENGINE_NOT_AVAILABLE',
  TRANSLATION_FAILED = 'TRANSLATION_FAILED'
}
```

### 错误处理示例

```javascript
try {
  const result = await translationManager.translate(text, 'en', 'zh-CN', 'google');
} catch (error) {
  if (error instanceof TranslationError) {
    switch (error.code) {
      case 'NETWORK_ERROR':
        console.error('网络错误，请检查连接');
        break;
      case 'API_KEY_INVALID':
        console.error('API 密钥无效');
        break;
      case 'RATE_LIMIT_EXCEEDED':
        console.error('超出速率限制');
        break;
      default:
        console.error('翻译失败:', error.message);
    }
  }
}
```

---

## 事件

### translation:progress

翻译进度事件（计划中）。

```javascript
window.electronAPI.on('translation:progress', (event, data) => {
  console.log('Progress:', data.progress);
});
```

### translation:error

翻译错误事件。

```javascript
window.electronAPI.on('translation:error', (event, error) => {
  console.error('Translation error:', error);
});
```

---

## 最佳实践

### 1. 错误处理

始终使用 try-catch 包裹异步调用：

```javascript
try {
  const result = await window.electronAPI.translate(request);
  // 处理结果
} catch (error) {
  // 处理错误
  console.error('Translation failed:', error);
}
```

### 2. 缓存利用

利用缓存提高性能：

```javascript
// 系统会自动使用缓存
const result = await translationManager.translate(text, 'en', 'zh-CN', 'google');
if (result.cached) {
  console.log('Using cached result');
}
```

### 3. 配置验证

保存配置前验证：

```javascript
function validateConfig(config) {
  if (!config.global.engine) {
    throw new Error('Engine is required');
  }
  if (!config.global.targetLang) {
    throw new Error('Target language is required');
  }
  return true;
}

if (validateConfig(config)) {
  await window.electronAPI.saveConfig(accountId, config);
}
```

### 4. 资源清理

及时清理资源：

```javascript
// 清理过期缓存
await cacheManager.cleanup();

// 清除所有缓存
cacheManager.clear();
```

---

**最后更新**: 2024-01-15  
**版本**: 1.0.0
