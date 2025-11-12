// 在浏览器控制台运行此脚本来诊断禁发中文功能

console.log('=== 禁发中文功能诊断 ===');

// 1. 检查 WhatsAppTranslation 对象
if (!window.WhatsAppTranslation) {
  console.error('❌ WhatsAppTranslation 对象不存在');
} else {
  console.log('✅ WhatsAppTranslation 对象存在');
  
  // 2. 检查配置
  const config = window.WhatsAppTranslation.config;
  console.log('配置信息:', {
    blockChinese: config?.advanced?.blockChinese,
    friendIndependent: config?.advanced?.friendIndependent
  });
  
  if (!config?.advanced?.blockChinese) {
    console.warn('⚠️ blockChinese 未启用，请在设置中启用');
  } else {
    console.log('✅ blockChinese 已启用');
  }
  
  // 3. 检查监听器
  console.log('监听器状态:', {
    chineseBlockHandler: !!window.WhatsAppTranslation.chineseBlockHandler,
    chineseBlockKeypressHandler: !!window.WhatsAppTranslation.chineseBlockKeypressHandler,
    chineseBlockMouseDownHandler: !!window.WhatsAppTranslation.chineseBlockMouseDownHandler,
    chineseBlockClickHandler: !!window.WhatsAppTranslation.chineseBlockClickHandler,
    chineseBlockInputMonitor: !!window.WhatsAppTranslation.chineseBlockInputMonitor
  });
  
  // 4. 检查输入框
  const inputBox = document.querySelector('footer [contenteditable="true"]') ||
                   document.querySelector('[data-testid="conversation-compose-box-input"]');
  
  if (!inputBox) {
    console.warn('⚠️ 未找到输入框（可能未打开聊天）');
  } else {
    console.log('✅ 找到输入框');
    
    // 获取文本
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
    
    console.log('输入框内容:', text);
    
    // 检测中文
    const hasChinese = /[\u4e00-\u9fa5]/.test(text);
    console.log('包含中文:', hasChinese);
  }
  
  // 5. 检查发送按钮
  const sendButton = document.querySelector('[data-testid="send"]') ||
                     document.querySelector('button[aria-label*="发送"]') ||
                     document.querySelector('button[aria-label*="Send"]');
  
  if (!sendButton) {
    console.warn('⚠️ 未找到发送按钮（可能输入框为空）');
  } else {
    console.log('✅ 找到发送按钮');
    console.log('按钮状态:', {
      pointerEvents: sendButton.style.pointerEvents,
      opacity: sendButton.style.opacity,
      blocked: sendButton.getAttribute('data-chinese-blocked')
    });
  }
  
  // 6. 测试 containsChinese 函数
  console.log('\n测试 containsChinese 函数:');
  const testCases = [
    '你好',
    'Hello',
    'Hello 你好',
    '123',
    '😀',
    ''
  ];
  
  testCases.forEach(test => {
    const result = window.WhatsAppTranslation.containsChinese(test);
    console.log(`  "${test}" => ${result}`);
  });
}

console.log('\n=== 诊断完成 ===');
console.log('\n如果功能未生效，请尝试:');
console.log('1. 确认在设置中启用了"禁发中文"');
console.log('2. 刷新页面重新加载');
console.log('3. 查看上面的日志找出问题');
console.log('4. 在输入框输入中文，观察控制台日志');
