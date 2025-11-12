/**
 * WhatsApp Web 翻译内容脚本
 * 注入到 WhatsApp Web 页面中，实现翻译功能
 */

(function() {
  'use strict';

  console.log('[Translation] Content script initializing...');

  // 翻译系统对象
  const WhatsAppTranslation = {
    config: null,
    messageObserver: null,
    inputObserver: null,
    initialized: false,
    accountId: 'default',

    /**
     * 初始化翻译系统
     */
    async init() {
      if (this.initialized) {
        console.log('[Translation] Already initialized');
        return;
      }

      try {
        // 等待 WhatsApp Web 加载完成
        await this.waitForWhatsApp();
        console.log('[Translation] WhatsApp Web loaded');

        // 加载配置
        await this.loadConfig();
        console.log('[Translation] Config loaded:', this.config);

        // 注入样式
        this.injectStyles();

        // 开始监听消息
        this.observeMessages();

        // 监听输入框
        this.observeInputBox();

        this.initialized = true;
        console.log('[Translation] Initialized successfully');

      } catch (error) {
        console.error('[Translation] Initialization failed:', error);
      }
    },

    /**
     * 等待 WhatsApp Web 加载完成
     */
    waitForWhatsApp() {
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          // 检查聊天容器是否存在
          const chatContainer = document.querySelector('[data-testid="conversation-panel-messages"]') ||
                               document.querySelector('#main') ||
                               document.querySelector('[role="application"]');
          
          if (chatContainer) {
            clearInterval(checkInterval);
            // 额外等待一秒确保完全加载
            setTimeout(resolve, 1000);
          }
        }, 500);

        // 超时保护
        setTimeout(() => {
          clearInterval(checkInterval);
          resolve();
        }, 30000); // 30秒超时
      });
    },

    /**
     * 加载配置
     */
    async loadConfig() {
      try {
        if (window.translationAPI) {
          const response = await window.translationAPI.getConfig(this.accountId);
          if (response.success) {
            this.config = response.data;
          } else {
            console.error('[Translation] Failed to load config:', response.error);
            this.config = this.getDefaultConfig();
          }
        } else {
          console.warn('[Translation] translationAPI not available, using default config');
          this.config = this.getDefaultConfig();
        }
      } catch (error) {
        console.error('[Translation] Error loading config:', error);
        this.config = this.getDefaultConfig();
      }
    },

    /**
     * 获取默认配置
     */
    getDefaultConfig() {
      return {
        global: {
          autoTranslate: false,
          engine: 'google',
          sourceLang: 'auto',
          targetLang: 'zh-CN',
          groupTranslation: false
        },
        inputBox: {
          enabled: false,
          style: '通用'
        },
        advanced: {
          friendIndependent: false,
          blockChinese: false,
          realtime: false,
          reverseTranslation: false,
          voiceTranslation: false,
          imageTranslation: false
        },
        friendConfigs: {}
      };
    },

    /**
     * 监听消息
     */
    observeMessages() {
      // 查找消息容器
      const chatContainer = document.querySelector('[data-testid="conversation-panel-messages"]') ||
                           document.querySelector('#main .copyable-area') ||
                           document.querySelector('[role="application"]');

      if (!chatContainer) {
        console.warn('[Translation] Chat container not found, retrying...');
        setTimeout(() => this.observeMessages(), 2000);
        return;
      }

      console.log('[Translation] Starting message observation');

      // 创建 MutationObserver
      this.messageObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              // 检查是否是消息节点
              if (this.isMessageNode(node)) {
                this.handleNewMessage(node);
              }
              // 也检查子节点
              const messages = node.querySelectorAll('[data-testid="msg-container"]');
              messages.forEach(msg => this.handleNewMessage(msg));
            }
          });
        });
      });

      // 开始观察
      this.messageObserver.observe(chatContainer, {
        childList: true,
        subtree: true
      });

      // 处理已存在的消息
      const existingMessages = chatContainer.querySelectorAll('[data-testid="msg-container"], .message-in, .message-out');
      existingMessages.forEach(msg => {
        if (!msg.querySelector('.wa-translation-result')) {
          this.handleNewMessage(msg);
        }
      });
    },

    /**
     * 检查是否是消息节点
     */
    isMessageNode(node) {
      return node.matches && (
        node.matches('[data-testid="msg-container"]') ||
        node.matches('.message-in') ||
        node.matches('.message-out') ||
        node.querySelector('[data-testid="msg-container"]') ||
        node.querySelector('.message-in') ||
        node.querySelector('.message-out')
      );
    },

    /**
     * 处理新消息
     */
    async handleNewMessage(messageNode) {
      try {
        // 检查是否已经翻译过
        if (messageNode.querySelector('.wa-translation-result')) {
          return;
        }

        // 检查自动翻译是否启用
        if (!this.config.global.autoTranslate) {
          return;
        }

        // 检查是否是群组消息
        if (this.isGroupChat() && !this.config.global.groupTranslation) {
          return;
        }

        // 提取消息文本
        const textElement = messageNode.querySelector('.selectable-text[dir="ltr"], .selectable-text[dir="rtl"]') ||
                           messageNode.querySelector('.selectable-text') ||
                           messageNode.querySelector('[data-testid="conversation-text"]');

        if (!textElement || !textElement.textContent.trim()) {
          return;
        }

        const messageText = textElement.textContent.trim();

        // 翻译消息
        await this.translateMessage(messageNode, messageText);

      } catch (error) {
        console.error('[Translation] Error handling message:', error);
      }
    },

    /**
     * 翻译消息
     */
    async translateMessage(messageNode, text) {
      try {
        if (!window.translationAPI) {
          console.error('[Translation] translationAPI not available');
          return;
        }

        const response = await window.translationAPI.translate({
          text: text,
          sourceLang: this.config.global.sourceLang,
          targetLang: this.config.global.targetLang,
          engineName: this.config.global.engine,
          options: {}
        });

        if (response.success) {
          this.displayTranslation(messageNode, response.data);
        } else {
          console.error('[Translation] Translation failed:', response.error);
          this.displayError(messageNode, response.error);
        }

      } catch (error) {
        console.error('[Translation] Translation error:', error);
        this.displayError(messageNode, error.message);
      }
    },

    /**
     * 显示翻译结果
     */
    displayTranslation(messageNode, result) {
      // 检查是否已经有翻译结果
      const existing = messageNode.querySelector('.wa-translation-result');
      if (existing) {
        existing.remove();
      }

      // 创建翻译结果元素
      const translationDiv = document.createElement('div');
      translationDiv.className = 'wa-translation-result';
      
      const detectedLang = result.detectedLang || 'auto';
      const targetLang = this.config.global.targetLang;
      
      translationDiv.innerHTML = `
        <div class="translation-header">
          <span class="translation-icon">🌐</span>
          <span class="translation-lang">${detectedLang} → ${targetLang}</span>
          ${result.cached ? '<span class="translation-cached">📦</span>' : ''}
        </div>
        <div class="translation-text">${this.escapeHtml(result.translatedText)}</div>
      `;

      // 找到消息内容容器
      const messageContent = messageNode.querySelector('.copyable-text') ||
                            messageNode.querySelector('[data-testid="msg-text"]') ||
                            messageNode;

      // 插入翻译结果
      if (messageContent.parentNode) {
        messageContent.parentNode.appendChild(translationDiv);
      } else {
        messageNode.appendChild(translationDiv);
      }
    },

    /**
     * 显示错误信息
     */
    displayError(messageNode, errorMessage) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'wa-translation-result wa-translation-error';
      errorDiv.innerHTML = `
        <div class="translation-header">
          <span class="translation-icon">⚠️</span>
          <span class="translation-lang">翻译失败</span>
        </div>
        <div class="translation-text">${this.escapeHtml(errorMessage)}</div>
      `;

      const messageContent = messageNode.querySelector('.copyable-text') ||
                            messageNode.querySelector('[data-testid="msg-text"]') ||
                            messageNode;

      if (messageContent.parentNode) {
        messageContent.parentNode.appendChild(errorDiv);
      }
    },

    /**
     * 转义 HTML
     */
    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    },

    /**
     * 检查是否是群组聊天
     */
    isGroupChat() {
      // 检查聊天标题是否包含群组标识
      const header = document.querySelector('[data-testid="conversation-info-header"]');
      if (!header) return false;

      // 检查是否有群组图标或多个参与者
      const groupIcon = header.querySelector('[data-icon="default-group"]') ||
                       header.querySelector('[data-icon="group"]');
      
      return !!groupIcon;
    },

    /**
     * 监听输入框
     */
    observeInputBox() {
      console.log('[Translation] Setting up input box observation');
      
      // 初始化输入框翻译
      this.initInputBoxTranslation();
    },

    /**
     * 初始化输入框翻译
     */
    initInputBoxTranslation() {
      // 查找输入框
      const inputBox = document.querySelector('[data-testid="conversation-compose-box-input"]') ||
                      document.querySelector('[contenteditable="true"][data-tab="10"]') ||
                      document.querySelector('div[contenteditable="true"][role="textbox"]');
      
      if (!inputBox) {
        console.warn('[Translation] Input box not found, retrying...');
        setTimeout(() => this.initInputBoxTranslation(), 2000);
        return;
      }

      // 添加翻译按钮
      if (this.config.inputBox.enabled) {
        this.addTranslateButton(inputBox);
      }

      // 设置实时翻译
      if (this.config.advanced.realtime) {
        this.setupRealtimeTranslation(inputBox);
      }

      // 设置中文拦截
      if (this.config.advanced.blockChinese) {
        this.setupChineseBlock(inputBox);
      }
    },

    /**
     * 添加翻译按钮
     */
    addTranslateButton(inputBox) {
      const footer = document.querySelector('[data-testid="conversation-compose-box"]') ||
                    document.querySelector('footer');
      
      if (!footer) return;

      // 检查按钮是否已存在
      if (document.getElementById('wa-translate-btn')) return;

      const button = document.createElement('button');
      button.id = 'wa-translate-btn';
      button.className = 'wa-translate-btn';
      button.innerHTML = '🌐';
      button.title = '翻译';
      button.type = 'button';
      
      button.onclick = () => this.translateInputBox(inputBox);

      // 添加按钮样式
      button.style.cssText = `
        padding: 8px;
        background: transparent;
        border: none;
        cursor: pointer;
        font-size: 20px;
        border-radius: 50%;
        transition: background 0.2s;
      `;

      button.onmouseenter = () => {
        button.style.background = 'rgba(0, 0, 0, 0.05)';
      };

      button.onmouseleave = () => {
        button.style.background = 'transparent';
      };

      const attachButton = footer.querySelector('[data-testid="clip"]') ||
                          footer.querySelector('[data-icon="clip"]');
      
      if (attachButton && attachButton.parentNode) {
        attachButton.parentNode.insertBefore(button, attachButton.nextSibling);
      } else {
        footer.appendChild(button);
      }

      console.log('[Translation] Translate button added');
    },

    /**
     * 翻译输入框
     */
    async translateInputBox(inputBox) {
      const text = inputBox.textContent || inputBox.innerText;
      
      if (!text || !text.trim()) {
        alert('请输入要翻译的内容');
        return;
      }

      // 检查禁发中文
      if (this.config.advanced.blockChinese && this.containsChinese(text)) {
        alert('检测到中文内容，请先翻译后再发送');
        return;
      }

      try {
        const button = document.getElementById('wa-translate-btn');
        if (button) {
          button.innerHTML = '⏳';
          button.disabled = true;
        }

        const response = await window.translationAPI.translate({
          text: text,
          sourceLang: 'auto',
          targetLang: this.config.global.targetLang,
          engineName: this.config.global.engine,
          options: {
            style: this.config.inputBox.style
          }
        });

        if (response.success) {
          this.setInputBoxText(inputBox, response.data.translatedText);
        } else {
          alert('翻译失败: ' + response.error);
        }

      } catch (error) {
        console.error('[Translation] Input box translation error:', error);
        alert('翻译失败: ' + error.message);
      } finally {
        const button = document.getElementById('wa-translate-btn');
        if (button) {
          button.innerHTML = '🌐';
          button.disabled = false;
        }
      }
    },

    /**
     * 设置输入框文本
     */
    setInputBoxText(inputBox, text) {
      inputBox.textContent = '';
      inputBox.textContent = text;
      
      const inputEvent = new Event('input', { bubbles: true });
      inputBox.dispatchEvent(inputEvent);
      
      inputBox.focus();
      
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(inputBox);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    },

    /**
     * 设置实时翻译
     */
    setupRealtimeTranslation(inputBox) {
      // 简化版实时翻译，暂不实现
      console.log('[Translation] Realtime translation setup (placeholder)');
    },

    /**
     * 设置中文拦截
     */
    setupChineseBlock(inputBox) {
      const sendButton = document.querySelector('[data-testid="send"]') ||
                        document.querySelector('[data-icon="send"]');
      
      if (sendButton) {
        sendButton.addEventListener('click', (e) => {
          const text = inputBox.textContent || inputBox.innerText;
          
          if (this.containsChinese(text)) {
            e.preventDefault();
            e.stopPropagation();
            alert('检测到中文内容，请先翻译后再发送');
            return false;
          }
        }, true);

        console.log('[Translation] Chinese block enabled');
      }
    },

    /**
     * 检测是否包含中文
     */
    containsChinese(text) {
      return /[\u4e00-\u9fa5]/.test(text);
    },

    /**
     * 注入样式
     */
    injectStyles() {
      const style = document.createElement('style');
      style.id = 'wa-translation-styles';
      style.textContent = `
        /* 翻译结果样式 */
        .wa-translation-result {
          margin-top: 8px;
          padding: 8px 12px;
          background: rgba(0, 0, 0, 0.05);
          border-radius: 8px;
          font-size: 14px;
          line-height: 1.5;
          animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .wa-translation-result.wa-translation-error {
          background: rgba(255, 0, 0, 0.1);
          border-left: 3px solid #ff4444;
        }

        .translation-header {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 4px;
          font-size: 12px;
          color: #667781;
          font-weight: 500;
        }

        .translation-icon {
          font-size: 14px;
        }

        .translation-cached {
          margin-left: auto;
          font-size: 12px;
          opacity: 0.7;
        }

        .translation-text {
          color: #111b21;
          word-wrap: break-word;
          white-space: pre-wrap;
        }

        /* 翻译按钮样式 */
        .wa-translate-btn {
          padding: 8px;
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 20px;
          border-radius: 50%;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
        }

        .wa-translate-btn:hover {
          background: rgba(0, 0, 0, 0.05);
          transform: scale(1.1);
        }

        .wa-translate-btn:active {
          transform: scale(0.95);
        }

        .wa-translate-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* 实时翻译预览 */
        .wa-realtime-preview {
          padding: 12px;
          background: rgba(0, 150, 255, 0.1);
          border-left: 3px solid #0096ff;
          margin: 8px 0;
          border-radius: 8px;
          font-size: 14px;
        }

        .wa-realtime-preview .translation-header {
          color: #0096ff;
          margin-bottom: 8px;
        }

        .wa-realtime-preview .translation-loading {
          color: #667781;
          font-style: italic;
        }

        /* 深色模式支持 */
        [data-theme="dark"] .wa-translation-result {
          background: rgba(255, 255, 255, 0.1);
        }

        [data-theme="dark"] .translation-text {
          color: #e9edef;
        }

        [data-theme="dark"] .translation-header {
          color: #8696a0;
        }

        [data-theme="dark"] .wa-translate-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        [data-theme="dark"] .wa-realtime-preview {
          background: rgba(0, 150, 255, 0.15);
        }

        [data-theme="dark"] .wa-translation-result.wa-translation-error {
          background: rgba(255, 68, 68, 0.15);
        }

        /* 响应式设计 */
        @media (max-width: 768px) {
          .wa-translation-result {
            font-size: 13px;
            padding: 6px 10px;
          }

          .translation-header {
            font-size: 11px;
          }

          .wa-translate-btn {
            width: 36px;
            height: 36px;
            font-size: 18px;
          }
        }

        /* 打印样式 */
        @media print {
          .wa-translate-btn {
            display: none;
          }

          .wa-translation-result {
            background: #f5f5f5;
            border: 1px solid #ddd;
          }
        }
      `;

      document.head.appendChild(style);
      console.log('[Translation] Styles injected');
    },

    /**
     * 清理资源
     */
    cleanup() {
      if (this.messageObserver) {
        this.messageObserver.disconnect();
        this.messageObserver = null;
      }

      if (this.inputObserver) {
        this.inputObserver.disconnect();
        this.inputObserver = null;
      }

      const styles = document.getElementById('wa-translation-styles');
      if (styles) {
        styles.remove();
      }

      this.initialized = false;
      console.log('[Translation] Cleaned up');
    }
  };

  // 初始化
  WhatsAppTranslation.init();

  // 暴露到全局（用于调试）
  window.WhatsAppTranslation = WhatsAppTranslation;

})();
