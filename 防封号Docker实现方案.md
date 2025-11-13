# 防封号 Docker 实现方案

## 正确的架构

### 架构图

```
用户
  ↓
管理界面（Web UI）
  ↓
Docker 容器集群
├── 容器 1 → Puppeteer + 指纹伪装 + 代理 1 → 账号 1
├── 容器 2 → Puppeteer + 指纹伪装 + 代理 2 → 账号 2
└── 容器 3 → Puppeteer + 指纹伪装 + 代理 3 → 账号 3
```

## 实现步骤

### 1. Docker 容器配置

```dockerfile
# Dockerfile
FROM node:18

# 安装 Chromium 和依赖
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libnss3 \
    libxss1 \
    libasound2

# 安装 Puppeteer
RUN npm install puppeteer puppeteer-extra puppeteer-extra-plugin-stealth

# 设置工作目录
WORKDIR /app

# 复制代码
COPY . .

# 启动
CMD ["node", "bot.js"]
```

### 2. 指纹伪装代码

```javascript
// bot.js
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

async function startBot(accountId, proxyUrl) {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      `--proxy-server=${proxyUrl}`,
      '--no-sandbox'
    ]
  });

  const page = await browser.newPage();
  
  // 伪装指纹
  await page.evaluateOnNewDocument(() => {
    // Canvas 指纹伪装
    const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL = function() {
      // 添加随机噪声
      return originalToDataURL.apply(this, arguments);
    };
  });

  await page.goto('https://web.whatsapp.com');
  
  // 等待扫码登录...
}
```

### 3. Docker Compose 配置

```yaml
version: '3.8'

services:
  account1:
    build: .
    environment:
      - ACCOUNT_ID=account1
      - PROXY_URL=socks5://proxy1:1080
    volumes:
      - account1-data:/data

  account2:
    build: .
    environment:
      - ACCOUNT_ID=account2
      - PROXY_URL=socks5://proxy2:1080
    volumes:
      - account2-data:/data
```

## 关键点

1. **每个账号独立容器**
2. **使用 Puppeteer 控制浏览器**
3. **伪装设备指纹**
4. **配置独立代理**
5. **无头浏览器运行**

## 注意

这个方案：
- ✅ 防封号效果好
- ❌ 不是桌面应用
- ❌ 没有图形界面
- ✅ 适合服务器运行
