# 快速开始指南

## 🚀 启动应用

```bash
npm start
```

## ✅ 验证翻译功能

### 1. 应用启动后

应用会自动加载 WhatsApp Web，你会看到以下日志：

```
[INFO] Electron 应用已就绪
[INFO] 翻译服务初始化完成
[INFO] IPC 处理器注册完成
[INFO] 创建 Electron 窗口...
[INFO] 加载 WhatsApp Web...
[INFO] WhatsApp Web 加载完成，注入翻译脚本...
[INFO] 翻译脚本注入成功
```

### 2. 在浏览器控制台中验证

打开开发者工具（F12），在控制台中输入：

```javascript
// 检查翻译系统是否加载
window.WhatsAppTranslation

// 检查翻译 API 是否可用
window.translationAPI

// 测试翻译功能
await window.translationAPI.translate({
  text: 'Hello, how are you?',
  sourceLang: 'en',
  targetLang: 'zh-CN',
  engineName: 'google'
})
```

### 3. 启用自动翻译

#### 方法 1: 修改配置文件

找到配置文件（Windows: `%APPDATA%/whatsapp-desktop-container/translation-config.json`）

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
      }
    }
  }
}
```

#### 方法 2: 使用控制台

```javascript
// 获取当前配置
const config = await window.translationAPI.getConfig('default')

// 修改配置
config.data.global.autoTranslate = true
config.data.inputBox.enabled = true

// 保存配置
await window.translationAPI.saveConfig('default', config.data)

// 刷新页面使配置生效
location.reload()
```

### 4. 测试消息翻译

1. 登录 WhatsApp Web
2. 打开任意聊天
3. 发送一条英文消息（或让别人发送）
4. 如果启用了自动翻译，消息下方会显示翻译结果

### 5. 测试输入框翻译

1. 在输入框中输入中文文本
2. 点击输入框旁边的 🌐 按钮
3. 文本会被翻译成目标语言（默认英文）

## 🔧 常见问题

### 翻译按钮不显示

- 确保 WhatsApp Web 已完全加载
- 检查控制台是否有错误
- 刷新页面（Ctrl+R）

### 翻译不工作

1. 检查配置是否正确
2. 查看控制台错误信息
3. 验证网络连接

### 查看翻译统计

```javascript
await window.translationAPI.getStats()
```

## 📝 配置选项

### 翻译引擎

- `google`: Google 翻译（默认，免费）
- `gpt4`: OpenAI GPT-4（需要 API 密钥）
- `gemini`: Google Gemini（需要 API 密钥）
- `deepseek`: DeepSeek（需要 API 密钥）
- `custom`: 自定义 API

### 目标语言

- `zh-CN`: 中文简体
- `zh-TW`: 中文繁体
- `en`: 英语
- `ja`: 日语
- `ko`: 韩语
- `es`: 西班牙语
- `fr`: 法语
- `de`: 德语
- 等等...

### 翻译风格（仅 AI 引擎）

- 通用
- 正式
- 口语化
- 亲切
- 幽默
- 礼貌
- 强硬
- 简洁
- 激励
- 中立
- 专业

## 🎯 MVP 功能清单

- ✅ 消息自动翻译
- ✅ 输入框翻译按钮
- ✅ 多引擎支持（Google、GPT-4、Gemini、DeepSeek）
- ✅ 智能缓存系统
- ✅ 翻译风格选择
- ✅ 禁发中文功能
- ✅ 统计监控
- ✅ 错误重试和降级

## 📚 更多文档

详细文档请查看 `TRANSLATION_README.md`

## 🐛 调试

启用开发者工具：

```bash
npm run dev
```

查看日志：
- 主进程日志：终端输出
- 渲染进程日志：浏览器控制台（F12）

## 🎉 成功！

如果你看到翻译结果显示在消息下方，恭喜你，翻译功能已经成功运行！
