/**
 * AccountConfigManager 测试
 */

const AccountConfigManager = require('../AccountConfigManager');
const AccountConfig = require('../../models/AccountConfig');
const path = require('path');
const os = require('os');
const fs = require('fs').promises;

describe('AccountConfigManager', () => {
  let manager;
  let tempDir;

  beforeEach(async () => {
    // 创建临时目录用于测试
    tempDir = path.join(os.tmpdir(), `test-accounts-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });
    
    // 创建管理器实例
    manager = new AccountConfigManager({
      configName: 'test-accounts',
      cwd: tempDir
    });
  });

  afterEach(async () => {
    // 清理临时目录
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      console.warn('Failed to clean up temp directory:', error);
    }
  });

  describe('createAccount', () => {
    test('should create a new account with default values', async () => {
      const result = await manager.createAccount({ name: 'Test Account' });
      
      expect(result.success).toBe(true);
      expect(result.account).toBeDefined();
      expect(result.account.name).toBe('Test Account');
      expect(result.account.id).toBeDefined();
    });

    test('should create account with custom configuration', async () => {
      const config = {
        name: 'Custom Account',
        proxy: {
          enabled: true,
          protocol: 'socks5',
          host: '127.0.0.1',
          port: 1080
        }
      };
      
      const result = await manager.createAccount(config);
      
      expect(result.success).toBe(true);
      expect(result.account.proxy.enabled).toBe(true);
      expect(result.account.proxy.host).toBe('127.0.0.1');
    });

    test('should fail with invalid proxy configuration', async () => {
      const config = {
        name: 'Invalid Proxy',
        proxy: {
          enabled: true,
          protocol: 'socks5',
          host: '',
          port: 0
        }
      };
      
      const result = await manager.createAccount(config);
      
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('loadAccounts', () => {
    test('should load all accounts', async () => {
      await manager.createAccount({ name: 'Account 1' });
      await manager.createAccount({ name: 'Account 2' });
      
      const accounts = await manager.loadAccounts();
      
      expect(accounts.length).toBe(2);
      expect(accounts[0]).toBeInstanceOf(AccountConfig);
    });

    test('should return empty array when no accounts exist', async () => {
      const accounts = await manager.loadAccounts();
      
      expect(accounts).toEqual([]);
    });
  });

  describe('getAccount', () => {
    test('should get account by ID', async () => {
      const createResult = await manager.createAccount({ name: 'Test Account' });
      const accountId = createResult.account.id;
      
      const account = await manager.getAccount(accountId);
      
      expect(account).toBeDefined();
      expect(account.id).toBe(accountId);
      expect(account.name).toBe('Test Account');
    });

    test('should return null for non-existent account', async () => {
      const account = await manager.getAccount('non-existent-id');
      
      expect(account).toBeNull();
    });
  });

  describe('updateAccount', () => {
    test('should update account configuration', async () => {
      const createResult = await manager.createAccount({ name: 'Original Name' });
      const accountId = createResult.account.id;
      
      const updateResult = await manager.updateAccount(accountId, {
        name: 'Updated Name'
      });
      
      expect(updateResult.success).toBe(true);
      expect(updateResult.account.name).toBe('Updated Name');
    });

    test('should fail to update non-existent account', async () => {
      const result = await manager.updateAccount('non-existent-id', {
        name: 'New Name'
      });
      
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('deleteAccount', () => {
    test('should delete account', async () => {
      const createResult = await manager.createAccount({ name: 'To Delete' });
      const accountId = createResult.account.id;
      
      const deleteResult = await manager.deleteAccount(accountId);
      
      expect(deleteResult.success).toBe(true);
      
      const account = await manager.getAccount(accountId);
      expect(account).toBeNull();
    });

    test('should fail to delete non-existent account', async () => {
      const result = await manager.deleteAccount('non-existent-id');
      
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('validateConfig', () => {
    test('should validate valid configuration', () => {
      const account = new AccountConfig({
        name: 'Valid Account',
        proxy: {
          enabled: true,
          protocol: 'socks5',
          host: '127.0.0.1',
          port: 1080
        }
      });
      
      const validation = manager.validateConfig(account);
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    test('should detect invalid proxy configuration', () => {
      const account = new AccountConfig({
        name: 'Invalid Proxy',
        proxy: {
          enabled: true,
          protocol: 'invalid',
          host: '',
          port: 99999
        }
      });
      
      const validation = manager.validateConfig(account);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe('exportAccounts and importAccounts', () => {
    test('should export and import accounts', async () => {
      await manager.createAccount({ name: 'Account 1' });
      await manager.createAccount({ name: 'Account 2' });
      
      const exportData = await manager.exportAccounts();
      
      expect(exportData.accounts.length).toBe(2);
      
      // 清除所有账号
      await manager.clearAllAccounts();
      
      // 导入账号
      const importResult = await manager.importAccounts(exportData);
      
      expect(importResult.success).toBe(true);
      expect(importResult.imported).toBe(2);
      expect(importResult.skipped).toBe(0);
    });

    test('should skip existing accounts when overwrite is false', async () => {
      const createResult = await manager.createAccount({ name: 'Existing Account' });
      
      const exportData = await manager.exportAccounts();
      
      const importResult = await manager.importAccounts(exportData, { overwrite: false });
      
      expect(importResult.imported).toBe(0);
      expect(importResult.skipped).toBe(1);
    });
  });

  describe('utility methods', () => {
    test('accountExists should return correct value', async () => {
      const createResult = await manager.createAccount({ name: 'Test' });
      const accountId = createResult.account.id;
      
      expect(manager.accountExists(accountId)).toBe(true);
      expect(manager.accountExists('non-existent')).toBe(false);
    });

    test('getAccountCount should return correct count', async () => {
      expect(manager.getAccountCount()).toBe(0);
      
      await manager.createAccount({ name: 'Account 1' });
      expect(manager.getAccountCount()).toBe(1);
      
      await manager.createAccount({ name: 'Account 2' });
      expect(manager.getAccountCount()).toBe(2);
    });

    test('getAllAccountIds should return all IDs', async () => {
      const result1 = await manager.createAccount({ name: 'Account 1' });
      const result2 = await manager.createAccount({ name: 'Account 2' });
      
      const ids = manager.getAllAccountIds();
      
      expect(ids).toContain(result1.account.id);
      expect(ids).toContain(result2.account.id);
      expect(ids.length).toBe(2);
    });
  });
});
