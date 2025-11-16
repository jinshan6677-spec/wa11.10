/**
 * IPC 处理器
 * 处理渲染进程的翻译请求
 */

const { ipcMain } = require('electron');
const translationService = require('./translationService');

/**
 * 注册所有 IPC 处理器
 */
async function registerIPCHandlers() {
  // 初始化翻译服务
  if (!translationService.initialized) {
    try {
      await translationService.initialize();
      console.log('[IPC] Translation service initialized');
    } catch (error) {
      console.error('[IPC] Failed to initialize translation service:', error);
    }
  }
  
  // 翻译请求
  ipcMain.handle('translation:translate', async (event, request) => {
    try {
      const { text, sourceLang, targetLang, engineName, options } = request;
      
      const result = await translationService.translate(
        text,
        sourceLang || 'auto',
        targetLang || 'zh-CN',
        engineName || 'google',
        options || {}
      );

      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('[IPC] Translation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // 语言检测
  ipcMain.handle('translation:detectLanguage', async (event, text) => {
    try {
      const lang = await translationService.detectLanguage(text);
      return {
        success: true,
        data: lang
      };
    } catch (error) {
      console.error('[IPC] Language detection error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // 获取配置
  ipcMain.handle('translation:getConfig', async (event, accountId) => {
    try {
      const config = translationService.getConfig(accountId || 'default');
      return {
        success: true,
        data: config
      };
    } catch (error) {
      console.error('[IPC] Get config error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // 保存配置
  ipcMain.handle('translation:saveConfig', async (event, accountId, config) => {
    try {
      translationService.saveConfig(accountId || 'default', config);
      return {
        success: true
      };
    } catch (error) {
      console.error('[IPC] Save config error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // 获取统计信息
  ipcMain.handle('translation:getStats', async (event) => {
    try {
      const stats = translationService.getStats();
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('[IPC] Get stats error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // 清除缓存
  ipcMain.handle('translation:clearCache', async (event) => {
    try {
      await translationService.cacheManager.clear();
      return {
        success: true
      };
    } catch (error) {
      console.error('[IPC] Clear cache error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // 保存引擎配置
  ipcMain.handle('translation:saveEngineConfig', async (event, engineName, config) => {
    try {
      translationService.configManager.saveEngineConfig(engineName, config);
      console.log(`[IPC] Saved engine config for: ${engineName}`);
      
      // 强制重新注册引擎
      translationService.registerEngines();
      console.log('[IPC] Engines reregistered with new config');
      console.log('[IPC] Available engines:', Array.from(translationService.translationManager.engines.keys()));
      
      return {
        success: true
      };
    } catch (error) {
      console.error('[IPC] Save engine config error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // 获取引擎配置
  ipcMain.handle('translation:getEngineConfig', async (event, engineName) => {
    try {
      const config = translationService.configManager.getEngineConfig(engineName);
      return {
        success: true,
        data: config
      };
    } catch (error) {
      console.error('[IPC] Get engine config error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // 隐私保护：清除翻译历史
  ipcMain.handle('translation:clearHistory', async (event) => {
    try {
      await translationService.clearTranslationHistory();
      return {
        success: true,
        message: 'Translation history cleared successfully'
      };
    } catch (error) {
      console.error('[IPC] Clear history error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // 隐私保护：清除用户数据
  ipcMain.handle('translation:clearUserData', async (event) => {
    try {
      await translationService.clearAllUserData();
      return {
        success: true,
        message: 'User data cleared successfully'
      };
    } catch (error) {
      console.error('[IPC] Clear user data error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // 隐私保护：清除所有数据
  ipcMain.handle('translation:clearAllData', async (event) => {
    try {
      await translationService.clearAllData();
      return {
        success: true,
        message: 'All data cleared successfully'
      };
    } catch (error) {
      console.error('[IPC] Clear all data error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // 隐私保护：获取隐私报告
  ipcMain.handle('translation:getPrivacyReport', async (event) => {
    try {
      const report = translationService.getPrivacyReport();
      return {
        success: true,
        data: report
      };
    } catch (error) {
      console.error('[IPC] Get privacy report error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  console.log('[IPC] Translation handlers registered');
}

/**
 * 注销所有 IPC 处理器
 */
function unregisterIPCHandlers() {
  ipcMain.removeHandler('translation:translate');
  ipcMain.removeHandler('translation:detectLanguage');
  ipcMain.removeHandler('translation:getConfig');
  ipcMain.removeHandler('translation:saveConfig');
  ipcMain.removeHandler('translation:getStats');
  ipcMain.removeHandler('translation:clearCache');
  ipcMain.removeHandler('translation:clearHistory');
  ipcMain.removeHandler('translation:clearUserData');
  ipcMain.removeHandler('translation:clearAllData');
  ipcMain.removeHandler('translation:getPrivacyReport');
  
  console.log('[IPC] Translation handlers unregistered');
}

module.exports = {
  registerIPCHandlers,
  unregisterIPCHandlers
};
