# 实时翻译预览修复说明

## 问题描述
优化后，实时翻译预览功能不显示了。

## 根本原因
在优化过程中，添加了过于严格的初始化检查：
```javascript
// 如果已经初始化过，直接返回
if (this._realtimeInitialized && this.realtimeInputHandler) {
  return;
}
```

这导致在某些情况下，即使需要重新绑定监听器，也会被跳过。

## 修复方案

### 1. 移除过于严格的检查
不再检查 `this._realtimeInitialized`，因为：
- 每次调用 `setupRealtimeTranslation` 时，`inputBox` 可能是新的 DOM 元素
- 需要重新绑定监听器到新的元素上
- `cleanupRealtimeTranslation` 已经会清理旧的监听器

### 2. 优化清理逻辑
在 `cleanupRealtimeTranslation` 中：
- 只在真正禁用实时翻译时才移除预览元素
- 如果只是重新初始化，保留预览元素，避免闪烁

### 3. 添加调试日志
添加更详细的日志，帮助诊断问题：
```javascript
console.log('[Translation] setupRealtimeTranslation called, realtime enabled:', this.config.advanced.realtime);
console.log('[Translation] Realtime translation enabled, handler attached to inputBox');
```

## 测试步骤

### 1. 检查配置
打开浏览器控制台，确认实时翻译已启用：
```javascript
WhatsAppTranslation.config.advanced.realtime
// 应该返回 true
```

### 2. 测试输入
1. 打开一个聊天窗口
2. 在输入框中输入文字（例如："你好"）
3. 等待 500ms
4. 应该看到输入框上方出现实时翻译预览

### 3. 检查日志
在控制台中应该看到：
```
[Translation] setupRealtimeTranslation called, realtime enabled: true
[Translation] Setting up realtime translation
[Translation] Realtime preview element created
[Translation] Realtime translation enabled, handler attached to inputBox
```

当你输入文字时，应该看到：
```
[Translation] Realtime translation for contact: xxx
[Translation] Using contact config for realtime: {...}
[Translation] Realtime target language: en
```

### 4. 测试切换聊天
1. 切换到另一个聊天
2. 在新聊天的输入框中输入文字
3. 实时翻译预览应该正常显示

## 预期行为

### 正常情况
- 输入文字后 500ms，显示翻译预览
- 预览显示在输入框上方
- 预览有蓝色边框和闪电图标 ⚡
- 清空输入框时，预览自动隐藏

### 异常情况排查

#### 预览不显示
1. 检查配置：`WhatsAppTranslation.config.advanced.realtime` 是否为 `true`
2. 检查控制台是否有错误
3. 检查是否有 `.wa-realtime-preview` 元素：
   ```javascript
   document.querySelector('.wa-realtime-preview')
   ```

#### 预览显示但不更新
1. 检查监听器是否绑定：
   ```javascript
   WhatsAppTranslation.realtimeInputHandler
   // 应该是一个函数
   ```
2. 检查输入框元素：
   ```javascript
   document.querySelector('#main footer [contenteditable="true"]')
   ```

#### 翻译失败
1. 检查翻译 API 是否可用：
   ```javascript
   window.translationAPI
   ```
2. 检查网络连接
3. 查看控制台错误信息

## 技术细节

### 监听器绑定流程
1. `initInputBoxTranslation()` 被调用
2. 找到 `inputBox` 元素
3. 调用 `setupRealtimeTranslation(inputBox)`
4. 清理旧的监听器（如果有）
5. 创建新的 `realtimeInputHandler`
6. 绑定到 `inputBox` 的 `input` 事件
7. 创建预览元素（如果不存在）

### 防抖机制
- 用户输入后，等待 500ms 才发起翻译请求
- 如果在 500ms 内继续输入，重置计时器
- 避免频繁调用翻译 API

### 预览元素管理
- 预览元素只创建一次（`createRealtimePreview` 有检查）
- 切换聊天时不删除预览元素，只是隐藏
- 只在禁用实时翻译时才删除预览元素

## 相关代码位置

- `setupRealtimeTranslation()`: 第 1688-1824 行
- `cleanupRealtimeTranslation()`: 第 1826-1853 行
- `createRealtimePreview()`: 第 1855-1891 行
- `showRealtimePreview()`: 第 1893-1914 行
- `hideRealtimePreview()`: 第 1916-1927 行

## 总结

修复后的逻辑更加简洁和可靠：
- ✅ 每次都清理旧的监听器，避免泄漏
- ✅ 每次都重新绑定到新的 inputBox 元素
- ✅ 保留预览元素，避免闪烁
- ✅ 添加详细日志，便于调试

实时翻译预览功能应该恢复正常工作了。
