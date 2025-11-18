/**
 * 调试翻译风格问题的测试脚本
 * 
 * 使用方法：
 * 1. 启动应用
 * 2. 在开发者工具中运行此脚本
 * 3. 尝试翻译操作并查看控制台输出
 */

// 测试翻译风格功能
function testTranslationStyle() {
  console.log('🧪 开始测试翻译风格功能...');
  
  // 检查当前配置
  if (typeof window !== 'undefined' && window.translationAPI) {
    console.log('✅ translationAPI 已加载');
    
    // 测试配置读取
    const testConfig = {
      accountId: 'test-account',
      text: 'Hello, how are you?',
      sourceLang: 'en',
      targetLang: 'zh-CN',
      engineName: 'custom', // 或其他AI引擎
      options: {
        style: '亲切' // 测试风格参数
      }
    };
    
    console.log('📋 测试配置:', testConfig);
    
    // 尝试翻译
    window.translationAPI.translate(testConfig)
      .then(response => {
        console.log('✅ 翻译成功:', response);
        
        if (response.success) {
          console.log('📝 翻译结果:', response.data.translatedText);
          console.log('🔧 使用引擎:', response.data.engineUsed);
        }
      })
      .catch(error => {
        console.error('❌ 翻译失败:', error);
      });
      
  } else {
    console.log('ℹ️  当前在Node.js环境中或translationAPI不可用，跳过翻译测试');
    console.log('💡 在浏览器控制台中运行此函数进行实际测试');
  }
}

// 检查DOM元素
function checkDOMElements() {
  console.log('🔍 检查关键DOM元素...');
  
  // 检查是否在浏览器环境中
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    console.log('ℹ️  当前在Node.js环境中，无法访问DOM元素');
    return;
  }
  
  const elements = [
    '#translationStyle',
    '#inputBoxEngine',
    '#inputBoxEnabled',
    '#inputBoxTargetLang'
  ];
  
  elements.forEach(selector => {
    const element = document.querySelector(selector);
    if (element) {
      console.log(`✅ 找到元素 ${selector}:`, element.value);
    } else {
      console.log(`❌ 未找到元素 ${selector}`);
    }
  });
}

// 监听翻译事件
function listenTranslationEvents() {
  console.log('👂 开始监听翻译事件...');
  
  // 检查是否在浏览器环境中
  if (typeof window !== 'undefined') {
    // 监听来自主进程的消息
    if (window.electronAPI) {
      window.electronAPI.onTranslationResult((event, result) => {
        console.log('📡 收到翻译结果:', result);
      });
    }
    
    // 监听配置变化
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          const styleSelect = document.querySelector('#translationStyle');
          if (styleSelect && !styleSelect.hasAttribute('data-monitored')) {
            styleSelect.setAttribute('data-monitored', 'true');
            styleSelect.addEventListener('change', (e) => {
              console.log('🎨 风格选择改变:', e.target.value);
            });
            console.log('✅ 已绑定风格选择监听器');
          }
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    console.log('✅ DOM变化监听器已启动');
  } else {
    console.log('ℹ️  当前在Node.js环境中，跳过浏览器特定的监听器设置');
  }
}

// 运行测试
console.log('🚀 翻译风格调试工具已加载');
console.log('运行 testTranslationStyle() 开始测试');
console.log('运行 checkDOMElements() 检查DOM元素');
console.log('运行 listenTranslationEvents() 监听事件');

// 仅在浏览器环境中导出函数到全局对象
if (typeof window !== 'undefined') {
  window.testTranslationStyle = testTranslationStyle;
  window.checkDOMElements = checkDOMElements;
  window.listenTranslationEvents = listenTranslationEvents;
} else {
  // 在Node.js环境中，将函数挂载到global对象
  global.testTranslationStyle = testTranslationStyle;
  global.checkDOMElements = checkDOMElements;
  global.listenTranslationEvents = listenTranslationEvents;
}