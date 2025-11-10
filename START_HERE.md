# 🚀 开始使用 WhatsApp Desktop Container

## 第一步：安装依赖

选择你的操作系统：

### Windows
```cmd
scripts\install.bat
```

### Linux/macOS
```bash
chmod +x scripts/install.sh
./scripts/install.sh
```

### 手动安装
```bash
npm install
```

---

## 第二步：启动应用

```bash
npm start
```

---

## 第三步：登录 WhatsApp

1. 应用启动后会打开一个窗口
2. 窗口中会显示 WhatsApp Web（web.whatsapp.com）
3. 在手机上打开 WhatsApp
4. 点击 **设置** > **已连接的设备** > **连接设备**
5. 扫描电脑屏幕上的二维码
6. ✅ 完成！会话会自动保存

---

## 下次使用

重启应用后会自动登录，无需重新扫码！

```bash
npm start
```

---

## 🐳 使用 Docker（可选）

### 构建并启动
```bash
npm run docker:build
npm run docker:run
```

### 查看日志
```bash
npm run docker:logs
```

### 停止容器
```bash
npm run docker:stop
```

---

## 📦 打包应用（可选）

生成可安装的应用程序：

```bash
npm run build
```

安装包会在 `dist/` 目录中。

---

## 🎯 就这么简单！

你现在有了一个完整的 WhatsApp 桌面应用：

✅ 完整的 WhatsApp Web 功能  
✅ 会话自动保存  
✅ 支持容器化部署  
✅ 可以打包分发  

---

## 📚 更多信息

- **使用指南**: 查看 `USAGE.md`
- **项目说明**: 查看 `README.md`
- **项目状态**: 查看 `PROJECT_STATUS.md`

---

## ❓ 遇到问题？

### 常见问题

**Q: 应用无法启动**  
A: 确保 Node.js 版本 >= 18，运行 `npm install`

**Q: 如何重新登录？**  
A: 删除 `session-data/` 目录，或在手机端断开连接

**Q: 容器无法启动**  
A: 确保 Docker 正在运行，查看日志 `docker-compose logs`

---

## 🎉 享受使用！

现在你可以在桌面上使用 WhatsApp 了！

有任何问题或建议，欢迎提交 Issue。
