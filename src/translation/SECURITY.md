# 安全和隐私保护功能

本文档描述了翻译系统中实现的安全和隐私保护功能。

## 功能概述

### 1. API 密钥加密存储

**实现位置**: `src/translation/utils/SecureStorage.js`

**功能**:
- 使用 Electron `safeStorage` API 加密存储 API 密钥
- 自动检测平台是否支持加密，不支持时降级到明文存储
- 提供加密/解密方法
- API 密钥掩码显示（用于日志和 UI）
- API 密钥格式验证

**使用方法**:
```javascript
const secureStorage = new SecureStorage();

// 加密 API 密钥
const encrypted = secureStorage.encryptApiKey('sk-1234567890abcdef');

// 解密 API 密钥
const decrypted = secureStorage.decryptApiKey(encrypted);

// 掩码显示（用于日志）
const masked = secureStorage.maskApiKey('sk-1234567890abcdef');
// 输出: "sk-1...cdef"
```

**集成**:
- `ConfigManager` 在保存引擎配置时自动加密 API 密钥
- `ConfigManager` 在读取引擎配置时自动解密 API 密钥
- 提供 `getAllEngineConfigsMasked()` 方法用于 UI 显示

### 2. 内容安全过滤

**实现位置**: `src/translation/utils/ContentSecurity.js`

**功能**:
- XSS 过滤：移除危险的 HTML 标签和属性
- HTML 转义：防止注入攻击
- 文本长度限制：最大 10000 字符
- 威胁检测：识别潜在的恶意内容
- 日志消息清理：移除敏感信息

**使用方法**:
```javascript
const contentSecurity = new ContentSecurity();

// 清理用户输入
const cleaned = contentSecurity.cleanTranslationInput(userInput);
if (cleaned.valid) {
  // 使用 cleaned.text
}

// 清理翻译输出（HTML 转义）
const safeOutput = contentSecurity.cleanTranslationOutput(translationResult);

// 检测威胁
const threats = contentSecurity.detectThreats(text);
if (!threats.isSafe) {
  console.warn('Detected threats:', threats.threats);
}
```

**集成**:
- `TranslationManager` 在翻译前自动清理输入
- `TranslationManager` 在翻译后自动清理输出
- 所有日志消息都经过清理，移除敏感信息

### 3. 数据隐私保护

**实现位置**: 
- `src/translation/utils/PrivacyProtection.js`
- `src/translation/managers/CacheManager.js`
- `src/translation/managers/ConfigManager.js`
- `src/translation/managers/TranslationManager.js`

**功能**:

#### 3.1 翻译历史清除
```javascript
// 清除所有翻译缓存，但保留配置
await translationService.clearTranslationHistory();
```

#### 3.2 用户数据清除
```javascript
// 清除用户配置和翻译历史，但保留引擎配置
await translationService.clearAllUserData();
```

#### 3.3 完全数据清除
```javascript
// 清除所有数据，包括 API 密钥
await translationService.clearAllData();
```

#### 3.4 隐私报告
```javascript
// 获取隐私数据统计
const report = translationService.getPrivacyReport();
console.log(report);
// 输出:
// {
//   config: { accountCount, friendConfigCount, engineCount, ... },
//   cache: { totalBytes, totalMB, fileCount, ... },
//   stats: { totalRequests, successCount, ... },
//   dataLocations: { config: '...', cache: '...' }
// }
```

#### 3.5 敏感信息检测和移除
```javascript
const privacyProtection = new PrivacyProtection();

// 检测敏感信息
const detection = privacyProtection.detectSensitiveInfo(text);
if (detection.hasSensitiveInfo) {
  console.warn('Detected:', detection.types);
}

// 移除敏感信息
const cleaned = privacyProtection.removeSensitiveInfo(text);
```

## IPC 接口

以下 IPC 处理器已添加到 `src/translation/ipcHandlers.js`:

### 清除翻译历史
```javascript
const result = await window.electronAPI.invoke('translation:clearHistory');
```

### 清除用户数据
```javascript
const result = await window.electronAPI.invoke('translation:clearUserData');
```

### 清除所有数据
```javascript
const result = await window.electronAPI.invoke('translation:clearAllData');
```

### 获取隐私报告
```javascript
const result = await window.electronAPI.invoke('translation:getPrivacyReport');
console.log(result.data);
```

## 安全特性

### 1. 数据存储
- ✅ 所有数据本地存储，不上传到云端
- ✅ API 密钥使用系统级加密存储
- ✅ 缓存数据定期自动清理（7天过期）
- ✅ 支持用户手动清除所有数据

### 2. 输入验证
- ✅ 文本长度限制（最大 10000 字符）
- ✅ 语言代码格式验证
- ✅ XSS 过滤和 HTML 转义
- ✅ 危险内容检测

### 3. 日志安全
- ✅ 自动移除日志中的 API 密钥
- ✅ 自动移除日志中的邮箱、电话等敏感信息
- ✅ 文本截断（日志中只显示前 50 个字符）
- ✅ 错误消息清理

### 4. 隐私保护
- ✅ 不记录完整的翻译内容到日志
- ✅ 支持完全清除翻译历史
- ✅ 提供隐私数据报告
- ✅ 匿名化错误报告

## 最佳实践

### 用户建议
1. 定期清除翻译历史（建议每月一次）
2. 不使用的 API 密钥应及时删除
3. 启用自动缓存清理
4. 定期导出和备份配置

### 开发者建议
1. 永远不要在日志中记录完整的 API 密钥
2. 使用 `contentSecurity.sanitizeLogMessage()` 清理所有日志消息
3. 使用 `contentSecurity.cleanTranslationInput()` 验证所有用户输入
4. 使用 `contentSecurity.cleanTranslationOutput()` 清理所有输出
5. 定期运行 `privacyProtection.sanitizeLogDirectory()` 清理日志文件

## 合规性

本实现遵循以下隐私和安全标准：

- ✅ **本地优先**: 所有数据存储在本地，不上传到云端
- ✅ **用户控制**: 用户可以随时清除所有数据
- ✅ **数据最小化**: 只存储必要的数据
- ✅ **加密存储**: 敏感信息（API 密钥）加密存储
- ✅ **透明度**: 提供隐私报告，用户可以查看存储的数据
- ✅ **安全传输**: 所有 API 请求使用 HTTPS

## 测试

建议进行以下测试：

1. **加密测试**: 验证 API 密钥加密/解密功能
2. **XSS 测试**: 尝试注入恶意脚本，验证过滤功能
3. **隐私测试**: 验证数据清除功能是否完全删除数据
4. **日志测试**: 检查日志文件，确保没有敏感信息泄露

## 未来改进

- [ ] 添加数据导出功能（GDPR 合规）
- [ ] 实现更细粒度的数据清除选项
- [ ] 添加数据加密备份功能
- [ ] 实现审计日志（记录数据访问和修改）
- [ ] 添加隐私设置 UI 界面
