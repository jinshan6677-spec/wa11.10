/**
 * 语法检查脚本
 * 检查修改的文件是否有语法错误
 */

const fs = require('fs');
const path = require('path');

const filesToCheck = [
  'src/single-window/ipcHandlers.js',
  'src/container/renderer.js',
  'src/single-window/renderer/sidebar.js',
  'src/container/preload-main.js',
  'src/container/ipcHandlers.js'
];

function checkSyntax(filePath) {
  try {
    const fullPath = path.resolve(__dirname, filePath);
    console.log(`检查文件: ${fullPath}`);
    
    // 读取文件内容
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // 尝试解析JavaScript
    new Function(content);
    
    console.log(`✅ ${filePath} - 语法正确`);
    return true;
  } catch (error) {
    console.log(`❌ ${filePath} - 语法错误:`);
    console.log(`   ${error.message}`);
    return false;
  }
}

console.log('开始语法检查...\n');

let allPassed = true;
for (const file of filesToCheck) {
  if (!checkSyntax(file)) {
    allPassed = false;
  }
  console.log(); // 空行分隔
}

if (allPassed) {
  console.log('🎉 所有文件语法检查通过！');
} else {
  console.log('⚠️  发现语法错误，请修复后再使用。');
  process.exit(1);
}
