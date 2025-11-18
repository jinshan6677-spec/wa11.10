/**
 * 事件管理器
 * 实现模块间的通信机制
 */
const { EVENTS } = require('../constants/config');

class EventManager {
  constructor() {
    this.listeners = new Map();
    this.debugMode = false;
  }

  /**
   * 订阅事件
   * @param {string} eventType - 事件类型
   * @param {Function} callback - 回调函数
   */
  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    
    this.listeners.get(eventType).add(callback);
    
    if (this.debugMode) {
      console.log(`[EventManager] Subscribed to event: ${eventType}`);
    }
    
    // 返回取消订阅函数
    return () => this.off(eventType, callback);
  }

  /**
   * 取消订阅事件
   * @param {string} eventType - 事件类型
   * @param {Function} callback - 回调函数
   */
  off(eventType, callback) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).delete(callback);
      
      if (this.listeners.get(eventType).size === 0) {
        this.listeners.delete(eventType);
      }
      
      if (this.debugMode) {
        console.log(`[EventManager] Unsubscribed from event: ${eventType}`);
      }
    }
  }

  /**
   * 触发事件
   * @param {string} eventType - 事件类型
   * @param {*} data - 事件数据
   */
  emit(eventType, data) {
    if (this.listeners.has(eventType)) {
      const callbacks = this.listeners.get(eventType);
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[EventManager] Error in event listener for ${eventType}:`, error);
        }
      });
      
      if (this.debugMode) {
        console.log(`[EventManager] Emitted event: ${eventType}`, data);
      }
    } else {
      if (this.debugMode) {
        console.log(`[EventManager] No listeners for event: ${eventType}`);
      }
    }
  }

  /**
   * 异步触发事件
   * @param {string} eventType - 事件类型
   * @param {*} data - 事件数据
   */
  async emitAsync(eventType, data) {
    if (this.listeners.has(eventType)) {
      const callbacks = Array.from(this.listeners.get(eventType));
      const promises = callbacks.map(callback => {
        try {
          return Promise.resolve(callback(data));
        } catch (error) {
          console.error(`[EventManager] Error in async event listener for ${eventType}:`, error);
          return Promise.resolve(); // 不让错误中断其他监听器
        }
      });
      
      await Promise.all(promises);
      
      if (this.debugMode) {
        console.log(`[EventManager] Async emitted event: ${eventType}`, data);
      }
    }
  }

  /**
   * 一次性事件监听
   * @param {string} eventType - 事件类型
   * @param {Function} callback - 回调函数
   */
  once(eventType, callback) {
    const off = this.on(eventType, (data) => {
      off();
      callback(data);
    });
    return off;
  }

  /**
   * 移除所有监听器
   * @param {string} eventType - 事件类型（可选，不传则移除所有）
   */
  removeAllListeners(eventType) {
    if (eventType) {
      this.listeners.delete(eventType);
      if (this.debugMode) {
        console.log(`[EventManager] Removed all listeners for event: ${eventType}`);
      }
    } else {
      this.listeners.clear();
      if (this.debugMode) {
        console.log(`[EventManager] Removed all listeners`);
      }
    }
  }

  /**
   * 获取监听器数量
   * @param {string} eventType - 事件类型（可选）
   */
  listenerCount(eventType) {
    if (eventType) {
      return this.listeners.has(eventType) ? this.listeners.get(eventType).size : 0;
    }
    
    let total = 0;
    this.listeners.forEach(callbacks => {
      total += callbacks.size;
    });
    return total;
  }

  /**
   * 开启/关闭调试模式
   * @param {boolean} enabled - 是否启用
   */
  setDebugMode(enabled) {
    this.debugMode = enabled;
    console.log(`[EventManager] Debug mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * 获取当前事件统计
   */
  getStats() {
    const stats = {
      totalEvents: this.listeners.size,
      totalListeners: this.listenerCount(),
      eventTypes: Array.from(this.listeners.keys())
    };
    
    if (this.debugMode) {
      console.log('[EventManager] Stats:', stats);
    }
    
    return stats;
  }
}

// 创建全局事件管理器实例
const eventManager = new EventManager();

module.exports = {
  eventManager,
  EVENTS
};