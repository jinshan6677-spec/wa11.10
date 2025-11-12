# 手动测试步骤 - 禁发中文功能

## 前提条件
1. 应用已启动
2. WhatsApp Web 已加载
3. 已打开一个聊天窗口

## 测试步骤

### 步骤 1: 启用功能
1. 点击左下角的设置按钮（⚙️）
2. 滚动到"高级设置"部分
3. 勾选"禁发中文"复选框
4. 点击"保存设置"按钮
5. 等待提示"设置已保存并生效！"

### 步骤 2: 打开开发者工具
1. 按 `F12` 打开开发者工具
2. 切换到 `Console` 标签
3. 查找以下日志：
   ```
   [Translation] setupChineseBlock called, shouldBlock= true
   [Translation] Setting up Chinese blocking with multi-layer defense
   [Translation] Chinese blocking enabled with 5-layer defense
   ```

**如果没有看到这些日志：**
- 功能可能没有启用
- 运行诊断脚本（见下文）

### 步骤 3: 运行诊断脚本
1. 复制 `DEBUG_CHINESE_BLOCK.js` 的内容
2. 粘贴到控制台并按 Enter
3. 查看诊断结果
4. 确认：
   - ✅ blockChinese 已启用
   - ✅ 找到输入框
   - ✅ 监听器已设置

### 步骤 4: 测试输入中文
1. 在输入框输入："你好"
2. 观察控制台日志：
   ```
   [Translation] Monitor: text= 你好 hasChinese= true
   [Translation] Monitor: Send button DISABLED
   ```
3. 观察发送按钮：
   - 应该变灰（透明度 0.5）
   - 鼠标悬停无效果

### 步骤 5: 测试按 Enter 键
1. 输入框中有中文："你好"
2. 按 Enter 键
3. 观察控制台日志：
   ```
   [Translation] Enter key: Checking text: 你好
   [Translation] Enter key: Chinese detected! Blocking...
   [Translation] Blocked Chinese message send via Enter key
   ```
4. 观察页面：
   - 显示黄色提示框："检测到中文内容"
   - 消息未发送

### 步骤 6: 测试点击发送按钮
1. 输入框中有中文："测试"
2. 点击发送按钮
3. 观察控制台日志：
   ```
   [Translation] mousedown on send button: Checking text: 测试
   [Translation] mousedown on send button: Chinese detected! Blocking...
   [Translation] Blocked Chinese message send via mousedown on send button
   ```
4. 观察页面：
   - 显示提示框
   - 消息未发送

### 步骤 7: 测试删除中文
1. 输入框中有中文："你好"
2. 观察发送按钮变灰
3. 删除所有中文
4. 输入英文："hello"
5. 观察控制台日志：
   ```
   [Translation] Monitor: Send button ENABLED
   ```
6. 观察发送按钮：
   - 恢复正常（透明度 1）
   - 可以点击

### 步骤 8: 测试发送英文
1. 输入框中只有英文："hello"
2. 按 Enter 键或点击发送按钮
3. 观察：
   - 消息正常发送
   - 无拦截提示

## 问题排查

### 问题 1: 没有看到初始化日志
**可能原因：**
- 功能未启用
- 页面未刷新

**解决方法：**
1. 运行诊断脚本检查配置
2. 重新启用功能并保存
3. 刷新页面（Ctrl+R）

### 问题 2: 按钮没有变灰
**可能原因：**
- 监控未运行
- 输入框选择器不正确

**解决方法：**
1. 查看控制台是否有 "Monitor:" 日志
2. 运行诊断脚本检查输入框
3. 手动运行：
   ```javascript
   window.WhatsAppTranslation.setupChineseBlock();
   ```

### 问题 3: 还是可以发送中文
**可能原因：**
- 事件监听器未生效
- WhatsApp 使用了其他发送方式

**解决方法：**
1. 查看控制台日志，确认是否触发了拦截
2. 如果没有触发，说明事件未捕获
3. 尝试不同的发送方式（Enter、点击按钮）
4. 查看是否有错误日志

### 问题 4: 第一次拦截，第二次失败
**可能原因：**
- 监听器被移除
- 配置被重置

**解决方法：**
1. 查看控制台是否有 "Chinese blocking disabled" 日志
2. 运行诊断脚本检查监听器状态
3. 重新设置：
   ```javascript
   window.WhatsAppTranslation.setupChineseBlock();
   ```

## 调试命令

在控制台运行这些命令来调试：

```javascript
// 1. 检查配置
window.WhatsAppTranslation.config.advanced.blockChinese

// 2. 检查是否应该拦截
window.WhatsAppTranslation.shouldBlockChinese()

// 3. 手动设置拦截
window.WhatsAppTranslation.setupChineseBlock()

// 4. 测试中文检测
window.WhatsAppTranslation.containsChinese('你好')  // 应该返回 true
window.WhatsAppTranslation.containsChinese('hello') // 应该返回 false

// 5. 查看监听器状态
console.log({
  handler: !!window.WhatsAppTranslation.chineseBlockHandler,
  monitor: !!window.WhatsAppTranslation.chineseBlockInputMonitor
})

// 6. 查看输入框
const inputBox = document.querySelector('footer [contenteditable="true"]');
console.log('Input box:', inputBox);
console.log('Text:', inputBox?.textContent);

// 7. 查看发送按钮
const sendButton = document.querySelector('[data-testid="send"]');
console.log('Send button:', sendButton);
console.log('Style:', {
  pointerEvents: sendButton?.style.pointerEvents,
  opacity: sendButton?.style.opacity
});
```

## 预期结果总结

| 操作 | 预期结果 |
|------|---------|
| 输入中文 | 按钮变灰，控制台显示 "Monitor: Send button DISABLED" |
| 删除中文 | 按钮恢复，控制台显示 "Monitor: Send button ENABLED" |
| 按 Enter（有中文） | 拦截，显示提示，控制台显示 "Blocked via Enter key" |
| 点击发送（有中文） | 拦截，显示提示，控制台显示 "Blocked via mousedown" |
| 发送英文 | 正常发送，无拦截 |

## 成功标准

- ✅ 所有包含中文的发送尝试都被拦截
- ✅ 控制台显示详细的拦截日志
- ✅ 发送按钮实时反馈（变灰/恢复）
- ✅ 显示用户友好的提示信息
- ✅ 不影响英文/其他语言的发送
