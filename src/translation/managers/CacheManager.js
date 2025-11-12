/**
 * 缓存管理器
 * 使用 LRU 缓存和文件系统持久化存储
 */

const { LRUCache } = require('lru-cache');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { app } = require('electron');

class CacheManager {
  constructor(options = {}) {
    this.maxSize = options.maxSize || 1000;
    this.ttl = options.ttl || 7 * 24 * 60 * 60 * 1000; // 7 days
    
    // LRU 内存缓存
    this.cache = new LRUCache({
      max: this.maxSize,
      ttl: this.ttl,
      updateAgeOnGet: true
    });

    // 文件系统持久化缓存
    try {
      this.cacheDir = path.join(app.getPath('userData'), 'translation-cache');
      this.initCacheDir();
    } catch (error) {
      console.warn('[CacheManager] Could not initialize cache directory:', error.message);
      this.cacheDir = null;
    }

    // 统计信息
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0
    };
  }

  /**
   * 初始化缓存目录
   */
  initCacheDir() {
    if (!this.cacheDir) return;
    
    try {
      if (!fs.existsSync(this.cacheDir)) {
        fs.mkdirSync(this.cacheDir, { recursive: true });
      }
    } catch (error) {
      console.error('[CacheManager] Failed to create cache directory:', error);
    }
  }

  /**
   * 生成缓存键
   * @param {string} text - 文本
   * @param {string} sourceLang - 源语言
   * @param {string} targetLang - 目标语言
   * @param {string} engine - 引擎名称
   * @returns {string} 缓存键
   */
  generateKey(text, sourceLang, targetLang, engine) {
    const content = `${text}:${sourceLang}:${targetLang}:${engine}`;
    return crypto.createHash('md5').update(content).digest('hex');
  }

  /**
   * 获取缓存
   * @param {string} key - 缓存键
   * @returns {Promise<Object|null>} 缓存结果
   */
  async get(key) {
    // 先查内存缓存
    const memCached = this.cache.get(key);
    if (memCached) {
      this.stats.hits++;
      return memCached;
    }

    // 查询文件缓存
    if (!this.cacheDir) {
      this.stats.misses++;
      return null;
    }

    try {
      const cacheFile = path.join(this.cacheDir, `${key}.json`);
      
      if (fs.existsSync(cacheFile)) {
        const data = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
        const cutoffTime = Date.now() - this.ttl;
        
        if (data.created_at > cutoffTime) {
          // 更新访问时间
          data.accessed_at = Date.now();
          data.access_count = (data.access_count || 0) + 1;
          fs.writeFileSync(cacheFile, JSON.stringify(data));

          const result = {
            translatedText: data.translated_text,
            detectedLang: data.source_lang,
            engineUsed: data.engine
          };

          // 放入内存缓存
          this.cache.set(key, result);
          this.stats.hits++;
          
          return result;
        } else {
          // 过期，删除文件
          fs.unlinkSync(cacheFile);
        }
      }
    } catch (error) {
      console.error('Cache get error:', error);
    }

    this.stats.misses++;
    return null;
  }

  /**
   * 设置缓存
   * @param {string} key - 缓存键
   * @param {Object} value - 缓存值
   */
  async set(key, value) {
    // 设置内存缓存
    this.cache.set(key, value);
    this.stats.sets++;

    // 持久化到文件
    if (!this.cacheDir) return;

    try {
      const cacheFile = path.join(this.cacheDir, `${key}.json`);
      const now = Date.now();
      
      const data = {
        cache_key: key,
        translated_text: value.translatedText,
        source_lang: value.detectedLang || 'auto',
        target_lang: value.targetLang || 'unknown',
        engine: value.engineUsed || 'unknown',
        created_at: now,
        accessed_at: now,
        access_count: 1
      };

      fs.writeFileSync(cacheFile, JSON.stringify(data));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * 清理过期缓存
   */
  async cleanup() {
    if (!this.cacheDir) return;

    try {
      const cutoffTime = Date.now() - this.ttl;
      const files = fs.readdirSync(this.cacheDir);
      let cleanedCount = 0;

      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.cacheDir, file);
          try {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            if (data.created_at < cutoffTime) {
              fs.unlinkSync(filePath);
              cleanedCount++;
            }
          } catch (error) {
            // 删除损坏的文件
            fs.unlinkSync(filePath);
            cleanedCount++;
          }
        }
      }

      console.log(`Cleaned up ${cleanedCount} expired cache entries`);
    } catch (error) {
      console.error('Cache cleanup error:', error);
    }
  }

  /**
   * 清空所有缓存
   */
  async clear() {
    this.cache.clear();
    
    if (!this.cacheDir) return;

    try {
      const files = fs.readdirSync(this.cacheDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          fs.unlinkSync(path.join(this.cacheDir, file));
        }
      }
      console.log('All cache cleared');
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  /**
   * 获取统计信息
   * @returns {Object} 统计数据
   */
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0
      ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
      : 0;

    let fileCount = 0;
    if (this.cacheDir) {
      try {
        const files = fs.readdirSync(this.cacheDir);
        fileCount = files.filter(f => f.endsWith('.json')).length;
      } catch (error) {
        console.error('Get stats error:', error);
      }
    }

    return {
      memorySize: this.cache.size,
      fileCount,
      hits: this.stats.hits,
      misses: this.stats.misses,
      sets: this.stats.sets,
      hitRate: `${hitRate}%`
    };
  }

  /**
   * 关闭（清理资源）
   */
  close() {
    // 文件系统不需要关闭连接
    this.cache.clear();
  }
}

module.exports = CacheManager;
