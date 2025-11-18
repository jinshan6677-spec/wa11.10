/**
 * 输入框翻译器
 * 负责输入框的翻译功能，包括监听、按钮管理、实时预览等
 */

const { UI_CONFIG, EVENTS } = require('../constants/config');
const { TRANSLATION_MODES } = require('../constants/languages');

class InputTranslator {
  constructor(eventManager, configManager, translator) {
    this.eventManager = eventManager;
    this.configManager = configManager;
    this.translator = translator;
    this.observer = null;
    this.inputObserver = null;
    this.realtimeTimer = null;
    this.isInitialized = false;
    this.currentInputBox = null;
    this.realtimePreview = null;
  }

  /**
   * 初始化输入框翻译器
   */
  async init() {
    if (this.isInitialized) {
      console.log('[InputTranslator] Already initialized');
      return;
    }

    try {
      // 监听输入框
      this.observeInputBox();
      
      // 监听按钮变化
      this.startButtonMonitoring();
      
      this.isInitialized = true;
      console.log('[InputTranslator] Initialized successfully');
    } catch (error) {
      console.error('[InputTranslator] Initialization failed:', error);
    }
  }

  /**
   * 监听输入框
   */
  observeInputBox() {
    console.log('[InputTranslator] Setting up input box observer');
    
    // 断开旧的观察器
    if (this.inputObserver) {
      this.inputObserver.disconnect();
    }

    // 创建 MutationObserver 观察输入框
    this.inputObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            // 检查是否是输入框
            const inputBox = this.findInputBox(node);
            if (inputBox && !inputBox.querySelector('.wa-translate-btn')) {
              this.setupInputBoxTranslation(inputBox);
            }
            
            // 也检查子节点
            const childInputBox = node.querySelector ? 
              this.findInputBox(node.querySelector('div[contenteditable="true"]')) : null;
            if (childInputBox && !childInputBox.querySelector('.wa-translate-btn')) {
              this.setupInputBoxTranslation(childInputBox);
            }
          }
        });
      });
    });

    // 开始观察
    this.inputObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    // 处理当前页面中已存在的输入框
    this.setupExistingInputBoxes();
  }

  /**
   * 查找输入框
   * @param {Element} element - DOM元素
   * @returns {Element|null} 输入框元素
   */
  findInputBox(element) {
    if (!element) return null;
    
    // WhatsApp Web 输入框选择器
    const selectors = [
      'div[contenteditable="true"][data-tab="10"]',
      'div[contenteditable="true"][data-testid="conversation-compose-box-input"]',
      'div[contenteditable="true"]'
    ];

    for (const selector of selectors) {
      const inputBox = element.matches ? 
        (element.matches(selector) ? element : element.querySelector(selector)) :
        element.querySelector(selector);
      
      if (inputBox) {
        return inputBox;
      }
    }

    return null;
  }

  /**
   * 设置已存在的输入框
   */
  setupExistingInputBoxes() {
    const inputBoxes = document.querySelectorAll('div[contenteditable="true"][data-tab="10"], div[contenteditable="true"][data-testid="conversation-compose-box-input"]');
    inputBoxes.forEach(inputBox => {
      if (!inputBox.querySelector('.wa-translate-btn')) {
        this.setupInputBoxTranslation(inputBox);
      }
    });
  }

  /**
   * 为输入框设置翻译功能
   * @param {Element} inputBox - 输入框元素
   */
  setupInputBoxTranslation(inputBox) {
    if (!inputBox || this.currentInputBox === inputBox) {
      return;
    }

    console.log('[InputTranslator] Setting up translation for input box:', inputBox);

    // 设置发送监听
    this.setupSendMonitoring(inputBox);
    
    // 添加翻译按钮
    this.addTranslateButton(inputBox);
    
    // 添加语言选择器
    this.addLanguageSelector(inputBox);
    
    // 添加翻译模式切换
    this.addTranslationModeToggle(inputBox);
    
    // 设置实时翻译
    this.setupRealtimeTranslation(inputBox);

    this.currentInputBox = inputBox;
  }

  /**
   * 设置发送监听
   * @param {Element} inputBox - 输入框元素
   */
  setupSendMonitoring(inputBox) {
    const sendButton = inputBox.closest('div[role="group"]')?.querySelector('button[data-testid="send"], button[data-testid="conversation-compose-box-send"], button[aria-label="Send"]');
    
    if (sendButton && !sendButton.dataset.waMonitoringAdded) {
      sendButton.dataset.waMonitoringAdded = 'true';
      
      sendButton.addEventListener('click', async (event) => {
        await this.handleSendClick(event, inputBox);
      });
      
      console.log('[InputTranslator] Send monitoring added');
    }
  }

  /**
   * 处理发送按钮点击
   * @param {Event} event - 点击事件
   * @param {Element} inputBox - 输入框
   */
  async handleSendClick(event, inputBox) {
    try {
      const text = this.getInputText(inputBox);
      if (!text || !text.trim()) {
        return; // 没有文本，直接发送
      }

      // 检查是否需要拦截中文
      if (this.shouldBlockChinese(text)) {
        event.preventDefault();
        event.stopPropagation();
        
        this.showChineseBlockAlert();
        return;
      }

      // 检查是否启用输入框翻译
      if (this.configManager.get('inputBox.enabled')) {
        const contactId = this.getCurrentContactId();
        const inputConfig = this.configManager.getInputTranslationConfig(contactId);
        
        if (inputConfig.targetLang !== 'auto') {
          console.log(`[InputTranslator] 🔄 正在翻译输入文本: "${text}" -> "${inputConfig.targetLang}"`);
          
          event.preventDefault();
          event.stopPropagation();
          
          try {
            const result = await this.translator.translate(text, {
              sourceLang: 'auto',
              targetLang: inputConfig.targetLang,
              engineName: inputConfig.engine,
              style: inputConfig.style
            });
            
            if (result.translatedText) {
              // 替换输入框内容
              this.setInputText(inputBox, result.translatedText);
              
              // 触发发送
              setTimeout(() => {
                sendButton.click();
              }, 100);
              
              console.log(`[InputTranslator] ✅ 输入翻译完成: "${result.translatedText}"`);
            } else {
              // 翻译失败，原样发送
              console.warn('[InputTranslator] 翻译结果为空，原样发送');
              sendButton.click();
            }
          } catch (error) {
            console.error('[InputTranslator] 输入翻译失败:', error);
            // 翻译失败，原样发送
            sendButton.click();
          }
        }
      }
    } catch (error) {
      console.error('[InputTranslator] Error handling send click:', error);
      // 出错时正常发送
    }
  }

  /**
   * 添加翻译按钮
   * @param {Element} inputBox - 输入框
   */
  addTranslateButton(inputBox) {
    if (inputBox.querySelector('.wa-translate-btn')) {
      return; // 按钮已存在
    }

    // 创建翻译按钮
    const translateBtn = document.createElement('button');
    translateBtn.className = 'wa-translate-btn';
    translateBtn.innerHTML = '🔄';
    translateBtn.title = '翻译输入文本';
    translateBtn.style.cssText = `
      position: absolute;
      right: 10px;
      bottom: 5px;
      width: 32px;
      height: 32px;
      border: none;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.1);
      color: #666;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: none;
    `;

    // 按钮事件
    translateBtn.addEventListener('click', async (event) => {
      event.preventDefault();
      event.stopPropagation();
      await this.handleTranslateClick(inputBox);
    });

    // 鼠标悬停效果
    translateBtn.addEventListener('mouseenter', () => {
      translateBtn.style.background = 'rgba(0, 0, 0, 0.2)';
      translateBtn.style.color = '#333';
    });

    translateBtn.addEventListener('mouseleave', () => {
      translateBtn.style.background = 'rgba(0, 0, 0, 0.1)';
      translateBtn.style.color = '#666';
    });

    // 添加到输入框容器
    const container = inputBox.closest('div[role="group"]') || inputBox.parentElement;
    if (container) {
      container.style.position = 'relative';
      container.appendChild(translateBtn);
      
      // 监听输入框内容变化，显示/隐藏按钮
      this.updateTranslateButtonVisibility(inputBox, translateBtn);
    }

    console.log('[InputTranslator] Translate button added');
  }

  /**
   * 更新翻译按钮显示状态
   * @param {Element} inputBox - 输入框
   * @param {Element} button - 翻译按钮
   */
  updateTranslateButtonVisibility(inputBox, button) {
    const updateVisibility = () => {
      const text = this.getInputText(inputBox);
      const hasText = text && text.trim().length > 0;
      button.style.display = hasText ? 'block' : 'none';
    };

    // 初始检查
    updateVisibility();

    // 监听内容变化
    inputBox.addEventListener('input', updateVisibility);
    inputBox.addEventListener('paste', () => {
      setTimeout(updateVisibility, 100);
    });
  }

  /**
   * 处理翻译按钮点击
   * @param {Element} inputBox - 输入框
   */
  async handleTranslateClick(inputBox) {
    try {
      const text = this.getInputText(inputBox);
      if (!text || !text.trim()) {
        return;
      }

      const contactId = this.getCurrentContactId();
      const inputConfig = this.configManager.getInputTranslationConfig(contactId);
      
      console.log(`[InputTranslator] 🔄 手动翻译: "${text}" -> "${inputConfig.targetLang}"`);
      
      const translateBtn = inputBox.closest('div[role="group"]')?.querySelector('.wa-translate-btn');
      if (translateBtn) {
        translateBtn.innerHTML = '⏳';
        translateBtn.disabled = true;
      }
      
      const result = await this.translator.translate(text, {
        sourceLang: 'auto',
        targetLang: inputConfig.targetLang,
        engineName: inputConfig.engine,
        style: inputConfig.style
      });
      
      if (result.translatedText) {
        this.setInputText(inputBox, result.translatedText);
        console.log(`[InputTranslator] ✅ 翻译完成: "${result.translatedText}"`);
        
        // 显示成功提示
        this.showToast('翻译完成', 'success');
      } else {
        throw new Error('翻译结果为空');
      }
      
    } catch (error) {
      console.error('[InputTranslator] 翻译失败:', error);
      this.showToast('翻译失败: ' + error.message, 'error');
    } finally {
      // 恢复按钮状态
      const translateBtn = inputBox.closest('div[role="group"]')?.querySelector('.wa-translate-btn');
      if (translateBtn) {
        translateBtn.innerHTML = '🔄';
        translateBtn.disabled = false;
      }
    }
  }

  /**
   * 添加语言选择器
   * @param {Element} inputBox - 输入框
   */
  addLanguageSelector(inputBox) {
    if (document.getElementById('wa-lang-selector')) {
      return; // 语言选择器已存在
    }

    const selector = document.createElement('select');
    selector.id = 'wa-lang-selector';
    selector.innerHTML = `
      <option value="auto">自动</option>
      <option value="zh-CN">中文</option>
      <option value="en">English</option>
      <option value="ja">日本語</option>
      <option value="ko">한국어</option>
      <option value="vi">Tiếng Việt</option>
      <option value="th">ไทย</option>
    `;
    selector.style.cssText = `
      position: absolute;
      left: 10px;
      bottom: 5px;
      padding: 4px 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;
      font-size: 12px;
      cursor: pointer;
      z-index: 1000;
    `;

    // 设置默认值
    const contactId = this.getCurrentContactId();
    const inputConfig = this.configManager.getInputTranslationConfig(contactId);
    selector.value = inputConfig.targetLang;

    // 变更事件
    selector.addEventListener('change', () => {
      console.log(`[InputTranslator] 语言选择器变更: ${selector.value}`);
      this.showToast(`目标语言已切换为: ${this.getLanguageName(selector.value)}`, 'info');
    });

    // 添加到容器
    const container = inputBox.closest('div[role="group"]') || inputBox.parentElement;
    if (container) {
      container.style.position = 'relative';
      container.appendChild(selector);
    }

    console.log('[InputTranslator] Language selector added');
  }

  /**
   * 添加翻译模式切换
   * @param {Element} inputBox - 输入框
   */
  addTranslationModeToggle(inputBox) {
    const container = inputBox.closest('div[role="group"]') || inputBox.parentElement;
    if (!container) return;

    // 检查是否已存在
    if (container.querySelector('.wa-mode-toggle')) {
      return;
    }

    const modeToggle = document.createElement('div');
    modeToggle.className = 'wa-mode-toggle';
    modeToggle.innerHTML = `
      <span style="font-size: 11px; color: #666; margin-right: 5px;">模式:</span>
      <button class="wa-mode-btn active" data-mode="smart">智能</button>
      <button class="wa-mode-btn" data-mode="manual">手动</button>
    `;
    modeToggle.style.cssText = `
      position: absolute;
      left: 100px;
      bottom: 5px;
      font-size: 11px;
      z-index: 1000;
    `;

    // 按钮样式
    const style = document.createElement('style');
    style.textContent = `
      .wa-mode-btn {
        padding: 2px 6px;
        margin: 0 1px;
        border: 1px solid #ddd;
        border-radius: 3px;
        background: white;
        font-size: 11px;
        cursor: pointer;
        transition: all 0.2s;
      }
      .wa-mode-btn.active {
        background: #007cba;
        color: white;
        border-color: #007cba;
      }
      .wa-mode-btn:hover {
        background: #f0f0f0;
      }
    `;
    document.head.appendChild(style);

    // 按钮事件
    const buttons = modeToggle.querySelectorAll('.wa-mode-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const mode = btn.dataset.mode;
        this.switchTranslationMode(mode);
        console.log(`[InputTranslator] 翻译模式切换: ${mode}`);
      });
    });

    container.appendChild(modeToggle);
    console.log('[InputTranslator] Translation mode toggle added');
  }

  /**
   * 切换翻译模式
   * @param {string} mode - 翻译模式
   */
  switchTranslationMode(mode) {
    // 根据模式调整功能
    const translateBtn = document.querySelector('.wa-translate-btn');
    const langSelector = document.getElementById('wa-lang-selector');
    
    if (mode === 'smart') {
      // 智能模式：自动翻译，按钮主要用来手动触发
      if (translateBtn) translateBtn.title = '智能翻译模式';
      if (langSelector) langSelector.style.display = 'none';
    } else if (mode === 'manual') {
      // 手动模式：需要手动点击翻译按钮
      if (translateBtn) translateBtn.title = '手动翻译模式';
      if (langSelector) langSelector.style.display = 'block';
    }

    this.eventManager.emit('translation:mode:changed', { mode });
  }

  /**
   * 设置实时翻译
   * @param {Element} inputBox - 输入框
   */
  setupRealtimeTranslation(inputBox) {
    if (!this.configManager.get('advanced.realtime')) {
      return; // 未启用实时翻译
    }

    console.log('[InputTranslator] Setting up realtime translation');

    const cleanup = () => {
      if (this.realtimeTimer) {
        clearTimeout(this.realtimeTimer);
        this.realtimeTimer = null;
      }
    };

    const debouncedTranslate = () => {
      cleanup();
      
      this.realtimeTimer = setTimeout(async () => {
        const text = this.getInputText(inputBox);
        if (!text || text.length < 5) {
          return; // 文本太短，不翻译
        }

        try {
          this.showRealtimePreview(inputBox, true); // 显示加载状态
          
          const contactId = this.getCurrentContactId();
          const inputConfig = this.configManager.getInputTranslationConfig(contactId);
          
          const result = await this.translator.translate(text, {
            sourceLang: 'auto',
            targetLang: inputConfig.targetLang,
            engineName: inputConfig.engine,
            style: inputConfig.style
          });
          
          if (result.translatedText) {
            this.showRealtimePreview(inputBox, false, result.translatedText);
          } else {
            throw new Error('翻译结果为空');
          }
        } catch (error) {
          console.error('[InputTranslator] 实时翻译失败:', error);
          this.showRealtimePreview(inputBox, false, '翻译失败');
        }
      }, 1000); // 1秒延迟
    };

    // 监听输入变化
    inputBox.addEventListener('input', debouncedTranslate);
    inputBox.addEventListener('paste', () => {
      setTimeout(debouncedTranslate, 100);
    });

    // 清理函数
    this.cleanupRealtimeTranslation = cleanup;
  }

  /**
   * 创建实时预览
   * @param {Element} inputBox - 输入框
   */
  createRealtimePreview(inputBox) {
    const preview = document.createElement('div');
    preview.className = 'wa-realtime-preview';
    preview.style.cssText = `
      position: absolute;
      bottom: 100%;
      left: 0;
      right: 0;
      background: #f8f9fa;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 8px;
      font-size: 12px;
      color: #666;
      box-shadow: 0 -2px 4px rgba(0,0,0,0.1);
      z-index: 1001;
      display: none;
    `;

    return preview;
  }

  /**
   * 显示实时预览
   * @param {Element} inputBox - 输入框
   * @param {boolean} isLoading - 是否加载中
   * @param {string} text - 预览文本
   */
  showRealtimePreview(inputBox, isLoading = false, text = '') {
    if (!this.realtimePreview) {
      this.realtimePreview = this.createRealtimePreview(inputBox);
      const container = inputBox.closest('div[role="group"]') || inputBox.parentElement;
      if (container) {
        container.appendChild(this.realtimePreview);
      }
    }

    if (isLoading) {
      this.realtimePreview.innerHTML = '🔄 正在翻译...';
      this.realtimePreview.style.display = 'block';
    } else if (text) {
      this.realtimePreview.innerHTML = `预览: ${text}`;
      this.realtimePreview.style.display = 'block';
    } else {
      this.realtimePreview.style.display = 'none';
    }
  }

  /**
   * 隐藏实时预览
   */
  hideRealtimePreview() {
    if (this.realtimePreview) {
      this.realtimePreview.style.display = 'none';
    }
  }

  /**
   * 检查是否应该拦截中文
   * @param {string} text - 文本
   * @returns {boolean} 是否拦截
   */
  shouldBlockChinese(text) {
    if (!this.configManager.get('advanced.blockChinese')) {
      return false;
    }

    // 简单中文检测
    const chineseChars = text.match(/[\u4e00-\u9fff]/g) || [];
    const chineseRatio = chineseChars.length / text.length;
    
    return chineseRatio > 0.6;
  }

  /**
   * 显示中文拦截提示
   */
  showChineseBlockAlert() {
    const alert = document.createElement('div');
    alert.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ff6b6b;
      color: white;
      padding: 12px 16px;
      border-radius: 4px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      z-index: 10000;
      font-size: 14px;
      max-width: 300px;
    `;
    alert.innerHTML = '⚠️ 已启用禁发中文功能，请先翻译后再发送';
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
      alert.remove();
    }, 3000);
  }

  /**
   * 显示提示信息
   * @param {string} message - 消息内容
   * @param {string} type - 消息类型
   */
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    const colors = {
      success: '#28a745',
      error: '#dc3545',
      info: '#007cba',
      warning: '#ffc107'
    };
    
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors[type] || colors.info};
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      z-index: 10000;
      font-size: 12px;
      animation: slideIn 0.3s ease;
    `;
    
    toast.textContent = message;
    
    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
      style.remove();
    }, UI_CONFIG.TOAST_DURATION);
  }

  /**
   * 获取输入框文本
   * @param {Element} inputBox - 输入框
   * @returns {string} 输入文本
   */
  getInputText(inputBox) {
    return inputBox.textContent || inputBox.innerText || '';
  }

  /**
   * 设置输入框文本
   * @param {Element} inputBox - 输入框
   * @param {string} text - 要设置的文本
   */
  setInputText(inputBox, text) {
    inputBox.textContent = text;
    inputBox.dispatchEvent(new Event('input', { bubbles: true }));
  }

  /**
   * 获取当前联系人ID
   * @returns {string} 联系人ID
   */
  getCurrentContactId() {
    try {
      // 方法1: 从 URL 获取
      const urlMatch = window.location.href.match(/\/chat\/([^/]+)/);
      if (urlMatch && urlMatch[1]) {
        return decodeURIComponent(urlMatch[1]);
      }
      
      // 方法2: 从聊天标题获取
      const header = document.querySelector('#main header [data-testid="conversation-info-header"]') ||
                    document.querySelector('#main header span[dir="auto"]');
      
      if (header) {
        return header.textContent.trim();
      }
      
      return 'unknown';
    } catch (error) {
      console.error('[InputTranslator] Error getting contact ID:', error);
      return 'unknown';
    }
  }

  /**
   * 获取语言名称
   * @param {string} langCode - 语言代码
   * @returns {string} 语言名称
   */
  getLanguageName(langCode) {
    const names = {
      'auto': '自动',
      'zh-CN': '中文',
      'en': 'English',
      'ja': '日本語',
      'ko': '한국어',
      'vi': 'Tiếng Việt',
      'th': 'ไทย'
    };
    return names[langCode] || langCode;
  }

  /**
   * 监听按钮变化
   */
  startButtonMonitoring() {
    const monitorButtons = () => {
      const sendButton = document.querySelector('button[data-testid="send"], button[data-testid="conversation-compose-box-send"], button[aria-label="Send"]');
      if (sendButton && !sendButton.dataset.waMonitoringAdded) {
        this.setupSendMonitoring(this.currentInputBox || document.querySelector('div[contenteditable="true"]'));
      }
    };

    // 定期检查
    setInterval(monitorButtons, 2000);
  }

  /**
   * 清理资源
   */
  cleanup() {
    if (this.inputObserver) {
      this.inputObserver.disconnect();
    }
    
    if (this.cleanupRealtimeTranslation) {
      this.cleanupRealtimeTranslation();
    }
    
    if (this.realtimeTimer) {
      clearTimeout(this.realtimeTimer);
    }
    
    // 移除临时元素
    const tempElements = document.querySelectorAll('.wa-translate-btn, .wa-mode-toggle, #wa-lang-selector, .wa-realtime-preview');
    tempElements.forEach(el => el.remove());
    
    this.isInitialized = false;
    console.log('[InputTranslator] Cleanup complete');
  }
}

module.exports = InputTranslator;