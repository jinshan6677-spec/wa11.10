# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- 语音消息翻译功能
- 图片文字 OCR 翻译
- 翻译统计和监控面板
- 本地翻译模型支持

## [1.0.0] - 2024-01-15

### Added
- 消息自动翻译功能
- 输入框翻译功能
- 多翻译引擎支持（Google 翻译、GPT-4、Gemini、DeepSeek）
- 好友独立翻译配置
- 禁发中文功能
- 实时翻译预览
- 反向翻译验证
- 翻译风格支持（11 种风格）
- 智能缓存系统（LRU 缓存）
- 翻译设置面板
- API 密钥加密存储
- 内容安全过滤
- 性能优化（请求队列、防抖、批量更新）
- 完整的用户文档
- 开发者文档和 API 文档
- 扩展开发指南

### Security
- API 密钥使用 Electron safeStorage 加密存储
- XSS 过滤和 HTML 转义
- 所有 API 请求使用 HTTPS
- 本地数据存储，不上传云端

### Performance
- LRU 缓存提高翻译速度
- 请求队列限制并发
- 防抖技术减少频繁请求
- requestAnimationFrame 优化 DOM 操作

### Documentation
- 用户指南（USER_GUIDE.md）
- 常见问题解答（FAQ.md）
- 开发者指南（DEVELOPER_GUIDE.md）
- API 文档（API.md）
- 扩展开发指南（EXTENSION_GUIDE.md）
- 构建和发布指南（BUILD_GUIDE.md）

## [0.1.0] - 2024-01-01

### Added
- 初始项目结构
- Electron 应用框架
- WhatsApp Web 集成
- 基础翻译功能原型

---

## 版本说明

### 版本号格式

版本号格式：`主版本号.次版本号.修订号`

- **主版本号**: 不兼容的 API 更改
- **次版本号**: 向后兼容的功能新增
- **修订号**: 向后兼容的问题修正

### 更改类型

- **Added**: 新增功能
- **Changed**: 功能变更
- **Deprecated**: 即将废弃的功能
- **Removed**: 已移除的功能
- **Fixed**: Bug 修复
- **Security**: 安全性改进
- **Performance**: 性能优化
- **Documentation**: 文档更新

---

[Unreleased]: https://github.com/your-org/whatsapp-desktop-translation/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/your-org/whatsapp-desktop-translation/releases/tag/v1.0.0
[0.1.0]: https://github.com/your-org/whatsapp-desktop-translation/releases/tag/v0.1.0
