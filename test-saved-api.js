/**
 * 测试已保存的 API 配置
 * 自动从 electron-store 读取配置并测试
 */

const Store = require('electron-store');
const https = require('https');
const { URL } = require('url');
const crypto = require('crypto');

// 初始化 store
const store = new Store({
  name: 'translation-config'
});

console.log('🔍 读取已保存的配置...\n');

// 读取引擎配置
const engines = store.get('engines') || {};
console.log('找到的引擎:', Object.keys(engines));

if (!engines.custom) {
  console.error('❌ 未找到 custom 引擎配置');
  console.error('请先在应用中配置 Custom API 并保存');
  process.exit(1);
}

const customConfig = engines.custom;
console.log('\nCustom 引擎配置:');
console.log('  Enabled:', customConfig.enabled);
console.log('  Endpoint:', customConfig.endpoint);
console.log('  Model:', customConfig.model);
console.log('  API Key (加密):', customConfig.apiKey ? '存在' : '不存在');

if (!customConfig.enabled) {
  console.error('\n❌ Custom 引擎未启用');
  process.exit(1);
}

if (!customConfig.apiKey) {
  console.error('\n❌ 未找到 API Key');
  process.exit(1);
}

// 解密 API Key (简单的 base64 解码，实际可能更复杂)
let apiKey = customConfig.apiKey;
try {
  // 尝试 base64 解码
  apiKey = Buffer.from(customConfig.apiKey, 'base64').toString('utf8');
  console.log('  API Key (解密后):', apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 4));
} catch (e) {
  // 如果解码失败，可能是明文存储
  console.log('  API Key (明文):', apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 4));
}

console.log('\n🧪 开始测试 API 连接...\n');

async function testAPI() {
  const url = new URL(customConfig.endpoint);
  
  const requestBody = JSON.stringify({
    model: customConfig.model,
    messages: [
      {
        role: 'system',
        content: 'You are a professional translator. Follow the style instructions precisely and only output the translation result without any explanations.'
      },
      {
        role: 'user',
        content: `你是一个风趣幽默的翻译助手。请将以下文本翻译成英语。

【重要】在准确传达原意的基础上，适当增加幽默感、俏皮话或有趣的表达方式。可以使用双关语、比喻等修辞手法增加趣味性。

原文：
今天的会议真是太无聊了，我差点睡着。

翻译要求：
1. 只输出翻译结果，不要包含任何解释、说明或额外内容
2. 严格遵守上述风格要求，风格特征必须明显体现
3. 保持原文的完整意思`
      }
    ],
    max_tokens: 2000,
    temperature: 0.9
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(requestBody)
      }
    };

    console.log('📤 发送请求到:', customConfig.endpoint);
    console.log('📝 使用模型:', customConfig.model);
    console.log('🎨 测试风格: 幽默\n');

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`📥 收到响应 (状态码: ${res.statusCode})\n`);
        
        if (res.statusCode !== 200) {
          console.error('❌ API 调用失败!');
          console.error(`状态码: ${res.statusCode}`);
          console.error(`响应内容: ${data}\n`);
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          return;
        }

        try {
          const parsed = JSON.parse(data);
          
          if (parsed.error) {
            console.error('❌ API 返回错误:');
            console.error(JSON.stringify(parsed.error, null, 2));
            reject(new Error(`API Error: ${parsed.error.message}`));
            return;
          }

          const translatedText = parsed.choices?.[0]?.message?.content;
          
          if (!translatedText) {
            console.error('❌ 响应中没有翻译结果');
            console.error('完整响应:', JSON.stringify(parsed, null, 2));
            reject(new Error('No translation result in response'));
            return;
          }

          console.log('✅ API 调用成功!\n');
          console.log('原文: 今天的会议真是太无聊了，我差点睡着。');
          console.log(`译文: ${translatedText}\n`);
          
          // 显示使用的 token 数量
          if (parsed.usage) {
            console.log('Token 使用情况:');
            console.log(`  Prompt tokens: ${parsed.usage.prompt_tokens}`);
            console.log(`  Completion tokens: ${parsed.usage.completion_tokens}`);
            console.log(`  Total tokens: ${parsed.usage.total_tokens}\n`);
          }

          resolve(translatedText);

        } catch (error) {
          console.error('❌ 解析响应失败:', error.message);
          console.error('原始响应:', data);
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ 网络错误:', error.message);
      reject(new Error(`Network error: ${error.message}`));
    });

    req.setTimeout(30000, () => {
      req.destroy();
      console.error('❌ 请求超时 (30秒)');
      reject(new Error('Request timeout'));
    });

    req.write(requestBody);
    req.end();
  });
}

// 运行测试
testAPI()
  .then(() => {
    console.log('✅ 测试完成！你的 API 配置正确，可以正常使用。');
    console.log('\n现在的问题是应用没有正确加载这个配置。');
    console.log('需要检查 translationService 的初始化流程。');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 测试失败:', error.message);
    console.error('\n可能的原因:');
    console.error('  1. API Key 不正确或已过期');
    console.error('  2. API Endpoint 不正确');
    console.error('  3. 模型名称不正确');
    console.error('  4. 账户余额不足');
    console.error('  5. 网络连接问题');
    process.exit(1);
  });
