# 自定义翻译API风格翻译问题排查指南

## 问题概述
自定义翻译API的风格翻译功能没有生效，需要系统排查配置传递和处理流程。

## 已实施的修复

### 1. 修复配置合并问题 (`ipcHandlers.js`)
**问题**：配置合并时，账户配置可能覆盖了传递的 `style` 参数
**修复**：
```javascript
// 修复前
const mergedOptions = {
  ...options,
  accountId,
  ...accountConfig
};

// 修复后
const mergedOptions = {
  accountId,
  ...accountConfig,
  ...options // options应该覆盖账户配置（特别是style）
};
```

### 2. 增加调试日志
在以下位置增加了详细的调试信息：
- `ipcHandlers.js`: 请求参数和合并选项日志
- `AITranslationAdapter.js`: 风格参数和提示词生成日志
- `CustomAPIAdapter.js`: 适配器初始化日志
- `translationService.js`: 引擎注册日志

## 排查步骤

### 第一步：验证配置
1. 打开应用设置页面
2. 检查翻译引擎设置为自定义API
3. 确认翻译风格选项可见且可选
4. 设置一个非"通用"的风格（如"亲切"）

### 第二步：启用调试模式
1. 启动应用
2. 打开开发者工具（F12）
3. 在控制台中加载调试脚本：
   ```javascript
   // 在控制台中运行
   fetch('./debug-translation-style.js').then(r => r.text()).then(eval);
   ```
4. 运行 `checkDOMElements()` 检查DOM元素
5. 运行 `listenTranslationEvents()` 监听事件

### 第三步：测试翻译
1. 在输入框中输入测试文本："Hello, how are you?"
2. 点击翻译按钮
3. 观察控制台输出

### 第四步：分析日志
检查以下关键日志信息：

#### IPC处理器日志
```
[IPC] Translation request received: {
  accountId: "xxx",
  engineName: "custom",
  hasOptions: true,
  optionsStyle: "亲切",  // 应该显示设置的风格
  accountInputBoxStyle: "通用"  // 账户配置中的风格
}
[IPC] Merged options: {
  style: "亲切",  // 应该显示"亲切"而不是"通用"
  inputBox: {...},
  engine: "custom"
}
```

#### AI翻译适配器日志
```
[AITranslation] 收到的 options: {"style":"亲切",...}
[AITranslation] 最终使用风格: 亲切  // 应该显示设置的风格
[AITranslation] API端点: xxx
[AITranslation] 提示词预览（亲切风格）: ...  // 应该包含亲切风格指导
```

#### 自定义API适配器日志
```
[CustomAPIAdapter] 初始化完成 - 名称: Custom API, API端点: xxx, 模型: xxx
[TranslationService] Custom API 配置: {...}
[TranslationService] Registered Custom API
```

## 常见问题及解决方案

### 问题1：风格选项不可见
**原因**：`updateTranslationStyleVisibility` 函数的逻辑问题
**解决**：检查输入框引擎是否为非Google引擎

### 问题2：风格参数未传递
**原因**：配置合并覆盖了style参数
**解决**：已修复配置合并逻辑

### 问题3：API配置问题
**检查项**：
- API端点是否正确
- API密钥是否有效
- 模型名称是否正确

### 问题4：缓存问题
**解决**：清除翻译缓存
```javascript
// 在主进程中运行
translationService.cacheManager.clearTranslationHistory();
```

## 验证修复效果

修复成功后，您应该看到：

1. **设置页面**：翻译风格选项对自定义API可见
2. **控制台日志**：风格参数正确传递和处理
3. **翻译结果**：使用选定风格的翻译效果

## 调试脚本使用

加载调试脚本后，可以使用以下函数：

- `testTranslationStyle()`: 测试翻译风格功能
- `checkDOMElements()`: 检查关键DOM元素
- `listenTranslationEvents()`: 监听翻译事件

## 后续优化建议

1. **配置持久化**：确保风格设置正确保存
2. **错误处理**：增加API调用失败时的处理
3. **性能优化**：避免重复的风格提示词构建
4. **用户体验**：在UI中显示当前使用的翻译风格

如需进一步调试，请提供控制台中的详细日志信息。