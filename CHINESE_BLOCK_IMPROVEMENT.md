# 禁发中文功能改进方案

## 问题分析

### 原有实现的问题
1. **单层拦截不够** - 只监听 `keydown` 和 `click` 事件
2. **拦截时机可能太晚** - WhatsApp 可能已经处理了事件
3. **没有持续监控** - 用户可能通过其他方式触发发送

## 改进方案：5层防御机制

### 第1层：keydown 事件拦截
- 拦截 Enter 键按下事件
- 使用 capture 阶段，优先级最高
- 检测到中文立即阻止

### 第2层：keypress 事件拦截（备用）
- 作为 keydown 的备份
- 防止某些情况下 keydown 被绕过

### 第3层：mousedown 事件拦截
- 比 click 事件更早触发
- 在鼠标按下时就拦截，而不是等到点击完成

### 第4层：click 事件拦截（双重保险）
- 作为 mousedown 的备份
- 确保点击发送按钮被拦截

### 第5层：持续监控 + 禁用按钮
- 每 100ms 检查一次输入框内容
- 如果检测到中文：
  - 禁用发送按钮（`pointerEvents: none`）
  - 降低按钮透明度（视觉反馈）
  - 添加标记属性
- 如果没有中文：
  - 恢复发送按钮状态

## 技术细节

### 1. 改进的文本获取
```javascript
const getInputText = (inputBox) => {
  if (!inputBox) return '';
  
  // 处理 Lexical 编辑器
  if (inputBox.hasAttribute('data-lexical-editor')) {
    const textNodes = inputBox.querySelectorAll('p, span[data-text="true"]');
    if (textNodes.length > 0) {
      return Array.from(textNodes).map(node => node.textContent).join('\n');
    }
  }
  
  return inputBox.textContent || inputBox.innerText || '';
};
```

### 2. 统一的拦截逻辑
```javascript
const checkAndBlock = (e, source) => {
  const inputBox = getInputBox();
  if (!inputBox) return false;
  
  const text = getInputText(inputBox);
  
  if (this.containsChinese(text)) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    
    this.showChineseBlockAlert();
    console.log(`[Translation] Blocked via ${source}`);
    return true;
  }
  
  return false;
};
```

### 3. 持续监控机制
```javascript
this.chineseBlockInputMonitor = setInterval(() => {
  if (!this.shouldBlockChinese()) return;
  
  const inputBox = getInputBox();
  const text = getInputText(inputBox);
  const hasChinese = this.containsChinese(text);
  
  const sendButton = document.querySelector('[data-testid="send"]');
  
  if (sendButton) {
    if (hasChinese) {
      sendButton.style.pointerEvents = 'none';
      sendButton.style.opacity = '0.5';
      sendButton.setAttribute('data-chinese-blocked', 'true');
    } else {
      if (sendButton.getAttribute('data-chinese-blocked') === 'true') {
        sendButton.style.pointerEvents = '';
        sendButton.style.opacity = '';
        sendButton.removeAttribute('data-chinese-blocked');
      }
    }
  }
}, 100);
```

## 优势

1. **多层防御** - 5层拦截机制，大大降低漏网概率
2. **主动禁用** - 直接禁用发送按钮，从源头阻止
3. **实时反馈** - 按钮透明度变化，用户立即知道不能发送
4. **更早拦截** - mousedown 比 click 更早，keypress 作为备份
5. **持续监控** - 不依赖事件，定期检查状态

## 配置同步

改进后的实现确保在以下时机重新设置拦截：

1. **初始化时** - `init()` 函数中调用 `setupChineseBlock()`
2. **配置更新时** - 保存设置后调用 `setupChineseBlock()`
3. **聊天切换时** - 可以根据联系人配置动态调整

## 测试建议

### 测试场景
1. ✅ 输入中文后按 Enter 键
2. ✅ 输入中文后点击发送按钮
3. ✅ 快速连续点击发送按钮
4. ✅ 使用快捷键发送（Ctrl+Enter）
5. ✅ 切换聊天窗口后发送
6. ✅ 修改配置后立即测试

### 预期结果
- 所有场景都应该被拦截
- 显示提示消息
- 发送按钮在有中文时变灰
- 删除中文后按钮恢复正常

## 性能考虑

- 监控间隔设为 100ms，平衡了响应速度和性能
- 只在启用禁发中文时运行监控
- 使用简单的 DOM 查询，性能开销很小

## 后续优化方向

如果这个方案还不够，可以考虑：

1. **Hook WhatsApp 内部函数** - 需要逆向工程
2. **MutationObserver 监听消息列表** - 检测到新消息立即撤回（不推荐）
3. **改为自动翻译发送** - 不阻止发送，而是自动翻译后发送
