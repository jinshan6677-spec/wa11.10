# Windows 构建说明

## 成功构建！

你的应用已经成功打包。可执行文件位于：
```
dist\win-unpacked\WhatsApp Desktop Translation.exe
```

## 如何运行

### 方法 1：直接运行（测试）
双击运行：
```
dist\win-unpacked\WhatsApp Desktop Translation.exe
```

### 方法 2：创建安装程序
要创建 NSIS 安装程序，运行：
```bash
npm run build:win
```

这将在 `dist/` 目录创建：
- `WhatsApp Desktop Translation-1.0.0-x64.exe` - 64位安装程序
- `WhatsApp Desktop Translation-1.0.0-ia32.exe` - 32位安装程序
- `WhatsApp Desktop Translation-1.0.0-portable.exe` - 便携版

## 已知问题和解决方案

### 1. better-sqlite3 依赖问题

**问题**：`better-sqlite3` 是一个原生模块，需要 Visual Studio 构建工具来编译。

**解决方案**：已从依赖中移除。应用使用 `lru-cache` 进行内存缓存，功能完全正常。

如果将来需要 SQLite 持久化缓存，有两个选择：

#### 选项 A：安装 Visual Studio 构建工具
```bash
# 安装 Windows 构建工具
npm install --global windows-build-tools

# 或者安装完整的 Visual Studio Community
# 下载地址：https://visualstudio.microsoft.com/
# 确保选择 "Desktop development with C++" 工作负载
```

#### 选项 B：使用预编译的二进制文件
```bash
npm install better-sqlite3 --build-from-source=false
```

### 2. 代码签名警告

**问题**：构建过程中出现符号链接错误（需要管理员权限）。

**影响**：不影响应用功能，只是无法进行代码签名。

**解决方案**：
- 对于测试：忽略此警告，应用可以正常运行
- 对于生产：以管理员身份运行 PowerShell/CMD，或者配置代码签名证书

### 3. 图标缺失警告

**问题**：使用默认 Electron 图标。

**解决方案**：
1. 创建 256x256 的 PNG 图标
2. 转换为 .ico 格式（可使用在线工具或 ImageMagick）
3. 保存到 `resources/icon.ico`
4. 重新构建

## 构建配置说明

### 当前配置
- **应用名称**：WhatsApp Desktop Translation
- **版本**：1.0.0
- **平台**：Windows (x64, ia32)
- **打包格式**：NSIS 安装程序 + 便携版
- **缓存方式**：LRU 内存缓存（不需要 SQLite）

### 文件大小
- 解包应用：约 200-250 MB（包含 Electron 运行时）
- 安装程序：约 150-180 MB（压缩后）

这是 Electron 应用的正常大小。

## 测试清单

在分发之前，请测试以下功能：

- [ ] 应用启动成功
- [ ] WhatsApp Web 正常加载
- [ ] 可以扫码登录
- [ ] 翻译设置界面可以打开
- [ ] 可以配置翻译引擎
- [ ] 消息翻译功能正常
- [ ] 输入框翻译功能正常
- [ ] 配置在重启后保持
- [ ] 没有控制台错误

## 分发

### 测试版本
直接分发 `dist\win-unpacked` 文件夹（压缩为 ZIP）：
- 用户解压后直接运行 .exe 文件
- 无需安装
- 适合内部测试

### 正式版本
运行 `npm run build:win` 创建安装程序：
- NSIS 安装程序提供标准的安装体验
- 创建桌面快捷方式和开始菜单项
- 包含卸载程序
- 适合最终用户

## 下一步

1. **测试应用**：运行并测试所有功能
2. **创建图标**：添加自定义应用图标
3. **构建安装程序**：`npm run build:win`
4. **代码签名**（可选）：获取代码签名证书
5. **分发**：上传到 GitHub Releases 或其他平台

## 故障排除

### 应用无法启动
- 检查是否有杀毒软件阻止
- 查看 Windows 事件查看器中的错误
- 尝试以管理员身份运行

### 翻译功能不工作
- 检查网络连接
- 验证 API 密钥配置
- 查看开发者工具控制台（F12）

### 配置丢失
- 检查 `%APPDATA%\whatsapp-desktop-translation` 目录
- 确保应用有写入权限

## 技术支持

如有问题，请查看：
- BUILD_GUIDE.md - 完整构建指南
- DEPLOYMENT_CHECKLIST.md - 部署检查清单
- GitHub Issues - 报告问题
