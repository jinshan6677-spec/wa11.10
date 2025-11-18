/**
 * F12 手动诊断工具
 * 在浏览器控制台中运行此脚本来测试 F12 功能
 */

console.log('🧪 F12 诊断工具启动...');

// 检查 window.electronAPI 是否可用
console.log('1️⃣ 检查 electronAPI:', !!window.electronAPI);

if (window.electronAPI) {
  console.log('2️⃣ 测试 get-accounts 方法...');
  window.electronAPI.getAccounts().then(accounts => {
    console.log('📋 可用账号数量:', accounts ? accounts.length : 0);
    if (accounts && accounts.length > 0) {
      console.log('👤 第一个账号:', accounts[0].id, accounts[0].name);
      
      console.log('3️⃣ 测试 get-active-account 方法...');
      return window.electronAPI.getActiveAccount();
    }
  }).then(activeResult => {
    console.log('🎯 当前活跃账号:', activeResult);
    
    console.log('4️⃣ 手动测试 toggleDeveloperTools...');
    return window.electronAPI.toggleDeveloperTools();
  }).then(f12Result => {
    console.log('🎉 F12 测试结果:', f12Result);
    
    console.log('5️⃣ 检查主窗口开发者工具状态...');
    return window.electronAPI.getDeveloperToolsStatus();
  }).then(devToolsStatus => {
    console.log('🔧 开发者工具状态:', devToolsStatus);
  }).catch(error => {
    console.error('❌ 诊断过程出错:', error);
  });
} else {
  console.error('❌ window.electronAPI 不可用');
}

// 额外的检查
console.log('6️⃣ 检查当前页面状态...');
console.log('📱 当前页面 URL:', window.location.href);
console.log('🖥️ 当前页面标题:', document.title);
console.log('📊 页面元素数量:', document.querySelectorAll('*').length);

// 检查是否有特定的元素
const sidebar = document.getElementById('sidebar');
const viewContainer = document.getElementById('view-container');
console.log('📋 侧边栏元素:', !!sidebar);
console.log('📱 视图容器元素:', !!viewContainer);

console.log('🧪 诊断工具完成。请按 F12 并查看结果。');
console.log('💡 如果仍有问题，请检查主进程控制台中的 [DEBUG] 日志。');