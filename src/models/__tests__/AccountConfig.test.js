/**
 * AccountConfig 模型测试
 * 专注于代理和翻译配置验证逻辑
 */

const AccountConfig = require('../AccountConfig');

describe('AccountConfig', () => {
  describe('initialization', () => {
    test('should create account with default values', () => {
      const account = new AccountConfig();
      
      expect(account.id).toBeDefined();
      expect(account.name).toBeDefined();
      expect(account.createdAt).toBeInstanceOf(Date);
      expect(account.lastActiveAt).toBeInstanceOf(Date);
      expect(account.proxy).toBeDefined();
      expect(account.translation).toBeDefined();
      expect(account.window).toBeDefined();
      expect(account.notifications).toBeDefined();
    });

    test('should create account with custom values', () => {
      const config = {
        name: 'Custom Account',
        proxy: {
          enabled: true,
          protocol: 'socks5',
          host: '127.0.0.1',
          port: 1080
        }
      };
      
      const account = new AccountConfig(config);
      
      expect(account.name).toBe('Custom Account');
      expect(account.proxy.enabled).toBe(true);
      expect(account.proxy.host).toBe('127.0.0.1');
    });
  });

  describe('proxy configuration validation', () => {
    test('should validate valid proxy configuration', () => {
      const account = new AccountConfig({
        name: 'Valid Proxy',
        proxy: {
          enabled: true,
          protocol: 'socks5',
          host: '127.0.0.1',
          port: 1080
        }
      });
      
      const validation = account.validate();
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    test('should reject invalid proxy protocol', () => {
      const account = new AccountConfig({
        name: 'Invalid Protocol',
        proxy: {
          enabled: true,
          protocol: 'invalid',
          host: '127.0.0.1',
          port: 1080
        }
      });
      
      const validation = account.validate();
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Invalid proxy protocol. Must be socks5, http, or https');
    });

    test('should reject empty proxy host', () => {
      const account = new AccountConfig({
        name: 'Empty Host',
        proxy: {
          enabled: true,
          protocol: 'socks5',
          host: '',
          port: 1080
        }
      });
      
      const validation = account.validate();
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Proxy host is required when proxy is enabled');
    });

    test('should reject invalid proxy port (too low)', () => {
      const account = new AccountConfig({
        name: 'Invalid Port',
        proxy: {
          enabled: true,
          protocol: 'socks5',
          host: '127.0.0.1',
          port: 0
        }
      });
      
      const validation = account.validate();
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Invalid proxy port. Must be between 1 and 65535');
    });

    test('should reject invalid proxy port (too high)', () => {
      const account = new AccountConfig({
        name: 'Invalid Port',
        proxy: {
          enabled: true,
          protocol: 'socks5',
          host: '127.0.0.1',
          port: 99999
        }
      });
      
      const validation = account.validate();
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Invalid proxy port. Must be between 1 and 65535');
    });

    test('should accept all valid proxy protocols', () => {
      const protocols = ['socks5', 'http', 'https'];
      
      protocols.forEach(protocol => {
        const account = new AccountConfig({
          name: `${protocol} Proxy`,
          proxy: {
            enabled: true,
            protocol: protocol,
            host: '127.0.0.1',
            port: 1080
          }
        });
        
        const validation = account.validate();
        expect(validation.valid).toBe(true);
      });
    });

    test('should not validate proxy when disabled', () => {
      const account = new AccountConfig({
        name: 'Disabled Proxy',
        proxy: {
          enabled: false,
          protocol: 'invalid',
          host: '',
          port: 0
        }
      });
      
      const validation = account.validate();
      
      expect(validation.valid).toBe(true);
    });

    test('should accept proxy with authentication', () => {
      const account = new AccountConfig({
        name: 'Authenticated Proxy',
        proxy: {
          enabled: true,
          protocol: 'socks5',
          host: '127.0.0.1',
          port: 1080,
          username: 'user',
          password: 'pass'
        }
      });
      
      const validation = account.validate();
      
      expect(validation.valid).toBe(true);
    });
  });

  describe('translation configuration validation', () => {
    test('should validate valid translation configuration', () => {
      const account = new AccountConfig({
        name: 'Valid Translation',
        translation: {
          enabled: true,
          targetLanguage: 'zh-CN',
          engine: 'google',
          autoTranslate: true
        }
      });
      
      const validation = account.validate();
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    test('should reject invalid translation engine', () => {
      const account = new AccountConfig({
        name: 'Invalid Engine',
        translation: {
          enabled: true,
          targetLanguage: 'zh-CN',
          engine: 'invalid',
          autoTranslate: true
        }
      });
      
      const validation = account.validate();
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Invalid translation engine. Must be google, gpt4, gemini, or deepseek');
    });

    test('should reject missing target language', () => {
      const account = new AccountConfig({
        name: 'Missing Language',
        translation: {
          enabled: true,
          targetLanguage: '',
          engine: 'google',
          autoTranslate: true
        }
      });
      
      const validation = account.validate();
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Target language is required when translation is enabled');
    });

    test('should require API key for GPT-4', () => {
      const account = new AccountConfig({
        name: 'GPT-4 No Key',
        translation: {
          enabled: true,
          targetLanguage: 'zh-CN',
          engine: 'gpt4',
          apiKey: ''
        }
      });
      
      const validation = account.validate();
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('API key is required for gpt4 translation engine');
    });

    test('should require API key for Gemini', () => {
      const account = new AccountConfig({
        name: 'Gemini No Key',
        translation: {
          enabled: true,
          targetLanguage: 'zh-CN',
          engine: 'gemini',
          apiKey: ''
        }
      });
      
      const validation = account.validate();
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('API key is required for gemini translation engine');
    });

    test('should require API key for DeepSeek', () => {
      const account = new AccountConfig({
        name: 'DeepSeek No Key',
        translation: {
          enabled: true,
          targetLanguage: 'zh-CN',
          engine: 'deepseek',
          apiKey: ''
        }
      });
      
      const validation = account.validate();
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('API key is required for deepseek translation engine');
    });

    test('should not require API key for Google Translate', () => {
      const account = new AccountConfig({
        name: 'Google Translate',
        translation: {
          enabled: true,
          targetLanguage: 'zh-CN',
          engine: 'google',
          apiKey: ''
        }
      });
      
      const validation = account.validate();
      
      expect(validation.valid).toBe(true);
    });

    test('should accept all valid translation engines', () => {
      const engines = ['google', 'gpt4', 'gemini', 'deepseek'];
      
      engines.forEach(engine => {
        const account = new AccountConfig({
          name: `${engine} Translation`,
          translation: {
            enabled: true,
            targetLanguage: 'zh-CN',
            engine: engine,
            apiKey: engine !== 'google' ? 'test-api-key' : ''
          }
        });
        
        const validation = account.validate();
        expect(validation.valid).toBe(true);
      });
    });

    test('should not validate translation when disabled', () => {
      const account = new AccountConfig({
        name: 'Disabled Translation',
        translation: {
          enabled: false,
          targetLanguage: '',
          engine: 'invalid',
          apiKey: ''
        }
      });
      
      const validation = account.validate();
      
      expect(validation.valid).toBe(true);
    });
  });

  describe('window configuration validation', () => {
    test('should validate valid window configuration', () => {
      const account = new AccountConfig({
        name: 'Valid Window',
        window: {
          width: 1200,
          height: 800
        }
      });
      
      const validation = account.validate();
      
      expect(validation.valid).toBe(true);
    });

    test('should reject window width below minimum', () => {
      const account = new AccountConfig({
        name: 'Small Window',
        window: {
          width: 300,
          height: 800
        }
      });
      
      const validation = account.validate();
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Window width must be at least 400 pixels');
    });

    test('should reject window height below minimum', () => {
      const account = new AccountConfig({
        name: 'Short Window',
        window: {
          width: 1200,
          height: 200
        }
      });
      
      const validation = account.validate();
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Window height must be at least 300 pixels');
    });
  });

  describe('combined validation', () => {
    test('should detect multiple validation errors', () => {
      const account = new AccountConfig({
        name: '',
        proxy: {
          enabled: true,
          protocol: 'invalid',
          host: '',
          port: 0
        },
        translation: {
          enabled: true,
          targetLanguage: '',
          engine: 'invalid',
          apiKey: ''
        },
        window: {
          width: 100,
          height: 100
        }
      });
      
      const validation = account.validate();
      
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(5);
    });

    test('should validate complex valid configuration', () => {
      const account = new AccountConfig({
        name: 'Complex Account',
        proxy: {
          enabled: true,
          protocol: 'socks5',
          host: '127.0.0.1',
          port: 1080,
          username: 'user',
          password: 'pass'
        },
        translation: {
          enabled: true,
          targetLanguage: 'zh-CN',
          engine: 'gpt4',
          apiKey: 'sk-test-key',
          autoTranslate: true,
          translateInput: true
        },
        window: {
          x: 100,
          y: 100,
          width: 1400,
          height: 900
        },
        notifications: {
          enabled: true,
          sound: true,
          badge: true
        }
      });
      
      const validation = account.validate();
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toEqual([]);
    });
  });

  describe('JSON serialization', () => {
    test('should serialize to JSON', () => {
      const account = new AccountConfig({
        name: 'Test Account'
      });
      
      const json = account.toJSON();
      
      expect(json.id).toBe(account.id);
      expect(json.name).toBe('Test Account');
      expect(json.createdAt).toBeDefined();
      expect(json.proxy).toBeDefined();
      expect(json.translation).toBeDefined();
    });

    test('should deserialize from JSON', () => {
      const originalAccount = new AccountConfig({
        name: 'Original Account',
        proxy: {
          enabled: true,
          protocol: 'socks5',
          host: '127.0.0.1',
          port: 1080
        }
      });
      
      const json = originalAccount.toJSON();
      const restoredAccount = AccountConfig.fromJSON(json);
      
      expect(restoredAccount.id).toBe(originalAccount.id);
      expect(restoredAccount.name).toBe(originalAccount.name);
      expect(restoredAccount.proxy.enabled).toBe(true);
      expect(restoredAccount.proxy.host).toBe('127.0.0.1');
    });
  });

  describe('utility methods', () => {
    test('should update last active time', () => {
      const account = new AccountConfig({ name: 'Test' });
      const originalTime = account.lastActiveAt;
      
      // Wait a bit
      setTimeout(() => {
        account.updateLastActive();
        expect(account.lastActiveAt.getTime()).toBeGreaterThan(originalTime.getTime());
      }, 10);
    });
  });
});
