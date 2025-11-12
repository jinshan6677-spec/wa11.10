/**
 * 测试脚本注入
 * 在浏览器控制台中手动运行此脚本来测试翻译功能
 */

// 简单的测试脚本
(function() {
  console.log('[Test] Starting translation test...');
  
  // 1. 测试 API 是否可用
  if (!window.translationAPI) {
    console.error('[Test] translationAPI not available!');
    console.log('[Test] This means preload script did not load correctly');
    return;
  }
  
  console.log('[Test] ✅ translationAPI is available');
  
  // 2. 测试翻译功能
  console.log('[Test] Testing translation...');
  window.translationAPI.translate({
    text: 'Hello, how are you?',
    sourceLang: 'en',
    targetLang: 'zh-CN',
    engineName: 'google'
  }).then(result => {
    console.log('[Test] ✅ Translation successful:', result);
    
    if (result.success) {
      console.log('[Test] Translated text:', result.data.translatedText);
      
      // 3. 手动显示翻译结果
      const testDiv = document.createElement('div');
      testDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #25D366;
        color: white;
        padding: 20px;
        border-radius: 10px;
        z-index: 99999;
        max-width: 300px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
      `;
      testDiv.innerHTML = `
        <h3 style="margin: 0 0 10px 0;">✅ 翻译测试成功！</h3>
        <p style="margin: 5px 0;"><strong>原文:</strong> Hello, how are you?</p>
        <p style="margin: 5px 0;"><strong>译文:</strong> ${result.data.translatedText}</p>
        <p style="margin: 5px 0; font-size: 12px;">引擎: ${result.data.engineUsed}</p>
        <button onclick="this.parentElement.remove()" style="
          margin-top: 10px;
          padding: 5px 10px;
          background: white;
          color: #25D366;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        ">关闭</button>
      `;
      document.body.appendChild(testDiv);
      
      // 5秒后自动关闭
      setTimeout(() => testDiv.remove(), 5000);
    }
  }).catch(error => {
    console.error('[Test] ❌ Translation failed:', error);
  });
  
  // 4. 测试配置
  window.translationAPI.getConfig('default').then(result => {
    console.log('[Test] Current config:', result);
  });
  
})();
