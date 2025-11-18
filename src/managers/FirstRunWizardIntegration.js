/**
 * FirstRunWizardIntegration - 首次启动迁移集成模块
 * 
 * 提供简单的 API 来处理从容器模式到单窗口模式的迁移
 * 由于容器模式已移除，此模块主要处理自动迁移功能
 */

const MigrationManager = require('./MigrationManager');
const AccountConfigManager = require('./AccountConfigManager');

/**
 * 执行迁移检查和自动迁移
 * @param {Object} options - 配置选项
 * @param {string} options.userDataPath - 用户数据路径
 * @param {boolean} options.autoMigrate - 是否自动执行迁移
 * @param {Function} options.onComplete - 完成回调
 * @returns {Promise<{migrationNeeded: boolean, migrated: boolean, result?: Object}>}
 */
async function checkAndMigrate(options) {
  const {
    userDataPath,
    autoMigrate = true,
    onComplete = () => {}
  } = options;

  if (!userDataPath) {
    throw new Error('userDataPath is required');
  }

  try {
    // 创建账号配置管理器
    const accountConfigManager = new AccountConfigManager({
      userDataPath
    });

    // 创建迁移管理器
    const migrationManager = new MigrationManager({
      userDataPath,
      accountConfigManager
    });

    // 检查是否需要迁移
    const needsMigration = await migrationManager.needsMigration();

    if (!needsMigration) {
      console.log('[MigrationIntegration] No migration needed');
      return {
        migrationNeeded: false,
        migrated: false
      };
    }

    console.log('[MigrationIntegration] Migration needed, checking autoMigrate setting...');

    if (!autoMigrate) {
      return {
        migrationNeeded: true,
        migrated: false
      };
    }

    console.log('[MigrationIntegration] Starting automatic migration...');

    // 执行迁移
    const result = await migrationManager.migrate();

    if (result.success) {
      console.log('[MigrationIntegration] Migration completed successfully');
      onComplete();
    } else {
      console.error('[MigrationIntegration] Migration failed:', result.message);
    }

    return {
      migrationNeeded: true,
      migrated: result.success,
      result
    };
  } catch (error) {
    console.error('[MigrationIntegration] Error during migration:', error);
    throw error;
  }
}

/**
 * 自动执行迁移（静默模式）
 * @param {Object} options - 配置选项
 * @param {string} options.userDataPath - 用户数据路径
 * @param {boolean} options.silent - 是否静默执行
 * @returns {Promise<{migrated: boolean, result?: Object}>}
 */
async function autoMigrate(options) {
  const {
    userDataPath,
    silent = false
  } = options;

  if (!userDataPath) {
    throw new Error('userDataPath is required');
  }

  try {
    // 创建账号配置管理器
    const accountConfigManager = new AccountConfigManager({
      userDataPath
    });

    // 创建迁移管理器
    const migrationManager = new MigrationManager({
      userDataPath,
      accountConfigManager
    });

    // 检查是否需要迁移
    const needsMigration = await migrationManager.needsMigration();

    if (!needsMigration) {
      if (!silent) {
      console.log('[MigrationIntegration] No migration needed');
    }
      return {
        migrated: false
      };
    }

    if (!silent) {
      console.log('[MigrationIntegration] Starting automatic migration...');
    }

    // 执行迁移
    const result = await migrationManager.migrate();

    if (!silent) {
      if (result.success) {
        console.log('[MigrationIntegration] Migration completed successfully');
      } else {
        console.error('[MigrationIntegration] Migration failed:', result.message);
      }
    }

    return {
      migrated: result.success,
      result
    };
  } catch (error) {
    console.error('[MigrationIntegration] Error during auto migration:', error);
    throw error;
  }
}

/**
 * 获取迁移状态
 * @param {string} userDataPath - 用户数据路径
 * @returns {Promise<Object>}
 */
async function getMigrationStatus(userDataPath) {
  if (!userDataPath) {
    throw new Error('userDataPath is required');
  }

  try {
    const accountConfigManager = new AccountConfigManager({
      userDataPath
    });

    const migrationManager = new MigrationManager({
      userDataPath,
      accountConfigManager
    });

    return await migrationManager.getMigrationStatus();
  } catch (error) {
    console.error('[MigrationIntegration] Error getting migration status:', error);
    throw error;
  }
}

module.exports = {
  checkAndMigrate,
  autoMigrate,
  getMigrationStatus
};
