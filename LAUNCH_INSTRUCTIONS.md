# 🚀 启动说明

## ✅ 依赖已安装完成

所有必要的依赖已经成功安装：
- whatsapp-web.js v1.34.2
- electron v27.3.11
- 其他依赖包（共 373 个）

---

## 🎯 现在可以启动应用了！

### 方法 1：直接启动（推荐）

在终端中运行：

```bash
npm start
```

### 方法 2：开发模式（带调试工具）

```bash
npm run dev
```

---

## 📱 首次使用流程

1. **启动应用**
   ```bash
   npm start
   ```

2. **等待窗口打开**
   - Electron 窗口会自动打开
   - 窗口中会加载 WhatsApp Web (web.whatsapp.com)

3. **扫描二维码**
   - 在手机上打开 WhatsApp
   - 点击 **设置** > **已连接的设备** > **连接设备**
   - 扫描电脑屏幕上的二维码

4. **完成！**
   - 登录成功后，会话会自动保存到 `session-data/` 目录
   - 下次启动时会自动登录，无需重新扫码

---

## 🔍 启动时会看到什么

### 控制台输出示例：

```
[2024-XX-XX] [INFO] ========================================
[2024-XX-XX] [INFO] WhatsApp Desktop Container
[2024-XX-XX] [INFO] 版本: 1.0.0
[2024-XX-XX] [INFO] Node.js: v18.x.x
[2024-XX-XX] [INFO] Electron: 27.3.11
[2024-XX-XX] [INFO] Chromium: xxx
[2024-XX-XX] [INFO] 平台: win32
[2024-XX-XX] [INFO] 环境: development
[2024-XX-XX] [INFO] 会话路径: ./session-data
[2024-XX-XX] [INFO] ========================================
[2024-XX-XX] [INFO] Electron 应用已就绪
[2024-XX-XX] [INFO] 创建 Electron 窗口...
[2024-XX-XX] [INFO] 加载 WhatsApp Web...
[2024-XX-XX] [INFO] Electron 窗口创建完成
[2024-XX-XX] [INFO] 初始化 WhatsApp 客户端...
[2024-XX-XX] [INFO] WhatsApp 客户端初始化完成
[2024-XX-XX] [INFO] QR 码已生成，请使用手机扫描登录
[2024-XX-XX] [INFO] 认证成功
[2024-XX-XX] [INFO] WhatsApp 客户端已就绪，可以正常使用
```

### Electron 窗口：

- 窗口标题：**WhatsApp Desktop**
- 窗口大小：1200x800
- 内容：完整的 WhatsApp Web 界面
- 首次启动会显示二维码

---

## ⚠️ 注意事项

### 1. 首次启动较慢
- whatsapp-web.js 需要下载 Chromium（如果还没有）
- 首次初始化需要 30-60 秒
- 请耐心等待

### 2. 防火墙提示
- Windows 可能会提示防火墙警告
- 请允许 Electron 访问网络

### 3. 会话数据
- 登录后会在项目目录创建 `session-data/` 文件夹
- 这个文件夹包含你的登录凭证
- **不要删除**，否则需要重新扫码

---

## 🛑 停止应用

在终端中按 `Ctrl + C` 或直接关闭窗口。

应用会自动清理资源并保存会话。

---

## 🐛 遇到问题？

### 问题 1：窗口打开但是空白

**原因**：网络连接问题或 WhatsApp Web 加载失败

**解决**：
1. 检查网络连接
2. 重启应用
3. 查看控制台错误信息

### 问题 2：二维码不显示

**原因**：这是正常的！二维码会显示在 Electron 窗口中（就像在浏览器中一样）

**解决**：等待 WhatsApp Web 完全加载

### 问题 3：应用崩溃

**原因**：可能是 Chromium 依赖问题

**解决**：
1. 查看控制台错误信息
2. 删除 `node_modules/` 重新安装
3. 确保 Node.js 版本 >= 18

### 问题 4：认证失败

**原因**：会话数据损坏

**解决**：
```bash
# 删除会话数据
rm -rf session-data/
# 或 Windows:
rmdir /s /q session-data
```

然后重新启动应用并扫码。

---

## 📊 系统要求

- ✅ Node.js 18 或更高版本
- ✅ Windows 10/11, macOS 10.13+, 或 Linux
- ✅ 至少 2GB 可用内存
- ✅ 至少 1GB 可用磁盘空间
- ✅ 稳定的网络连接

---

## 🎉 准备就绪！

现在在终端中运行：

```bash
npm start
```

享受使用 WhatsApp Desktop！🚀

---

## 📚 更多帮助

- **使用指南**: `USAGE.md`
- **项目说明**: `README.md`
- **快速开始**: `START_HERE.md`
- **项目状态**: `PROJECT_STATUS.md`
