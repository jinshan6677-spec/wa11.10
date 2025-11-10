FROM node:18-slim

# 安装 Chromium 和必要的依赖
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libatspi2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libwayland-client0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# 设置 Puppeteer 使用系统 Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# 创建应用目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装生产依赖
RUN npm ci --production

# 复制应用代码
COPY src/ ./src/

# 创建会话数据目录
RUN mkdir -p /data/session

# 设置环境变量
ENV SESSION_PATH=/data/session \
    NODE_ENV=production

# 创建非 root 用户
RUN useradd -m -u 1000 whatsapp && \
    chown -R whatsapp:whatsapp /app /data

# 切换到非 root 用户
USER whatsapp

# 启动应用
CMD ["npm", "start"]
