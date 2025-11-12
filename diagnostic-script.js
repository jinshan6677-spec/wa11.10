/**
 * WhatsApp 翻译插件内存诊断脚本
 * 在 WhatsApp Web 页面的浏览器控制台中运行此脚本
 */

(function() {
  console.log('='.repeat(60));
  console.log('📊 WhatsApp 翻译插件内存诊断报告');
  console.log('='.repeat(60));
  console.log('');

  // 1. 基础信息
  console.log('📌 基础信息');
  console.log('-'.repeat(60));
  
  const currentUrl = window.location.href;
  const isInChat = currentUrl.includes('/chat/');
  console.log(`当前页面: ${isInChat ? '聊天窗口' : '聊天列表'}`);
  console.log(`URL: ${currentUrl}`);
  console.log('');

  // 2. 消息统计
  console.log('💬 消息统计');
  console.log('-'.repeat(60));
  
  const allMessages = document.querySelectorAll('.message-in, .message-out');
  const incomingMessages = document.querySelectorAll('.message-in');
  const outgoingMessages = document.querySelectorAll('.message-out');
  
  console.log(`总消息数: ${allMessages.length} 条`);
  console.log(`  ├─ 接收消息: ${incomingMessages.length} 条`);
  console.log(`  └─ 发送消息: ${outgoingMessages.length} 条`);
  console.log('');

  // 3. 翻译统计
  console.log('🌐 翻译统计');
  console.log('-'.repeat(60));
  
  const translationResults = document.querySelectorAll('.wa-translation-result');
  const translationButtons = document.querySelectorAll('.wa-translate-btn');
  const realtimePreview = document.querySelectorAll('.wa-realtime-preview');
  const reverseTranslation = document.querySelectorAll('.wa-input-reverse-translation');
  
  console.log(`翻译结果数: ${translationResults.length} 个`);
  console.log(`翻译按钮数: ${translationButtons.length} 个`);
  console.log(`实时预览数: ${realtimePreview.length} 个`);
  console.log(`反向翻译数: ${reverseTranslation.length} 个`);
  
  const translationRate = allMessages.length > 0 
    ? ((translationResults.length / allMessages.length) * 100).toFixed(1)
    : 0;
  console.log(`翻译覆盖率: ${translationRate}%`);
  console.log('');

  // 4. DOM 节点统计
  console.log('🌳 DOM 节点统计');
  console.log('-'.repeat(60));
  
  const totalNodes = document.querySelectorAll('*').length;
  const translationNodes = document.querySelectorAll('.wa-translation-result *').length;
  const translationNodeRate = ((translationNodes / totalNodes) * 100).toFixed(2);
  
  console.log(`总 DOM 节点数: ${totalNodes.toLocaleString()} 个`);
  console.log(`翻译相关节点: ${translationNodes.toLocaleString()} 个 (${translationNodeRate}%)`);
  
  // 计算平均每个翻译结果的节点数
  if (translationResults.length > 0) {
    const avgNodesPerTranslation = (translationNodes / translationResults.length).toFixed(1);
    console.log(`平均每个翻译: ${avgNodesPerTranslation} 个节点`);
  }
  console.log('');

  // 5. 翻译结果详细分析
  console.log('🔍 翻译结果详细分析');
  console.log('-'.repeat(60));
  
  let totalTranslationTextLength = 0;
  let maxTranslationLength = 0;
  let minTranslationLength = Infinity;
  
  translationResults.forEach(result => {
    const textElement = result.querySelector('.translation-text');
    if (textElement) {
      const length = textElement.textContent.length;
      totalTranslationTextLength += length;
      maxTranslationLength = Math.max(maxTranslationLength, length);
      minTranslationLength = Math.min(minTranslationLength, length);
    }
  });
  
  if (translationResults.length > 0) {
    const avgLength = (totalTranslationTextLength / translationResults.length).toFixed(0);
    console.log(`平均翻译长度: ${avgLength} 字符`);
    console.log(`最长翻译: ${maxTranslationLength} 字符`);
    console.log(`最短翻译: ${minTranslationLength === Infinity ? 0 : minTranslationLength} 字符`);
    console.log(`总翻译文本: ${(totalTranslationTextLength / 1024).toFixed(2)} KB`);
  } else {
    console.log('暂无翻译结果');
  }
  console.log('');

  // 6. 监听器和观察器检查
  console.log('👂 监听器和观察器');
  console.log('-'.repeat(60));
  
  const wt = window.WhatsAppTranslation;
  if (wt) {
    console.log('✅ WhatsAppTranslation 对象存在');
    console.log(`  ├─ 已初始化: ${wt.initialized ? '是' : '否'}`);
    console.log(`  ├─ 消息观察器: ${wt.messageObserver ? '运行中' : '未运行'}`);
    console.log(`  ├─ 按钮监控: ${wt.buttonMonitor ? '运行中' : '未运行'}`);
    console.log(`  ├─ 实时翻译: ${wt._realtimeInitialized ? '已启用' : '未启用'}`);
    console.log(`  ├─ 中文拦截: ${wt._chineseBlockInitialized ? '已启用' : '未启用'}`);
    console.log(`  └─ 按钮监控: ${wt._buttonMonitorInitialized ? '已启用' : '未启用'}`);
  } else {
    console.log('❌ WhatsAppTranslation 对象不存在');
  }
  console.log('');

  // 7. 可见性分析
  console.log('👁️ 可见性分析');
  console.log('-'.repeat(60));
  
  let visibleMessages = 0;
  let visibleTranslations = 0;
  
  allMessages.forEach(msg => {
    const rect = msg.getBoundingClientRect();
    const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
    if (isVisible) {
      visibleMessages++;
      if (msg.querySelector('.wa-translation-result')) {
        visibleTranslations++;
      }
    }
  });
  
  console.log(`可见消息数: ${visibleMessages} 条 (${((visibleMessages / allMessages.length) * 100).toFixed(1)}%)`);
  console.log(`可见翻译数: ${visibleTranslations} 个`);
  console.log(`不可见消息: ${allMessages.length - visibleMessages} 条`);
  console.log(`不可见翻译: ${translationResults.length - visibleTranslations} 个`);
  console.log('');

  // 8. 内存估算
  console.log('💾 内存估算');
  console.log('-'.repeat(60));
  
  // 估算每个 DOM 节点平均占用 (粗略估计)
  const avgBytesPerNode = 200; // 每个 DOM 节点约 200 字节
  const estimatedDOMMemory = (totalNodes * avgBytesPerNode) / (1024 * 1024);
  const estimatedTranslationMemory = (translationNodes * avgBytesPerNode) / (1024 * 1024);
  const estimatedTextMemory = (totalTranslationTextLength * 2) / (1024 * 1024); // UTF-16, 每字符 2 字节
  
  console.log(`估算总 DOM 内存: ${estimatedDOMMemory.toFixed(2)} MB`);
  console.log(`估算翻译 DOM: ${estimatedTranslationMemory.toFixed(2)} MB`);
  console.log(`估算翻译文本: ${estimatedTextMemory.toFixed(2)} MB`);
  console.log(`估算翻译总计: ${(estimatedTranslationMemory + estimatedTextMemory).toFixed(2)} MB`);
  console.log('');
  console.log('⚠️  注意: 以上为粗略估算，实际内存占用可能不同');
  console.log('');

  // 9. 性能建议
  console.log('💡 性能建议');
  console.log('-'.repeat(60));
  
  const suggestions = [];
  
  if (translationResults.length > 100) {
    suggestions.push('⚠️  翻译结果过多 (>100)，建议启用虚拟滚动或限制历史');
  }
  
  if (translationResults.length - visibleTranslations > 50) {
    suggestions.push('⚠️  大量不可见翻译 (>50)，建议定期清理');
  }
  
  if (translationNodeRate > 30) {
    suggestions.push('⚠️  翻译节点占比过高 (>30%)，建议优化 DOM 结构');
  }
  
  if (avgNodesPerTranslation > 10) {
    suggestions.push('⚠️  每个翻译节点数过多 (>10)，建议简化 HTML 结构');
  }
  
  if (allMessages.length > 200) {
    suggestions.push('⚠️  消息数量过多 (>200)，建议只翻译可见消息');
  }
  
  if (suggestions.length === 0) {
    console.log('✅ 当前状态良好，无需优化');
  } else {
    suggestions.forEach(s => console.log(s));
  }
  console.log('');

  // 10. 优化潜力分析
  console.log('🎯 优化潜力分析');
  console.log('-'.repeat(60));
  
  const invisibleTranslations = translationResults.length - visibleTranslations;
  const potentialSavings = (invisibleTranslations * avgBytesPerNode * 8) / (1024 * 1024); // 假设每个翻译 8 个节点
  
  console.log(`不可见翻译数: ${invisibleTranslations} 个`);
  console.log(`潜在节省内存: ${potentialSavings.toFixed(2)} MB`);
  
  if (translationResults.length > 50) {
    const excessTranslations = translationResults.length - 50;
    const limitSavings = (excessTranslations * avgBytesPerNode * 8) / (1024 * 1024);
    console.log(`限制到 50 条可节省: ${limitSavings.toFixed(2)} MB`);
  }
  
  console.log('');

  // 11. 总结
  console.log('📋 诊断总结');
  console.log('-'.repeat(60));
  
  let status = '✅ 正常';
  let recommendation = '无需优化';
  
  if (allMessages.length < 20 && translationResults.length < 20) {
    status = '✅ 轻度使用';
    recommendation = '内存占用应在 200-400MB，如超过则需优化';
  } else if (allMessages.length < 50 && translationResults.length < 50) {
    status = '✅ 中度使用';
    recommendation = '内存占用应在 400-600MB，如超过则建议优化';
  } else if (allMessages.length < 100 && translationResults.length < 100) {
    status = '⚠️  重度使用';
    recommendation = '内存占用 600-900MB 可接受，建议实施轻量级优化';
  } else {
    status = '❌ 超重度使用';
    recommendation = '内存占用 >900MB，强烈建议实施优化方案';
  }
  
  console.log(`使用状态: ${status}`);
  console.log(`消息数量: ${allMessages.length} 条`);
  console.log(`翻译数量: ${translationResults.length} 个`);
  console.log(`建议: ${recommendation}`);
  console.log('');

  // 12. 详细数据导出
  console.log('📤 详细数据');
  console.log('-'.repeat(60));
  
  const diagnosticData = {
    timestamp: new Date().toISOString(),
    url: currentUrl,
    isInChat: isInChat,
    messages: {
      total: allMessages.length,
      incoming: incomingMessages.length,
      outgoing: outgoingMessages.length,
      visible: visibleMessages
    },
    translations: {
      total: translationResults.length,
      visible: visibleTranslations,
      invisible: invisibleTranslations,
      coverageRate: parseFloat(translationRate)
    },
    dom: {
      totalNodes: totalNodes,
      translationNodes: translationNodes,
      translationNodeRate: parseFloat(translationNodeRate),
      avgNodesPerTranslation: translationResults.length > 0 ? parseFloat(avgNodesPerTranslation) : 0
    },
    memory: {
      estimatedDOMMemory: parseFloat(estimatedDOMMemory.toFixed(2)),
      estimatedTranslationMemory: parseFloat(estimatedTranslationMemory.toFixed(2)),
      estimatedTextMemory: parseFloat(estimatedTextMemory.toFixed(2)),
      potentialSavings: parseFloat(potentialSavings.toFixed(2))
    },
    status: status,
    recommendation: recommendation
  };
  
  console.log('数据已保存到 window.diagnosticData');
  console.log('可以通过 copy(diagnosticData) 复制到剪贴板');
  window.diagnosticData = diagnosticData;
  console.log('');

  console.log('='.repeat(60));
  console.log('✅ 诊断完成');
  console.log('='.repeat(60));
  console.log('');
  console.log('💡 提示:');
  console.log('  1. 如需查看详细数据: console.log(diagnosticData)');
  console.log('  2. 如需复制数据: copy(diagnosticData)');
  console.log('  3. 如需重新诊断: 刷新页面后重新运行此脚本');
  console.log('');

  return diagnosticData;
})();
