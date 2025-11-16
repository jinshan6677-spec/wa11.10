/**
 * 翻译风格效果测试脚本
 * 用于验证不同风格的翻译效果差异
 */

const AITranslationAdapter = require('./src/translation/adapters/AITranslationAdapter');

// 从配置文件读取 API 配置
const fs = require('fs');
const path = require('path');

async function testTranslationStyles() {
  try {
    // 读取配置
    const configPath = path.join(__dirname, 'config', 'translation.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    const customEngine = config.engines.find(e => e.name === 'custom');
    if (!customEngine || !customEngine.enabled) {
      console.error('❌ Custom 引擎未配置或未启用');
      return;
    }

    // 创建翻译适配器
    const adapter = new AITranslationAdapter({
      apiKey: customEngine.apiKey,
      endpoint: customEngine.endpoint,
      model: customEngine.model
    });

    // 测试文本
    const testText = '哎，这几天忙得我都有点睡不够';
    const targetLang = 'en';

    // 测试不同风格
    const styles = ['通用', '正式', '口语化', '亲切', '幽默', '礼貌', '强硬', '简洁'];

    console.log('🧪 开始测试翻译风格效果\n');
    console.log(`原文: ${testText}`);
    console.log(`目标语言: 英语\n`);
    console.log('='.repeat(80));

    for (const style of styles) {
      try {
        console.log(`\n📝 风格: ${style}`);
        console.log('-'.repeat(80));
        
        const result = await adapter.translate(testText, 'zh-CN', targetLang, { style });
        
        console.log(`✅ 译文: ${result.translatedText}`);
        
        // 等待一下避免 API 限流
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.log(`❌ 翻译失败: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ 测试完成！请对比不同风格的翻译效果');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 运行测试
testTranslationStyles();
