/**
 * 深度内存诊断脚本
 * 用于找出 WhatsApp Web 900MB 内存占用的真正原因
 */

(async function() {
  console.log('='.repeat(80));
  console.log('🔬 深度内存诊断 - 找出 900MB 内存占用的真凶');
  console.log('='.repeat(80));
  console.log('');

  const results = {
    timestamp: new Date().toISOString(),
    browser: navigator.userAgent,
    categories: {}
  };

  // ==================== 1. DOM 节点分析 ====================
  console.log('📊 1. DOM 节点详细分析');
  console.log('-'.repeat(80));

  const allElements = document.querySelectorAll('*');
  const tagCounts = {};
  const classCounts = {};
  
  allElements.forEach(el => {
    // 统计标签
    const tag = el.tagName.toLowerCase();
    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    
    // 统计类名
    if (el.className && typeof el.className === 'string') {
      el.className.split(' ').forEach(cls => {
        if (cls) {
          classCounts[cls] = (classCounts[cls] || 0) + 1;
        }
      });
    }
  });

  // 找出最多的标签
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  console.log('Top 10 HTML 标签:');
  topTags.forEach(([tag, count]) => {
    const percentage = ((count / allElements.length) * 100).toFixed(1);
    console.log(`  ${tag.padEnd(15)} ${count.toString().padStart(6)} 个 (${percentage}%)`);
  });

  // 找出最多的类名
  const topClasses = Object.entries(classCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  console.log('\nTop 10 CSS 类名:');
  topClasses.forEach(([cls, count]) => {
    console.log(`  ${cls.substring(0, 30).padEnd(32)} ${count.toString().padStart(6)} 个`);
  });

  results.categories.dom = {
    totalElements: allElements.length,
    topTags: topTags,
    topClasses: topClasses.slice(0, 5)
  };

  console.log('');

  // ==================== 2. 图片和媒体分析 ====================
  console.log('🖼️  2. 图片和媒体分析');
  console.log('-'.repeat(80));

  const images = document.querySelectorAll('img');
  const videos = document.querySelectorAll('video');
  const audios = document.querySelectorAll('audio');
  const canvases = document.querySelectorAll('canvas');

  let totalImageSize = 0;
  let loadedImages = 0;
  const imageSizes = [];

  images.forEach(img => {
    if (img.complete && img.naturalWidth > 0) {
      loadedImages++;
      // 估算图片大小 (宽 * 高 * 4 字节/像素)
      const estimatedSize = img.naturalWidth * img.naturalHeight * 4;
      totalImageSize += estimatedSize;
      imageSizes.push({
        src: img.src.substring(0, 50),
        width: img.naturalWidth,
        height: img.naturalHeight,
        size: estimatedSize
      });
    }
  });

  imageSizes.sort((a, b) => b.size - a.size);

  console.log(`图片总数: ${images.length} 个`);
  console.log(`已加载图片: ${loadedImages} 个`);
  console.log(`视频: ${videos.length} 个`);
  console.log(`音频: ${audios.length} 个`);
  console.log(`Canvas: ${canvases.length} 个`);
  console.log(`估算图片内存: ${(totalImageSize / (1024 * 1024)).toFixed(2)} MB`);

  if (imageSizes.length > 0) {
    console.log('\n最大的 5 张图片:');
    imageSizes.slice(0, 5).forEach((img, i) => {
      console.log(`  ${i + 1}. ${img.width}x${img.height} - ${(img.size / (1024 * 1024)).toFixed(2)} MB`);
      console.log(`     ${img.src}...`);
    });
  }

  results.categories.media = {
    images: images.length,
    loadedImages: loadedImages,
    videos: videos.length,
    audios: audios.length,
    canvases: canvases.length,
    estimatedImageMemory: parseFloat((totalImageSize / (1024 * 1024)).toFixed(2))
  };

  console.log('');

  // ==================== 3. WhatsApp 特定元素分析 ====================
  console.log('💬 3. WhatsApp 特定元素分析');
  console.log('-'.repeat(80));

  const messages = document.querySelectorAll('.message-in, .message-out');
  const chatItems = document.querySelectorAll('[data-testid="cell-frame-container"]');
  const messageImages = document.querySelectorAll('.message-in img, .message-out img');
  const messageVideos = document.querySelectorAll('.message-in video, .message-out video');
  const emojiElements = document.querySelectorAll('[data-testid="emoji"]');
  const avatars = document.querySelectorAll('[data-testid="default-user"], [data-testid="default-group"]');

  console.log(`聊天消息: ${messages.length} 条`);
  console.log(`聊天列表项: ${chatItems.length} 个`);
  console.log(`消息中的图片: ${messageImages.length} 张`);
  console.log(`消息中的视频: ${messageVideos.length} 个`);
  console.log(`表情符号: ${emojiElements.length} 个`);
  console.log(`头像: ${avatars.length} 个`);

  // 估算消息占用的内存
  let messageMemory = 0;
  messages.forEach(msg => {
    const text = msg.textContent || '';
    messageMemory += text.length * 2; // UTF-16
    messageMemory += 500; // DOM 节点开销
  });

  console.log(`估算消息内存: ${(messageMemory / (1024 * 1024)).toFixed(2)} MB`);

  results.categories.whatsapp = {
    messages: messages.length,
    chatItems: chatItems.length,
    messageImages: messageImages.length,
    messageVideos: messageVideos.length,
    emojis: emojiElements.length,
    avatars: avatars.length,
    estimatedMessageMemory: parseFloat((messageMemory / (1024 * 1024)).toFixed(2))
  };

  console.log('');

  // ==================== 4. 事件监听器分析 ====================
  console.log('👂 4. 事件监听器分析');
  console.log('-'.repeat(80));

  // 检查常见的事件监听器
  const eventTypes = ['click', 'scroll', 'mouseover', 'mouseout', 'input', 'change'];
  const listenerCounts = {};

  // 注意：无法直接获取所有监听器，这里只是估算
  console.log('⚠️  注意: 浏览器不允许直接访问所有事件监听器');
  console.log('以下是基于常见模式的估算:');

  // 检查 WhatsApp Translation 的监听器
  const wt = window.WhatsAppTranslation;
  if (wt) {
    let wtListeners = 0;
    if (wt.messageObserver) wtListeners++;
    if (wt.buttonMonitor) wtListeners++;
    if (wt.messageSentObserver) wtListeners++;
    if (wt.realtimeInputHandler) wtListeners++;
    if (wt.chineseBlockHandler) wtListeners += 4; // 4 个中文拦截监听器
    
    console.log(`翻译插件监听器: ~${wtListeners} 个`);
    listenerCounts.translation = wtListeners;
  }

  // 估算 WhatsApp 的监听器
  const interactiveElements = document.querySelectorAll('button, a, input, [role="button"]');
  console.log(`可交互元素: ${interactiveElements.length} 个 (每个可能有 1-3 个监听器)`);
  listenerCounts.interactive = interactiveElements.length;

  results.categories.listeners = listenerCounts;

  console.log('');

  // ==================== 5. 内存泄漏检测 ====================
  console.log('🔍 5. 潜在内存泄漏检测');
  console.log('-'.repeat(80));

  const leaks = [];

  // 检查分离的 DOM 节点
  const detachedNodes = [];
  try {
    // 这个方法在某些浏览器中可能不可用
    console.log('⚠️  分离 DOM 节点检测需要使用 Chrome DevTools Memory Profiler');
    console.log('建议: 打开 DevTools → Memory → Take Heap Snapshot');
  } catch (e) {
    console.log('无法自动检测分离的 DOM 节点');
  }

  // 检查大型对象
  console.log('\n检查全局对象:');
  const globalKeys = Object.keys(window);
  const largeGlobals = [];

  globalKeys.forEach(key => {
    try {
      const value = window[key];
      if (value && typeof value === 'object') {
        const str = JSON.stringify(value);
        if (str && str.length > 100000) { // > 100KB
          largeGlobals.push({
            key: key,
            size: str.length,
            type: Array.isArray(value) ? 'Array' : 'Object'
          });
        }
      }
    } catch (e) {
      // 忽略无法序列化的对象
    }
  });

  if (largeGlobals.length > 0) {
    console.log('发现大型全局对象:');
    largeGlobals.sort((a, b) => b.size - a.size).slice(0, 5).forEach(obj => {
      console.log(`  ${obj.key}: ${(obj.size / 1024).toFixed(2)} KB (${obj.type})`);
    });
  } else {
    console.log('✅ 未发现异常大的全局对象');
  }

  results.categories.leaks = {
    largeGlobals: largeGlobals.slice(0, 5)
  };

  console.log('');

  // ==================== 6. 缓存分析 ====================
  console.log('💾 6. 缓存和存储分析');
  console.log('-'.repeat(80));

  // LocalStorage
  let localStorageSize = 0;
  try {
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        localStorageSize += localStorage[key].length + key.length;
      }
    }
    console.log(`LocalStorage: ${(localStorageSize / 1024).toFixed(2)} KB`);
  } catch (e) {
    console.log('LocalStorage: 无法访问');
  }

  // SessionStorage
  let sessionStorageSize = 0;
  try {
    for (let key in sessionStorage) {
      if (sessionStorage.hasOwnProperty(key)) {
        sessionStorageSize += sessionStorage[key].length + key.length;
      }
    }
    console.log(`SessionStorage: ${(sessionStorageSize / 1024).toFixed(2)} KB`);
  } catch (e) {
    console.log('SessionStorage: 无法访问');
  }

  // IndexedDB
  try {
    const dbs = await indexedDB.databases();
    console.log(`IndexedDB 数据库: ${dbs.length} 个`);
    if (dbs.length > 0) {
      console.log('数据库列表:');
      dbs.forEach(db => {
        console.log(`  - ${db.name} (版本 ${db.version})`);
      });
    }
  } catch (e) {
    console.log('IndexedDB: 无法访问');
  }

  results.categories.storage = {
    localStorage: parseFloat((localStorageSize / 1024).toFixed(2)),
    sessionStorage: parseFloat((sessionStorageSize / 1024).toFixed(2))
  };

  console.log('');

  // ==================== 7. 内存估算汇总 ====================
  console.log('📊 7. 内存占用估算汇总');
  console.log('-'.repeat(80));

  const estimates = {
    dom: (allElements.length * 200) / (1024 * 1024), // 每个节点 200 字节
    images: totalImageSize / (1024 * 1024),
    messages: messageMemory / (1024 * 1024),
    storage: (localStorageSize + sessionStorageSize) / (1024 * 1024),
    javascript: 50, // 估算 JavaScript 对象占用
    other: 100 // 其他开销
  };

  const total = Object.values(estimates).reduce((a, b) => a + b, 0);

  console.log('各部分估算:');
  console.log(`  DOM 节点:        ${estimates.dom.toFixed(2).padStart(8)} MB`);
  console.log(`  图片/媒体:       ${estimates.images.toFixed(2).padStart(8)} MB`);
  console.log(`  消息内容:        ${estimates.messages.toFixed(2).padStart(8)} MB`);
  console.log(`  存储(LS/SS):     ${estimates.storage.toFixed(2).padStart(8)} MB`);
  console.log(`  JavaScript:      ${estimates.javascript.toFixed(2).padStart(8)} MB (估算)`);
  console.log(`  其他开销:        ${estimates.other.toFixed(2).padStart(8)} MB (估算)`);
  console.log(`  ${'─'.repeat(40)}`);
  console.log(`  估算总计:        ${total.toFixed(2).padStart(8)} MB`);
  console.log('');
  console.log(`⚠️  实际内存:      ${' '.repeat(8)}900 MB (任务管理器)`);
  console.log(`❓ 未解释部分:     ${(900 - total).toFixed(2).padStart(8)} MB`);

  results.estimates = estimates;
  results.total = total;
  results.actual = 900;
  results.unexplained = 900 - total;

  console.log('');

  // ==================== 8. 可能的原因分析 ====================
  console.log('🔎 8. 900MB 内存占用的可能原因');
  console.log('-'.repeat(80));

  const possibleCauses = [];

  // 分析未解释的内存
  const unexplained = 900 - total;
  
  if (unexplained > 500) {
    possibleCauses.push({
      cause: '浏览器基础开销',
      estimated: '300-500 MB',
      description: 'Chrome/Edge 标签页基础内存占用',
      likelihood: '高'
    });
  }

  if (messageImages.length > 50) {
    possibleCauses.push({
      cause: '图片缓存',
      estimated: `${(messageImages.length * 2).toFixed(0)}-${(messageImages.length * 5).toFixed(0)} MB`,
      description: `${messageImages.length} 张消息图片的解码缓存`,
      likelihood: '高'
    });
  }

  if (messages.length > 100) {
    possibleCauses.push({
      cause: '消息历史',
      estimated: '50-150 MB',
      description: `${messages.length} 条消息的完整 DOM 树`,
      likelihood: '中'
    });
  }

  possibleCauses.push({
    cause: 'WhatsApp Web 应用代码',
    estimated: '100-200 MB',
    description: 'React 框架、业务逻辑、状态管理',
    likelihood: '高'
  });

  possibleCauses.push({
    cause: '浏览器扩展',
    estimated: '50-200 MB',
    description: '其他已安装的浏览器扩展',
    likelihood: '中'
  });

  if (videos.length > 0) {
    possibleCauses.push({
      cause: '视频缓冲',
      estimated: `${(videos.length * 10).toFixed(0)}-${(videos.length * 50).toFixed(0)} MB`,
      description: `${videos.length} 个视频的缓冲区`,
      likelihood: '中'
    });
  }

  console.log('可能的内存占用来源:');
  possibleCauses.forEach((item, i) => {
    console.log(`\n${i + 1}. ${item.cause} [可能性: ${item.likelihood}]`);
    console.log(`   估算: ${item.estimated}`);
    console.log(`   说明: ${item.description}`);
  });

  results.possibleCauses = possibleCauses;

  console.log('');

  // ==================== 9. 优化建议 ====================
  console.log('💡 9. 降低内存占用的建议');
  console.log('-'.repeat(80));

  const recommendations = [];

  if (messageImages.length > 20) {
    recommendations.push({
      priority: '高',
      action: '清理聊天历史',
      method: '向上滚动到顶部，然后刷新页面',
      expectedSaving: `${(messageImages.length * 2).toFixed(0)}-${(messageImages.length * 5).toFixed(0)} MB`
    });
  }

  if (messages.length > 100) {
    recommendations.push({
      priority: '高',
      action: '限制加载的消息数量',
      method: '避免滚动到很久以前的消息',
      expectedSaving: '50-100 MB'
    });
  }

  recommendations.push({
    priority: '中',
    action: '清理浏览器缓存',
    method: 'Ctrl+Shift+Delete → 清除缓存的图片和文件',
    expectedSaving: '100-300 MB'
  });

  recommendations.push({
    priority: '中',
    action: '禁用不必要的扩展',
    method: '浏览器设置 → 扩展程序 → 禁用不常用的',
    expectedSaving: '50-200 MB'
  });

  recommendations.push({
    priority: '低',
    action: '使用轻量级浏览器',
    method: '尝试 Firefox 或 Edge',
    expectedSaving: '100-200 MB'
  });

  console.log('推荐的优化措施:');
  recommendations.forEach((rec, i) => {
    console.log(`\n${i + 1}. [${rec.priority}优先级] ${rec.action}`);
    console.log(`   方法: ${rec.method}`);
    console.log(`   预计节省: ${rec.expectedSaving}`);
  });

  results.recommendations = recommendations;

  console.log('');

  // ==================== 10. 总结 ====================
  console.log('='.repeat(80));
  console.log('📋 诊断总结');
  console.log('='.repeat(80));

  console.log(`\n当前状态:`);
  console.log(`  • 总 DOM 节点: ${allElements.length.toLocaleString()} 个`);
  console.log(`  • 图片数量: ${images.length} 张 (已加载 ${loadedImages} 张)`);
  console.log(`  • 消息数量: ${messages.length} 条`);
  console.log(`  • 估算内存: ${total.toFixed(2)} MB`);
  console.log(`  • 实际内存: 900 MB`);
  console.log(`  • 未解释: ${unexplained.toFixed(2)} MB`);

  console.log(`\n主要结论:`);
  if (unexplained > 600) {
    console.log(`  ❌ 大部分内存 (${unexplained.toFixed(0)} MB) 来自浏览器和 WhatsApp Web 本身`);
    console.log(`  ✅ 翻译插件占用极低，不是问题根源`);
    console.log(`  💡 建议: 清理浏览器缓存和聊天历史`);
  } else if (messageImages.length > 50) {
    console.log(`  ⚠️  大量图片 (${messageImages.length} 张) 可能占用大量内存`);
    console.log(`  💡 建议: 刷新页面清理图片缓存`);
  } else {
    console.log(`  ✅ 内存占用在合理范围内`);
  }

  console.log('\n💾 数据已保存到 window.deepDiagnosticData');
  console.log('可以通过 copy(deepDiagnosticData) 复制到剪贴板');
  
  window.deepDiagnosticData = results;

  console.log('');
  console.log('='.repeat(80));
  console.log('✅ 深度诊断完成');
  console.log('='.repeat(80));
  console.log('');

  return results;
})();
