# WhatsApp Web 翻译功能

## 功能概述

为 WhatsApp Web 桌面客户端集成的全功能翻译系统，支持：

- ✅ **自动消息翻译** - 接收到的消息自动翻译
- ✅ **输入框翻译** - 发送前翻译输入内容
- ✅ **多引擎支持** - Google 翻译、GPT-4、Gemini、DeepSeek、自定义 API
- ✅ **智能缓存** - LRU 内存缓存 + 文件持久化
- ✅ **翻译风格** - 11 种 AI 翻译风格（通用、正式、口语化等）
- ✅ **错误重试** - 自动重试和引擎降级
- ✅ **统计监控** - 翻译使用统计和性能监控

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置翻译引擎（可选）

默认使用 Google 免费翻译，无需配置。

如需使用 AI 翻译引擎，可以通过环境变量或配置文件设置：

```bash
# OpenAI GPT-4
OPENAI_API_KEY=sk-xxx

# Google Gemini
GEMINI_API_KEY=xxx

# DeepSeek
DEEPSEEK_API_KEY=xxx
```

### 3. 启动应用

```bash
npm start
```

## 使用说明

### 消息自动翻译

1. 打开应用后，翻译功能会自动初始化
2. 默认情况下，自动翻译是**关闭**的
3. 翻译结果会显示在消息下方，包含：
   - 源语言 → 目标语言标识
   - 翻译后的文本
   - 缓存标识（如果是缓存结果）

### 输入框翻译

1. 在输入框中输入文本
2. 点击输入框旁边的 🌐 翻译按钮
3. 文本会被翻译并替换输入框内容
4. 可以继续编辑或直接发送

### 配置翻译设置

翻译配置存储在用户数据目录中：

**Windows**: `%APPDATA%/whatsapp-desktop-container/translation-config.json`
**macOS**: `~/Library/Application Support/whatsapp-desktop-container/translation-config.json`
**Linux**: `~/.config/whatsapp-desktop-container/translation-config.json`

#### 配置示例

```json
{
  "accounts": {
    "default": {
      "global": {
        "autoTranslate": true,
        "engine": "google",
        "sourceLang": "auto",
        "targetLang": "zh-CN",
        "groupTranslation": false
      },
      "inputBox": {
        "enabled": true,
        "style": "通用"
      },
      "advanced": {
        "friendIndependent": false,
        "blockChinese": false,
        "realtime": false,
        "reverseTranslation": false,
        "voiceTranslation": false,
        "imageTranslation": false
      }
    }
  },
  "engines": {
    "google": {
      "type": "google",
      "enabled": true
    },
    "gpt4": {
      "type": "openai",
      "enabled": false,
      "apiKey": "sk-xxx",
      "endpoint": "https://api.openai.com/v1/chat/completions",
      "model": "gpt-4"
    }
  }
}
```

### 配置说明

#### 全局设置 (global)

- `autoTranslate`: 是否自动翻译接收到的消息
- `engine`: 翻译引擎 (`google`, `gpt4`, `gemini`, `deepseek`, `custom`)
- `sourceLang`: 源语言 (`auto` 为自动检测)
- `targetLang`: 目标语言 (`zh-CN`, `en`, `ja`, `ko` 等)
- `groupTranslation`: 是否翻译群组消息

#### 输入框设置 (inputBox)

- `enabled`: 是否启用输入框翻译按钮
- `style`: AI 翻译风格（仅 AI 引擎有效）
  - 通用、正式、口语化、亲切、幽默、礼貌、强硬、简洁、激励、中立、专业

#### 高级功能 (advanced)

- `friendIndependent`: 好友独立翻译配置（暂未实现）
- `blockChinese`: 禁发中文（拦截包含中文的消息）
- `realtime`: 实时翻译预览（暂未实现）
- `reverseTranslation`: 反向翻译验证（暂未实现）
- `voiceTranslation`: 语音消息翻译（暂未实现）
- `imageTranslation`: 图片文字翻译（暂未实现）

## 翻译引擎配置

### Google 翻译（默认）

无需配置，开箱即用。使用免费的 Google Translate API。

### OpenAI GPT-4

```json
{
  "engines": {
    "gpt4": {
      "type": "openai",
      "enabled": true,
      "apiKey": "sk-xxx",
      "endpoint": "https://api.openai.com/v1/chat/completions",
      "model": "gpt-4"
    }
  }
}
```

### Google Gemini

```json
{
  "engines": {
    "gemini": {
      "type": "gemini",
      "enabled": true,
      "apiKey": "xxx",
      "endpoint": "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent",
      "model": "gemini-pro"
    }
  }
}
```

### DeepSeek

```json
{
  "engines": {
    "deepseek": {
      "type": "deepseek",
      "enabled": true,
      "apiKey": "xxx",
      "endpoint": "https://api.deepseek.com/v1/chat/completions",
      "model": "deepseek-chat"
    }
  }
}
```

### 自定义 API

支持任何兼容 OpenAI API 格式的服务：

```json
{
  "engines": {
    "custom": {
      "type": "custom",
      "name": "My Custom API",
      "enabled": true,
      "apiKey": "xxx",
      "endpoint": "https://your-api.com/v1/chat/completions",
      "model": "your-model"
    }
  }
}
```

## 缓存管理

翻译结果会被缓存以提高性能：

- **内存缓存**: 最近 1000 条翻译结果
- **文件缓存**: 所有翻译历史，7 天过期
- **缓存位置**: `%APPDATA%/whatsapp-desktop-container/translation-cache/`

### 清除缓存

可以通过以下方式清除缓存：

1. 删除缓存目录中的所有文件
2. 使用开发者工具调用 API：
   ```javascript
   window.translationAPI.clearCache()
   ```

## 统计信息

翻译统计数据存储在：`%APPDATA%/whatsapp-desktop-container/translation-stats.json`

包含：
- 每日翻译统计
- 各引擎使用情况
- 成功/失败率
- 平均响应时间
- 翻译字符数

## 故障排除

### 翻译按钮不显示

1. 确保 WhatsApp Web 已完全加载
2. 检查浏览器控制台是否有错误
3. 尝试刷新页面（Ctrl+R）

### 翻译失败

1. 检查网络连接
2. 验证 API 密钥是否正确
3. 查看错误提示信息
4. 检查翻译引擎是否可用

### API 密钥错误

1. 确认 API 密钥格式正确
2. 检查 API 密钥是否有效
3. 验证 API 端点 URL 是否正确

## 开发调试

### 启用开发者工具

```bash
npm run dev
```

### 查看翻译系统状态

在浏览器控制台中：

```javascript
// 查看翻译配置
window.WhatsAppTranslation.config

// 查看统计信息
await window.translationAPI.getStats()

// 手动翻译
await window.translationAPI.translate({
  text: 'Hello',
  sourceLang: 'en',
  targetLang: 'zh-CN',
  engineName: 'google'
})
```

## 性能优化

- 翻译结果自动缓存，重复内容无需重新翻译
- 支持引擎降级，主引擎失败自动切换备用引擎
- 自动重试机制，网络错误自动重试 3 次
- 批量处理优化，减少 API 调用次数

## 隐私说明

- 翻译内容仅发送到选择的翻译引擎
- 缓存数据仅存储在本地
- 不会上传任何数据到第三方服务器
- API 密钥加密存储

## 已知限制

- 语音消息翻译：暂未实现
- 图片文字翻译：暂未实现
- 好友独立配置：暂未实现
- 实时翻译预览：暂未实现
- 反向翻译验证：暂未实现

## 技术架构

- **前端**: Electron 39.x + 内容脚本注入
- **后端**: Node.js + IPC 通信
- **翻译引擎**: 多引擎适配器模式
- **缓存**: LRU Cache + 文件系统
- **配置**: electron-store

## 许可证

MIT License
