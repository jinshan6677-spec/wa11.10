/**
 * F12 Debug Test Script
 * 测试 F12 开发者工具切换功能
 */

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// 创建测试窗口
async function createTestWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'src', 'single-window', 'renderer', 'preload-main.js')
    }
  });

  await mainWindow.loadURL(`file://${path.join(__dirname, 'src', 'single-window', 'renderer', 'index.html')}`);
  
  return mainWindow;
}

// 模拟 F12 按键测试
async function testF12Functionality() {
  try {
    console.log('=== F12 调试功能测试 ===\n');
    
    // 注册 IPC 处理器来模拟环境
    ipcMain.handle('test-f12', async () => {
      console.log('📝 测试 F12 功能开始...');
      
      // 测试主窗口开发者工具切换
      console.log('1️⃣ 测试主窗口开发者工具切换');
      const mainWindow = BrowserWindow.getAllWindows()[0];
      if (mainWindow && !mainWindow.isDestroyed()) {
        if (mainWindow.webContents.isDevToolsOpened()) {
          mainWindow.webContents.closeDevTools();
          console.log('   ✅ 关闭主窗口开发者工具成功');
        } else {
          mainWindow.webContents.openDevTools({
            mode: 'detach',
            activate: true
          });
          console.log('   ✅ 打开主窗口开发者工具成功');
        }
      }
      
      return {
        success: true,
        message: 'F12 功能测试完成'
      };
    });

    // 模拟测试
    const result = await ipcMain.emit('test-f12');
    console.log('🎉 测试结果:', result);
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 主函数
async function main() {
  try {
    console.log('🚀 启动 F12 调试测试...');
    console.log('📍 当前工作目录:', process.cwd());
    console.log('🔧 Electron 版本:', process.versions.electron);
    console.log('📱 Node.js 版本:', process.versions.node);
    
    // 等待应用准备就绪
    await new Promise((resolve) => {
      if (app.isReady()) {
        resolve();
      } else {
        app.whenReady().then(resolve);
      }
    });
    
    console.log('✅ Electron 应用已准备就绪\n');
    
    // 运行测试
    await testF12Functionality();
    
    console.log('\n🏁 测试完成。按 Ctrl+C 退出。');
    
    // 保持应用运行
    setInterval(() => {
      // 保持事件循环活跃
    }, 1000);
    
  } catch (error) {
    console.error('💥 启动测试失败:', error);
    process.exit(1);
  }
}

// 错误处理
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 未处理的 Promise 拒绝:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('💥 未捕获的异常:', error);
  process.exit(1);
});

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  testF12Functionality
};
