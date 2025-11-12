/**
 * 翻译功能调试脚本
 * 在浏览器控制台中运行此脚本来诊断问题
 */

console.log('=== 翻译功能调试 ===');

// 1. 检查翻译 API 是否可用
console.log('1. 检查 translationAPI:', typeof window.translationAPI);
if (window.translationAPI) {
  console.log('   ✅ translationAPI 已加载');
  console.log('   可用方法:', Object.keys(window.translationAPI));
} else {
  console.log('   ❌ translationAPI 未加载');
}

// 2. 检查翻译系统是否初始化
console.log('2. 检查 WhatsAppTranslation:', typeof window.WhatsAppTranslation);
if (window.WhatsAppTranslation) {
  console.log('   ✅ WhatsAppTranslation 已加载');
  console.log('   初始化状态:', window.WhatsAppTranslation.initialized);
  console.log('   配置:', window.WhatsAppTranslation.config);
} else {
  console.log('   ❌ WhatsAppTranslation 未加载');
}

// 3. 检查翻译按钮
const translateBtn = document.getElementById('wa-translate-btn');
console.log('3. 检查翻译按钮:', translateBtn ? '✅ 已添加' : '❌ 未找到');

// 4. 检查样式
const styles = document.getElementById('wa-translation-styles');
console.log('4. 检查翻译样式:', styles ? '✅ 已注入' : '❌ 未注入');

// 5. 测试翻译功能
if (window.translationAPI) {
  console.log('5. 测试翻译功能...');
  window.translationAPI.translate({
    text: 'Hello',
    sourceLang: 'en',
    targetLang: 'zh-CN',
    engineName: 'google'
  }).then(result => {
    console.log('   ✅ 翻译成功:', result);
  }).catch(error => {
    console.log('   ❌ 翻译失败:', error);
  });
}

// 6. 获取配置
if (window.translationAPI) {
  console.log('6. 获取配置...');
  window.translationAPI.getConfig('default').then(result => {
    console.log('   配置:', result);
  });
}

console.log('=== 调试完成 ===');
console.log('如果看到错误，请将上述信息提供给开发者');
