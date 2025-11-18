/**
 * WhatsApp Web 翻译系统主入口
 * 模块化的翻译系统，整合所有功能模块
 */

(function() {
  'use strict';

  console.log('[Translation] Modular content script initializing...');

  // 导入所有模块
  const { eventManager } = require('./utils/eventManager');
  const ConfigManager = require('./core/configManager');
  const LanguageDetector = require('./core/languageDetector');
  const Translator = require('./core/translator');
  const MessageHandler = require('./message/messageHandler');
  const InputTranslator = require('./input/inputTranslator');

  /**
   * 主翻译系统类
   */
  class WhatsAppTranslationSystem {
    constructor() {
      this.configManager = null;
      this.languageDetector = null;
      this.translator = null;
      this.messageHandler = null;
      this.inputTranslator = null;
      this.initialized = false;
      this.accountId = 'default';
    }

    /**
     * 初始化翻译系统
     */
    async init() {
      if (this.initialized) {
        console.log('[Translation] Already initialized');
        return;
      }

      try {
        console.log('[Translation] Starting modular initialization...');

        // 1. 初始化配置管理器
        this.configManager = new ConfigManager(eventManager);
        await this.configManager.init();
        console.log('[Translation] ✓ Config manager initialized');

        // 2. 初始化语言检测器
        this.languageDetector = new LanguageDetector(eventManager);
        console.log('[Translation] ✓ Language detector initialized');

        // 3. 初始化翻译器
        this.translator = new Translator(eventManager, this.configManager);
        console.log('[Translation] ✓ Translator initialized');

        // 4. 初始化消息处理器
        this.messageHandler = new MessageHandler(eventManager, this.configManager, this.translator, this.languageDetector);
        await this.messageHandler.init();
        console.log('[Translation] ✓ Message handler initialized');

        // 5. 初始化输入框翻译器
        this.inputTranslator = new InputTranslator(eventManager, this.configManager, this.translator);
        await this.inputTranslator.init();
        console.log('[Translation] ✓ Input translator initialized');

        // 6. 注入样式
        this.injectStyles();

        // 7. 监听聊天窗口切换
        this.observeChatSwitch();

        // 8. 启动定期检查
        this.startPeriodicCheck();

        // 9. 添加设置按钮
        this.addSettingsButton();

        this.initialized = true;
        console.log('[Translation] ✅ All modules initialized successfully');

        // 暴露到全局（用于调试）
        window.WhatsAppTranslationSystem = this;

      } catch (error) {
        console.error('[Translation] Initialization failed:', error);
      }
    }

    /**
     * 注入样式
     */
    injectStyles() {
      const style = document.createElement('style');
      style.textContent = `
        /* 翻译结果样式 */
        .wa-translation-result {
          margin-top: 4px;
          padding: 4px 8px;
          background: rgba(0, 124, 186, 0.1);
          border-left: 3px solid #007cba;
          font-size: 13px;
          color: #333;
          border-radius: 0 4px 4px 0;
          animation: fadeIn 0.3s ease-in;
        }

        .wa-translation-error {
          margin-top: 4px;
          padding: 4px 8px;
          background: rgba(220, 53, 69, 0.1);
          border-left: 3px solid #dc3545;
          font-size: 12px;
          color: #dc3545;
          border-radius: 0 4px 4px 0;
          animation: fadeIn 0.3s ease-in;
        }

        /* 翻译按钮样式 */
        .wa-translate-btn {
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
        }

        .wa-translate-btn:hover {
          background: rgba(0, 0, 0, 0.2);
          color: #333;
        }

        .wa-translate-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* 设置按钮样式 */
        .wa-translation-settings-btn {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          width: 28px;
          height: 28px;
          border: none;
          border-radius: 4px;
          background: rgba(0, 0, 0, 0.05);
          color: #667;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          z-index: 1000;
        }

        .wa-translation-settings-btn:hover {
          background: rgba(0, 0, 0, 0.1);
          color: #333;
        }

        /* 动画 */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;

      document.head.appendChild(style);
      console.log('[Translation] Styles injected');
    }

    /**
     * 监听聊天窗口切换
     */
    observeChatSwitch() {
      let lastUrl = location.href;
      let urlChangeTimer = null;

      const urlObserver = new MutationObserver(() => {
        const currentUrl = location.href;
        if (currentUrl !== lastUrl) {
          lastUrl = currentUrl;
          console.log('[Translation] Chat switched, re-translating messages');
          
          // 防抖处理
          if (urlChangeTimer) {
            clearTimeout(urlChangeTimer);
          }
          
          urlChangeTimer = setTimeout(() => {
            this.messageHandler.translateExistingMessages();
            this.inputTranslator.cleanup(); // 清理旧的输入框功能
            this.inputTranslator.init(); // 重新初始化
            eventManager.emit(EVENTS.CHAT_SWITCHED, { url: currentUrl });
          }, 1000);
        }
      });

      // 观察整个文档
      urlObserver.observe(document.body, {
        childList: true,
        subtree: true
      });

      console.log('[Translation] Chat switch observer set up');
    }

    /**
     * 启动定期检查
     */
    startPeriodicCheck() {
      // 定期清理缓存
      setInterval(() => {
        this.languageDetector.clearAllCaches();
        this.cleanupInvisibleTranslations();
      }, 60000); // 每分钟清理一次

      console.log('[Translation] Periodic cleanup started');
    }

    /**
   * 清理不可见的翻译
   */
  cleanupInvisibleTranslations() {
    const translations = document.querySelectorAll('.wa-translation-result, .wa-translation-error');
    translations.forEach(translation => {
      const messageNode = translation.closest('.message-in, .message-out');
      if (!messageNode || !messageNode.isConnected || messageNode.offsetParent === null) {
        translation.remove();
      }
    });
  }

  /**
   * 添加设置按钮
   */
  addSettingsButton() {
    const addSettingsButton = () => {
      // 查找侧边栏头部
      const sidebarHeader = document.querySelector('#main header') ||
                           document.querySelector('header[data-testid="chatlist-header"]') ||
                           document.querySelector('._3Dr46');

      if (!sidebarHeader) {
        setTimeout(addSettingsButton, 2000);
        return;
      }

      if (document.getElementById('wa-translation-settings-btn')) {
        return; // 按钮已存在
      }

      const settingsBtn = document.createElement('button');
      settingsBtn.id = 'wa-translation-settings-btn';
      settingsBtn.className = 'wa-translation-settings-btn';
      settingsBtn.innerHTML = '⚙️';
      settingsBtn.title = '翻译设置';

      settingsBtn.onclick = () => {
        console.log('[Translation] Settings button clicked');
        eventManager.emit(EVENTS.SETTINGS_OPENED);
        this.showSettingsPanel();
      };

      // 悬停效果
      settingsBtn.onmouseenter = () => {
        settingsBtn.style.background = 'rgba(0, 0, 0, 0.1)';
      };

      settingsBtn.onmouseleave = () => {
        settingsBtn.style.background = 'rgba(0, 0, 0, 0.05)';
      };

      // 插入到头部
      const headerDivs = sidebarHeader.querySelectorAll(':scope > div');
      const firstDiv = headerDivs[0];
      
      if (firstDiv) {
        firstDiv.insertBefore(settingsBtn, firstDiv.firstChild);
        console.log('[Translation] Settings button added');
      }
    };

    // 立即添加
    addSettingsButton();
    
    // 延迟后再次尝试
    setTimeout(addSettingsButton, 2000);
    
    // 监听header变化
    const headerObserver = new MutationObserver(() => {
      if (!document.getElementById('wa-translation-settings-btn')) {
        addSettingsButton();
      }
    });
    
    setTimeout(() => {
      headerObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
    }, 3000);
  }

  /**
   * 显示设置面板（简化版）
   */
  showSettingsPanel() {
    // 创建设置面板容器
    const panel = document.createElement('div');
    panel.id = 'wa-translation-settings-panel';
    panel.style.cssText = `
      position: fixed;
      top: 0;
      right: 0;
      width: 400px;
      height: 100vh;
      background: white;
      box-shadow: -2px 0 10px rgba(0,0,0,0.2);
      z-index: 10000;
      overflow-y: auto;
      animation: slideIn 0.3s ease;
    `;

    panel.innerHTML = `
      <div style="padding: 20px; border-bottom: 1px solid #eee;">
        <h3 style="margin: 0 0 10px 0;">翻译设置</h3>
        <button onclick="document.getElementById('wa-translation-settings-panel').remove()" 
                style="position: absolute; right: 15px; top: 15px; background: none; border: none; font-size: 20px; cursor: pointer;">×</button>
      </div>
      <div style="padding: 20px;">
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">聊天窗口翻译</label>
          <label style="display: flex; align-items: center;">
            <input type="checkbox" id="auto-translate" ${this.configManager.get('global.autoTranslate') ? 'checked' : ''} 
                   style="margin-right: 8px;">
            启用自动翻译
          </label>
        </div>
        
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">输入框翻译</label>
          <label style="display: flex; align-items: center;">
            <input type="checkbox" id="input-translate" ${this.configManager.get('inputBox.enabled') ? 'checked' : ''} 
                   style="margin-right: 8px;">
            启用输入框翻译
          </label>
        </div>

        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">翻译引擎</label>
          <select id="translation-engine" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            <option value="google">Google Translate (免费)</option>
            <option value="baidu">百度翻译</option>
            <option value="youdao">有道翻译</option>
            <option value="ai_translation">AI翻译</option>
          </select>
        </div>

        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">目标语言</label>
          <select id="target-lang" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            <option value="zh-CN">简体中文</option>
            <option value="zh-TW">繁体中文</option>
            <option value="en">英语</option>
          </select>
        </div>

        <div style="margin-bottom: 20px;">
          <label style="display: flex; align-items: center;">
            <input type="checkbox" id="block-chinese" ${this.configManager.get('advanced.blockChinese') ? 'checked' : ''} 
                   style="margin-right: 8px;">
            拦截中文消息
          </label>
        </div>

        <button onclick="this.saveSettings()" 
                style="width: 100%; padding: 10px; background: #007cba; color: white; border: none; border-radius: 4px; cursor: pointer;">
          保存设置
        </button>
      </div>
    `;

    // 添加保存功能
    panel.querySelector('button[onclick="this.saveSettings()"]').saveSettings = () => {
      this.saveSettings(panel);
    };

    document.body.appendChild(panel);

    // 点击外部关闭
    panel.addEventListener('click', (e) => {
      if (e.target === panel) {
        panel.remove();
      }
    });
  }

  /**
   * 保存设置
   */
  saveSettings(panel) {
    try {
      const autoTranslate = document.getElementById('auto-translate').checked;
      const inputTranslate = document.getElementById('input-translate').checked;
      const engine = document.getElementById('translation-engine').value;
      const targetLang = document.getElementById('target-lang').value;
      const blockChinese = document.getElementById('block-chinese').checked;

      // 更新配置
      this.configManager.set('global.autoTranslate', autoTranslate);
      this.configManager.set('inputBox.enabled', inputTranslate);
      this.configManager.set('global.engine', engine);
      this.configManager.set('global.targetLang', targetLang);
      this.configManager.set('advanced.blockChinese', blockChinese);

      // 保存到本地存储
      this.configManager.saveConfig();

      // 显示保存成功提示
      this.showToast('设置已保存', 'success');

      // 关闭面板
      panel.remove();

      console.log('[Translation] Settings saved successfully');

    } catch (error) {
      console.error('[Translation] Error saving settings:', error);
      this.showToast('保存失败: ' + error.message, 'error');
    }
  }

  /**
   * 显示提示信息
   */
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    const colors = {
      success: '#28a745',
      error: '#dc3545',
      info: '#007cba'
    };
    
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors[type] || colors.info};
      color: white;
      padding: 12px 16px;
      border-radius: 4px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      z-index: 10001;
      font-size: 14px;
      animation: slideIn 0.3s ease;
    `;
    
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  /**
   * 获取系统统计信息
   */
  getStats() {
    return {
      initialized: this.initialized,
      configManager: this.configManager ? this.configManager.getSummary() : null,
      translator: this.translator ? this.translator.getStats() : null,
      languageDetector: this.languageDetector ? this.languageDetector.getStats() : null
    };
  }

  /**
   * 清理所有资源
   */
  cleanup() {
    if (this.messageHandler) {
      this.messageHandler.cleanup();
    }
    
    if (this.inputTranslator) {
      this.inputTranslator.cleanup();
    }

    if (this.configManager) {
      this.configManager.reset();
    }

    // 移除设置面板
    const panel = document.getElementById('wa-translation-settings-panel');
    if (panel) {
      panel.remove();
    }

    // 移除设置按钮
    const settingsBtn = document.getElementById('wa-translation-settings-btn');
    if (settingsBtn) {
      settingsBtn.remove();
    }

    // 清理缓存
    if (this.languageDetector) {
      this.languageDetector.clearAllCaches();
    }

    // 重置翻译器
    if (this.translator) {
      this.translator.reset();
    }

    this.initialized = false;
    console.log('[Translation] System cleanup complete');
  }
}

// 创建并初始化系统
const translationSystem = new WhatsAppTranslationSystem();

// 等待DOM加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    translationSystem.init();
  });
} else {
  translationSystem.init();
}

// 导出全局对象（用于调试）
window.WhatsAppTranslationSystem = translationSystem;

// 添加全局快捷函数
window.translateCurrentChat = function() {
  console.log('[Translation] Manually translating current chat...');
  if (translationSystem.messageHandler) {
    translationSystem.messageHandler.translateExistingMessages();
  }
};

console.log('[Translation] Modular content script loaded');

})();