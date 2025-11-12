/**
 * 直接测试翻译功能（绕过服务初始化检查）
 * 在浏览器控制台运行
 */

(async function testDirectTranslation() {
  console.log('🧪 开始直接翻译测试...\n');
  
  // 测试文本
  const testText = 'Hello, how are you?';
  
  try {
    console.log('📝 测试文本:', testText);
    console.log('🔄 正在翻译...\n');
    
    const result = await window.translationAPI.translate({
      text: testText,
      sourceLang: 'en',
      targetLang: 'zh-CN',
      engineName: 'google',
      options: {}
    });
    
    console.log('📊 翻译结果:', result);
    
    if (result.success) {
      console.log('\n✅ 翻译成功！');
      console.log('原文:', testText);
      console.log('译文:', result.data.translatedText);
      console.log('引擎:', result.data.engineUsed);
      console.log('缓存:', result.data.cached ? '是' : '否');
      
      // 在页面上显示结果
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        z-index: 999999;
        max-width: 350px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        animation: slideIn 0.3s ease-out;
      `;
      
      notification.innerHTML = `
        <style>
          @keyframes slideIn {
            from {
              transform: translateX(400px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        </style>
        <div style="display: flex; align-items: center; margin-bottom: 12px;">
          <span style="font-size: 24px; margin-right: 10px;">✅</span>
          <h3 style="margin: 0; font-size: 18px; font-weight: 600;">翻译测试成功！</h3>
        </div>
        <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px; margin-bottom: 10px;">
          <p style="margin: 0 0 8px 0; font-size: 13px; opacity: 0.9;">原文:</p>
          <p style="margin: 0; font-size: 14px; font-weight: 500;">${testText}</p>
        </div>
        <div style="background: rgba(255,255,255,0.2); padding: 12px; border-radius: 8px; margin-bottom: 10px;">
          <p style="margin: 0 0 8px 0; font-size: 13px; opacity: 0.9;">译文:</p>
          <p style="margin: 0; font-size: 14px; font-weight: 500;">${result.data.translatedText}</p>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 12px; opacity: 0.8;">
          <span>🔧 ${result.data.engineUsed}</span>
          <span>${result.data.cached ? '📦 已缓存' : '🆕 新翻译'}</span>
        </div>
        <button onclick="this.parentElement.remove()" style="
          margin-top: 12px;
          width: 100%;
          padding: 8px;
          background: rgba(255,255,255,0.2);
          color: white;
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.2s;
        " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
          关闭
        </button>
      `;
      
      document.body.appendChild(notification);
      
      // 10秒后自动关闭
      setTimeout(() => {
        if (notification.parentElement) {
          notification.style.animation = 'slideIn 0.3s ease-out reverse';
          setTimeout(() => notification.remove(), 300);
        }
      }, 10000);
      
    } else {
      console.log('\n❌ 翻译失败');
      console.log('错误:', result.error);
      alert('翻译失败: ' + result.error);
    }
    
  } catch (error) {
    console.error('\n❌ 测试出错:', error);
    console.error('错误详情:', error.message);
    console.error('错误堆栈:', error.stack);
    alert('测试出错: ' + error.message);
  }
  
  console.log('\n🏁 测试完成');
})();
