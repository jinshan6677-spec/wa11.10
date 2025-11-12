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
    isTranslating: false, // 防止重复翻译

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

        // 监听聊天窗口切换
        this.observeChatSwitch();

        // 启动定期检查新消息
        this.startPeriodicCheck();

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
          style: '通用',
          targetLang: 'auto'
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
      // 查找主容器（#main 会在切换聊天时保持不变）
      const mainContainer = document.querySelector('#main');

      if (!mainContainer) {
        console.warn('[Translation] Main container not found, retrying...');
        setTimeout(() => this.observeMessages(), 2000);
        return;
      }

      console.log('[Translation] Starting message observation');

      // 断开旧的观察器
      if (this.messageObserver) {
        this.messageObserver.disconnect();
      }

      // 创建 MutationObserver - 观察整个 #main 容器
      this.messageObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              // 检查节点本身是否是消息
              if (node.classList && (node.classList.contains('message-in') || node.classList.contains('message-out'))) {
                console.log('[Translation] New message detected:', node);
                if (!node.querySelector('.wa-translation-result')) {
                  this.handleNewMessage(node);
                }
              }
              
              // 检查是否包含消息节点
              if (this.isMessageNode(node)) {
                this.handleNewMessage(node);
              }
              
              // 也检查子节点中的消息
              const messages = node.querySelectorAll('.message-in, .message-out');
              if (messages.length > 0) {
                console.log(`[Translation] Found ${messages.length} messages in added node`);
                messages.forEach(msg => {
                  if (!msg.querySelector('.wa-translation-result')) {
                    this.handleNewMessage(msg);
                  }
                });
              }
            }
          });
        });
      });

      // 开始观察整个 #main 容器
      this.messageObserver.observe(mainContainer, {
        childList: true,
        subtree: true
      });

      // 处理当前聊天窗口中已存在的消息
      this.translateExistingMessages();
    },

    /**
     * 翻译已存在的消息
     */
    translateExistingMessages() {
      const existingMessages = document.querySelectorAll('.message-in, .message-out');
      console.log(`[Translation] Found ${existingMessages.length} existing messages`);
      
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
        // 检查配置是否加载
        if (!this.config || !this.config.global) {
          console.log('[Translation] Config not loaded yet, skipping');
          return;
        }

        // 检查是否已经翻译过
        if (messageNode.querySelector('.wa-translation-result')) {
          console.log('[Translation] Message already translated, skipping');
          return;
        }

        // 检查自动翻译是否启用
        if (!this.config.global.autoTranslate) {
          console.log('[Translation] Auto translate disabled, skipping');
          return;
        }

        // 检查是否是群组消息
        if (this.isGroupChat() && !this.config.global.groupTranslation) {
          console.log('[Translation] Group translation disabled, skipping');
          return;
        }

        // 提取消息文本
        const textElement = messageNode.querySelector('.selectable-text[dir="ltr"], .selectable-text[dir="rtl"]') ||
                           messageNode.querySelector('.selectable-text') ||
                           messageNode.querySelector('[data-testid="conversation-text"]');

        if (!textElement || !textElement.textContent.trim()) {
          console.log('[Translation] No text found in message, skipping');
          return;
        }

        const messageText = textElement.textContent.trim();
        
        // 聊天窗口翻译始终使用全局配置的目标语言（通常是中文）
        // 不受好友独立配置影响
        const targetLang = this.config.global.targetLang || 'zh-CN';
        console.log('[Translation] Target language for incoming message:', targetLang);
        
        // 只有当目标语言是中文时，才跳过中文消息
        if (targetLang.startsWith('zh') && this.isChinese(messageText)) {
          console.log('[Translation] Message is already in Chinese and target is Chinese, skipping');
          return;
        }
        
        console.log('[Translation] Translating message:', messageText.substring(0, 50) + '...');

        // 翻译消息
        await this.translateMessage(messageNode, messageText);

      } catch (error) {
        console.error('[Translation] Error handling message:', error);
      }
    },

    /**
     * 获取当前聊天的联系人 ID
     */
    getCurrentContactId() {
      try {
        // 方法1: 从 URL 获取联系人 ID
        const urlMatch = window.location.href.match(/\/chat\/([^/]+)/);
        if (urlMatch && urlMatch[1]) {
          const contactId = decodeURIComponent(urlMatch[1]);
          console.log('[Translation] Contact ID from URL:', contactId);
          return contactId;
        }
        
        // 方法2: 从聊天标题获取
        const header = document.querySelector('#main header [data-testid="conversation-info-header"]') ||
                      document.querySelector('#main header span[dir="auto"]') ||
                      document.querySelector('header[data-testid="chatlist-header"] + div span[dir="auto"]');
        
        if (header) {
          const contactName = header.textContent.trim();
          if (contactName) {
            console.log('[Translation] Contact ID from header:', contactName);
            return contactName;
          }
        }
        
        console.warn('[Translation] Could not determine contact ID');
        return null;
      } catch (error) {
        console.error('[Translation] Error getting contact ID:', error);
        return null;
      }
    },

    /**
     * 获取联系人的翻译配置（优先使用独立配置）
     */
    getContactConfig(contactId) {
      console.log('[Translation] getContactConfig called with contactId:', contactId);
      console.log('[Translation] friendIndependent enabled:', this.config.advanced.friendIndependent);
      console.log('[Translation] friendConfigs:', this.config.friendConfigs);
      
      // 如果没有启用好友独立配置，返回全局配置
      if (!this.config.advanced.friendIndependent) {
        console.log('[Translation] Friend independent config is disabled, using global config');
        return this.config.global;
      }
      
      // 检查是否有该联系人的独立配置
      if (contactId && this.config.friendConfigs && this.config.friendConfigs[contactId]) {
        const friendConfig = this.config.friendConfigs[contactId];
        console.log('[Translation] Found friend config for', contactId, ':', friendConfig);
        
        if (friendConfig.enabled) {
          const mergedConfig = {
            ...this.config.global,
            targetLang: friendConfig.targetLang || this.config.global.targetLang,
            blockChinese: friendConfig.blockChinese !== undefined ? friendConfig.blockChinese : this.config.advanced.blockChinese
          };
          console.log('[Translation] ✓ Using friend-specific config:', mergedConfig);
          return mergedConfig;
        } else {
          console.log('[Translation] Friend config exists but is disabled');
        }
      } else {
        console.log('[Translation] No friend config found for:', contactId);
      }
      
      // 返回全局配置
      console.log('[Translation] Using global config');
      return this.config.global;
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

        // 聊天窗口翻译使用全局配置，不受好友独立配置影响
        // 接收到的消息应该翻译成用户设置的目标语言（通常是中文）
        const response = await window.translationAPI.translate({
          text: text,
          sourceLang: this.config.global.sourceLang || 'auto',
          targetLang: this.config.global.targetLang || 'zh-CN',
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
      
      // 设置持续监控，确保按钮始终存在
      this.startButtonMonitoring();
    },

    /**
     * 持续监控翻译按钮，确保它始终存在
     */
    startButtonMonitoring() {
      // 如果已经有监控器在运行，先停止
      if (this.buttonMonitor) {
        this.buttonMonitor.disconnect();
      }
      
      console.log('[Translation] Starting button monitoring');
      
      // 每秒检查一次按钮是否存在
      this.buttonCheckInterval = setInterval(() => {
        if (!this.config || !this.config.inputBox || !this.config.inputBox.enabled) {
          return;
        }
        
        const button = document.getElementById('wa-translate-btn');
        const footer = document.querySelector('#main footer');
        
        // 如果按钮不存在，或者不在正确的 footer 中
        if (!button || (footer && !footer.contains(button))) {
          console.log('[Translation] Button missing or in wrong location, re-adding...');
          
          // 移除旧按钮（如果存在但位置不对）
          if (button) {
            button.remove();
          }
          
          // 重新初始化
          this.initInputBoxTranslation();
        }
      }, 1000);
      
      // 也使用 MutationObserver 监控 #main 的变化
      const mainContainer = document.querySelector('#main');
      if (mainContainer) {
        this.buttonMonitor = new MutationObserver((mutations) => {
          // 检查是否有 footer 相关的变化
          const hasFooterChange = mutations.some(m => {
            return Array.from(m.addedNodes).some(node => 
              node.nodeName === 'FOOTER' || 
              (node.querySelector && node.querySelector('footer'))
            ) || Array.from(m.removedNodes).some(node =>
              node.nodeName === 'FOOTER' ||
              (node.querySelector && node.querySelector('footer'))
            );
          });
          
          if (hasFooterChange) {
            console.log('[Translation] Footer changed, re-adding button...');
            setTimeout(() => {
              this.initInputBoxTranslation();
            }, 200);
          }
        });
        
        this.buttonMonitor.observe(mainContainer, {
          childList: true,
          subtree: true
        });
      }
    },

    /**
     * 初始化输入框翻译
     */
    initInputBoxTranslation() {
      // 先移除旧的翻译按钮（如果存在）
      const oldButton = document.getElementById('wa-translate-btn');
      if (oldButton) {
        console.log('[Translation] Removing old translate button');
        oldButton.remove();
      }
      
      // 查找输入框 - 使用多个选择器尝试，优先查找 #main 中的
      const inputBox = document.querySelector('#main footer [contenteditable="true"]') ||
                      document.querySelector('footer [contenteditable="true"]') ||
                      document.querySelector('[data-testid="conversation-compose-box-input"]') ||
                      document.querySelector('[contenteditable="true"][data-tab="10"]') ||
                      document.querySelector('div[contenteditable="true"][role="textbox"]');
      
      if (!inputBox) {
        console.warn('[Translation] Input box not found, retrying...');
        setTimeout(() => this.initInputBoxTranslation(), 1000);
        return;
      }
      
      console.log('[Translation] Input box found:', inputBox);

      // 添加翻译按钮
      if (this.config && this.config.inputBox && this.config.inputBox.enabled) {
        this.addTranslateButton(inputBox);
      } else {
        console.log('[Translation] Input box translation disabled in config');
      }

      // 设置实时翻译
      if (this.config && this.config.advanced && this.config.advanced.realtime) {
        this.setupRealtimeTranslation(inputBox);
      }

      // 设置中文拦截
      this.setupChineseBlock();
      
      // 监听消息发送，自动关闭反向翻译窗口
      this.setupSendMonitoring(inputBox);
    },

    /**
     * 监听消息发送，自动关闭反向翻译窗口
     */
    setupSendMonitoring(inputBox) {
      // 停止旧的监听器
      if (this.messageSentObserver) {
        this.messageSentObserver.disconnect();
      }
      
      // 查找消息容器
      const messagesContainer = document.querySelector('[data-testid="conversation-panel-messages"]') ||
                               document.querySelector('#main [role="application"]') ||
                               document.querySelector('#main');
      
      if (!messagesContainer) {
        console.warn('[Translation] Messages container not found for send monitoring');
        return;
      }
      
      console.log('[Translation] Setting up message sent monitoring');
      
      // 使用 MutationObserver 监控新消息的添加
      this.messageSentObserver = new MutationObserver((mutations) => {
        // 首先检查是否有反向翻译窗口，如果没有就不需要处理
        const reverseWindow = document.querySelector('.wa-input-reverse-translation');
        if (!reverseWindow) {
          return;
        }
        
        // 检查是否有新的发送消息节点被添加
        const hasNewOutgoingMessage = mutations.some(mutation => {
          return Array.from(mutation.addedNodes).some(node => {
            if (node.nodeType === 1) {
              // 只检查发送的消息（绿色气泡，message-out）
              // 排除接收的消息（白色气泡，message-in）
              const isOutgoing = node.classList && node.classList.contains('message-out');
              const hasOutgoing = node.querySelector && node.querySelector('.message-out');
              
              if (isOutgoing || hasOutgoing) {
                console.log('[Translation] Detected new OUTGOING message (green bubble)');
                return true;
              }
              return false;
            }
            return false;
          });
        });
        
        if (hasNewOutgoingMessage) {
          console.log('[Translation] Closing reverse translation after sending message');
          // 延迟一下确保消息已完全发送
          setTimeout(() => {
            this.closeReverseTranslation();
          }, 100);
        }
      });
      
      // 开始监控
      this.messageSentObserver.observe(messagesContainer, {
        childList: true,
        subtree: true
      });
      
      console.log('[Translation] Message sent monitoring enabled');
    },

    /**
     * 关闭反向翻译窗口
     */
    closeReverseTranslation() {
      const reverseDiv = document.querySelector('.wa-input-reverse-translation');
      if (reverseDiv) {
        console.log('[Translation] Closing reverse translation window');
        reverseDiv.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => {
          if (reverseDiv.parentNode) {
            reverseDiv.remove();
          }
        }, 300);
      }
      
      // 同时关闭实时翻译预览
      this.hideRealtimePreview();
    },

    /**
     * 添加翻译按钮
     */
    addTranslateButton(inputBox) {
      // 优先查找 #main 中的 footer
      const footer = document.querySelector('#main footer') ||
                    document.querySelector('[data-testid="conversation-compose-box"]') ||
                    document.querySelector('footer');
      
      if (!footer) {
        console.warn('[Translation] Footer not found for translate button, retrying...');
        setTimeout(() => this.addTranslateButton(inputBox), 500);
        return;
      }

      // 再次检查按钮是否已存在（双重保险）
      const existingButton = document.getElementById('wa-translate-btn');
      if (existingButton) {
        console.log('[Translation] Translate button already exists, skipping');
        return;
      }

      const button = document.createElement('button');
      button.id = 'wa-translate-btn';
      button.className = 'wa-translate-btn';
      button.innerHTML = '🌐';
      button.title = '翻译';
      button.type = 'button';
      
      button.onclick = async () => {
        // 防止重复点击
        if (button.disabled) {
          console.log('[Translation] Button already disabled, skipping');
          return;
        }
        
        button.disabled = true;
        button.innerHTML = '⏳';
        console.log('[Translation] Button clicked, starting translation');
        
        try {
          await this.translateInputBox(inputBox);
        } catch (error) {
          console.error('[Translation] Translation error:', error);
        } finally {
          button.disabled = false;
          button.innerHTML = '🌐';
          console.log('[Translation] Button re-enabled');
        }
      };

      // 添加按钮样式 - 固定在输入框上方
      button.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: 20px;
        padding: 8px;
        background: rgba(102, 126, 234, 0.95);
        border: none;
        cursor: pointer;
        font-size: 22px;
        border-radius: 50%;
        transition: all 0.2s;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
      `;

      button.onmouseenter = () => {
        button.style.background = 'rgba(102, 126, 234, 1)';
        button.style.transform = 'scale(1.15)';
        button.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
      };

      button.onmouseleave = () => {
        button.style.background = 'rgba(102, 126, 234, 0.95)';
        button.style.transform = 'scale(1)';
        button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
      };

      // 直接添加到 body 中（固定定位，不依赖 footer）
      document.body.appendChild(button);

      console.log('[Translation] Translate button added (floating position)');
    },

    /**
     * 检测当前聊天对方使用的语言
     */
    async detectChatLanguage() {
      try {
        // 获取最近的对方消息（接收的消息）
        const incomingMessages = document.querySelectorAll('.message-in');
        
        if (incomingMessages.length === 0) {
          console.log('[Translation] No incoming messages found');
          return 'en'; // 默认英文
        }
        
        // 从最新的消息开始检测
        for (let i = incomingMessages.length - 1; i >= Math.max(0, incomingMessages.length - 5); i--) {
          const msg = incomingMessages[i];
          const textElement = msg.querySelector('.selectable-text');
          
          if (textElement && textElement.textContent.trim()) {
            const text = textElement.textContent.trim();
            
            // 调用语言检测 API
            const result = await window.translationAPI.detectLanguage(text);
            
            if (result.success && result.data.language) {
              const detectedLang = result.data.language;
              console.log('[Translation] Detected language from message:', detectedLang, 'Text:', text.substring(0, 50));
              
              // 如果检测到的语言不是中文，就用这个语言
              if (!detectedLang.startsWith('zh')) {
                return detectedLang;
              }
            }
          }
        }
        
        // 如果对方也是中文，默认翻译成英文
        return 'en';
        
      } catch (error) {
        console.error('[Translation] Error detecting chat language:', error);
        return 'en';
      }
    },

    /**
     * 添加语言选择器
     */
    addLanguageSelector(inputBox) {
      const footer = document.querySelector('#main footer') ||
                    document.querySelector('[data-testid="conversation-compose-box"]') ||
                    document.querySelector('footer');
      
      if (!footer) {
        console.warn('[Translation] Footer not found for language selector');
        return;
      }

      // 检查选择器是否已存在
      if (document.getElementById('wa-lang-selector')) {
        console.log('[Translation] Language selector already exists');
        return;
      }

      // 创建语言选择器
      const selector = document.createElement('select');
      selector.id = 'wa-lang-selector';
      selector.className = 'wa-lang-selector';
      selector.title = '选择翻译目标语言';
      
      // 添加语言选项
      const languages = [
        { code: 'auto', name: '🤖 自动检测' },
        { code: 'en', name: '🇬🇧 English' },
        { code: 'zh-CN', name: '🇨🇳 中文' },
        { code: 'vi', name: '🇻🇳 Tiếng Việt' },
        { code: 'ja', name: '🇯🇵 日本語' },
        { code: 'ko', name: '🇰🇷 한국어' },
        { code: 'es', name: '🇪🇸 Español' },
        { code: 'fr', name: '🇫🇷 Français' },
        { code: 'de', name: '🇩🇪 Deutsch' },
        { code: 'ru', name: '🇷🇺 Русский' },
        { code: 'ar', name: '🇸🇦 العربية' },
        { code: 'pt', name: '🇵🇹 Português' },
        { code: 'it', name: '🇮🇹 Italiano' }
      ];
      
      languages.forEach(lang => {
        const option = document.createElement('option');
        option.value = lang.code;
        option.textContent = lang.name;
        selector.appendChild(option);
      });
      
      // 默认选择自动检测
      selector.value = 'auto';
      
      // 添加样式
      selector.style.cssText = `
        padding: 6px 8px;
        background: transparent;
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        cursor: pointer;
        font-size: 13px;
        margin: 0 8px;
        transition: all 0.2s;
      `;
      
      selector.onmouseenter = () => {
        selector.style.background = 'rgba(0, 0, 0, 0.05)';
      };
      
      selector.onmouseleave = () => {
        selector.style.background = 'transparent';
      };
      
      // 添加到翻译按钮旁边
      const translateBtn = document.getElementById('wa-translate-btn');
      if (translateBtn && translateBtn.parentNode) {
        translateBtn.parentNode.insertBefore(selector, translateBtn);
      } else {
        footer.appendChild(selector);
      }
      
      console.log('[Translation] Language selector added');
    },

    /**
     * 检查是否应该拦截中文（考虑全局和联系人配置）
     */
    shouldBlockChinese() {
      // 获取当前联系人 ID
      const contactId = this.getCurrentContactId();
      
      // 如果启用了好友独立配置，检查该联系人的配置
      if (this.config.advanced.friendIndependent && contactId) {
        const friendConfig = this.config.friendConfigs && this.config.friendConfigs[contactId];
        if (friendConfig && friendConfig.enabled) {
          // 使用联系人的独立配置
          return friendConfig.blockChinese || false;
        }
      }
      
      // 使用全局配置
      return this.config.advanced.blockChinese || false;
    },

    /**
     * 设置中文拦截
     */
    setupChineseBlock() {
      // 移除旧的监听器
      if (this.chineseBlockHandler) {
        document.removeEventListener('keydown', this.chineseBlockHandler, true);
      }
      if (this.chineseBlockClickHandler) {
        document.removeEventListener('click', this.chineseBlockClickHandler, true);
      }
      
      // 检查是否需要启用拦截
      if (!this.shouldBlockChinese()) {
        console.log('[Translation] Chinese blocking disabled');
        return;
      }
      
      console.log('[Translation] Setting up Chinese blocking');
      
      // 创建键盘监听器（拦截 Enter 键发送）
      this.chineseBlockHandler = (e) => {
        // 检测 Enter 键（发送消息）
        if (e.key === 'Enter' && !e.shiftKey) {
          const inputBox = document.querySelector('footer [contenteditable="true"]') ||
                          document.querySelector('[data-testid="conversation-compose-box-input"]');
          
          if (!inputBox) return;
          
          const text = inputBox.textContent || inputBox.innerText || '';
          
          if (this.containsChinese(text)) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            // 显示提示
            this.showChineseBlockAlert();
            
            console.log('[Translation] Blocked Chinese message send via Enter');
            return false;
          }
        }
      };
      
      // 创建点击监听器（拦截发送按钮点击）
      this.chineseBlockClickHandler = (e) => {
        // 检查是否点击了发送按钮
        const target = e.target;
        const sendButton = target.closest('[data-testid="send"]') || 
                          target.closest('button[aria-label*="发送"]') ||
                          target.closest('button[aria-label*="Send"]') ||
                          target.closest('span[data-icon="send"]');
        
        if (sendButton) {
          const inputBox = document.querySelector('footer [contenteditable="true"]') ||
                          document.querySelector('[data-testid="conversation-compose-box-input"]');
          
          if (!inputBox) return;
          
          const text = inputBox.textContent || inputBox.innerText || '';
          
          if (this.containsChinese(text)) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            // 显示提示
            this.showChineseBlockAlert();
            
            console.log('[Translation] Blocked Chinese message send via button');
            return false;
          }
        }
      };
      
      // 添加监听器（使用 capture 阶段，优先级最高）
      document.addEventListener('keydown', this.chineseBlockHandler, true);
      document.addEventListener('click', this.chineseBlockClickHandler, true);
      
      console.log('[Translation] Chinese blocking enabled');
    },

    /**
     * 显示非阻塞提示消息
     */
    showToast(message, type = 'info') {
      // 创建提示元素
      const toast = document.createElement('div');
      toast.className = 'wa-toast wa-toast-' + type;
      toast.textContent = message;
      
      toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        font-size: 14px;
        z-index: 10000000;
        animation: slideInRight 0.3s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        max-width: 300px;
      `;
      
      // 根据类型设置背景色
      if (type === 'error') {
        toast.style.background = '#ef4444';
      } else if (type === 'warning') {
        toast.style.background = '#f59e0b';
      } else if (type === 'success') {
        toast.style.background = '#10b981';
      } else {
        toast.style.background = '#3b82f6';
      }
      
      document.body.appendChild(toast);
      
      // 2秒后自动移除
      setTimeout(() => {
        if (toast.parentNode) {
          toast.style.animation = 'fadeOut 0.3s ease';
          setTimeout(() => {
            if (toast.parentNode) {
              toast.parentNode.removeChild(toast);
            }
          }, 300);
        }
      }, 2000);
    },

    /**
     * 显示中文拦截提示
     */
    showChineseBlockAlert() {
      // 创建提示元素
      const alert = document.createElement('div');
      alert.className = 'wa-chinese-block-alert';
      alert.innerHTML = `
        <div class="alert-content">
          <span class="alert-icon">🚫</span>
          <div class="alert-text">
            <strong>检测到中文内容</strong>
            <p>已启用禁发中文功能，请先翻译后再发送</p>
          </div>
          <button class="alert-close">×</button>
        </div>
      `;
      
      alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #fff3cd;
        border: 2px solid #ffc107;
        border-radius: 8px;
        padding: 16px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000000;
        animation: slideInRight 0.3s ease;
        max-width: 350px;
      `;
      
      const content = alert.querySelector('.alert-content');
      content.style.cssText = `
        display: flex;
        align-items: flex-start;
        gap: 12px;
      `;
      
      const icon = alert.querySelector('.alert-icon');
      icon.style.cssText = `
        font-size: 24px;
        flex-shrink: 0;
      `;
      
      const text = alert.querySelector('.alert-text');
      text.style.cssText = `
        flex: 1;
      `;
      
      const strong = alert.querySelector('strong');
      strong.style.cssText = `
        display: block;
        color: #856404;
        margin-bottom: 4px;
        font-size: 14px;
      `;
      
      const p = alert.querySelector('p');
      p.style.cssText = `
        margin: 0;
        color: #856404;
        font-size: 13px;
        line-height: 1.4;
      `;
      
      const closeBtn = alert.querySelector('.alert-close');
      closeBtn.style.cssText = `
        background: transparent;
        border: none;
        font-size: 24px;
        color: #856404;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      `;
      
      closeBtn.onclick = () => {
        if (alert.parentNode) {
          alert.parentNode.removeChild(alert);
        }
      };
      
      document.body.appendChild(alert);
      
      // 3秒后自动移除
      setTimeout(() => {
        if (alert.parentNode) {
          alert.parentNode.removeChild(alert);
        }
      }, 3000);
    },

    /**
     * 翻译输入框
     */
    async translateInputBox(inputBox) {
      // 防止重复翻译
      if (this.isTranslating) {
        console.log('[Translation] Already translating, skipping');
        return;
      }
      
      this.isTranslating = true;
      
      // 如果没有传入 inputBox，尝试查找
      if (!inputBox) {
        inputBox = document.querySelector('footer [contenteditable="true"]') ||
                  document.querySelector('[data-testid="conversation-compose-box-input"]') ||
                  document.querySelector('#main footer div[contenteditable="true"]');
      }
      
      if (!inputBox) {
        this.showToast('找不到输入框', 'error');
        console.error('[Translation] Input box not found');
        this.isTranslating = false;
        return;
      }
      
      // 获取文本 - 处理 Lexical 编辑器
      let text = '';
      
      // 尝试多种方式获取文本
      if (inputBox.hasAttribute('data-lexical-editor')) {
        // Lexical 编辑器 - 从子元素获取文本
        const textNodes = inputBox.querySelectorAll('p, span[data-text="true"]');
        if (textNodes.length > 0) {
          text = Array.from(textNodes).map(node => node.textContent).join('\n');
        } else {
          text = inputBox.innerText || inputBox.textContent || '';
        }
      } else {
        text = inputBox.textContent || inputBox.innerText || '';
      }
      
      text = text.trim();
      
      if (!text) {
        this.showToast('请输入要翻译的内容', 'warning');
        this.isTranslating = false;
        return;
      }
      
      console.log('[Translation] Translating input box text:', text);

      try {
        const button = document.getElementById('wa-translate-btn');
        if (button) {
          button.innerHTML = '⏳';
          button.disabled = true;
        }

        // 获取当前联系人ID
        const contactId = this.getCurrentContactId();
        console.log('[Translation] Input box translation for contact:', contactId);
        
        // 获取该联系人的配置（可能是独立配置）
        const contactConfig = this.getContactConfig(contactId);
        console.log('[Translation] Using contact config:', contactConfig);
        
        // 从配置中获取输入框翻译目标语言
        // 优先使用好友独立配置的targetLang，否则使用inputBox配置
        let targetLang = contactConfig.targetLang || this.config.inputBox.targetLang || 'auto';
        
        // 如果设置为自动检测，则检测对方使用的语言
        if (targetLang === 'auto') {
          targetLang = await this.detectChatLanguage();
          console.log('[Translation] Auto-detected chat language:', targetLang);
        }
        
        // 如果还是检测不到，默认翻译成英文
        if (!targetLang || targetLang === 'auto') {
          targetLang = 'en';
        }
        
        console.log('[Translation] Final target language:', targetLang);
        
        const response = await window.translationAPI.translate({
          text: text,
          sourceLang: 'auto',
          targetLang: targetLang,
          engineName: this.config.global.engine,
          options: {
            style: this.config.inputBox.style
          }
        });

        if (response.success) {
          const translatedText = response.data.translatedText;
          console.log('[Translation] Translation successful:', translatedText);
          
          // 将翻译后的文本设置到输入框
          await this.setInputBoxText(inputBox, translatedText);
          console.log('[Translation] Text set to input box');
          
          // 如果启用了反向翻译，显示反向翻译验证
          if (this.config.advanced.reverseTranslation) {
            await this.showInputBoxReverseTranslation(text, translatedText, targetLang);
          }
        } else {
          console.error('[Translation] Translation failed:', response.error);
          this.showToast('翻译失败: ' + response.error, 'error');
        }

      } catch (error) {
        console.error('[Translation] Input box translation error:', error);
        this.showToast('翻译失败: ' + error.message, 'error');
      } finally {
        // 释放翻译锁
        this.isTranslating = false;
      }
    },

    /**
     * 显示输入框反向翻译验证
     */
    async showInputBoxReverseTranslation(originalText, translatedText, targetLang) {
      try {
        // 移除旧的反向翻译显示
        const oldReverse = document.querySelector('.wa-input-reverse-translation');
        if (oldReverse) {
          oldReverse.remove();
        }
        
        // 查找输入框容器
        const footer = document.querySelector('#main footer') ||
                      document.querySelector('[data-testid="conversation-compose-box"]') ||
                      document.querySelector('footer');
        
        if (!footer) {
          console.warn('[Translation] Footer not found for reverse translation');
          return;
        }
        
        // 创建反向翻译容器
        const reverseDiv = document.createElement('div');
        reverseDiv.className = 'wa-input-reverse-translation';
        reverseDiv.innerHTML = `
          <div class="reverse-header">
            <span class="reverse-icon">🔄</span>
            <span class="reverse-title">反向翻译验证中...</span>
            <button class="reverse-close" title="关闭">×</button>
          </div>
          <div class="reverse-content"></div>
        `;
        
        // 添加样式
        reverseDiv.style.cssText = `
          margin: 8px 12px;
          padding: 12px;
          background: rgba(156, 39, 176, 0.05);
          border-left: 3px solid #9c27b0;
          border-radius: 8px;
          font-size: 13px;
        `;
        
        // 插入到输入框上方
        footer.insertBefore(reverseDiv, footer.firstChild);
        
        // 绑定关闭按钮
        const closeBtn = reverseDiv.querySelector('.reverse-close');
        closeBtn.onclick = () => {
          reverseDiv.remove();
        };
        
        // 先检测原文的语言
        let sourceLang = 'zh-CN'; // 默认中文
        try {
          const detectResult = await window.translationAPI.detectLanguage(originalText);
          if (detectResult.success && detectResult.data.language) {
            sourceLang = detectResult.data.language;
            console.log('[Translation] Detected original language:', sourceLang);
          }
        } catch (error) {
          console.warn('[Translation] Language detection failed, using default zh-CN:', error);
        }
        
        // 执行反向翻译 - 翻译回原始语言
        const response = await window.translationAPI.translate({
          text: translatedText,
          sourceLang: targetLang,
          targetLang: sourceLang, // 翻译回原始语言
          engineName: this.config.global.engine,
          options: {}
        });
        
        if (response.success) {
          const reverseText = response.data.translatedText;
          
          // 计算相似度
          const similarity = this.calculateSimilarity(originalText, reverseText);
          const similarityPercent = Math.round(similarity * 100);
          const needsWarning = similarityPercent < 70;
          
          // 更新显示
          const header = reverseDiv.querySelector('.reverse-header');
          const content = reverseDiv.querySelector('.reverse-content');
          
          header.innerHTML = `
            <span class="reverse-icon">🔄</span>
            <span class="reverse-title">反向翻译验证</span>
            <span class="similarity-badge ${needsWarning ? 'warning' : 'good'}">
              相似度: ${similarityPercent}%
            </span>
            <button class="reverse-close" title="关闭">×</button>
          `;
          
          content.innerHTML = `
            <div class="reverse-item">
              <div class="reverse-label">实时翻译</div>
              <div class="reverse-text">${this.escapeHtml(translatedText)}</div>
            </div>
            <div class="reverse-item">
              <div class="reverse-label">反向结果</div>
              <div class="reverse-text">${this.escapeHtml(reverseText)}</div>
            </div>
            ${needsWarning ? '<div class="reverse-warning">⚠️ 相似度较低，翻译可能不够准确</div>' : ''}
          `;
          
          // 重新绑定关闭按钮
          const newCloseBtn = reverseDiv.querySelector('.reverse-close');
          newCloseBtn.onclick = () => {
            reverseDiv.remove();
          };
        } else {
          const content = reverseDiv.querySelector('.reverse-content');
          content.innerHTML = `
            <div class="reverse-error">
              <span>⚠️</span>
              <span>反向翻译失败: ${response.error}</span>
            </div>
          `;
        }
      } catch (error) {
        console.error('[Translation] Input box reverse translation error:', error);
      }
    },

    /**
     * 设置输入框文本
     */
    async setInputBoxText(inputBox, text) {
      console.log('[Translation] Setting input box text:', text);
      
      // 聚焦输入框
      inputBox.focus();
      
      // 等待一下确保聚焦
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 选中所有内容
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(inputBox);
      selection.removeAllRanges();
      selection.addRange(range);
      
      console.log('[Translation] Content selected');
      
      // 等待一下
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // 模拟键盘输入来替换内容
      const dataTransfer = new DataTransfer();
      dataTransfer.setData('text/plain', text);
      
      const pasteEvent = new ClipboardEvent('paste', {
        bubbles: true,
        cancelable: true,
        clipboardData: dataTransfer
      });
      
      inputBox.dispatchEvent(pasteEvent);
      
      console.log('[Translation] Paste event dispatched');
      
      // 如果粘贴事件被阻止，使用备用方法
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 检查是否成功
      const currentText = inputBox.textContent || inputBox.innerText || '';
      if (!currentText.includes(text)) {
        console.log('[Translation] Paste failed, using fallback method');
        
        // 备用方法：逐字符输入
        inputBox.textContent = '';
        
        for (let char of text) {
          const keyEvent = new KeyboardEvent('keydown', {
            key: char,
            bubbles: true,
            cancelable: true
          });
          inputBox.dispatchEvent(keyEvent);
          
          document.execCommand('insertText', false, char);
          
          const inputEvent = new InputEvent('input', {
            bubbles: true,
            data: char,
            inputType: 'insertText'
          });
          inputBox.dispatchEvent(inputEvent);
        }
        
        console.log('[Translation] Text inserted character by character');
      } else {
        console.log('[Translation] Text successfully pasted');
      }
    },

    /**
     * 设置实时翻译
     */
    setupRealtimeTranslation(inputBox) {
      // 移除旧的监听器
      if (this.realtimeInputHandler) {
        inputBox.removeEventListener('input', this.realtimeInputHandler);
      }
      
      // 检查是否启用实时翻译
      if (!this.config.advanced.realtime) {
        console.log('[Translation] Realtime translation disabled');
        // 移除预览元素
        const preview = document.querySelector('.wa-realtime-preview');
        if (preview) {
          preview.remove();
        }
        return;
      }
      
      console.log('[Translation] Setting up realtime translation');
      
      let debounceTimer = null;
      let lastText = '';
      
      // 创建预览元素
      this.createRealtimePreview();
      
      // 创建输入监听器
      this.realtimeInputHandler = () => {
        // 清除之前的定时器
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }
        
        // 获取当前文本
        let text = '';
        if (inputBox.hasAttribute('data-lexical-editor')) {
          const textNodes = inputBox.querySelectorAll('p, span[data-text="true"]');
          if (textNodes.length > 0) {
            text = Array.from(textNodes).map(node => node.textContent).join('\n');
          } else {
            text = inputBox.innerText || inputBox.textContent || '';
          }
        } else {
          text = inputBox.textContent || inputBox.innerText || '';
        }
        
        text = text.trim();
        
        // 如果文本为空，隐藏预览
        if (!text) {
          this.hideRealtimePreview();
          lastText = '';
          return;
        }
        
        // 如果文本没有变化，不翻译
        if (text === lastText) {
          return;
        }
        
        lastText = text;
        
        // 显示加载状态
        this.showRealtimePreview('翻译中...', true);
        
        // 500ms 后执行翻译
        debounceTimer = setTimeout(async () => {
          try {
            // 获取当前联系人ID
            const contactId = this.getCurrentContactId();
            console.log('[Translation] Realtime translation for contact:', contactId);
            
            // 获取该联系人的配置（可能是独立配置）
            const contactConfig = this.getContactConfig(contactId);
            console.log('[Translation] Using contact config for realtime:', contactConfig);
            
            // 从配置中获取输入框翻译目标语言
            // 优先使用好友独立配置的targetLang，否则使用inputBox配置
            let targetLang = contactConfig.targetLang || this.config.inputBox.targetLang || 'auto';
            
            // 如果设置为自动检测，则检测对方使用的语言
            if (targetLang === 'auto') {
              targetLang = await this.detectChatLanguage();
            }
            
            // 如果还是检测不到，默认翻译成英文
            if (!targetLang || targetLang === 'auto') {
              targetLang = 'en';
            }
            
            console.log('[Translation] Realtime target language:', targetLang);
            
            const response = await window.translationAPI.translate({
              text: text,
              sourceLang: 'auto',
              targetLang: targetLang,
              engineName: this.config.global.engine,
              options: {
                style: this.config.inputBox.style
              }
            });
            
            if (response.success) {
              this.showRealtimePreview(response.data.translatedText, false);
            } else {
              this.showRealtimePreview('翻译失败: ' + response.error, false, true);
            }
          } catch (error) {
            console.error('[Translation] Realtime translation error:', error);
            this.showRealtimePreview('翻译失败: ' + error.message, false, true);
          }
        }, 500);
      };
      
      // 添加监听器
      inputBox.addEventListener('input', this.realtimeInputHandler);
      
      console.log('[Translation] Realtime translation enabled');
    },

    /**
     * 创建实时翻译预览元素
     */
    createRealtimePreview() {
      // 检查是否已存在
      if (document.querySelector('.wa-realtime-preview')) {
        return;
      }
      
      // 查找输入框容器
      const footer = document.querySelector('#main footer') ||
                    document.querySelector('[data-testid="conversation-compose-box"]') ||
                    document.querySelector('footer');
      
      if (!footer) {
        console.warn('[Translation] Footer not found for realtime preview');
        return;
      }
      
      // 创建预览元素
      const preview = document.createElement('div');
      preview.className = 'wa-realtime-preview';
      preview.style.display = 'none';
      preview.innerHTML = `
        <div class="translation-header">
          <span class="translation-icon">⚡</span>
          <span class="translation-lang">实时翻译预览</span>
        </div>
        <div class="translation-text"></div>
      `;
      
      // 插入到输入框上方
      footer.insertBefore(preview, footer.firstChild);
      
      console.log('[Translation] Realtime preview element created');
    },

    /**
     * 显示实时翻译预览
     */
    showRealtimePreview(text, isLoading = false, isError = false) {
      const preview = document.querySelector('.wa-realtime-preview');
      if (!preview) {
        this.createRealtimePreview();
        return this.showRealtimePreview(text, isLoading, isError);
      }
      
      const textElement = preview.querySelector('.translation-text');
      if (textElement) {
        if (isLoading) {
          textElement.innerHTML = '<span class="translation-loading">' + this.escapeHtml(text) + '</span>';
        } else if (isError) {
          textElement.innerHTML = '<span style="color: #ef4444;">' + this.escapeHtml(text) + '</span>';
        } else {
          textElement.textContent = text;
        }
      }
      
      preview.style.display = 'block';
    },

    /**
     * 隐藏实时翻译预览
     */
    hideRealtimePreview() {
      const preview = document.querySelector('.wa-realtime-preview');
      if (preview) {
        preview.style.display = 'none';
        // 清空预览内容，避免下次显示时出现旧内容
        const textElement = preview.querySelector('.translation-text');
        if (textElement) {
          textElement.textContent = '';
        }
      }
    },

    /**
     * 设置中文拦截
     */
    setupChineseBlock(inputBox) {
      // 移除旧的监听器
      if (this.chineseBlockHandler) {
        document.removeEventListener('keydown', this.chineseBlockHandler, true);
      }
      if (this.chineseBlockClickHandler) {
        document.removeEventListener('click', this.chineseBlockClickHandler, true);
      }
      
      let isAutoTranslating = false;
      
      // 保存原始文本并在发送后翻译
      let pendingTranslation = null;
      
      const scheduleTranslation = (text) => {
        if (!this.containsChinese(text)) {
          return;
        }
        
        console.log('[Translation] Scheduling auto-translation for:', text);
        pendingTranslation = text;
        
        // 等待消息发送完成后翻译并发送
        setTimeout(async () => {
          if (!pendingTranslation) return;
          
          const textToTranslate = pendingTranslation;
          pendingTranslation = null;
          
          try {
            // 获取目标语言
            const langSelector = document.getElementById('wa-lang-selector');
            let targetLang = langSelector ? langSelector.value : null;
            
            if (!targetLang || targetLang === 'auto') {
              targetLang = await this.detectChatLanguage();
            }
            
            console.log('[Translation] Translating:', textToTranslate, 'to', targetLang);
            
            // 翻译
            const response = await window.translationAPI.translate({
              text: textToTranslate,
              sourceLang: 'auto',
              targetLang: targetLang,
              engineName: this.config.global.engine,
              options: {
                style: this.config.inputBox.style
              }
            });
            
            if (response.success) {
              const translatedText = response.data.translatedText;
              console.log('[Translation] Translation successful:', translatedText);
              
              // 在输入框中输入翻译结果
              inputBox.focus();
              
              // 清空输入框
              inputBox.innerHTML = '';
              inputBox.textContent = '';
              
              // 插入翻译文本
              document.execCommand('insertText', false, `[翻译] ${translatedText}`);
              
              // 等待一下
              await new Promise(resolve => setTimeout(resolve, 200));
              
              // 自动发送
              const enterEvent = new KeyboardEvent('keydown', {
                key: 'Enter',
                code: 'Enter',
                keyCode: 13,
                which: 13,
                bubbles: true,
                cancelable: true
              });
              inputBox.dispatchEvent(enterEvent);
              
              console.log('[Translation] Translated message sent');
            }
          } catch (error) {
            console.error('[Translation] Auto-translation error:', error);
          }
        }, 500); // 等待500ms让原始消息先发送
      };
      
      // 创建键盘监听器
      this.chineseBlockHandler = (e) => {
        // 检测 Enter 键（发送消息）
        if (e.key === 'Enter' && !e.shiftKey) {
          const text = inputBox.textContent || inputBox.innerText || '';
          
          if (this.containsChinese(text)) {
            // 不阻止发送，但安排翻译
            scheduleTranslation(text);
          }
        }
      };
      
      // 创建点击监听器（拦截发送按钮点击）
      this.chineseBlockClickHandler = (e) => {
        // 检查是否点击了发送按钮
        const target = e.target;
        const sendButton = target.closest('[data-testid="send"]') || 
                          target.closest('button[aria-label*="发送"]') ||
                          target.closest('button[aria-label*="Send"]') ||
                          target.closest('span[data-icon="send"]');
        
        if (sendButton) {
          const text = inputBox.textContent || inputBox.innerText || '';
          
          if (this.containsChinese(text)) {
            // 不阻止发送，但安排翻译
            scheduleTranslation(text);
          }
        }
      };
      
      // 添加监听器（使用 capture 阶段，优先级最高）
      document.addEventListener('keydown', this.chineseBlockHandler, true);
      document.addEventListener('click', this.chineseBlockClickHandler, true);
      
      console.log('[Translation] Auto-translate on send enabled - will send translation after Chinese message');
    },

    /**
     * 检测是否包含中文
     */
    containsChinese(text) {
      return /[\u4e00-\u9fa5]/.test(text);
    },

    /**
     * 检测是否主要是中文
     */
    isChinese(text) {
      // 检测日语假名（平假名和片假名）
      const hasHiragana = /[\u3040-\u309f]/.test(text);
      const hasKatakana = /[\u30a0-\u30ff]/.test(text);
      
      // 如果包含日语假名，肯定不是纯中文
      if (hasHiragana || hasKatakana) {
        return false;
      }
      
      // 检测韩文
      const hasKorean = /[\uac00-\ud7af]/.test(text);
      if (hasKorean) {
        return false;
      }
      
      // 统计中文字符数量
      const chineseChars = text.match(/[\u4e00-\u9fa5]/g);
      const chineseCount = chineseChars ? chineseChars.length : 0;
      
      // 如果中文字符超过50%，认为是中文消息
      const totalChars = text.replace(/\s/g, '').length;
      const chineseRatio = totalChars > 0 ? chineseCount / totalChars : 0;
      
      return chineseRatio > 0.5;
    },

    /**
     * 计算两个文本的相似度（用于反向翻译验证）
     */
    calculateSimilarity(text1, text2) {
      // 转换为小写并去除标点符号
      const normalize = (text) => {
        return text.toLowerCase()
          .replace(/[^\w\s\u4e00-\u9fa5]/g, '')
          .replace(/\s+/g, ' ')
          .trim();
      };
      
      const s1 = normalize(text1);
      const s2 = normalize(text2);
      
      // 如果完全相同
      if (s1 === s2) return 1.0;
      
      // 计算 Levenshtein 距离
      const len1 = s1.length;
      const len2 = s2.length;
      
      if (len1 === 0) return len2 === 0 ? 1.0 : 0.0;
      if (len2 === 0) return 0.0;
      
      const matrix = [];
      
      // 初始化矩阵
      for (let i = 0; i <= len1; i++) {
        matrix[i] = [i];
      }
      for (let j = 0; j <= len2; j++) {
        matrix[0][j] = j;
      }
      
      // 填充矩阵
      for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
          const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
          matrix[i][j] = Math.min(
            matrix[i - 1][j] + 1,      // 删除
            matrix[i][j - 1] + 1,      // 插入
            matrix[i - 1][j - 1] + cost // 替换
          );
        }
      }
      
      const distance = matrix[len1][len2];
      const maxLen = Math.max(len1, len2);
      
      // 返回相似度（0-1）
      return 1 - (distance / maxLen);
    },

    /**
     * 启动定期检查新消息
     */
    startPeriodicCheck() {
      console.log('[Translation] Starting periodic message check');
      
      // 每1秒检查一次新消息
      setInterval(() => {
        if (this.config && this.config.global && this.config.global.autoTranslate) {
          const messages = document.querySelectorAll('.message-in, .message-out');
          let newCount = 0;
          
          messages.forEach(msg => {
            if (!msg.querySelector('.wa-translation-result')) {
              const textElement = msg.querySelector('.selectable-text');
              if (textElement && textElement.textContent.trim()) {
                this.handleNewMessage(msg);
                newCount++;
              }
            }
          });
          
          if (newCount > 0) {
            console.log(`[Translation] Found ${newCount} new messages to translate`);
          }
        }
      }, 1000);
    },

    /**
     * 显示联系人独立配置标识
     */
    showFriendConfigIndicator() {
      // 移除旧的标识
      const oldIndicator = document.querySelector('.wa-friend-config-indicator');
      if (oldIndicator) {
        oldIndicator.remove();
      }
      
      // 检查是否启用好友独立配置
      if (!this.config.advanced.friendIndependent) {
        return;
      }
      
      // 获取当前联系人 ID
      const contactId = this.getCurrentContactId();
      if (!contactId) {
        return;
      }
      
      // 检查该联系人是否有独立配置
      const friendConfig = this.config.friendConfigs && this.config.friendConfigs[contactId];
      if (!friendConfig || !friendConfig.enabled) {
        return;
      }
      
      // 查找聊天标题区域
      const header = document.querySelector('[data-testid="conversation-info-header"]');
      if (!header) {
        return;
      }
      
      // 创建标识
      const indicator = document.createElement('span');
      indicator.className = 'wa-friend-config-indicator';
      indicator.innerHTML = '🎯';
      indicator.title = `独立翻译配置：${friendConfig.targetLang}${friendConfig.blockChinese ? ' (禁发中文)' : ''}`;
      indicator.style.cssText = `
        display: inline-block;
        margin-left: 8px;
        font-size: 16px;
        cursor: help;
        animation: fadeIn 0.3s ease-in;
      `;
      
      // 添加到标题后面
      header.appendChild(indicator);
      
      console.log('[Translation] Friend config indicator added for:', contactId);
    },

    /**
     * 监听聊天窗口切换
     */
    observeChatSwitch() {
      console.log('[Translation] Setting up chat switch observer');
      
      // 监听 URL 变化（WhatsApp Web 使用 hash 路由）
      let lastUrl = location.href;
      const urlObserver = new MutationObserver(() => {
        const currentUrl = location.href;
        if (currentUrl !== lastUrl) {
          lastUrl = currentUrl;
          console.log('[Translation] Chat switched, re-translating messages');
          
          // 延迟一下，等待新聊天加载
          setTimeout(() => {
            this.translateExistingMessages();
            this.observeInputBox(); // 重新设置输入框
            this.showFriendConfigIndicator(); // 显示独立配置标识
          }, 500);
        }
      });

      // 观察 document.body 的变化
      urlObserver.observe(document.body, {
        childList: true,
        subtree: true
      });

      // 也监听 #main 容器的变化
      const mainContainer = document.querySelector('#main');
      if (mainContainer) {
        const chatObserver = new MutationObserver((mutations) => {
          // 检查是否有大的 DOM 变化（可能是切换聊天）
          const hasSignificantChange = mutations.some(m => 
            m.addedNodes.length > 5 || m.removedNodes.length > 5
          );
          
          if (hasSignificantChange) {
            console.log('[Translation] Significant DOM change detected');
            setTimeout(() => {
              this.translateExistingMessages();
              this.observeInputBox(); // 重新设置输入框和翻译按钮
              this.showFriendConfigIndicator(); // 显示独立配置标识
            }, 300);
          }
        });

        chatObserver.observe(mainContainer, {
          childList: true,
          subtree: false // 只观察直接子节点
        });
      }
      
      // 初始显示标识
      setTimeout(() => {
        this.showFriendConfigIndicator();
      }, 1000);
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



        /* 输入框反向翻译样式 */
        .wa-input-reverse-translation {
          animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-10px);
          }
        }

        .reverse-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          font-weight: 500;
        }

        .reverse-icon {
          font-size: 16px;
        }

        .reverse-title {
          color: #9c27b0;
          font-size: 13px;
        }

        .reverse-close {
          margin-left: auto;
          background: transparent;
          border: none;
          font-size: 20px;
          color: #667781;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background 0.2s;
        }

        .reverse-close:hover {
          background: rgba(0, 0, 0, 0.05);
        }

        .reverse-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .reverse-item {
          background: rgba(255, 255, 255, 0.5);
          padding: 8px;
          border-radius: 4px;
        }

        .reverse-label {
          font-size: 11px;
          color: #667781;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .reverse-text {
          font-size: 13px;
          color: #111b21;
          line-height: 1.4;
        }

        .reverse-error {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #ef4444;
          font-size: 12px;
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

        /* ==================== 设置面板样式 ==================== */
        
        .wa-translation-settings {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: none;
          justify-content: center;
          align-items: center;
          z-index: 999999;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .wa-translation-settings.show {
          opacity: 1;
        }

        .settings-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: transparent;
          cursor: pointer;
        }

        .settings-container {
          position: relative;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          display: flex;
          flex-direction: column;
          transform: scale(0.9);
          transition: transform 0.3s ease;
        }

        .wa-translation-settings.show .settings-container {
          transform: scale(1);
        }

        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #e5e7eb;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 12px 12px 0 0;
        }

        .settings-header h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
        }

        .settings-close {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          font-size: 24px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        .settings-close:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .settings-content {
          flex: 1;
          overflow-y: auto;
          padding: 0;
        }

        .settings-section {
          padding: 20px 24px;
          border-bottom: 1px solid #f3f4f6;
        }

        .settings-section:last-child {
          border-bottom: none;
        }

        .settings-section h3 {
          margin: 0 0 16px 0;
          font-size: 16px;
          font-weight: 600;
          color: #374151;
        }

        .setting-item {
          margin-bottom: 20px;
        }

        .setting-item:last-child {
          margin-bottom: 0;
        }

        .setting-label {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          font-weight: 500;
          color: #374151;
        }

        .setting-title {
          display: block;
          font-weight: 500;
          color: #374151;
          margin-bottom: 8px;
        }

        .setting-desc {
          margin: 6px 0 0 0;
          font-size: 13px;
          color: #6b7280;
          line-height: 1.4;
        }

        .setting-checkbox {
          width: 18px;
          height: 18px;
          accent-color: #667eea;
          cursor: pointer;
        }

        .setting-select,
        .setting-input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          background: #ffffff;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .setting-select:focus,
        .setting-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .setting-button {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          margin-right: 12px;
        }

        .setting-button:last-child {
          margin-right: 0;
        }

        .setting-button.primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .setting-button.primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .setting-button.secondary {
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        .setting-button.secondary:hover {
          background: #e5e7eb;
        }

        .setting-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }

        .settings-footer {
          padding: 20px 24px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          background: #f9fafb;
          border-radius: 0 0 12px 12px;
        }

        .stats-content {
          background: #f9fafb;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 16px;
        }

        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }

        .stat-item:last-child {
          border-bottom: none;
        }

        .stat-label {
          font-size: 14px;
          color: #6b7280;
        }

        .stat-value {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }

        .settings-message {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 12px 20px;
          border-radius: 8px;
          color: white;
          font-weight: 500;
          z-index: 10000000;
          animation: slideInRight 0.3s ease;
        }

        .settings-message.success {
          background: #10b981;
        }

        .settings-message.error {
          background: #ef4444;
        }

        .settings-message.info {
          background: #3b82f6;
        }

        @keyframes slideInRight {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        /* 设置按钮样式 */
        .wa-settings-btn {
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

        .wa-settings-btn:hover {
          background: rgba(0, 0, 0, 0.05);
          transform: scale(1.1);
        }

        .wa-settings-btn:active {
          transform: scale(0.95);
        }

        /* 响应式设计 */
        @media (max-width: 768px) {
          .settings-container {
            width: 95%;
            max-height: 95vh;
          }
          
          .settings-header {
            padding: 16px 20px;
          }
          
          .settings-section {
            padding: 16px 20px;
          }
          
          .settings-footer {
            padding: 16px 20px;
            flex-direction: column;
          }
          
          .setting-button {
            width: 100%;
            margin-right: 0;
            margin-bottom: 8px;
          }
          
          .setting-button:last-child {
            margin-bottom: 0;
          }
        }

        /* 滚动条样式 */
        .settings-content::-webkit-scrollbar {
          width: 6px;
        }

        .settings-content::-webkit-scrollbar-track {
          background: #f1f5f9;
        }

        .settings-content::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        .settings-content::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
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

      if (this.buttonMonitor) {
        this.buttonMonitor.disconnect();
        this.buttonMonitor = null;
      }

      if (this.buttonCheckInterval) {
        clearInterval(this.buttonCheckInterval);
        this.buttonCheckInterval = null;
      }

      if (this.messageSentObserver) {
        this.messageSentObserver.disconnect();
        this.messageSentObserver = null;
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

  // 暴露到全局（用于调试和手动触发）
  window.WhatsAppTranslation = WhatsAppTranslation;

  // 添加全局快捷函数
  window.translateCurrentChat = function() {
    console.log('[Translation] Manually translating current chat...');
    WhatsAppTranslation.translateExistingMessages();
  };

  // 监听点击事件（点击聊天列表时）
  document.addEventListener('click', function(e) {
    // 检查是否点击了聊天列表项
    const chatItem = e.target.closest('[data-testid="cell-frame-container"]') ||
                     e.target.closest('._ak8l') ||
                     e.target.closest('[role="listitem"]');
    
    if (chatItem) {
      console.log('[Translation] Chat item clicked, will translate after delay');
      // 延迟翻译，等待聊天加载
      setTimeout(() => {
        WhatsAppTranslation.translateExistingMessages();
      }, 1000);
    }
  }, true);

  console.log('[Translation] Global functions exposed: window.translateCurrentChat()');

  // ==================== 设置面板 ====================
  
  /**
   * 翻译设置面板类
   */
  class TranslationSettingsPanel {
    constructor() {
      this.panel = null;
      this.config = null;
      this.isVisible = false;
    }

    /**
     * 创建设置面板
     */
    createPanel() {
      if (this.panel) {
        return this.panel;
      }

      // 创建面板容器
      this.panel = document.createElement('div');
      this.panel.id = 'wa-translation-settings';
      this.panel.className = 'wa-translation-settings';
      
      this.panel.innerHTML = `
        <div class="settings-overlay"></div>
        <div class="settings-container">
          <div class="settings-header">
            <h2>🌐 翻译设置</h2>
            <button class="settings-close">×</button>
          </div>
          
          <div class="settings-content">
            <!-- 基础设置 -->
            <div class="settings-section">
              <h3>📝 基础设置</h3>
              
              <div class="setting-item">
                <label class="setting-label">
                  <input type="checkbox" id="autoTranslate" class="setting-checkbox">
                  <span class="setting-title">自动翻译消息</span>
                </label>
                <p class="setting-desc">接收到新消息时自动显示翻译</p>
              </div>
              
              <div class="setting-item">
                <label class="setting-label">
                  <input type="checkbox" id="groupTranslation" class="setting-checkbox">
                  <span class="setting-title">群组消息翻译</span>
                </label>
                <p class="setting-desc">在群组聊天中也显示翻译</p>
              </div>
              
              <div class="setting-item">
                <label class="setting-title">翻译引擎</label>
                <select id="translationEngine" class="setting-select">
                  <option value="google">Google 翻译（免费）</option>
                  <option value="gpt4">GPT-4</option>
                  <option value="gemini">Google Gemini</option>
                  <option value="deepseek">DeepSeek</option>
                  <option value="custom">自定义 API</option>
                </select>
                <p class="setting-desc">选择翻译服务提供商</p>
              </div>
              
              <div class="setting-item">
                <label class="setting-title">目标语言</label>
                <select id="targetLanguage" class="setting-select">
                  <option value="zh-CN">🇨🇳 中文简体</option>
                  <option value="zh-TW">🇹🇼 中文繁体</option>
                  <option value="en">🇬🇧 英语</option>
                  <option value="vi">🇻🇳 越南语</option>
                  <option value="ja">🇯🇵 日语</option>
                  <option value="ko">🇰🇷 韩语</option>
                  <option value="th">🇹🇭 泰语</option>
                  <option value="id">🇮🇩 印尼语</option>
                  <option value="ms">🇲🇾 马来语</option>
                  <option value="tl">🇵🇭 菲律宾语</option>
                  <option value="my">🇲🇲 缅甸语</option>
                  <option value="km">🇰🇭 高棉语</option>
                  <option value="lo">🇱🇦 老挝语</option>
                  <option value="es">🇪🇸 西班牙语</option>
                  <option value="fr">🇫🇷 法语</option>
                  <option value="de">🇩🇪 德语</option>
                  <option value="it">🇮🇹 意大利语</option>
                  <option value="pt">🇵🇹 葡萄牙语</option>
                  <option value="ru">🇷🇺 俄语</option>
                  <option value="ar">🇸🇦 阿拉伯语</option>
                  <option value="hi">🇮🇳 印地语</option>
                  <option value="bn">🇧🇩 孟加拉语</option>
                  <option value="ur">🇵🇰 乌尔都语</option>
                  <option value="tr">🇹🇷 土耳其语</option>
                  <option value="fa">🇮🇷 波斯语</option>
                  <option value="he">🇮🇱 希伯来语</option>
                  <option value="nl">🇳🇱 荷兰语</option>
                  <option value="pl">🇵🇱 波兰语</option>
                  <option value="uk">🇺🇦 乌克兰语</option>
                  <option value="cs">🇨🇿 捷克语</option>
                  <option value="ro">🇷🇴 罗马尼亚语</option>
                  <option value="sv">🇸🇪 瑞典语</option>
                  <option value="da">🇩🇰 丹麦语</option>
                  <option value="no">🇳🇴 挪威语</option>
                  <option value="fi">🇫🇮 芬兰语</option>
                  <option value="el">🇬🇷 希腊语</option>
                  <option value="hu">🇭🇺 匈牙利语</option>
                  <option value="bg">🇧🇬 保加利亚语</option>
                  <option value="sr">🇷🇸 塞尔维亚语</option>
                  <option value="hr">🇭🇷 克罗地亚语</option>
                  <option value="sk">🇸🇰 斯洛伐克语</option>
                  <option value="sl">🇸🇮 斯洛文尼亚语</option>
                  <option value="lt">🇱🇹 立陶宛语</option>
                  <option value="lv">🇱🇻 拉脱维亚语</option>
                  <option value="et">🇪🇪 爱沙尼亚语</option>
                  <option value="sw">🇰🇪 斯瓦希里语</option>
                  <option value="af">🇿🇦 南非荷兰语</option>
                  <option value="am">🇪🇹 阿姆哈拉语</option>
                </select>
                <p class="setting-desc">消息翻译的目标语言</p>
              </div>
            </div>
            
            <!-- 输入框设置 -->
            <div class="settings-section">
              <h3>✏️ 输入框翻译</h3>
              
              <div class="setting-item">
                <label class="setting-label">
                  <input type="checkbox" id="inputBoxEnabled" class="setting-checkbox">
                  <span class="setting-title">启用输入框翻译按钮</span>
                </label>
                <p class="setting-desc">在输入框旁显示翻译按钮</p>
              </div>
              
              <div class="setting-item">
                <label class="setting-title">输入框翻译目标语言</label>
                <select id="inputBoxTargetLang" class="setting-select">
                  <option value="auto">🤖 自动检测（根据对方语言）</option>
                  <option value="zh-CN">🇨🇳 中文简体</option>
                  <option value="zh-TW">🇹🇼 中文繁体</option>
                  <option value="en">🇬🇧 英语</option>
                  <option value="vi">🇻🇳 越南语</option>
                  <option value="ja">🇯🇵 日语</option>
                  <option value="ko">🇰🇷 韩语</option>
                  <option value="th">🇹🇭 泰语</option>
                  <option value="id">🇮🇩 印尼语</option>
                  <option value="ms">🇲🇾 马来语</option>
                  <option value="tl">🇵🇭 菲律宾语</option>
                  <option value="my">🇲🇲 缅甸语</option>
                  <option value="km">🇰🇭 高棉语</option>
                  <option value="lo">🇱🇦 老挝语</option>
                  <option value="es">🇪🇸 西班牙语</option>
                  <option value="fr">🇫🇷 法语</option>
                  <option value="de">🇩🇪 德语</option>
                  <option value="it">🇮🇹 意大利语</option>
                  <option value="pt">🇵🇹 葡萄牙语</option>
                  <option value="ru">🇷🇺 俄语</option>
                  <option value="ar">🇸🇦 阿拉伯语</option>
                  <option value="hi">🇮🇳 印地语</option>
                  <option value="bn">🇧🇩 孟加拉语</option>
                  <option value="ur">🇵🇰 乌尔都语</option>
                  <option value="tr">🇹🇷 土耳其语</option>
                  <option value="fa">🇮🇷 波斯语</option>
                  <option value="he">🇮🇱 希伯来语</option>
                  <option value="nl">🇳🇱 荷兰语</option>
                  <option value="pl">🇵🇱 波兰语</option>
                  <option value="uk">🇺🇦 乌克兰语</option>
                  <option value="cs">🇨🇿 捷克语</option>
                  <option value="ro">🇷🇴 罗马尼亚语</option>
                  <option value="sv">🇸🇪 瑞典语</option>
                  <option value="da">🇩🇰 丹麦语</option>
                  <option value="no">🇳🇴 挪威语</option>
                  <option value="fi">🇫🇮 芬兰语</option>
                  <option value="el">🇬🇷 希腊语</option>
                  <option value="hu">🇭🇺 匈牙利语</option>
                  <option value="bg">🇧🇬 保加利亚语</option>
                  <option value="sr">🇷🇸 塞尔维亚语</option>
                  <option value="hr">🇭🇷 克罗地亚语</option>
                  <option value="sk">🇸🇰 斯洛伐克语</option>
                  <option value="sl">🇸🇮 斯洛文尼亚语</option>
                  <option value="lt">🇱🇹 立陶宛语</option>
                  <option value="lv">🇱🇻 拉脱维亚语</option>
                  <option value="et">🇪🇪 爱沙尼亚语</option>
                  <option value="sw">🇰🇪 斯瓦希里语</option>
                  <option value="af">🇿🇦 南非荷兰语</option>
                  <option value="am">🇪🇹 阿姆哈拉语</option>
                </select>
                <p class="setting-desc">点击翻译按钮时将输入框内容翻译成的目标语言</p>
              </div>
              
              <div class="setting-item">
                <label class="setting-title">翻译风格（仅 AI 引擎）</label>
                <select id="translationStyle" class="setting-select">
                  <option value="通用">通用</option>
                  <option value="正式">正式</option>
                  <option value="口语化">口语化</option>
                  <option value="亲切">亲切</option>
                  <option value="幽默">幽默</option>
                  <option value="礼貌">礼貌</option>
                  <option value="强硬">强硬</option>
                  <option value="简洁">简洁</option>
                  <option value="激励">激励</option>
                  <option value="中立">中立</option>
                  <option value="专业">专业</option>
                </select>
                <p class="setting-desc">AI 翻译时使用的语气风格</p>
              </div>
            </div>
            
            <!-- 高级设置 -->
            <div class="settings-section">
              <h3>⚙️ 高级设置</h3>
              
              <div class="setting-item">
                <label class="setting-label">
                  <input type="checkbox" id="blockChinese" class="setting-checkbox">
                  <span class="setting-title">禁发中文</span>
                </label>
                <p class="setting-desc">拦截包含中文的消息发送</p>
              </div>
              
              <div class="setting-item">
                <label class="setting-label">
                  <input type="checkbox" id="friendIndependent" class="setting-checkbox">
                  <span class="setting-title">好友独立配置</span>
                </label>
                <p class="setting-desc">为不同联系人设置独立的翻译配置</p>
              </div>
              
              <div class="setting-item">
                <label class="setting-label">
                  <input type="checkbox" id="realtimeTranslation" class="setting-checkbox">
                  <span class="setting-title">实时翻译预览</span>
                </label>
                <p class="setting-desc">输入时实时显示翻译预览</p>
              </div>
              
              <div class="setting-item">
                <label class="setting-label">
                  <input type="checkbox" id="reverseTranslation" class="setting-checkbox">
                  <span class="setting-title">反向翻译验证</span>
                </label>
                <p class="setting-desc">显示反向翻译以验证准确性</p>
              </div>
            </div>
            
            <!-- 好友独立配置 -->
            <div class="settings-section" id="friendConfigSection" style="display: none;">
              <h3>👥 当前联系人配置</h3>
              
              <div class="setting-item">
                <label class="setting-label">
                  <input type="checkbox" id="currentFriendEnabled" class="setting-checkbox">
                  <span class="setting-title">为当前联系人启用独立配置</span>
                </label>
                <p class="setting-desc" id="currentContactName">当前联系人：未知</p>
              </div>
              
              <div id="friendConfigOptions" style="display: none;">
                <div class="setting-item">
                  <label class="setting-title">目标语言</label>
                  <select id="friendTargetLang" class="setting-select">
                    <option value="zh-CN">🇨🇳 中文简体</option>
                    <option value="zh-TW">🇹🇼 中文繁体</option>
                    <option value="en">🇬🇧 英语</option>
                    <option value="vi">🇻🇳 越南语</option>
                    <option value="ja">🇯🇵 日语</option>
                    <option value="ko">🇰🇷 韩语</option>
                    <option value="th">🇹🇭 泰语</option>
                    <option value="id">🇮🇩 印尼语</option>
                    <option value="ms">🇲🇾 马来语</option>
                    <option value="tl">🇵🇭 菲律宾语</option>
                    <option value="my">🇲🇲 缅甸语</option>
                    <option value="km">🇰🇭 高棉语</option>
                    <option value="lo">🇱🇦 老挝语</option>
                    <option value="es">🇪🇸 西班牙语</option>
                    <option value="fr">🇫🇷 法语</option>
                    <option value="de">🇩🇪 德语</option>
                    <option value="it">🇮🇹 意大利语</option>
                    <option value="pt">🇵🇹 葡萄牙语</option>
                    <option value="ru">🇷🇺 俄语</option>
                    <option value="ar">🇸🇦 阿拉伯语</option>
                    <option value="hi">🇮🇳 印地语</option>
                    <option value="bn">🇧🇩 孟加拉语</option>
                    <option value="ur">🇵🇰 乌尔都语</option>
                    <option value="tr">🇹🇷 土耳其语</option>
                    <option value="fa">🇮🇷 波斯语</option>
                    <option value="he">🇮🇱 希伯来语</option>
                    <option value="nl">🇳🇱 荷兰语</option>
                    <option value="pl">🇵🇱 波兰语</option>
                    <option value="uk">🇺🇦 乌克兰语</option>
                    <option value="cs">🇨🇿 捷克语</option>
                    <option value="ro">🇷🇴 罗马尼亚语</option>
                    <option value="sv">🇸🇪 瑞典语</option>
                    <option value="da">🇩🇰 丹麦语</option>
                    <option value="no">🇳🇴 挪威语</option>
                    <option value="fi">🇫🇮 芬兰语</option>
                    <option value="el">🇬🇷 希腊语</option>
                    <option value="hu">🇭🇺 匈牙利语</option>
                    <option value="bg">🇧🇬 保加利亚语</option>
                    <option value="sr">🇷🇸 塞尔维亚语</option>
                    <option value="hr">🇭🇷 克罗地亚语</option>
                    <option value="sk">🇸🇰 斯洛伐克语</option>
                    <option value="sl">🇸🇮 斯洛文尼亚语</option>
                    <option value="lt">🇱🇹 立陶宛语</option>
                    <option value="lv">🇱🇻 拉脱维亚语</option>
                    <option value="et">🇪🇪 爱沙尼亚语</option>
                    <option value="sw">🇰🇪 斯瓦希里语</option>
                    <option value="af">🇿🇦 南非荷兰语</option>
                    <option value="am">🇪🇹 阿姆哈拉语</option>
                  </select>
                  <p class="setting-desc">该联系人消息的翻译目标语言</p>
                </div>
                
                <div class="setting-item">
                  <label class="setting-label">
                    <input type="checkbox" id="friendBlockChinese" class="setting-checkbox">
                    <span class="setting-title">对该联系人禁发中文</span>
                  </label>
                  <p class="setting-desc">向该联系人发送消息时拦截中文</p>
                </div>
              </div>
              
              <div class="setting-item">
                <button id="manageFriendsBtn" class="setting-button secondary">管理所有联系人配置</button>
              </div>
            </div>
            
            <!-- API 配置 -->
            <div class="settings-section" id="apiConfigSection" style="display: none;">
              <h3>🔑 API 配置</h3>
              
              <div class="setting-item">
                <label class="setting-title">API 密钥</label>
                <input type="password" id="apiKey" class="setting-input" placeholder="输入 API 密钥">
                <p class="setting-desc">翻译服务的 API 密钥（仅本地存储）</p>
              </div>
              
              <div class="setting-item" id="customEndpointItem" style="display: none;">
                <label class="setting-title">API 端点</label>
                <input type="text" id="apiEndpoint" class="setting-input" placeholder="https://api.example.com/v1/chat/completions">
                <p class="setting-desc">自定义 API 的端点地址</p>
              </div>
              
              <div class="setting-item" id="customModelItem" style="display: none;">
                <label class="setting-title">模型名称</label>
                <input type="text" id="apiModel" class="setting-input" placeholder="gpt-4">
                <p class="setting-desc">使用的模型名称</p>
              </div>
              
              <button id="testApiBtn" class="setting-button">测试连接</button>
            </div>
            
            <!-- 统计信息 -->
            <div class="settings-section">
              <h3>📊 使用统计</h3>
              <div id="statsContent" class="stats-content">
                <p>加载中...</p>
              </div>
              <button id="clearCacheBtn" class="setting-button secondary">清除缓存</button>
            </div>
          </div>
          
          <div class="settings-footer">
            <button id="resetBtn" class="setting-button secondary">重置设置</button>
            <button id="saveBtn" class="setting-button primary">保存设置</button>
          </div>
        </div>
      `;

      // 添加到页面
      document.body.appendChild(this.panel);
      
      // 绑定事件
      this.bindEvents();
      
      return this.panel;
    }

    /**
     * 绑定事件
     */
    bindEvents() {
      // 关闭按钮
      const closeBtn = this.panel.querySelector('.settings-close');
      closeBtn.onclick = () => this.hide();

      // 遮罩层点击关闭
      const overlay = this.panel.querySelector('.settings-overlay');
      overlay.onclick = () => this.hide();

      // 翻译引擎变化
      const engineSelect = this.panel.querySelector('#translationEngine');
      engineSelect.addEventListener('change', () => {
        this.updateAPIConfigVisibility();
      });

      // 测试 API 按钮
      const testApiBtn = this.panel.querySelector('#testApiBtn');
      testApiBtn.addEventListener('click', () => {
        this.testAPI();
      });

      // 保存按钮
      const saveBtn = this.panel.querySelector('#saveBtn');
      saveBtn.addEventListener('click', () => {
        this.saveSettings();
      });

      // 重置按钮
      const resetBtn = this.panel.querySelector('#resetBtn');
      resetBtn.addEventListener('click', () => {
        this.resetSettings();
      });

      // 清除缓存按钮
      const clearCacheBtn = this.panel.querySelector('#clearCacheBtn');
      clearCacheBtn.addEventListener('click', () => {
        this.clearCache();
      });
      
      // 好友独立配置开关
      const friendIndependentCheckbox = this.panel.querySelector('#friendIndependent');
      friendIndependentCheckbox.addEventListener('change', () => {
        this.updateFriendConfigVisibility();
      });
      
      // 当前好友配置开关
      const currentFriendCheckbox = this.panel.querySelector('#currentFriendEnabled');
      currentFriendCheckbox.addEventListener('change', () => {
        this.updateFriendConfigOptions();
      });
      
      // 管理所有联系人配置按钮
      const manageFriendsBtn = this.panel.querySelector('#manageFriendsBtn');
      manageFriendsBtn.addEventListener('click', () => {
        this.showFriendConfigManager();
      });
    }

    /**
     * 显示设置面板
     */
    async show() {
      if (!this.panel) {
        this.createPanel();
      }

      // 加载当前配置
      await this.loadSettings();
      
      // 显示面板
      this.panel.style.display = 'flex';
      this.isVisible = true;
      
      // 添加动画
      setTimeout(() => {
        this.panel.classList.add('show');
      }, 10);
    }

    /**
     * 隐藏设置面板
     */
    hide() {
      if (!this.panel || !this.isVisible) return;
      
      this.panel.classList.remove('show');
      
      setTimeout(() => {
        this.panel.style.display = 'none';
        this.isVisible = false;
      }, 300);
    }

    /**
     * 加载设置
     */
    async loadSettings() {
      try {
        const response = await window.translationAPI.getConfig('default');
        if (response.success) {
          this.config = response.data;
          this.updateUI();
        }
      } catch (error) {
        console.error('[Settings] Failed to load settings:', error);
      }
    }

    /**
     * 更新 UI
     */
    updateUI() {
      if (!this.config) return;

      // 基础设置
      this.panel.querySelector('#autoTranslate').checked = this.config.global.autoTranslate;
      this.panel.querySelector('#groupTranslation').checked = this.config.global.groupTranslation;
      this.panel.querySelector('#translationEngine').value = this.config.global.engine;
      this.panel.querySelector('#targetLanguage').value = this.config.global.targetLang;

      // 输入框设置
      this.panel.querySelector('#inputBoxEnabled').checked = this.config.inputBox.enabled;
      this.panel.querySelector('#inputBoxTargetLang').value = this.config.inputBox.targetLang || 'auto';
      this.panel.querySelector('#translationStyle').value = this.config.inputBox.style;

      // 高级设置
      this.panel.querySelector('#blockChinese').checked = this.config.advanced.blockChinese;
      this.panel.querySelector('#friendIndependent').checked = this.config.advanced.friendIndependent;
      this.panel.querySelector('#realtimeTranslation').checked = this.config.advanced.realtime || false;
      this.panel.querySelector('#reverseTranslation').checked = this.config.advanced.reverseTranslation || false;

      // 更新好友配置显示
      this.updateFriendConfigVisibility();
      this.loadCurrentFriendConfig();

      // 加载统计信息
      this.loadStats();
    }

    /**
     * 更新 API 配置显示
     */
    updateAPIConfigVisibility() {
      const engine = this.panel.querySelector('#translationEngine').value;
      const apiSection = this.panel.querySelector('#apiConfigSection');
      const customEndpoint = this.panel.querySelector('#customEndpointItem');
      const customModel = this.panel.querySelector('#customModelItem');

      if (engine === 'google') {
        apiSection.style.display = 'none';
      } else {
        apiSection.style.display = 'block';
        
        if (engine === 'custom') {
          customEndpoint.style.display = 'block';
          customModel.style.display = 'block';
        } else {
          customEndpoint.style.display = 'none';
          customModel.style.display = 'none';
        }
      }
    }

    /**
     * 测试 API
     */
    async testAPI() {
      const testBtn = this.panel.querySelector('#testApiBtn');
      const originalText = testBtn.textContent;
      
      testBtn.textContent = '测试中...';
      testBtn.disabled = true;
      
      try {
        const result = await window.translationAPI.translate({
          text: 'Hello, this is a test.',
          sourceLang: 'en',
          targetLang: 'zh-CN',
          engineName: this.panel.querySelector('#translationEngine').value
        });
        
        if (result.success) {
          this.showMessage('API 测试成功！翻译结果：' + result.data.translatedText, 'success');
        } else {
          this.showMessage('API 测试失败：' + result.error, 'error');
        }
      } catch (error) {
        this.showMessage('API 测试失败：' + error.message, 'error');
      } finally {
        testBtn.textContent = originalText;
        testBtn.disabled = false;
      }
    }

    /**
     * 保存设置
     */
    async saveSettings() {
      try {
        // 保存当前联系人配置
        this.saveCurrentFriendConfig();
        
        // 收集表单数据
        const newConfig = {
          global: {
            autoTranslate: this.panel.querySelector('#autoTranslate').checked,
            engine: this.panel.querySelector('#translationEngine').value,
            sourceLang: 'auto',
            targetLang: this.panel.querySelector('#targetLanguage').value,
            groupTranslation: this.panel.querySelector('#groupTranslation').checked
          },
          inputBox: {
            enabled: this.panel.querySelector('#inputBoxEnabled').checked,
            targetLang: this.panel.querySelector('#inputBoxTargetLang').value,
            style: this.panel.querySelector('#translationStyle').value
          },
          advanced: {
            friendIndependent: this.panel.querySelector('#friendIndependent').checked,
            blockChinese: this.panel.querySelector('#blockChinese').checked,
            realtime: this.panel.querySelector('#realtimeTranslation').checked,
            reverseTranslation: this.panel.querySelector('#reverseTranslation').checked,
            voiceTranslation: false,
            imageTranslation: false
          },
          friendConfigs: this.config.friendConfigs || {}
        };

        // 保存配置
        const response = await window.translationAPI.saveConfig('default', newConfig);
        
        if (response.success) {
          // 更新本地配置
          this.config = newConfig;
          
          // 同步更新 WhatsAppTranslation 的配置
          if (window.WhatsAppTranslation) {
            window.WhatsAppTranslation.config = newConfig;
            
            // 重新初始化输入框功能
            window.WhatsAppTranslation.observeInputBox();
          }
          
          // 显示成功消息
          this.showMessage('设置已保存并生效！', 'success');
          
          // 关闭设置面板
          setTimeout(() => {
            this.hide();
          }, 1500);
        } else {
          this.showMessage('保存失败：' + response.error, 'error');
        }
      } catch (error) {
        console.error('[Settings] Save error:', error);
        this.showMessage('保存失败：' + error.message, 'error');
      }
    }

    /**
     * 重置设置
     */
    resetSettings() {
      if (confirm('确定要重置所有设置吗？这将清除所有自定义配置。')) {
        // 重置为默认配置
        this.config = {
          global: {
            autoTranslate: false,
            engine: 'google',
            sourceLang: 'auto',
            targetLang: 'zh-CN',
            groupTranslation: false
          },
          inputBox: {
            enabled: false,
            targetLang: 'auto',
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
        
        this.updateUI();
        this.showMessage('设置已重置为默认值', 'info');
      }
    }

    /**
     * 清除缓存
     */
    async clearCache() {
      if (confirm('确定要清除所有翻译缓存吗？')) {
        try {
          const response = await window.translationAPI.clearCache();
          if (response.success) {
            this.showMessage('缓存已清除', 'success');
            this.loadStats(); // 重新加载统计
          } else {
            this.showMessage('清除缓存失败：' + response.error, 'error');
          }
        } catch (error) {
          this.showMessage('清除缓存失败：' + error.message, 'error');
        }
      }
    }

    /**
     * 加载统计信息
     */
    async loadStats() {
      try {
        const response = await window.translationAPI.getStats();
        if (response.success) {
          const stats = response.data;
          const statsContent = this.panel.querySelector('#statsContent');
          
          statsContent.innerHTML = `
            <div class="stat-item">
              <span class="stat-label">总翻译次数：</span>
              <span class="stat-value">${stats.translation.totalRequests || 0}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">成功次数：</span>
              <span class="stat-value">${stats.translation.successCount || 0}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">缓存命中率：</span>
              <span class="stat-value">${stats.translation.cacheStats?.hitRate || '0%'}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">缓存大小：</span>
              <span class="stat-value">${stats.translation.cacheStats?.memorySize || 0} 条</span>
            </div>
          `;
        }
      } catch (error) {
        console.error('[Settings] Failed to load stats:', error);
      }
    }

    /**
     * 更新好友配置区域显示
     */
    updateFriendConfigVisibility() {
      const friendIndependent = this.panel.querySelector('#friendIndependent').checked;
      const friendConfigSection = this.panel.querySelector('#friendConfigSection');
      
      if (friendIndependent) {
        friendConfigSection.style.display = 'block';
      } else {
        friendConfigSection.style.display = 'none';
      }
    }

    /**
     * 更新好友配置选项显示
     */
    updateFriendConfigOptions() {
      const enabled = this.panel.querySelector('#currentFriendEnabled').checked;
      const options = this.panel.querySelector('#friendConfigOptions');
      
      if (enabled) {
        options.style.display = 'block';
      } else {
        options.style.display = 'none';
      }
    }

    /**
     * 加载当前联系人配置
     */
    loadCurrentFriendConfig() {
      const contactId = window.WhatsAppTranslation.getCurrentContactId();
      
      if (!contactId) {
        this.panel.querySelector('#currentContactName').textContent = '当前联系人：未打开聊天窗口';
        this.panel.querySelector('#currentFriendEnabled').disabled = true;
        return;
      }
      
      // 显示联系人名称
      const header = document.querySelector('[data-testid="conversation-info-header"]');
      const contactName = header ? header.textContent.trim() : contactId;
      this.panel.querySelector('#currentContactName').textContent = `当前联系人：${contactName}`;
      this.panel.querySelector('#currentFriendEnabled').disabled = false;
      
      // 加载该联系人的配置
      const friendConfig = this.config.friendConfigs && this.config.friendConfigs[contactId];
      
      if (friendConfig && friendConfig.enabled) {
        this.panel.querySelector('#currentFriendEnabled').checked = true;
        this.panel.querySelector('#friendTargetLang').value = friendConfig.targetLang || 'en';
        this.panel.querySelector('#friendBlockChinese').checked = friendConfig.blockChinese || false;
        this.updateFriendConfigOptions();
      } else {
        this.panel.querySelector('#currentFriendEnabled').checked = false;
        this.panel.querySelector('#friendTargetLang').value = 'en';
        this.panel.querySelector('#friendBlockChinese').checked = false;
        this.updateFriendConfigOptions();
      }
    }

    /**
     * 保存当前联系人配置
     */
    saveCurrentFriendConfig() {
      const contactId = window.WhatsAppTranslation.getCurrentContactId();
      
      if (!contactId) {
        return;
      }
      
      if (!this.config.friendConfigs) {
        this.config.friendConfigs = {};
      }
      
      const enabled = this.panel.querySelector('#currentFriendEnabled').checked;
      
      if (enabled) {
        this.config.friendConfigs[contactId] = {
          enabled: true,
          targetLang: this.panel.querySelector('#friendTargetLang').value,
          blockChinese: this.panel.querySelector('#friendBlockChinese').checked
        };
      } else {
        // 删除该联系人的配置
        delete this.config.friendConfigs[contactId];
      }
    }

    /**
     * 显示好友配置管理器
     */
    showFriendConfigManager() {
      const friendConfigs = this.config.friendConfigs || {};
      const configCount = Object.keys(friendConfigs).length;
      
      let message = `已配置 ${configCount} 个联系人的独立翻译设置\n\n`;
      
      if (configCount > 0) {
        message += '配置列表：\n';
        for (const [contactId, config] of Object.entries(friendConfigs)) {
          if (config.enabled) {
            message += `• ${contactId}: ${config.targetLang}${config.blockChinese ? ' (禁发中文)' : ''}\n`;
          }
        }
        message += '\n要清除某个联系人的配置，请打开该聊天窗口，在设置中取消勾选"为当前联系人启用独立配置"';
      } else {
        message += '暂无配置的联系人\n\n要为联系人设置独立配置，请打开该聊天窗口，在设置中勾选"为当前联系人启用独立配置"';
      }
      
      alert(message);
    }

    /**
     * 显示消息
     */
    showMessage(message, type = 'info') {
      // 创建消息元素
      const messageEl = document.createElement('div');
      messageEl.className = `settings-message ${type}`;
      messageEl.textContent = message;
      
      // 添加到页面
      document.body.appendChild(messageEl);
      
      // 3秒后移除
      setTimeout(() => {
        if (messageEl.parentNode) {
          messageEl.parentNode.removeChild(messageEl);
        }
      }, 3000);
    }
  }

  // 创建设置面板实例
  const settingsPanel = new TranslationSettingsPanel();
  
  // 暴露到全局
  window.TranslationSettings = settingsPanel;
  
  // 添加设置按钮到 WhatsApp 界面
  function addSettingsButton() {
    // 检查按钮是否已存在
    if (document.getElementById('wa-translation-settings-btn')) {
      console.log('[Translation] Settings button already exists');
      return;
    }

    // 查找左侧边栏的 header（包含 WhatsApp logo 的区域）
    const sidebarHeader = document.querySelector('header');
    
    if (!sidebarHeader) {
      console.warn('[Translation] Sidebar header not found, retrying...');
      setTimeout(addSettingsButton, 1000);
      return;
    }

    // 创建设置按钮
    const settingsBtn = document.createElement('button');
    settingsBtn.id = 'wa-translation-settings-btn';
    settingsBtn.className = 'wa-settings-btn-header';
    settingsBtn.innerHTML = '⚙️';
    settingsBtn.title = '翻译设置';
    settingsBtn.type = 'button';
    settingsBtn.setAttribute('aria-label', '翻译设置');
    
    settingsBtn.onclick = () => {
      console.log('[Translation] Settings button clicked');
      settingsPanel.show();
    };

    // 添加按钮样式 - 与 WhatsApp UI 风格一致
    settingsBtn.style.cssText = `
      padding: 8px;
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 18px;
      border-radius: 50%;
      transition: background 0.2s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      margin: 0 4px;
    `;

    settingsBtn.onmouseenter = () => {
      settingsBtn.style.background = 'rgba(0, 0, 0, 0.05)';
    };

    settingsBtn.onmouseleave = () => {
      settingsBtn.style.background = 'transparent';
    };

    // 查找 header 中第一个 div（通常包含 logo）
    const headerDivs = sidebarHeader.querySelectorAll(':scope > div');
    const firstDiv = headerDivs[0];
    
    if (firstDiv) {
      // 插入到第一个 div 的开头（logo 的左边）
      firstDiv.insertBefore(settingsBtn, firstDiv.firstChild);
      console.log('[Translation] Settings button added before logo');
    } else {
      // 备选：直接添加到 header 开头
      sidebarHeader.insertBefore(settingsBtn, sidebarHeader.firstChild);
      console.log('[Translation] Settings button added to header start');
    }
  }

  // 立即添加设置按钮
  addSettingsButton();
  
  // 也在延迟后再次尝试（以防页面还没加载完）
  setTimeout(addSettingsButton, 2000);
  
  // 监听 header 变化，确保按钮始终存在
  const headerObserver = new MutationObserver(() => {
    if (!document.getElementById('wa-translation-settings-btn')) {
      console.log('[Translation] Settings button disappeared, re-adding...');
      addSettingsButton();
    }
  });
  
  // 观察整个 body，检测 header 的变化
  setTimeout(() => {
    headerObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }, 3000);

})();
