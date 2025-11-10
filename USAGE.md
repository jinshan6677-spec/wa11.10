# 使用指南

## 快速开始

### 1. 安装依赖

**Linux/macOS:**
```bash
chmod +x scripts/install.sh
./scripts/install.sh
```

**Windows:**
```cmd
scripts\install.bat
```

**或者手动安装:**
```bash
npm install
```

### 2. 启动应用

```bash
npm start
```

### 3. 首次登录

1. 应用启动后会打开一个窗口，显示 WhatsApp Web
2. 在手机上打开 WhatsApp
3. 点击"设置" > "已连接的设备" > "连接设备"
4. 扫描电脑屏幕上的二维码
5. 登录成功后，会话会自动保存

### 4. 后续使用

重启应用后无需重新扫码，会自动登录。

## 开发模式

启动开发模式（带开发者工具）：

```bash
npm run dev
```

## Docker 部署

### 构建镜像

```bash
npm run docker:build
```

或者：

```bash
cd docker
docker build -t whatsapp-desktop ..
```

### 启动容器

```bash
npm run docker:run
```

或者：

```bash
cd docker
docker-compose up -d
```

### 查看日志

```bash
npm run docker:logs
```

或者：

```bash
docker-compose logs -f whatsapp-desktop
```

### 停止容器

```bash
npm run docker:stop
```

或者：

```bash
docker-compose down
```

### 清理会话数据（重新登录）

```bash
docker-compose down
docker volume rm docker_whatsapp-session
docker-compose up -d
```

## 应用打包

生成可分发的安装包：

```bash
npm run build
```

打包后的文件在 `dist/` 目录：
- Windows: `.exe` 安装程序
- macOS: `.dmg` 磁盘镜像
- Linux: `.AppImage` 可执行文件

## 常见问题

### Q: 如何重新登录？

**方法 1 - 删除会话数据:**
```bash
rm -rf session-data/
```

**方法 2 - 在 WhatsApp 手机端:**
1. 打开 WhatsApp
2. 设置 > 已连接的设备
3. 找到 "WhatsApp Desktop" 并断开连接

### Q: 应用无法启动

检查以下几点：
1. Node.js 版本是否 >= 18
2. 是否正确安装了依赖 (`npm install`)
3. 查看控制台错误信息

### Q: 容器无法启动

检查：
1. Docker 是否正在运行
2. 是否有足够的磁盘空间
3. 查看容器日志: `docker-compose logs`

### Q: 二维码不显示

这是正常的！因为我们直接加载 web.whatsapp.com，二维码会显示在 Electron 窗口中，就像在浏览器中一样。

### Q: 如何添加自定义功能？

编辑 `src/main.js` 中的 `message` 事件监听器：

```javascript
client.on('message', async (msg) => {
  // 你的自定义逻辑
  if (msg.body === '你好') {
    await msg.reply('你好！我是机器人');
  }
});
```

### Q: 如何运行多个账号？

使用 Docker Compose 创建多个服务：

```yaml
services:
  whatsapp-account-1:
    build: .
    volumes:
      - session-1:/data/session
    
  whatsapp-account-2:
    build: .
    volumes:
      - session-2:/data/session

volumes:
  session-1:
  session-2:
```

## 环境变量

可以通过环境变量自定义配置：

```bash
# 会话数据路径
export SESSION_PATH=/custom/path

# 日志级别 (debug, info, warn, error)
export LOG_LEVEL=debug

# 运行环境
export NODE_ENV=production

# 启动应用
npm start
```

## 日志位置

- **本地运行**: 控制台输出
- **Docker 容器**: `docker-compose logs -f`
- **打包后**: 应用数据目录

## 性能优化

### 减少内存占用

编辑 `src/config.js`，添加更多 Puppeteer 参数：

```javascript
puppeteerArgs: [
  '--disable-extensions',
  '--disable-plugins',
  '--disable-images', // 禁用图片加载
  // ...
]
```

### 加快启动速度

使用已有的会话数据，避免重新认证。

## 安全建议

1. **不要分享会话数据**: `session-data/` 目录包含你的登录凭证
2. **定期更新**: 保持 whatsapp-web.js 和 Electron 为最新版本
3. **使用强密码**: 保护你的 WhatsApp 账号
4. **备份会话**: 定期备份 `session-data/` 目录

## 更多帮助

- [whatsapp-web.js 文档](https://wwebjs.dev/)
- [Electron 文档](https://www.electronjs.org/docs)
- [Docker 文档](https://docs.docker.com/)

## 贡献

欢迎提交 Issue 和 Pull Request！
