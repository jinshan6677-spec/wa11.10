# WhatsApp 翻译功能 - 当前问题

## 问题描述
输入框翻译功能存在以下问题：
1. 翻译按钮被多次触发（点击一次，执行5次翻译）
2. 翻译后的文本没有正确替换输入框内容
3. 结果显示为 "HelloHello你好" 而不是 "Hello"

## 日志分析
```
[Translation] Translating input box text: 你好
[Translation] Translation successful: Hello
[Translation] Text inserted using execCommand
[Translation] Events dispatched
[Translation] Text set to input box

// 重复了5次
```

## 根本原因
1. **防抖机制失效** - `isTranslating` 标志没有正确工作
2. **WhatsApp Lexical 编辑器** - 使用特殊的编辑器，普通的 DOM 操作不生效
3. **事件监听重复** - 可能翻译按钮被多次添加或事件被多次绑定

## 解决方案

### 方案1：使用 Clipboard API（推荐）
```javascript
async setInputBoxText(inputBox, text) {
  // 1. 复制翻译结果到剪贴板
  await navigator.clipboard.writeText(text);
  
  // 2. 清空输入框
  inputBox.focus();
  document.execCommand('selectAll');
  document.execCommand('delete');
  
  // 3. 粘贴
  document.execCommand('paste');
}
```

### 方案2：禁用按钮防止重复点击
```javascript
addTranslateButton(inputBox) {
  // ...
  button.onclick = async () => {
    if (button.disabled) return;
    button.disabled = true;
    button.innerHTML = '⏳';
    
    try {
      await this.translateInputBox(inputBox);
    } finally {
      button.disabled = false;
      button.innerHTML = '🌐';
    }
  };
}
```

### 方案3：移除旧按钮再添加新按钮
```javascript
addTranslateButton(inputBox) {
  // 移除旧按钮
  const oldButton = document.getElementById('wa-translate-btn');
  if (oldButton) {
    oldButton.remove();
  }
  
  // 创建新按钮
  // ...
}
```

## 下一步
1. 实现方案2（最简单）
2. 如果还有问题，实现方案1
3. 添加更详细的日志来追踪问题
