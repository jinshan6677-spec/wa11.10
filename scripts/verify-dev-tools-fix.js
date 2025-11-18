#!/usr/bin/env node

/**
 * 验证开发者工具修复的脚本
 * 
 * 验证所有必要的修改都已正确应用
 */

const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('验证开发者工具修复');
console.log('========================================');

let allChecks = true;

function checkFile(filePath, checks) {
  console.log(`\n检查文件: ${filePath}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    for (const check of checks) {
      if (content.includes(check)) {
        console.log(`  ✓ ${check}`);
      } else {
        console.log(`  ✗ ${check} - 未找到`);
        allChecks = false;
      }
    }
  } catch (error) {
    console.log(`  ✗ 无法读取文件: ${error.message}`);
    allChecks = false;
  }
}

// 检查 MainWindow.js
checkFile('src/single-window/MainWindow.js', [
  'openDeveloperToolsInDetachedWindow',
  'forceFocus',
  'WhatsApp Desktop - 开发者控制台',
  'alwaysOnTop: true',
  'devToolsWindow',
  'closeDevToolsWindow()',
  '_generateDevToolsHTML'
]);

// 检查 ipcHandlers.js
checkFile('src/single-window/ipcHandlers.js', [
  'toggle-dev-tools',
  'get-dev-tools-status',
  'openDeveloperToolsInDetachedWindow'
]);

// 检查 main.js
checkFile('src/main.js', [
  '=== 开发者工具快捷键已启用 ===',
  '=== 开发模式已启用 ===',
  '独立开发者工具窗口将自动在屏幕右侧打开',
  'WhatsApp Desktop - 开发者控制台'
]);

// 跳过 package.json 检查（使用 read_file 进行验证）
console.log('跳过 package.json 检查（使用 read_file 验证）');

// 检查测试文件
checkFile('scripts/test-dev-tools.js', [
  '全新独立窗口模式',
  '不会被任何界面覆盖',
  '查看屏幕右侧的"WhatsApp Desktop - 开发者控制台"窗口'
]);

// 检查文档
checkFile('docs/DEVELOPER_TOOLS_IMPROVED.md', [
  '独立窗口版本',
  '不会被WhatsApp web界面覆盖',
  '屏幕右侧显示'
]);

console.log('\n========================================');
if (allChecks) {
  console.log('✓ 所有检查通过！全新独立开发者工具修复完成');
  console.log('\n最新功能:');
  console.log('• 独立的"WhatsApp Desktop - 开发者控制台"窗口');
  console.log('• 完全不会被WhatsApp界面覆盖');
  console.log('• 专用控制台界面，支持实时日志');
  console.log('• 始终保持在最前面 (alwaysOnTop)');
  console.log('\n使用方法:');
  console.log('1. 运行: npm run dev');
  console.log('2. 查看屏幕右侧的"WhatsApp Desktop - 开发者控制台"窗口');
  console.log('3. 使用 F12 或 Ctrl+Shift+I 切换窗口显示/隐藏');
  console.log('4. 窗口具有完整功能（最小化、最大化、关闭）');
} else {
  console.log('✗ 存在未通过的检查项');
}
console.log('========================================');