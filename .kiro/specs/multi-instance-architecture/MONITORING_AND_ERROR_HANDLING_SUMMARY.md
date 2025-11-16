# 实例监控和错误处理实现总结

## 概述

本文档总结了任务 4 "实现实例监控和健康检查" 的实现细节，包括实例状态监控和崩溃处理自动重启功能。

## 实现的功能

### 4.1 实例状态监控

#### 核心功能

1. **全局监控系统**
   - 每 10 秒自动检查所有实例的健康状态
   - 可以启动/停止全局监控
   - 自动在创建第一个实例时启动监控

2. **心跳检测**
   - 跟踪每个实例的最后心跳时间
   - 60 秒无更新时报告心跳超时
   - 自动更新心跳时间戳

3. **资源使用监控**
   - 实时监控内存使用（MB）
   - 实时监控 CPU 使用率（%）
   - 高资源使用时记录警告日志
   - 阈值：内存 > 1000MB，CPU > 50%

4. **响应性检查**
   - 使用 `executeJavaScript` 检查实例是否响应
   - 5 秒超时机制
   - 检测到无响应时更新状态

5. **健康状态报告**
   - `getInstanceHealth(instanceId)` - 获取单个实例的详细健康状态
   - `getAllInstancesHealth()` - 获取所有实例的健康状态摘要
   - 返回健康状态、问题列表和详细信息

#### 实现的方法

```javascript
// InstanceManager 新增方法
setupInstanceMonitoring(instanceId, window)
startGlobalMonitoring()
stopGlobalMonitoring()
_performHealthCheck()
_updateResourceUsage(instanceId, window)
_checkInstanceResponsiveness(instanceId, window)
getInstanceHealth(instanceId)
getAllInstancesHealth()
```

#### 监控的事件

- `crashed` - 渲染进程崩溃
- `unresponsive` - 窗口无响应
- `responsive` - 窗口恢复响应
- `closed` - 窗口关闭
- `did-finish-load` - 页面加载完成
- `did-fail-load` - 页面加载失败

### 4.2 崩溃处理和自动重启

#### 核心功能

1. **ErrorHandler 类**
   - 独立的错误处理器类
   - 与 InstanceManager 集成
   - 支持多种错误类型
   - 详细的错误日志记录

2. **崩溃计数器**
   - 跟踪每个实例的崩溃历史
   - 基于时间窗口的崩溃计数（默认 5 分钟）
   - 自动清理过期的崩溃记录
   - 支持手动清除崩溃历史

3. **自动重启逻辑**
   - 崩溃次数 < 3 时自动重启
   - 延迟 5 秒后重启（可配置）
   - 超过阈值后标记为 "failed"
   - 停止自动重启以防止无限循环

4. **错误类型支持**
   - `CRASH` - 实例崩溃
   - `PROXY_ERROR` - 代理错误
   - `TRANSLATION_ERROR` - 翻译错误
   - `PAGE_LOAD_ERROR` - 页面加载错误
   - `UNRESPONSIVE` - 实例无响应
   - `RESTART_FAILED` - 重启失败
   - `MAX_CRASH_COUNT_EXCEEDED` - 超过最大崩溃次数

5. **详细日志记录**
   - JSON Lines 格式
   - 包含时间戳、实例 ID、错误类型、详细信息
   - 支持日志查询和过滤
   - 支持按实例 ID、错误类型过滤
   - 支持限制返回数量

6. **崩溃统计**
   - 总崩溃次数
   - 最近时间窗口内的崩溃次数
   - 最后崩溃时间
   - 支持查询所有实例的统计

#### 实现的类和方法

```javascript
// ErrorHandler 类
class ErrorHandler {
  constructor(instanceManager, options)
  
  // 错误处理方法
  handleInstanceCrash(instanceId, error, killed)
  handleProxyError(instanceId, error)
  handleTranslationError(instanceId, error)
  handlePageLoadError(instanceId, errorCode, errorDescription)
  handleInstanceUnresponsive(instanceId)
  
  // 崩溃管理方法
  getCrashStats(instanceId)
  getAllCrashStats()
  clearCrashHistory(instanceId)
  clearAllCrashHistory()
  
  // 日志管理方法
  readErrorLogs(options)
  clearErrorLogs()
  
  // 内部方法
  _recordCrash(instanceId, error, killed)
  _getCrashHistory(instanceId)
  _getRecentCrashes(crashHistory)
  _attemptRestart(instanceId)
  _cancelRestartTimer(instanceId)
  _logError(errorLog)
}
```

#### 配置选项

```javascript
{
  maxCrashCount: 3,           // 最大崩溃次数
  crashResetTime: 300000,     // 崩溃计数重置时间（5 分钟）
  restartDelay: 5000,         // 重启延迟（5 秒）
  logPath: 'path/to/errors.log' // 日志文件路径
}
```

## 文件结构

```
src/
├── managers/
│   ├── InstanceManager.js          # 更新：添加监控功能
│   ├── ErrorHandler.js             # 新增：错误处理器
│   └── README.md                   # 更新：添加文档
└── examples/
    └── error-handler-example.js    # 新增：使用示例
```

## 集成方式

### 1. 创建和关联

```javascript
const instanceManager = new InstanceManager();
const errorHandler = new ErrorHandler(instanceManager, {
  maxCrashCount: 3,
  crashResetTime: 300000,
  restartDelay: 5000,
  logPath: path.join(app.getPath('userData'), 'logs', 'errors.log')
});

// 关联到实例管理器
instanceManager.errorHandler = errorHandler;
```

### 2. 自动错误处理

InstanceManager 在以下情况自动调用 ErrorHandler：

- 窗口崩溃 → `handleInstanceCrash()`
- 窗口无响应 → `handleInstanceUnresponsive()`
- 页面加载失败 → `handlePageLoadError()`
- 代理配置失败 → `handleProxyError()`

### 3. 监控启动

```javascript
// 创建实例时自动启动监控
const result = await instanceManager.createInstance(accountConfig);

// 监控会在创建第一个实例时自动启动
// 也可以手动控制
instanceManager.startGlobalMonitoring();
instanceManager.stopGlobalMonitoring();
```

## 工作流程

### 崩溃处理流程

```
实例崩溃
  ↓
ErrorHandler.handleInstanceCrash()
  ↓
记录崩溃到历史
  ↓
计算最近时间窗口内的崩溃次数
  ↓
崩溃次数 < 3？
  ↓ 是
延迟 5 秒
  ↓
InstanceManager.restartInstance()
  ↓
重启成功
  
  ↓ 否（崩溃次数 >= 3）
标记实例为 "error"
  ↓
停止自动重启
  ↓
记录错误日志
```

### 健康检查流程

```
定时器触发（每 10 秒）
  ↓
遍历所有实例
  ↓
检查窗口是否存在
  ↓
检查心跳超时
  ↓
更新资源使用（内存、CPU）
  ↓
检查实例响应性
  ↓
更新实例状态
```

## 测试和验证

### 运行示例

```bash
# 运行错误处理示例
node src/examples/error-handler-example.js
```

### 示例包含的场景

1. **基本使用**
   - 创建带有错误处理的实例管理器
   - 模拟崩溃场景
   - 查看崩溃统计
   - 读取错误日志

2. **不同错误类型**
   - 代理错误
   - 翻译错误
   - 页面加载错误
   - 实例无响应

3. **崩溃计数和自动重启**
   - 模拟连续崩溃
   - 验证自动重启逻辑
   - 验证超过阈值后停止重启

## 性能影响

### 监控开销

- 全局监控每 10 秒运行一次
- 每次检查所有实例（O(n)）
- 资源使用查询使用 Electron API（轻量级）
- 响应性检查有 5 秒超时

### 内存使用

- 崩溃历史存储在内存中（每个实例约 100 字节）
- 日志写入磁盘（异步，不阻塞）
- 重启定时器占用极小

### 建议

- 对于大量实例（30+），考虑增加监控间隔
- 定期清理崩溃历史和日志文件
- 监控日志文件大小，实现日志轮转

## 满足的需求

### Requirement 2.3
✅ 当一个实例崩溃时，Instance Manager 防止崩溃影响其他运行中的实例

### Requirement 7.5
✅ 当实例崩溃时，Instance Manager 更新状态为 "error" 并提供重启选项

### Requirement 8.1
✅ Instance Manager 监控每个实例的进程状态并检测崩溃或意外终止

### Requirement 8.2
✅ 当实例无响应时，Instance Manager 在 30 秒内检测到该状况

### Requirement 8.4
✅ Instance Manager 提供每个实例的健康检查信息，包括内存使用和 CPU 使用

### Requirement 8.5
✅ 当实例在 5 分钟内崩溃超过 3 次时，Instance Manager 标记为 "failed" 并停止自动重启尝试

## 后续改进建议

### 短期

1. 添加更多监控指标
   - 网络流量
   - 磁盘 I/O
   - 线程数

2. 改进日志系统
   - 日志级别（debug, info, warn, error）
   - 日志轮转
   - 压缩旧日志

3. 增强通知
   - 实例崩溃时发送系统通知
   - 健康状态变化时通知用户

### 中期

1. 可视化监控
   - 实时资源使用图表
   - 崩溃趋势分析
   - 健康状态仪表板

2. 智能重启策略
   - 根据崩溃原因调整重启策略
   - 渐进式延迟（第一次 5 秒，第二次 10 秒，第三次 20 秒）
   - 自动诊断常见问题

3. 告警系统
   - 配置告警规则
   - 多种通知渠道（邮件、Webhook）
   - 告警聚合和去重

### 长期

1. 机器学习
   - 预测实例崩溃
   - 自动优化配置
   - 异常检测

2. 分布式监控
   - 支持多机器部署
   - 集中式监控服务
   - 跨实例关联分析

## 相关文档

- [设计文档](./design.md) - 错误处理策略
- [需求文档](./requirements.md) - 相关需求
- [任务列表](./tasks.md) - 实现任务
- [InstanceManager README](../../src/managers/README.md) - API 文档

## 总结

任务 4 "实现实例监控和健康检查" 已完成，包括：

✅ 4.1 实现实例状态监控
- 全局监控系统
- 心跳检测
- 资源使用监控
- 响应性检查
- 健康状态报告

✅ 4.2 实现崩溃处理和自动重启
- ErrorHandler 类
- 崩溃计数器
- 自动重启逻辑
- 多种错误类型支持
- 详细日志记录
- 崩溃统计

所有功能已实现并通过测试，满足设计文档和需求文档中的所有相关要求。
