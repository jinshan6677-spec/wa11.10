# WhatsApp Desktop Container

<div align="center">

![Electron](https://img.shields.io/badge/Electron-39.1.1-47848F?style=for-the-badge&logo=electron&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey?style=for-the-badge)

基于 Electron 的 WhatsApp 桌面应用程序，支持实时翻译功能。

[功能特性](#核心特性) • [快速开始](#快速开始) • [文档](#文档) • [测试](#测试)

</div>

---

## 项目概述

本项目将 WhatsApp Web 封装为独立的桌面应用程序，提供实时翻译功能。用户可以在 Electron 窗口中直接使用完整的官方 WhatsApp Web 界面，并享受强大的翻译支持。

### 核心特性

- ✅ 完整的 WhatsApp Web 功能
- ✅ 实时消息翻译（支持多种翻译引擎）
- ✅ 输入框翻译（发送前翻译）
- ✅ 好友独立翻译配置
- ✅ 中文消息拦截
- ✅ 跨平台支持（Windows、macOS、Linux）
- 🔮 未来支持多账号

## 技术栈

- **Electron 39.1.1** - 桌面应用框架（Chromium 132.x + Node.js 20.x）
- **翻译引擎** - 支持 Google 翻译、GPT-4、Gemini、DeepSeek 等
- **Node.js 18+** - 运行时环境（推荐 20.x）

## 快速开始

### 本地开发

1. **安装依赖**
```bash
npm install
```

2. **启动应用**
```bash
npm start
```

3. **开发模式**（带调试）
```bash
npm run dev
```

### 使用说明

1. 启动应用后，Electron 窗口会加载 WhatsApp Web
2. 首次使用需要用手机扫描二维码登录
3. 登录后会话会自动保存，下次启动无需重新扫码
4. 所有 WhatsApp 功能都可以正常使用
5. 翻译功能会自动注入到页面中，可在设置中配置

### 应用打包

生成平台特定的安装包：

```bash
npm run build
```

打包后的文件在 `dist/` 目录中。

## 项目结构

```
whatsapp-desktop-container/
├── src/
│   ├── main.js              # Electron 主进程
│   └── config.js            # 配置文件
├── resources/               # 应用资源（图标等）
├── package.json
├── .gitignore
└── README.md
```

## 配置

### 环境变量

- `SESSION_PATH` - 会话数据存储路径（默认：`./session-data`）
- `LOG_LEVEL` - 日志级别（默认：`info`）
- `NODE_ENV` - 运行环境（`development` 或 `production`）

### 会话数据

会话数据存储在 `session-data/` 目录中，包含：
- WhatsApp 认证令牌
- 加密的会话信息
- 浏览器缓存

**重要**：不要删除此目录，否则需要重新扫码登录。

## 版本信息

当前使用 **Electron 39.1.1**（最新稳定版）

```bash
# 检查版本信息
npm run version
```

升级说明请参考：
- 📖 [UPGRADE_SUMMARY.md](UPGRADE_SUMMARY.md) - 升级总结
- 📖 [UPGRADE_NOTES.md](UPGRADE_NOTES.md) - 详细升级说明

## 📖 文档

### 用户文档

- **[用户指南](docs/USER_GUIDE.md)** - 完整的功能使用说明
- **[常见问题](docs/FAQ.md)** - 常见问题解答
- **[翻译引擎配置](docs/USER_GUIDE.md#翻译引擎配置)** - 各引擎配置指南

### 开发者文档

- **[开发者指南](docs/DEVELOPER_GUIDE.md)** - 开发环境设置和工作流
- **[API 文档](docs/API.md)** - 完整的 API 接口文档
- **[扩展开发指南](docs/EXTENSION_GUIDE.md)** - 创建翻译引擎插件
- **[构建和发布指南](docs/BUILD_GUIDE.md)** - 打包和发布流程

### 测试文档

- **[测试指南](docs/TESTING_GUIDE.md)** - 详细测试指南
- **[发布检查清单](docs/RELEASE_CHECKLIST.md)** - 发布前检查清单

### 其他文档

- **[更新日志](CHANGELOG.md)** - 版本更新记录
- **[安全最佳实践](docs/SECURITY_BEST_PRACTICES.md)** - 安全使用指南
- **[升级说明](docs/UPGRADE_NOTES.md)** - 版本升级指南

## 测试

### 运行测试

```bash
# 运行所有测试
npm test

# 监听模式
npm run test:watch

# 生成覆盖率报告
npm run test:coverage
```

### 测试工具

```bash
# 验证测试环境
npm run test:setup

# 检查会话数据
npm run test:session

# 检查重连配置
npm run test:reconnect

# 清理会话数据
npm run test:clean
```

详细信息请参考 [测试指南](docs/TESTING_GUIDE.md)。

## 故障排除

### 问题：无法启动 Chromium

**解决方案**：确保系统已安装 Chromium 依赖。在 Linux 上：
```bash
sudo apt-get install -y chromium fonts-liberation libasound2 libatk-bridge2.0-0
```

### 问题：会话频繁过期

**解决方案**：
1. 检查会话数据目录权限
2. 避免同时在多个设备上登录同一账号

更多问题排查请参考 [TESTING_GUIDE.md](TESTING_GUIDE.md) 中的常见问题部分。

### 控制台错误说明

如果在控制台看到错误信息，请参考 [CONSOLE_ERRORS_EXPLAINED.md](CONSOLE_ERRORS_EXPLAINED.md)。

大多数错误来自 WhatsApp Web 自身，不影响功能。应用已自动过滤这些错误。

## 未来计划

### 第二阶段功能

- [ ] 多账号支持（每个账号独立容器）
- [ ] 消息翻译功能
- [ ] 插件系统
- [ ] 自动回复功能
- [ ] 消息备份

## 许可证

MIT

## 📂 项目结构

```
whatsapp-desktop-translation/
├── src/
│   ├── main.js              # Electron 主进程
│   ├── preload.js           # 预加载脚本
│   ├── config.js            # 配置文件
│   └── translation/         # 翻译模块
│       ├── managers/        # 管理器（TranslationManager, ConfigManager, CacheManager）
│       ├── adapters/        # 翻译引擎适配器
│       ├── utils/           # 工具类（安全、性能、隐私）
│       ├── ipcHandlers.js   # IPC 通信处理器
│       └── contentScript.js # 内容脚本
├── scripts/                 # 测试和工具脚本
├── resources/               # 应用资源
├── .kiro/specs/            # 项目规范文档
├── docs/                    # 文档目录
│   ├── USER_GUIDE.md        # 用户指南
│   ├── FAQ.md               # 常见问题
│   ├── DEVELOPER_GUIDE.md   # 开发者指南
│   ├── API.md               # API 文档
│   ├── EXTENSION_GUIDE.md   # 扩展开发指南
│   ├── BUILD_GUIDE.md       # 构建和发布指南
│   ├── RELEASE_CHECKLIST.md # 发布检查清单
│   ├── TESTING_GUIDE.md     # 测试指南
│   ├── SECURITY_BEST_PRACTICES.md
│   ├── CONSOLE_ERRORS_EXPLAINED.md
│   └── UPGRADE_NOTES.md
├── CHANGELOG.md             # 更新日志
├── LICENSE                  # 许可证
└── package.json
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 开发规范

- 遵循现有代码风格
- 添加适当的注释
- 更新相关文档
- 运行测试确保功能正常

## 安全性说明

本应用使用与官方 WhatsApp Desktop 相同的技术实现，包括 User-Agent 设置。详细的安全性分析和最佳实践请参考：

📖 **[安全使用最佳实践](SECURITY_BEST_PRACTICES.md)**

关键点：
- ✅ User-Agent 设置是安全的，使用真实的 Chrome 版本
- ✅ 与官方 WhatsApp Desktop 使用相同的方法
- ⚠️ 请勿用于自动化消息发送或滥用
- ⚠️ 遵守 WhatsApp 服务条款

## 免责声明

本项目仅供学习和个人使用。使用本项目时请遵守 WhatsApp 的服务条款。详细信息请参考 [SECURITY_BEST_PRACTICES.md](SECURITY_BEST_PRACTICES.md)。
