/**
 * API 连接测试脚本
 * 测试自定义 API 是否可以正常调用
 */

const https = require('https');
const { URL } = require('url');

// 从命令行参数获取配置
const apiKey = process.argv[2];
const endpoint = process.argv[3] || 'https://api.openai.com/v1/chat/completions';
const model = process.argv[4] || 'gpt-4';

if (!apiKey) {
  console.error('❌ 使用方法: node test-api-connection.js <API_KEY> [ENDPOINT] [MODEL]');
  console.error('例如: node test-api-connection.js sk-xxx https://api.openai.com/v1/chat/completions gpt-4');
  process.exit(1);
}

console.log('🧪 开始测试 API 连接...\n');
console.log('配置信息:');
console.log(`  API Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`);
console.log(`  Endpoint: ${endpoint}`);
console.log(`  Model: ${model}\n`);

async function testAPI() {
  const url = new URL(endpoint);
  
  const requestBody = JSON.stringify({
    model: model,
    messages: [
      {
        role: 'system',
        content: 'You are a professional translator. Only output the translation result without any explanations.'
      },
      {
        role: 'user',
        content: '请将以下文本翻译成英语，使用幽默风格：\n\n今天的会议真是太无聊了，我差点睡着。'
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

    console.log('📤 发送请求...\n');

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
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 测试失败:', error.message);
    console.error('\n请检查:');
    console.error('  1. API Key 是否正确');
    console.error('  2. API Endpoint 是否正确');
    console.error('  3. 模型名称是否正确');
    console.error('  4. 账户是否有足够的余额');
    console.error('  5. 网络连接是否正常');
    process.exit(1);
  });
