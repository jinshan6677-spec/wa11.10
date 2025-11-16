# IPC 通信机制实现总结

## 概述

本文档总结了多实例架构中 IPC（进程间通信）机制的完整实现。IPC 机制是主进程和渲染进程之间通信的桥梁，确保主窗口能够安全地管理账号和实例。

## 实现的 IPC 通道

### 1. 账号管理通道

#### `accounts:get-all`
- **类型**: Handle (双向)
- **功能**: 获取所有账号列表及其状态
- **返回**: 账号数组，包含状态信息

#### `account:create`
- **类型**: Handle (双向)
- **功能**: 创建新账号
- **参数**: 账号配置对象
- **返回**: 创建的账号对象

#### `account:update`
- **类型**: Handle (双向)
- **功能**: 更新账号配置
- **参数**: accountId, 配置对象
- **返回**: 更新后的账号对象

#### `account:delete`
- **类型**: Handle (双向)
- **功能**: 删除账号及其数据
- **参数**: accountId
- **返回**: void

### 2. 实例控制通道

#### `instance:start`
- **类型**: Handle (双向)
- **功能**: 启动账号实例
- **参数**: accountId
- **返回**: void

#### `instance:stop`
- **类型**: Handle (双向)
- **功能**: 停止账号实例
- **参数**: accountId
- **返回**: void

#### `instance:restart`
- **类型**: Handle (双向)
- **功能**: 重启账号实例
- **参数**: accountId
- **返回**: void

### 3. 状态同步通道

#### `status:request`
- **类型**: Handle (双向)
- **功能**: 请求账号状态信息
- **参数**: accountId (可选，不传则获取所有)
- **返回**: 状态对象或状态数组

#### `account:status-update` (事件)
- **类型**: Send (单向)
- **功能**: 主进程向渲染进程推送状态更新
- **数据**: { accountId, status }

#### `accounts:render` (事件)
- **类型**: Send (单向)
- **功能**: 主进程通知渲染进程刷新账号列表
- **数据**: 账号数组

### 4. 翻译配置通道

#### `translation:config-get`
- **类型**: Handle (双向)
- **功能**: 获取账号的翻译配置
- **参数**: accountId
- **返回**: 翻译配置对象

#### `translation:config-update`
- **类型**: Handle (双向)
- **功能**: 更新账号的翻译配置
- **参数**: accountId, 配置对象
- **返回**: 更新后的翻译配置

#### `translation:status`
- **类型**: Handle (双向)
- **功能**: 获取翻译系统状态
- **参数**: accountId
- **返回**: 翻译状态对象

### 5. 通知通道

#### `notification:show` (事件)
- **类型**: Send (单向)
- **功能**: 主进程向渲染进程发送通知
- **数据**: { accountId, message }

## 文件结构

### 1. `src/container/preload-main.js`

预加载脚本，在渲染进程中暴露安全的 IPC API。

**关键功能**:
- 使用 `contextBridge.exposeInMainWorld` 暴露 `mainAPI`
- 封装所有 IPC 调用，确保安全性
- 提供事件监听器注册

**暴露的 API**:
```javascript
window.mainAPI = {
  // 账号管理
  getAccounts(),
  createAccount(config),
  updateAccount(accountId, config),
  deleteAccount(accountId),
  
  // 实例控制
  startInstance(accountId),
  stopInstance(accountId),
  restartInstance(accountId),
  
  // 状态同步
  requestStatus(accountId),
  
  // 翻译配置
  getTranslationConfig(accountId),
  updateTranslationConfig(accountId, config),
  getTranslationStatus(accountId),
  
  // 事件监听
  onAccountsRender(callback),
  onAccountStatusUpdate(callback),
  onNotificationShow(callback)
}
```

### 2. `src/container/ipcHandlers.js`

主进程 IPC 处理器，处理来自渲染进程的请求。

**关键功能**:
- 注册所有 IPC 处理器
- 与 AccountConfigManager 和 InstanceManager 交互
- 错误处理和日志记录
- 状态同步和 UI 更新

**主要函数**:
- `registerIPCHandlers(configManager, instanceManager, mainWindow)`: 注册所有处理器
- `unregisterIPCHandlers()`: 注销所有处理器

### 3. `src/container/renderer.js`

渲染进程脚本，使用 IPC API 实现 UI 交互。

**关键功能**:
- 调用 `window.mainAPI` 方法
- 监听主进程事件
- 更新 UI 状态

## 安全性考虑

### 1. Context Isolation
- 启用 `contextIsolation: true`
- 使用 `contextBridge` 暴露 API
- 渲染进程无法直接访问 Node.js 和 Electron API

### 2. 输入验证
- 所有 IPC 处理器验证输入参数
- 检查账号是否存在
- 验证配置格式

### 3. 错误处理
- 所有 IPC 处理器使用 try-catch
- 错误信息记录到日志
- 向渲染进程返回友好的错误消息

## 数据流

### 账号创建流程
```
Renderer (UI)
  ↓ mainAPI.createAccount(config)
Preload (contextBridge)
  ↓ ipcRenderer.invoke('account:create', config)
Main Process (ipcHandlers)
  ↓ configManager.saveAccount()
  ↓ mainWindow.renderAccountList()
  ↓ return accountConfig
Renderer (UI)
  ↓ 更新账号列表
```

### 实例启动流程
```
Renderer (UI)
  ↓ mainAPI.startInstance(accountId)
Preload (contextBridge)
  ↓ ipcRenderer.invoke('instance:start', accountId)
Main Process (ipcHandlers)
  ↓ mainWindow.updateAccountStatus(accountId, 'starting')
  ↓ instanceManager.createInstance(accountConfig)
  ↓ mainWindow.updateAccountStatus(accountId, 'running')
Renderer (UI)
  ↓ 接收 account:status-update 事件
  ↓ 更新 UI 状态
```

### 状态同步流程
```
Main Process (InstanceManager)
  ↓ 检测到状态变化
  ↓ mainWindow.updateAccountStatus(accountId, status)
  ↓ window.webContents.send('account:status-update', data)
Renderer (UI)
  ↓ onAccountStatusUpdate 回调
  ↓ 更新账号卡片状态
```

## 与其他组件的集成

### 1. AccountConfigManager
- IPC 处理器调用配置管理器的方法
- 加载、保存、更新、删除账号配置

### 2. InstanceManager
- IPC 处理器调用实例管理器的方法
- 创建、销毁、重启实例
- 获取实例状态

### 3. MainApplicationWindow
- IPC 处理器调用主窗口的方法
- 更新 UI 状态
- 发送事件到渲染进程

### 4. TranslationIntegration
- 通过 InstanceManager 注入翻译脚本
- 应用翻译配置到运行中的实例

## 测试建议

### 单元测试
- 测试每个 IPC 处理器的逻辑
- 模拟 configManager 和 instanceManager
- 验证错误处理

### 集成测试
- 测试完整的 IPC 通信流程
- 验证数据在主进程和渲染进程之间正确传递
- 测试事件监听和状态同步

### 手动测试清单
- [ ] 创建账号并验证配置保存
- [ ] 更新账号配置并验证应用到运行中的实例
- [ ] 删除账号并验证数据清理
- [ ] 启动实例并验证状态更新
- [ ] 停止实例并验证状态更新
- [ ] 重启实例并验证流程
- [ ] 更新翻译配置并验证应用
- [ ] 验证错误处理和用户反馈

## 性能优化

### 1. 批量操作
- 避免频繁的 IPC 调用
- 批量获取账号状态

### 2. 事件节流
- 状态更新事件使用节流
- 避免过度渲染

### 3. 异步处理
- 所有 IPC 处理器使用 async/await
- 不阻塞主进程

## 未来改进

### 1. 类型安全
- 使用 TypeScript 定义 IPC 消息类型
- 编译时检查参数类型

### 2. 消息验证
- 使用 JSON Schema 验证 IPC 消息
- 更严格的输入验证

### 3. 性能监控
- 记录 IPC 调用延迟
- 监控消息频率

### 4. 错误恢复
- 实现 IPC 调用重试机制
- 处理渲染进程崩溃

## 相关需求

本实现满足以下需求：
- **Requirement 1.2**: 账号管理 IPC 通道
- **Requirement 7.1**: 实例控制 IPC 通道
- **Requirement 7.2**: 停止实例
- **Requirement 7.3**: 重启实例
- **Requirement 9.3**: 翻译配置 IPC 通道
- **Requirement 10.3**: 状态同步和 UI 更新

## 总结

IPC 通信机制是多实例架构的核心组件，实现了主进程和渲染进程之间的安全、高效通信。通过清晰的通道定义、完善的错误处理和状态同步机制，确保了用户界面能够可靠地管理多个 WhatsApp 账号实例。

所有 IPC 通道已完整实现并集成到现有的组件中，为后续功能（如会话持久化、高级功能等）提供了坚实的基础。
