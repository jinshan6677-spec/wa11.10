# 故障排除指南

## 问题：看不到翻译功能

### 步骤 1: 检查开发者工具

1. 在 WhatsApp 窗口中按 `F12` 或 `Ctrl+Shift+I` 打开开发者工具
2. 切换到 **Console（控制台）** 标签
3. 查找以下日志：

```
[Preload] Translation API exposed
[Translation] Content script initializing...
[Translation] WhatsApp Web loaded
[Translation] Config loaded
[Translation] Styles injected
[Translation] Initialized successfully
```

### 步骤 2: 运行调试脚本

在控制台中复制粘贴 `debug-translation.js` 的内容并运行，或者直接运行：

```javascript
// 快速检查
console.log('translationAPI:', typeof window.translationAPI);
console.log('WhatsAppTranslation:', typeof window.WhatsAppTranslation);
```

**预期结果**:
- `translationAPI: object`
- `WhatsAppTranslation: object`

**如果显示 `undefined`**，说明脚本没有正确加载。

### 步骤 3: 手动测试翻译

在控制台中运行：

```javascript
// 测试翻译 API
await window.translationAPI.translate({
  text: 'Hello',
  sourceLang: 'en',
  targetLang: 'zh-CN',
  engineName: 'google'
})
```

**预期结果**:
```javascript
{
  success: true,
  data: {
    translatedText: "你好",
    detectedLang: "en",
    engineUsed: "Google Translate",
    cached: false
  }
}
```

### 步骤 4: 启用自动翻译

#### 方法 A: 使用控制台

```javascript
// 1. 获取配置
const configResult = await window.translationAPI.getConfig('default');
console.log('当前配置:', configResult);

// 2. 启用自动翻译
const config = configResult.data;
config.global.autoTranslate = true;
config.global.groupTranslation = true;
config.inputBox.enabled = true;

// 3. 保存配置
await window.translationAPI.saveConfig('default', config);
console.log('✅ 配置已保存');

// 4. 刷新页面
location.reload();
```

#### 方法 B: 手动复制配置文件

1. 找到用户数据目录：
   - **Windows**: `%APPDATA%\whatsapp-desktop-container\`
   - **macOS**: `~/Library/Application Support/whatsapp-desktop-container/`
   - **Linux**: `~/.config/whatsapp-desktop-container/`

2. 将 `enable-translation-config.json` 复制到该目录，重命名为 `translation-config.json`

3. 重启应用

### 步骤 5: 检查翻译按钮

1. 打开任意聊天
2. 查看输入框右侧是否有 🌐 按钮
3. 如果没有，在控制台运行：

```javascript
// 检查输入框
const inputBox = document.querySelector('[data-testid="conversation-compose-box-input"]');
console.log('输入框:', inputBox);

// 检查翻译按钮
const translateBtn = document.getElementById('wa-translate-btn');
console.log('翻译按钮:', translateBtn);
```

### 步骤 6: 手动注入翻译脚本

如果自动注入失败，可以手动注入：

1. 复制 `test-injection.js` 的内容
2. 在控制台中粘贴并运行
3. 应该会看到一个绿色的测试成功提示框

### 步骤 7: 检查网络连接

翻译功能需要网络连接。测试：

```javascript
// 测试网络
fetch('https://translate.googleapis.com')
  .then(() => console.log('✅ 网络正常'))
  .catch(err => console.log('❌ 网络错误:', err));
```

## 常见错误及解决方案

### 错误 1: `translationAPI is not defined`

**原因**: 预加载脚本未加载

**解决方案**:
1. 检查 `src/preload.js` 文件是否存在
2. 检查 `src/config.js` 中的 preload 路径
3. 重启应用

### 错误 2: `Cannot read property 'translate' of undefined`

**原因**: IPC 通信未建立

**解决方案**:
1. 检查主进程日志
2. 确认看到 "IPC 处理器注册完成"
3. 重启应用

### 错误 3: 翻译失败 "Network error"

**原因**: 网络连接问题或 API 不可用

**解决方案**:
1. 检查网络连接
2. 尝试使用 VPN
3. 检查防火墙设置

### 错误 4: 翻译按钮不显示

**原因**: WhatsApp Web 界面变化或脚本注入时机问题

**解决方案**:
1. 刷新页面（Ctrl+R）
2. 等待 WhatsApp Web 完全加载
3. 手动运行初始化：

```javascript
if (window.WhatsAppTranslation) {
  window.WhatsAppTranslation.init();
}
```

### 错误 5: 配置不生效

**原因**: 配置未正确保存或未刷新

**解决方案**:
1. 保存配置后刷新页面
2. 检查配置文件是否正确
3. 清除缓存后重试

## 完整测试流程

### 1. 基础测试

```javascript
// 在控制台运行
console.log('=== 翻译功能测试 ===');

// 测试 1: API 可用性
console.log('1. API 可用性:', typeof window.translationAPI);

// 测试 2: 翻译功能
const testTranslation = async () => {
  try {
    const result = await window.translationAPI.translate({
      text: 'Hello World',
      sourceLang: 'en',
      targetLang: 'zh-CN',
      engineName: 'google'
    });
    console.log('2. 翻译测试:', result.success ? '✅ 成功' : '❌ 失败');
    console.log('   译文:', result.data?.translatedText);
  } catch (error) {
    console.log('2. 翻译测试: ❌ 错误', error.message);
  }
};

testTranslation();

// 测试 3: 配置
window.translationAPI.getConfig('default').then(result => {
  console.log('3. 配置状态:', result.success ? '✅ 正常' : '❌ 异常');
  console.log('   自动翻译:', result.data?.global?.autoTranslate);
});

console.log('=== 测试完成 ===');
```

### 2. 启用并测试自动翻译

```javascript
// 启用自动翻译
const enableAutoTranslate = async () => {
  const configResult = await window.translationAPI.getConfig('default');
  const config = configResult.data;
  
  config.global.autoTranslate = true;
  config.global.groupTranslation = true;
  config.inputBox.enabled = true;
  
  await window.translationAPI.saveConfig('default', config);
  
  console.log('✅ 自动翻译已启用');
  console.log('⚠️ 请刷新页面使配置生效');
  
  // 3秒后自动刷新
  setTimeout(() => {
    console.log('🔄 正在刷新...');
    location.reload();
  }, 3000);
};

enableAutoTranslate();
```

### 3. 手动测试消息翻译

```javascript
// 手动翻译一条消息
const testMessageTranslation = async () => {
  const testText = 'Hello, how are you today?';
  
  console.log('原文:', testText);
  
  const result = await window.translationAPI.translate({
    text: testText,
    sourceLang: 'en',
    targetLang: 'zh-CN',
    engineName: 'google'
  });
  
  if (result.success) {
    console.log('译文:', result.data.translatedText);
    console.log('引擎:', result.data.engineUsed);
    console.log('缓存:', result.data.cached ? '是' : '否');
    
    // 在页面上显示
    alert(`翻译成功！\n\n原文: ${testText}\n译文: ${result.data.translatedText}`);
  } else {
    console.error('翻译失败:', result.error);
  }
};

testMessageTranslation();
```

## 获取帮助

如果以上步骤都无法解决问题，请提供以下信息：

1. 操作系统版本
2. Electron 版本（在控制台运行 `process.versions`）
3. 控制台错误信息（截图）
4. 主进程日志（终端输出）
5. 配置文件内容

## 快速修复命令

```javascript
// 一键诊断和修复
(async function quickFix() {
  console.log('🔧 开始快速诊断...\n');
  
  // 1. 检查 API
  if (!window.translationAPI) {
    console.error('❌ translationAPI 未加载');
    console.log('💡 解决方案: 重启应用');
    return;
  }
  console.log('✅ translationAPI 已加载\n');
  
  // 2. 测试翻译
  try {
    const result = await window.translationAPI.translate({
      text: 'test',
      sourceLang: 'en',
      targetLang: 'zh-CN',
      engineName: 'google'
    });
    console.log('✅ 翻译功能正常\n');
  } catch (error) {
    console.error('❌ 翻译功能异常:', error.message);
    console.log('💡 解决方案: 检查网络连接\n');
    return;
  }
  
  // 3. 检查配置
  const configResult = await window.translationAPI.getConfig('default');
  const config = configResult.data;
  
  console.log('📋 当前配置:');
  console.log('   自动翻译:', config.global.autoTranslate);
  console.log('   输入框翻译:', config.inputBox.enabled);
  console.log('   翻译引擎:', config.global.engine);
  console.log('   目标语言:', config.global.targetLang);
  console.log('');
  
  // 4. 自动修复配置
  if (!config.global.autoTranslate || !config.inputBox.enabled) {
    console.log('🔧 正在启用翻译功能...');
    config.global.autoTranslate = true;
    config.inputBox.enabled = true;
    await window.translationAPI.saveConfig('default', config);
    console.log('✅ 配置已更新');
    console.log('⚠️ 3秒后将自动刷新页面...\n');
    setTimeout(() => location.reload(), 3000);
  } else {
    console.log('✅ 配置正常');
    console.log('💡 如果仍看不到翻译，请刷新页面（Ctrl+R）');
  }
})();
```

复制上面的代码到控制台运行，它会自动诊断并尝试修复问题。
