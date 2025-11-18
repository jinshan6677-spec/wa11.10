/**
 * 消息处理器
 * 负责监听和处理聊天消息的翻译
 */

const { EVENTS } = require('../constants/config');

class MessageHandler {
  constructor(eventManager, configManager, translator, languageDetector) {
    this.eventManager = eventManager;
    this.configManager = configManager;
    this.translator = translator;
    this.languageDetector = languageDetector;
    this.observer = null;
    this.isInitialized = false;
  }

  /**
   * 初始化消息处理器
   */
  async init() {
    if (this.isInitialized) {
      console.log('[MessageHandler] Already initialized');
      return;
    }

    try {
      await this.waitForWhatsApp();
      this.observeMessages();
      this.translateExistingMessages();
      
      this.isInitialized = true;
      console.log('[MessageHandler] Initialized successfully');
    } catch (error) {
      console.error('[MessageHandler] Initialization failed:', error);
    }
  }

  /**
   * 等待 WhatsApp Web 加载完成
   */
  waitForWhatsApp() {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        const chatContainer = document.querySelector('[data-testid="conversation-panel-messages"]') ||
                             document.querySelector('#main') ||
                             document.querySelector('[role="application"]');
        
        if (chatContainer) {
          clearInterval(checkInterval);
          setTimeout(resolve, 1000);
        }
      }, 500);

      setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, 30000);
    });
  }

  /**
   * 监听消息
   */
  observeMessages() {
    const mainContainer = document.querySelector('#main');
    if (!mainContainer) {
      console.warn('[MessageHandler] Main container not found');
      return;
    }

    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            if (this.isMessageNode(node)) {
              this.handleNewMessage(node);
            }
            
            const messages = node.querySelectorAll('.message-in, .message-out');
            messages.forEach(msg => {
              if (!msg.querySelector('.wa-translation-result')) {
                this.handleNewMessage(msg);
              }
            });
          }
        });
      });
    });

    this.observer.observe(mainContainer, {
      childList: true,
      subtree: true
    });
  }

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
  }

  /**
   * 处理新消息
   */
  async handleNewMessage(messageNode) {
    try {
      // 检查配置
      if (!this.configManager.getConfig()) {
        return;
      }

      // 检查是否已经翻译过
      if (messageNode.querySelector('.wa-translation-result')) {
        return;
      }

      // 检查自动翻译是否启用
      if (!this.configManager.get('global.autoTranslate')) {
        return;
      }

      // 检查群组翻译
      const isGroup = this.isGroupChat();
      if (isGroup && !this.configManager.get('global.groupTranslation')) {
        return;
      }

      // 提取消息信息
      const messageInfo = await this.extractMessageInfo(messageNode);
      if (!messageInfo.text) {
        return;
      }

      // 触发消息检测事件
      this.eventManager.emit(EVENTS.MESSAGE_DETECTED, {
        messageNode,
        messageInfo
      });

      // 翻译消息
      await this.translateMessage(messageNode, messageInfo.text, messageInfo.senderInfo);

    } catch (error) {
      console.error('[MessageHandler] Error handling message:', error);
    }
  }

  /**
   * 提取消息信息
   */
  async extractMessageInfo(messageNode) {
    try {
      // 提取消息文本
      const textElement = messageNode.querySelector('.selectable-text[dir="ltr"], .selectable-text[dir="rtl"]') ||
                         messageNode.querySelector('.selectable-text') ||
                         messageNode.querySelector('[data-testid="conversation-text"]');

      const text = textElement ? textElement.textContent.trim() : '';

      // 提取发送者信息
      const senderInfo = {
        contactId: this.getCurrentContactId(),
        senderName: null,
        senderId: null,
        isGroupMessage: this.isGroupChat()
      };

      // 群组消息中提取发言人信息
      if (senderInfo.isGroupMessage) {
        const senderName = this.extractGroupSenderName(messageNode);
        if (senderName) {
          senderInfo.senderName = senderName;
          senderInfo.senderId = this.languageDetector.getSenderId(senderName, senderInfo.contactId);
          
          // 更新群组语言统计
          await this.languageDetector.updateGroupLanguageStats(senderInfo.contactId, text);
        }
      }

      return { text, senderInfo };
    } catch (error) {
      console.error('[MessageHandler] Error extracting message info:', error);
      return { text: '', senderInfo: { contactId: this.getCurrentContactId(), senderName: null, senderId: null, isGroupMessage: false } };
    }
  }

  /**
   * 翻译消息
   */
  async translateMessage(messageNode, text, senderInfo) {
    try {
      // 智能目标语言选择
      const targetLang = await this.languageDetector.getSmartTargetLang(senderInfo.contactId, text, senderInfo);
      
      // 改进的中文检测
      if (targetLang.startsWith('zh') && this.languageDetector.isChinese(text)) {
        console.log('[MessageHandler] Smart Chinese detection: skipping Chinese message');
        messageNode.setAttribute('data-translation-skipped', 'true');
        return;
      }

      // 翻译消息
      const result = await this.translator.translate(text, {
        sourceLang: this.configManager.get('global.sourceLang'),
        targetLang: targetLang,
        engineName: this.configManager.get('global.engine')
      });

      if (result.translatedText) {
        this.displayTranslation(messageNode, result);
        console.log(`[MessageHandler] ✅ Message translated: "${result.translatedText}"`);
      }

    } catch (error) {
      console.error('[MessageHandler] Translation failed:', error);
      this.displayError(messageNode, error.message);
    }
  }

  /**
   * 显示翻译结果
   */
  displayTranslation(messageNode, result) {
    // 创建翻译结果元素
    const translationDiv = document.createElement('div');
    translationDiv.className = 'wa-translation-result';
    translationDiv.style.cssText = `
      margin-top: 4px;
      padding: 4px 8px;
      background: rgba(0, 124, 186, 0.1);
      border-left: 3px solid #007cba;
      font-size: 13px;
      color: #333;
      border-radius: 0 4px 4px 0;
    `;
    translationDiv.textContent = result.translatedText;

    // 找到消息内容的父容器
    const messageContent = messageNode.querySelector('.selectable-text') || messageNode;
    const contentContainer = messageContent.parentElement;
    
    if (contentContainer && !contentContainer.querySelector('.wa-translation-result')) {
      contentContainer.appendChild(translationDiv);
    }

    // 触发翻译完成事件
    this.eventManager.emit(EVENTS.MESSAGE_TRANSLATED, {
      messageNode,
      result
    });
  }

  /**
   * 显示翻译错误
   */
  displayError(messageNode, errorMessage) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'wa-translation-error';
    errorDiv.style.cssText = `
      margin-top: 4px;
      padding: 4px 8px;
      background: rgba(220, 53, 69, 0.1);
      border-left: 3px solid #dc3545;
      font-size: 12px;
      color: #dc3545;
      border-radius: 0 4px 4px 0;
    `;
    errorDiv.textContent = `翻译失败: ${errorMessage}`;

    const messageContent = messageNode.querySelector('.selectable-text') || messageNode;
    const contentContainer = messageContent.parentElement;
    
    if (contentContainer && !contentContainer.querySelector('.wa-translation-error')) {
      contentContainer.appendChild(errorDiv);
    }

    this.eventManager.emit(EVENTS.TRANSLATION_ERROR, {
      messageNode,
      error: errorMessage
    });
  }

  /**
   * 翻译已存在的消息
   */
  translateExistingMessages() {
    const existingMessages = document.querySelectorAll('.message-in, .message-out');
    console.log(`[MessageHandler] Found ${existingMessages.length} existing messages`);
    
    existingMessages.forEach(msg => {
      if (!msg.querySelector('.wa-translation-result')) {
        this.handleNewMessage(msg);
      }
    });
  }

  /**
   * 提取群组发言人名称
   */
  extractGroupSenderName(messageNode) {
    try {
      const senderElement = messageNode.querySelector('._21w3g') || 
                           messageNode.querySelector('._21w3g-0') ||
                           messageNode.querySelector('[dir="auto"]');
      
      if (senderElement) {
        const senderName = senderElement.textContent.trim();
        if (senderName && !this.isOwnMessage(messageNode)) {
          return senderName;
        }
      }
      
      return null;
    } catch (error) {
      console.error('[MessageHandler] Error extracting group sender name:', error);
      return null;
    }
  }

  /**
   * 判断是否为自己的消息
   */
  isOwnMessage(messageNode) {
    return messageNode.classList.contains('message-out') || 
           messageNode.classList.contains('_1urd3');
  }

  /**
   * 判断是否群聊
   */
  isGroupChat() {
    try {
      const header = document.querySelector('#main header [data-testid="conversation-info-header"]');
      if (header) {
        const groupIcon = header.querySelector('[data-testid="group-icon"], ._2de4i');
        return !!groupIcon;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取当前联系人ID
   */
  getCurrentContactId() {
    try {
      const urlMatch = window.location.href.match(/\/chat\/([^/]+)/);
      if (urlMatch && urlMatch[1]) {
        return decodeURIComponent(urlMatch[1]);
      }
      
      const header = document.querySelector('#main header [data-testid="conversation-info-header"]') ||
                    document.querySelector('#main header span[dir="auto"]');
      
      if (header) {
        return header.textContent.trim();
      }
      
      return null;
    } catch (error) {
      console.error('[MessageHandler] Error getting contact ID:', error);
      return null;
    }
  }

  /**
   * 清理资源
   */
  cleanup() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.isInitialized = false;
  }
}

module.exports = MessageHandler;