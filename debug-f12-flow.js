/**
 * 调试F12流程的工具脚本
 * 帮助理解为什么F12还是打开主窗口的开发者工具
 */

// 这是一个测试脚本，用于在浏览器控制台中测试
if (typeof window !== 'undefined' && window.electronAPI) {
  console.log('=== F12调试流程测试 ===');
  
  // 测试1: 直接调用toggleDeveloperTools
  console.log('测试1: 调用toggleDeveloperTools');
  window.electronAPI.toggleDeveloperTools().then(result => {
    console.log('toggleDeveloperTools结果:', result);
  }).catch(error => {
    console.error('toggleDeveloperTools错误:', error);
  });
  
  // 测试2: 检查可用的API
  console.log('测试2: 检查electronAPI可用方法');
  const methods = Object.keys(window.electronAPI).filter(key => 
    typeof window.electronAPI[key] === 'function'
  );
  console.log('可用方法:', methods);
  
  // 测试3: 检查是否能直接调用get-accounts
  if (window.electronAPI.invoke) {
    console.log('测试3: 直接调用get-accounts');
    window.electronAPI.invoke('get-accounts').then(accounts => {
      console.log('账号列表:', accounts);
    }).catch(error => {
      console.error('获取账号失败:', error);
    });
  }
  
  // 测试4: 检查当前活跃账号
  if (window.electronAPI.invoke) {
    console.log('测试4: 获取当前活跃账号');
    window.electronAPI.invoke('account:get-active').then(active => {
      console.log('当前活跃账号:', active);
    }).catch(error => {
      console.error('获取活跃账号失败:', error);
    });
  }
  
  console.log('=== 测试完成，请检查结果 ===');
  
} else {
  console.log('此脚本需要在Electron渲染进程中运行');
}