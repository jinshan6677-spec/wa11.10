# 翻译功能快速参考

## 两种翻译场景

### 📥 聊天窗口翻译（接收消息）

**用途**：理解对方在说什么

**配置**：
```javascript
config.global.engine = 'google'  // 或 'gpt4', 'gemini', 'deepseek'
config.global.targetLang = 'zh-CN'
```

**特点**：
- ❌ 不使用风格参数
- ✅ 正常翻译，准确传达原意
- 💰 推荐使用谷歌翻译（免费）

---

### 📤 输入框翻译（发送消息）

**用途**：以合适的风格回复对方

**配置**：
```javascript
config.inputBox.engine = 'gpt4'  // 或 'google', 'gemini', 'deepseek'
config.inputBox.style = '正式'   // 或其他风格
config.inputBox.targetLang = 'auto'
```

**特点**：
- ✅ 支持 11 种风格
- ✅ 可独立选择引擎
- 💰 根据场景选择引擎

---

## 11 种翻译风格

| 风格 | 适用场景 | 示例 |
|------|---------|------|
| 通用 | 日常对话 | 自然流畅的表达 |
| 正式 | 商务沟通 | 使用敬语和完整句式 |
| 口语化 | 朋友聊天 | 轻松随意，可用缩写 |
| 亲切 | 客户服务 | 温暖关怀的语气 |
| 幽默 | 轻松场合 | 风趣俏皮的表达 |
| 礼貌 | 初次接触 | 尊重谦逊的语气 |
| 强硬 | 谈判维权 | 坚定果断的表达 |
| 简洁 | 快速沟通 | 去除冗余，精炼直接 |
| 激励 | 团队激励 | 积极鼓舞人心 |
| 中立 | 客观陈述 | 不带感情色彩 |
| 专业 | 技术讨论 | 使用专业术语 |

**注意**：风格仅在使用 AI 引擎时有效（GPT-4、Gemini、DeepSeek）

---

## 推荐配置方案

### 🎯 方案 1：成本优先（推荐）

```javascript
{
  global: {
    engine: 'google',      // 聊天窗口用谷歌（免费）
    targetLang: 'zh-CN'
  },
  inputBox: {
    engine: 'gpt4',        // 输入框用 AI（付费）
    style: '正式',         // 根据场景选择
    targetLang: 'auto'
  }
}
```

**成本**：中等  
**适用**：日常聊天、大量消息  
**优点**：平衡成本和质量

---

### 💎 方案 2：质量优先

```javascript
{
  global: {
    engine: 'gpt4',        // 聊天窗口用 AI
    targetLang: 'zh-CN'
  },
  inputBox: {
    engine: 'gpt4',        // 输入框用 AI
    style: '通用',
    targetLang: 'auto'
  }
}
```

**成本**：较高  
**适用**：重要客户、商务沟通  
**优点**：翻译质量最高

---

### 💰 方案 3：完全免费

```javascript
{
  global: {
    engine: 'google',      // 聊天窗口用谷歌
    targetLang: 'zh-CN'
  },
  inputBox: {
    engine: 'google',      // 输入框用谷歌
    targetLang: 'auto'
  }
}
```

**成本**：免费  
**适用**：预算有限、大量消息  
**优点**：完全免费

---

## 场景示例

### 场景 1：跨境电商客服

**需求**：
- 大量客户咨询（接收）
- 需要专业礼貌的回复（发送）

**配置**：
```javascript
global.engine = 'google'        // 理解客户问题（免费）
inputBox.engine = 'gpt4'        // 专业回复
inputBox.style = '礼貌'         // 礼貌语气
```

**成本**：中等（只在回复时使用 AI）

---

### 场景 2：商务谈判

**需求**：
- 准确理解对方意图
- 坚定表达己方立场

**配置**：
```javascript
global.engine = 'gpt4'          // 准确理解
inputBox.engine = 'gpt4'        // 准确表达
inputBox.style = '强硬'         // 坚定语气
```

**成本**：较高（双向都用 AI）

---

### 场景 3：朋友聊天

**需求**：
- 理解朋友消息
- 轻松随意回复

**配置**：
```javascript
global.engine = 'google'        // 理解消息（免费）
inputBox.engine = 'google'      // 回复消息（免费）
// 或
inputBox.engine = 'gpt4'        // 回复消息（付费）
inputBox.style = '口语化'       // 轻松语气
```

**成本**：免费或中等

---

### 场景 4：营销推广

**需求**：
- 理解客户反馈
- 激励性的推广话术

**配置**：
```javascript
global.engine = 'google'        // 理解反馈（免费）
inputBox.engine = 'gpt4'        // 推广话术
inputBox.style = '激励'         // 激励语气
```

**成本**：中等

---

## 快速决策树

```
需要翻译吗？
├─ 是 → 继续
└─ 否 → 不配置翻译

接收大量消息吗？
├─ 是 → 聊天窗口用谷歌翻译（免费）
└─ 否 → 聊天窗口用 AI 翻译（质量更好）

发送消息需要特定风格吗？
├─ 是 → 输入框用 AI 翻译 + 选择风格
└─ 否 → 输入框用谷歌翻译（免费）

预算充足吗？
├─ 是 → 两者都用 AI 翻译（最佳质量）
└─ 否 → 聊天窗口用谷歌，输入框用 AI（推荐）
```

---

## 常见问题

### Q: 风格对谷歌翻译有效吗？
**A**: 无效。风格仅对 AI 引擎有效（GPT-4、Gemini、DeepSeek）。

### Q: 如何节省成本？
**A**: 聊天窗口用谷歌翻译（免费），输入框根据需要选择引擎。

### Q: 什么时候用 AI 翻译？
**A**: 
- 需要特定风格时
- 重要对话需要高质量翻译时
- 专业术语较多时

### Q: 可以动态切换引擎吗？
**A**: 可以。在设置中随时修改 `global.engine` 和 `inputBox.engine`。

### Q: 风格效果明显吗？
**A**: 是的。AI 会根据风格调整用词、句式和语气，效果明显。

---

## 配置文件位置

```
profiles/
└── account-{uuid}/
    └── translation-config.json
```

## 相关命令

```bash
# 测试翻译配置
node scripts/test-translation-config.js

# 查看配置
cat profiles/account-xxx/translation-config.json
```

---

## 更多信息

- [详细说明文档](TRANSLATION_ENGINE_SEPARATION.md)
- [更新说明](../TRANSLATION_UPDATE.md)
- [用户指南](USER_GUIDE.md)
- [API 文档](API.md)
