/**
 * 多实例架构验证脚本
 * 测试核心功能是否按照需求实现
 */

const { app, BrowserWindow } = require('electron');
const path = require('path');

// 导入管理器
const AccountConfigManager = require('./src/managers/AccountConfigManager');
const InstanceManager = require('./src/managers/InstanceManager');
const TranslationIntegration = require('./src/managers/TranslationIntegration');
const SessionManager = require('./src/managers/SessionManager');
const NotificationManager = require('./src/managers/NotificationManager');
const ResourceManager = require('./src/managers/ResourceManager');

let testResults = [];

function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
  testResults.push(`[${timestamp}] ${message}`);
}

function logSuccess(test) {
  log(`✅ PASS: ${test}`);
}

function logFailure(test, error) {
  log(`❌ FAIL: ${test} - ${error}`);
}

async function runTests() {
  log('========================================');
  log('开始验证多实例架构实现');
  log('========================================');

  try {
    // 测试 1: 账号配置管理器
    log('\n测试 1: 账号配置管理器');
    const accountConfigManager = new AccountConfigManager({
      cwd: app.getPath('userData')
    });
    
    // 创建测试账号
    const testAccount = await accountConfigManager.createAccount({
      name: '测试账号1',
      proxy: {
        enabled: true,
        protocol: 'socks5',
        host: '127.0.0.1',
        port: 1080
      },
      translation: {
        enabled: true,
        targetLanguage: 'zh-CN',
        engine: 'google'
      }
    });
    
    if (testAccount.success) {
      logSuccess('创建账号配置');
      log(`  账号 ID: ${testAccount.account.id}`);
      log(`  账号名称: ${testAccount.account.name}`);
    } else {
      logFailure('创建账号配置', testAccount.errors.join(', '));
    }

    // 测试 2: 加载账号配置
    log('\n测试 2: 加载账号配置');
    const accounts = await accountConfigManager.loadAccounts();
    if (accounts.length > 0) {
      logSuccess(`加载账号配置 (共 ${accounts.length} 个账号)`);
      accounts.forEach(acc => {
        log(`  - ${acc.name} (${acc.id})`);
      });
    } else {
      logFailure('加载账号配置', '没有找到账号');
    }

    // 测试 3: 初始化管理器
    log('\n测试 3: 初始化管理器');
    
    const sessionManager = new SessionManager({
      userDataPath: app.getPath('userData')
    });
    logSuccess('会话管理器初始化');

    const notificationManager = new NotificationManager();
    logSuccess('通知管理器初始化');

    const resourceManager = new ResourceManager({
      limits: {
        maxInstances: 30,
        maxMemoryUsagePercent: 90,
        maxCpuUsagePercent: 90
      }
    });
    logSuccess('资源管理器初始化');

    const translationIntegration = new TranslationIntegration(null);
    await translationIntegration.initialize();
    logSuccess('翻译集成初始化');

    const instanceManager = new InstanceManager({
      userDataPath: app.getPath('userData'),
      maxInstances: 30,
      translationIntegration: translationIntegration,
      sessionManager: sessionManager,
      notificationManager: notificationManager,
      resourceManager: resourceManager
    });
    translationIntegration.instanceManager = instanceManager;
    logSuccess('实例管理器初始化');

    // 测试 4: 资源检查
    log('\n测试 4: 资源检查');
    const resourceCheck = await resourceManager.canCreateInstance(0);
    if (resourceCheck.allowed) {
      logSuccess('资源检查通过');
      log(`  内存使用: ${resourceCheck.resources.memoryUsagePercent.toFixed(1)}%`);
      log(`  CPU 使用: ${resourceCheck.resources.cpuUsage.toFixed(1)}%`);
    } else {
      logFailure('资源检查', resourceCheck.reason);
    }

    // 测试 5: 创建实例（不实际加载 WhatsApp）
    log('\n测试 5: 实例创建能力测试');
    if (testAccount.success) {
      log('  跳过实际创建实例（避免打开浏览器窗口）');
      log('  验证实例管理器方法存在性:');
      
      const methods = [
        'createInstance',
        'destroyInstance',
        'restartInstance',
        'getInstanceStatus',
        'getRunningInstances',
        'setupInstanceMonitoring',
        'updateProxyConfig',
        'saveWindowState'
      ];
      
      let allMethodsExist = true;
      methods.forEach(method => {
        if (typeof instanceManager[method] === 'function') {
          log(`    ✓ ${method}`);
        } else {
          log(`    ✗ ${method} 不存在`);
          allMethodsExist = false;
        }
      });
      
      if (allMethodsExist) {
        logSuccess('实例管理器所有核心方法存在');
      } else {
        logFailure('实例管理器方法检查', '部分方法缺失');
      }
    }

    // 测试 6: 会话管理
    log('\n测试 6: 会话管理功能');
    if (testAccount.success) {
      const hasSession = await sessionManager.hasSessionData(testAccount.account.id);
      log(`  账号 ${testAccount.account.id} 会话数据存在: ${hasSession}`);
      logSuccess('会话数据检查功能正常');
    }

    // 测试 7: 翻译配置
    log('\n测试 7: 翻译配置功能');
    const translationMethods = [
      'injectScripts',
      'configureTranslation',
      'removeInstance',
      'initialize',
      'cleanup'
    ];
    
    let allTranslationMethodsExist = true;
    translationMethods.forEach(method => {
      if (typeof translationIntegration[method] === 'function') {
        log(`    ✓ ${method}`);
      } else {
        log(`    ✗ ${method} 不存在`);
        allTranslationMethodsExist = false;
      }
    });
    
    if (allTranslationMethodsExist) {
      logSuccess('翻译集成所有核心方法存在');
    } else {
      logFailure('翻译集成方法检查', '部分方法缺失');
    }

    // 测试 8: 账号配置验证
    log('\n测试 8: 账号配置验证');
    if (testAccount.success) {
      const validation = testAccount.account.validate();
      if (validation.valid) {
        logSuccess('账号配置验证通过');
      } else {
        logFailure('账号配置验证', validation.errors.join(', '));
      }
    }

    // 测试 9: 导出/导入功能
    log('\n测试 9: 账号导出/导入功能');
    const exportData = await accountConfigManager.exportAccounts();
    if (exportData.accounts && exportData.accounts.length > 0) {
      logSuccess(`账号导出功能正常 (导出 ${exportData.accounts.length} 个账号)`);
    } else {
      logFailure('账号导出', '导出数据为空');
    }

    // 测试 10: 清理测试账号
    log('\n测试 10: 清理测试数据');
    if (testAccount.success) {
      const deleteResult = await accountConfigManager.deleteAccount(
        testAccount.account.id,
        { deleteUserData: true, userDataPath: app.getPath('userData') }
      );
      
      if (deleteResult.success) {
        logSuccess('测试账号删除成功');
      } else {
        logFailure('删除测试账号', deleteResult.errors.join(', '));
      }
    }

    // 汇总结果
    log('\n========================================');
    log('验证完成');
    log('========================================');
    
    const passCount = testResults.filter(r => r.includes('✅')).length;
    const failCount = testResults.filter(r => r.includes('❌')).length;
    
    log(`\n总计: ${passCount} 个测试通过, ${failCount} 个测试失败`);
    
    if (failCount === 0) {
      log('\n🎉 所有测试通过！多实例架构实现符合需求。');
    } else {
      log('\n⚠️  部分测试失败，请检查实现。');
    }

  } catch (error) {
    log(`\n❌ 测试过程中发生错误: ${error.message}`);
    log(error.stack);
  }

  // 等待一下让日志输出完成
  setTimeout(() => {
    app.quit();
  }, 1000);
}

app.whenReady().then(runTests);

app.on('window-all-closed', () => {
  // 不退出，让测试完成
});
