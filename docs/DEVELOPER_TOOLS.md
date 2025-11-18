# 开发者工具使用指南

## 概述

WhatsApp Desktop 应用现在支持完整的开发者工具功能，让您可以查看控制台输出、调试应用、监控网络请求等。

## 功能特性

### 1. 快捷键控制
- **F12**: 切换开发者工具显示/隐藏
- **Ctrl+Shift+I** (Windows/Linux): 切换开发者工具
- **Cmd+Opt+I** (macOS): 切换开发者工具

### 2. 自动功能
- **开发模式自动打开**: 当使用 `npm run dev` 启动时，开发者工具会自动打开
- **控制台日志**: 渲染进程的 console.log 输出会显示在开发者工具的控制台中

### 3. IPC 接口
- **toggle-dev-tools**: 通过 IPC 切换开发者工具
- **get-dev-tools-status**: 获取开发者工具当前状态

## 使用方法

### 启动应用

1. **开发模式** (推荐用于调试):
   ```bash
   npm run dev
   ```
   - 开发者工具会自动打开
   - 可以看到完整的应用日志

2. **普通模式**:
   ```bash
   npm start
   ```
   - 需要手动按 F12 打开开发者工具

### 操作指南

#### 打开/关闭开发者工具
1. **方法一**: 按 F12 键
2. **方法二**: 按 Ctrl+Shift+I (Windows/Linux) 或 Cmd+Opt+I (macOS)
3. **方法三**: 在开发者工具中点击关闭按钮

#### 在开发者工具中查看信息

**Console (控制台)**
- 查看应用运行日志
- 查看 JavaScript 错误
- 测试 JavaScript 代码
- 监控 React 组件更新

**Elements (元素)**
- 查看 DOM 结构
- 检查 CSS 样式
- 实时修改页面样式

**Network (网络)**
- 监控 API 请求
- 查看响应数据
- 分析加载性能

**Application (应用)**
- 查看本地存储数据
- 检查会话信息
- 管理 IndexedDB 数据

**Performance (性能)**
- 监控页面性能
- 分析渲染时间
- 检查内存使用情况

## 代码集成

### 从渲染进程控制开发者工具

```javascript
// 在渲染进程的 JavaScript 中
const { ipcRenderer } = require('electron');

// 切换开发者工具
ipcRenderer.send('toggle-dev-tools');

// 获取开发者工具状态
ipcRenderer.invoke('get-dev-tools-status').then(result => {
  console.log('开发者工具状态:', result.isOpen ? '已打开' : '已关闭');
});
```

### 主进程中的实现

开发者工具功能已在以下文件中实现：

1. **src/single-window/MainWindow.js**
   - `toggleDeveloperTools()` 方法
   - `_setupKeyboardShortcuts()` 键盘快捷键设置
   - 开发模式自动打开逻辑

2. **src/single-window/ipcHandlers.js**
   - `toggle-dev-tools` IPC 处理器
   - `get-dev-tools-status` IPC 处理器

## 故障排除

### 问题1: 开发者工具无法打开

**解决方案**:
1. 确认使用的是开发模式: `npm run dev`
2. 检查应用是否完全启动
3. 重新启动应用
4. 检查控制台是否有错误信息

### 问题2: 看不到应用日志

**解决方案**:
1. 确认在开发模式下运行应用
2. 打开开发者工具的 Console 面板
3. 刷新应用窗口

### 问题3: 快捷键不工作

**解决方案**:
1. 确保应用窗口处于活动状态
2. 尝试不同的快捷键组合
3. 检查是否有其他软件占用快捷键

### 问题4: 开发者工具显示空白

**解决方案**:
1. 关闭开发者工具并重新打开
2. 刷新开发者工具 (F5)
3. 重启应用

## 最佳实践

### 1. 开发调试
- 使用 `npm run dev` 启动应用
- 开启开发者工具进行实时调试
- 利用 Console 面板查看日志输出

### 2. 性能监控
- 使用 Performance 面板分析应用性能
- 监控 Network 面板中的 API 响应时间
- 检查内存使用情况

### 3. 错误诊断
- 在 Console 面板中查看错误信息
- 使用 Sources 面板调试 JavaScript 代码
- 利用 Application 面板检查数据存储

## 注意事项

1. **安全性**: 开发者工具仅在开发模式下可用，生产构建中会自动禁用
2. **性能**: 开发者工具会消耗额外资源，生产环境中建议关闭
3. **兼容性**: 不同 Electron 版本的开发者工具界面可能略有差异
4. **权限**: 某些开发者工具功能可能需要管理员权限

## 更新日志

### v1.0.0 (2025-11-18)
- 新增 F12 快捷键切换开发者工具
- 新增 Ctrl+Shift+I / Cmd+Opt+I 快捷键支持
- 新增开发模式自动打开开发者工具
- 新增 IPC 接口控制开发者工具
- 新增控制台日志重定向功能

## 技术支持

如果在使用过程中遇到问题，请：

1. 运行测试脚本: `node scripts/test-dev-tools.js`
2. 检查应用日志输出
3. 查看本文档的故障排除部分
4. 提交 Issue 到项目仓库