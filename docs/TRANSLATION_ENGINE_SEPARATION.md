# 翻译引擎分离说明

## 概述

为了优化翻译成本和用户体验，我们将翻译功能分为两个独立的部分：
1. **聊天窗口翻译**（接收消息）- 正常翻译，不使用风格
2. **输入框翻译**（发送消息）- 支持风格翻译

## 功能特性

### 1. 聊天窗口翻译（接收的消息）

**用途**：翻译对方发来的消息，帮助用户理解对方在说什么

**特点**：
- 使用 `global.engine` 配置的翻译引擎
- **不使用风格参数**，只做正常翻译
- 可选择谷歌翻译（免费）或 AI 翻译
- 适合大量消息的日常翻译，节省成本

**配置位置**：
```javascript
config.global.engine = 'google' // 或 'gpt4', 'gemini', 'deepseek'
```

**使用场景**：
- 日常聊天：建议使用谷歌翻译（免费）
- 重要对话：可切换到 AI 翻译获得更准确的结果

### 2. 输入框翻译（发送的消息）

**用途**：翻译用户输入的消息，发送给对方

**特点**：
- 使用 `inputBox.engine` 配置的翻译引擎
- **支持风格参数**（通用、正式、口语化、亲切、幽默等）
- 可独立选择翻译引擎，与聊天窗口翻译分离
- 适合需要特定语气和风格的场景

**配置位置**：
```javascript
config.inputBox.engine = 'google' // 或 'gpt4', 'gemini', 'deepseek'
config.inputBox.style = '通用' // 或其他风格
```

**使用场景**：
- 普通回复：使用谷歌翻译 + 通用风格
- 商务沟通：使用 AI 翻译 + 正式风格
- 客户服务：使用 AI 翻译 + 亲切/礼貌风格
- 营销推广：使用 AI 翻译 + 激励/幽默风格

## 配置结构

```javascript
{
  global: {
    autoTranslate: false,
    engine: 'google',        // 聊天窗口翻译引擎（接收消息）
    sourceLang: 'auto',
    targetLang: 'zh-CN',
    groupTranslation: false
  },
  inputBox: {
    enabled: false,
    engine: 'google',        // 输入框翻译引擎（发送消息）
    style: '通用',           // 翻译风格（仅用于输入框翻译）
    targetLang: 'auto'
  }
}
```

## 成本优化建议

### 方案 1：全部使用免费翻译
```javascript
global.engine = 'google'      // 聊天窗口使用谷歌翻译
inputBox.engine = 'google'    // 输入框也使用谷歌翻译
```
- **成本**：完全免费
- **适用**：日常聊天、大量消息场景

### 方案 2：混合使用（推荐）
```javascript
global.engine = 'google'      // 聊天窗口使用谷歌翻译（免费）
inputBox.engine = 'gpt4'      // 输入框使用 AI 翻译（付费）
inputBox.style = '正式'       // 设置合适的风格
```
- **成本**：中等（只有发送消息时使用 AI）
- **适用**：大多数场景，平衡成本和质量

### 方案 3：全部使用 AI 翻译
```javascript
global.engine = 'gpt4'        // 聊天窗口使用 AI 翻译
inputBox.engine = 'gpt4'      // 输入框使用 AI 翻译
inputBox.style = '通用'       // 设置风格
```
- **成本**：较高
- **适用**：重要客户、商务沟通

## 风格说明

翻译风格**仅在输入框翻译时生效**，且需要使用 AI 翻译引擎（GPT-4、Gemini、DeepSeek 等）。

### 可用风格

| 风格 | 说明 | 适用场景 |
|------|------|----------|
| 通用 | 准确传达原意，保持自然流畅 | 日常对话 |
| 正式 | 正式、庄重的商务语气 | 商务沟通、正式场合 |
| 口语化 | 轻松、随意的日常口语 | 朋友聊天、非正式场合 |
| 亲切 | 亲切、温暖、关怀的语气 | 客户服务、关怀问候 |
| 幽默 | 风趣幽默、俏皮的表达 | 轻松场合、营销推广 |
| 礼貌 | 礼貌、尊重、谦逊的语气 | 初次接触、正式请求 |
| 强硬 | 坚定、有力、果断的语气 | 谈判、维权 |
| 简洁 | 简明扼要、去除冗余 | 快速沟通、信息传达 |
| 激励 | 积极、鼓舞人心、正能量 | 团队激励、销售推广 |
| 中立 | 客观中立、不带感情色彩 | 客观陈述、新闻报道 |
| 专业 | 专业、技术性、学术化 | 专业领域、技术讨论 |

### 风格示例

**原文**：我们的产品质量很好，价格也合理。

- **通用**：Our product quality is excellent and the price is reasonable.
- **正式**：We are pleased to inform you that our products are of superior quality and competitively priced.
- **口语化**：Our stuff is really good and the price is fair!
- **亲切**：We'd love to share that our products are great quality and very reasonably priced for you.
- **幽默**：Our products are so good, they practically sell themselves - and the price won't break the bank!
- **礼貌**：We would like to respectfully mention that our products maintain excellent quality while offering reasonable pricing.
- **强硬**：Our products deliver top quality at fair prices. Period.
- **简洁**：Quality products, fair prices.
- **激励**：Discover amazing quality products at prices that empower your success!
- **中立**：The products have good quality. The prices are reasonable.
- **专业**：Our product line demonstrates superior quality standards with competitive market positioning.

## 技术实现

### 代码修改点

1. **配置结构**（`ConfigManager.js`）
   - 添加 `inputBox.engine` 字段
   - 保留 `inputBox.style` 字段

2. **聊天窗口翻译**（`contentScript.js` - `translateMessage`）
   - 使用 `config.global.engine`
   - `options` 传递空对象（不使用风格）

3. **输入框翻译**（`contentScript.js` - `translateInputBox`）
   - 使用 `config.inputBox.engine`
   - `options.style` 传递风格参数

4. **实时翻译**（`contentScript.js` - `setupRealtimeTranslation`）
   - 使用 `config.inputBox.engine`
   - `options.style` 传递风格参数

5. **反向翻译**（`contentScript.js` - `showInputBoxReverseTranslation`）
   - 使用 `config.inputBox.engine`
   - `options` 传递空对象（不使用风格）

### 缓存机制

翻译缓存的 key 包含风格参数：
```javascript
const cacheKey = `${text}:${sourceLang}:${targetLang}:${engineName}:${style}`
```

这确保：
- 相同文本使用不同风格会产生不同的翻译结果
- 聊天窗口翻译（无风格）和输入框翻译（有风格）的缓存互不干扰

## 用户界面

### 配置界面建议

```
┌─────────────────────────────────────┐
│ 翻译设置                             │
├─────────────────────────────────────┤
│                                     │
│ 【聊天窗口翻译】（接收的消息）        │
│ ├─ 自动翻译：[✓] 开启               │
│ ├─ 翻译引擎：[谷歌翻译 ▼]           │
│ │             └─ 谷歌翻译（免费）    │
│ │                GPT-4              │
│ │                Gemini             │
│ │                DeepSeek           │
│ ├─ 目标语言：[中文简体 ▼]           │
│ └─ 群组翻译：[✓] 开启               │
│                                     │
│ 【输入框翻译】（发送的消息）          │
│ ├─ 启用翻译：[✓] 开启               │
│ ├─ 翻译引擎：[GPT-4 ▼]             │
│ │             └─ 谷歌翻译（免费）    │
│ │                GPT-4              │
│ │                Gemini             │
│ │                DeepSeek           │
│ ├─ 翻译风格：[正式 ▼]               │
│ │             └─ 通用               │
│ │                正式               │
│ │                口语化             │
│ │                亲切               │
│ │                幽默               │
│ │                礼貌               │
│ │                强硬               │
│ │                简洁               │
│ │                激励               │
│ │                中立               │
│ │                专业               │
│ └─ 目标语言：[自动检测 ▼]           │
│                                     │
│ 💡 提示：                            │
│ • 聊天窗口翻译不使用风格，建议使用   │
│   谷歌翻译节省成本                   │
│ • 输入框翻译支持风格，可根据场景     │
│   选择合适的引擎和风格               │
│                                     │
└─────────────────────────────────────┘
```

## 常见问题

### Q1: 为什么聊天窗口翻译不使用风格？
**A**: 聊天窗口翻译主要用于理解对方的意思，不需要特定的语气风格。使用正常翻译可以：
- 节省 AI 翻译成本
- 提高翻译速度
- 允许使用免费的谷歌翻译

### Q2: 如何选择合适的翻译引擎？
**A**: 
- **聊天窗口**：日常对话建议使用谷歌翻译（免费），重要对话可用 AI
- **输入框**：需要特定风格时使用 AI 翻译，普通回复可用谷歌翻译

### Q3: 风格翻译的成本如何？
**A**: 风格翻译需要使用 AI 引擎（GPT-4、Gemini 等），会产生 API 调用费用。建议：
- 日常聊天：使用谷歌翻译
- 重要场合：使用 AI 翻译 + 合适风格

### Q4: 可以只在输入框使用 AI 翻译吗？
**A**: 可以！这是推荐的成本优化方案：
```javascript
global.engine = 'google'      // 聊天窗口用谷歌（免费）
inputBox.engine = 'gpt4'      // 输入框用 AI（付费）
```

### Q5: 风格参数对谷歌翻译有效吗？
**A**: 无效。风格参数只对 AI 翻译引擎有效（GPT-4、Gemini、DeepSeek 等）。谷歌翻译会忽略风格参数。

## 更新日志

### 2024-11-16
- ✅ 实现聊天窗口翻译和输入框翻译的引擎分离
- ✅ 聊天窗口翻译不再使用风格参数
- ✅ 输入框翻译支持独立的引擎选择
- ✅ 更新配置结构，添加 `inputBox.engine` 字段
- ✅ 更新缓存机制，支持风格参数
- ✅ 更新文档和需求说明

## 相关文档

- [用户指南](USER_GUIDE.md)
- [API 文档](API.md)
- [配置管理](../src/translation/managers/ConfigManager.js)
- [内容脚本](../src/translation/contentScript.js)
