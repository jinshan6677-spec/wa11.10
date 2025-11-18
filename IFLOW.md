# iFlow CLI 指令上下文文档 - WhatsApp Desktop Container

> **创建时间**: 2025年11月18日  
> **项目类型**: Electron 桌面应用程序  
> **技术栈**: Electron 39.1.1 + Node.js 20.x + 单窗口架构

## 项目概述

这是一个基于 Electron 开发的 WhatsApp 桌面容器应用程序，支持多账号同时在线、实时翻译功能、完全会话隔离等企业级功能。项目采用现代化的单窗口架构，在单个主窗口中管理多个 WhatsApp 账号实例。

### 核心特性

- ✅ **多账号管理** - 同时运行多个 WhatsApp 账号，完全隔离
- ✅ **单窗口架构** - 使用 BrowserView 技术，一个窗口管理所有账号
- ✅ **智能翻译系统** - 支持 Google、GPT-4、Gemini、DeepSeek 等翻译引擎
- ✅ **会话持久化** - 自动保存登录状态，无需重复扫码
- ✅ **代理支持** - 每个账号可配置独立的网络代理
- ✅ **实时监控** - 账号状态监控、连接监控、登录状态检测
- ✅ **跨平台支持** - Windows、macOS、Linux 全平台支持

## 快速开始

### 基本运行命令

```bash
# 启动应用
npm start

# 开发模式（带调试）
npm run dev

# 打包应用
npm run build

# 运行测试
npm test
```

### 环境要求

- **Node.js**: 18+ (推荐 20.x)
- **操作系统**: Windows 10+, macOS 10.14+, Ubuntu 20.04+
- **内存**: 8GB+ (支持 5+ 并发账号)
- **网络**: 稳定的互联网连接

## 项目架构

### 核心技术架构

#### 1. 单窗口架构 (Single Window Architecture)

项目采用创新的单窗口架构设计：

```
┌─────────────────────────────────────┐
│           MainWindow                │
│  ┌─────────────┐ ┌─────────────────┐ │
│  │  Sidebar    │ │   ContentArea   │ │
│  │  (账号管理)  │ │  (BrowserView)  │ │
│  │             │ │                 │ │
│  │• 账号列表   │ │• 当前账号界面    │ │
│  │• 添加/删除  │ │• WhatsApp Web   │ │
│  │• 配置管理   │ │• 翻译功能       │ │
│  └─────────────┘ └─────────────────┘ │
└─────────────────────────────────────┘
```

**关键组件**:
- `MainWindow.js` - 主窗口管理器，管理侧边栏和内容区域
- `ViewManager.js` - BrowserView 视图管理器，切换不同账号视图
- `BrowserView` - 每个账号在独立的 BrowserView 中运行

#### 2. 多实例隔离 (Multi-Instance Isolation)

每个账号实例具有完全独立的运行环境：

```javascript
// 实例隔离配置
{
  userDataDir: `./profiles/account-${accountId}`,
  sessionPartition: `persist:account_${accountId}`,
  proxyConfig: account.proxy,
  translationConfig: account.translation
}
```

### 文件结构说明

```
src/
├── main.js                    # Electron 主进程入口点
├── config.js                  # 应用配置管理
├── preload.js                 # 预加载脚本
├── single-window/             # 单窗口架构组件
│   ├── MainWindow.js          # 主窗口管理
│   ├── ViewManager.js         # 视图管理
│   ├── ipcHandlers.js         # IPC 通信处理
│   └── renderer/              # 渲染进程文件
├── managers/                  # 核心管理器
│   ├── AccountConfigManager.js # 账号配置管理
│   ├── InstanceManager.js      # 实例生命周期管理
│   ├── SessionManager.js       # 会话持久化管理
│   ├── TranslationIntegration.js # 翻译系统集成
│   ├── NotificationManager.js  # 通知管理
│   ├── ErrorHandler.js         # 错误处理
│   └── ResourceManager.js      # 资源管理
├── translation/               # 翻译模块
│   ├── contentScript.js       # 翻译内容脚本
│   ├── translationService.js  # 翻译服务
│   └── adapters/              # 翻译引擎适配器
└── utils/                     # 工具类
    ├── ErrorLogger.js         # 错误日志
    ├── OrphanedDataCleaner.js # 数据清理
    └── PerformanceOptimizer.js # 性能优化
```

## 核心功能模块

### 1. 账号管理 (Account Management)

#### AccountConfigManager
- 账号配置的增删改查
- 账号状态持久化
- 自动账号配置验证

```javascript
// 账号配置示例
{
  id: "account-uuid",
  name: "工作账号",
  proxy: {
    enabled: true,
    protocol: "socks5",
    host: "127.0.0.1",
    port: 1080
  },
  translation: {
    enabled: true,
    engine: "google",
    targetLanguage: "zh-CN",
    autoTranslate: true,
    translateInput: true
  },
  autoStart: true,
  notifications: {
    enabled: true,
    sound: true,
    badge: true
  }
}
```

### 2. 实例管理 (Instance Management)

#### InstanceManager
- 负责管理所有账号实例的生命周期
- 实例状态监控和健康检查
- 崩溃检测和自动重启
- 资源使用监控

**实例状态**:
- `stopped` - 已停止
- `starting` - 启动中
- `running` - 运行中
- `error` - 错误状态
- `crashed` - 已崩溃

### 3. 翻译系统 (Translation System)

#### 支持的翻译引擎
- **Google 翻译** - 免费，适合日常使用
- **GPT-4** - 高质量翻译，支持风格化
- **Gemini** - Google 的 AI 翻译服务
- **DeepSeek** - 国产 AI 翻译服务

#### 翻译功能
- **聊天窗口翻译** - 自动翻译接收的消息
- **输入框翻译** - 发送前翻译，支持 11 种风格
- **好友独立配置** - 为每个联系人设置不同翻译规则
- **实时翻译** - 输入时实时显示翻译预览

```javascript
// 翻译配置示例
{
  engine: "gpt4",
  targetLanguage: "zh-CN",
  translateInput: true,
  translateChat: true,
  styles: [
    "通用", "正式", "口语化", "亲切", 
    "幽默", "礼貌", "强硬", "简洁", 
    "激励", "中立", "专业"
  ],
  friendSettings: {
    "+1234567890": {
      targetLanguage: "en",
      disabled: false
    }
  }
}
```

### 4. 会话管理 (Session Management)

#### SessionManager
- 独立的会话数据存储
- 自动登录状态检测
- 会话过期处理
- 数据迁移支持

每个账号的会话数据独立存储在：
```
profiles/account-${accountId}/
├── Session Storage/
├── Local Storage/
├── IndexedDB/
├── Cache/
└── Shared Dictionary/
```

### 5. 错误处理 (Error Handling)

#### ErrorHandler
- 全局错误捕获和处理
- 账号级别的错误隔离
- 错误分类和日志记录
- 错误恢复机制

**错误分类**:
- `INSTANCE_CRASH` - 实例崩溃
- `NETWORK_ERROR` - 网络错误
- `PROXY_ERROR` - 代理错误
- `TRANSLATION_ERROR` - 翻译错误

## IPC 通信

### 主进程与渲染进程通信

#### 主要 IPC 通道

```javascript
// 账号管理
'accounts-updated'        # 账号列表更新
'account-added'          # 添加账号
'account-removed'        # 删除账号
'account-updated'        # 更新账号

// 实例管理
'instance-started'       # 实例启动
'instance-stopped'       # 实例停止
'instance-error'         # 实例错误
'instance-crashed'       # 实例崩溃

// 翻译功能
'translation-config'     # 翻译配置
'translation-result'     # 翻译结果
'translation-error'      # 翻译错误

// 系统状态
'global-error'           # 全局错误
'cleanup-completed'      # 清理完成
'ipc-ready'             # IPC 就绪
```

## 开发规范

### 代码风格
- 使用 ESLint 进行代码规范检查
- 遵循 CommonJS 模块化规范
- 使用有意义的变量和函数命名
- 添加适当的注释说明复杂逻辑

### 错误处理
- 所有异步操作必须使用 try-catch 包装
- 使用统一的错误处理机制
- 错误信息需要详细且具有可操作性
- 关键错误需要记录到日志系统

### 性能优化
- 使用防抖机制处理频繁事件
- 合理使用定时器和定时任务
- 及时清理不再使用的资源
- 监控内存和 CPU 使用情况

## 常用操作

### 添加新账号

```javascript
// 通过 IPC 添加账号
window.electronAPI.addAccount({
  name: "新账号",
  proxy: { enabled: false },
  translation: {
    enabled: true,
    engine: "google",
    targetLanguage: "zh-CN"
  }
});
```

### 切换账号视图

```javascript
// 切换到指定账号
await viewManager.switchView(accountId, {
  createIfMissing: true,
  viewConfig: {
    url: 'https://web.whatsapp.com',
    proxy: account.proxy,
    translation: account.translation
  }
});
```

### 配置翻译功能

```javascript
// 为账号启用翻译
await translationIntegration.enableForAccount(accountId, {
  engine: 'gpt4',
  targetLanguage: 'zh-CN',
  translateInput: true,
  styles: ['正式', '亲切']
});
```

## 测试

### 运行测试

```bash
# 运行所有测试
npm test

# 监听模式（文件变更时自动运行）
npm run test:watch

# 生成覆盖率报告
npm run test:coverage

# 测试特定模块
npm test -- --testPathPattern=AccountConfigManager
```

### 测试覆盖

- **单元测试** - 各个管理器的核心功能
- **集成测试** - 组件间的协作
- **端到端测试** - 完整的用户操作流程

## 部署与发布

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm start

# 开发模式（带调试工具）
npm run dev
```

### 生产构建

```bash
# 构建所有平台
npm run build

# 构建特定平台
npm run build:win     # Windows
npm run build:mac     # macOS  
npm run build:linux   # Linux
```

### 环境变量

```bash
# 会话数据路径
SESSION_PATH=./session-data

# 最大实例数
MAX_INSTANCES=30

# 日志级别
LOG_LEVEL=info

# 是否启用系统托盘
TRAY_ENABLED=true

# 是否过滤控制台输出
FILTER_CONSOLE=true
```

## 故障排除

### 常见问题

#### 1. 实例启动失败

**症状**: 账号无法启动，显示连接错误

**解决方案**:
```bash
# 检查代理配置
npm run test:proxy

# 检查会话数据
npm run test:session

# 清理损坏的会话
npm run test:clean
```

#### 2. 翻译功能不工作

**症状**: 消息不被翻译或翻译错误

**解决方案**:
1. 检查翻译配置是否正确
2. 验证 API 密钥是否有效
3. 检查网络连接是否正常
4. 查看翻译服务日志

#### 3. 性能问题

**症状**: 应用运行缓慢，内存占用高

**解决方案**:
1. 减少并发运行的账号数量
2. 清理过期的会话数据
3. 重启应用释放资源
4. 检查是否有内存泄漏

### 日志分析

#### 关键日志路径

```
# 应用日志
${userData}/logs/error.log

# 会话日志  
${userData}/profiles/${accountId}/logs/

# 翻译日志
${userData}/translation-data/logs/
```

#### 日志级别

- **ERROR** - 严重错误，需要立即处理
- **WARN** - 警告信息，可能影响功能
- **INFO** - 一般信息，记录重要操作
- **DEBUG** - 调试信息，开发时使用

## 扩展开发

### 添加新的翻译引擎

1. 创建适配器文件 `src/translation/adapters/newEngine.js`
2. 实现标准接口方法
3. 注册到翻译管理器
4. 更新配置选项

### 添加新的管理器

1. 在 `src/managers/` 下创建新文件
2. 实现标准管理器接口
3. 在 `main.js` 中初始化
4. 添加相应的测试

### 自定义 IPC 处理器

1. 在相应模块中添加处理函数
2. 在 `ipcHandlers.js` 中注册
3. 在渲染进程中调用
4. 添加类型定义（如果使用 TypeScript）

## 贡献指南

### 提交规范

- 使用有意义的提交信息
- 遵循语义化版本控制
- 确保所有测试通过
- 更新相关文档

### 代码审查

- 所有代码变更需要审查
- 重点关注性能影响
- 验证错误处理
- 检查安全性问题

---

**最后更新**: 2025年11月18日  
**维护团队**: iFlow CLI Development Team  
**文档版本**: v1.0.0
