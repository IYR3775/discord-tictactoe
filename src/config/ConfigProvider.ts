import path from 'path';
import fs from 'fs';
import Config from '@config/Config';

/**
 * Manages the configuration loading to operate the bot.
 * Loads values from a static file and environement variables.
 *
 * @author Utarwyn <maximemalgorn@gmail.com>
 * @since 2.0.0
 */
export default class ConfigProvider implements Config {
    public token = '';
    public language = 'en';
    public command = '!ttt';
    public allowedChannelIds = [];
    public allowedRoleIds = [];
    public requestExpireTime = 60;
    public requestCooldownTime = 0;
    public gameExpireTime = 30;
    public gameBoardDelete = false;

    [key: string]: any;

    private readonly CONFIG_PATH = path.join(process.cwd(), 'config', 'config.json');

    constructor() {
        this.initializeFromFile();
        this.initializeFromEnv();
        this.verifyValues();
    }

    private initializeFromFile(): void {
        if (fs.existsSync(this.CONFIG_PATH)) {
            const savedConfig = require(this.CONFIG_PATH);
            Object.keys(savedConfig).forEach(field => {
                this[field] = savedConfig[field];
            });
        }
    }

    private initializeFromEnv(): void {
        Object.keys(process.env)
            .filter(key => this[ConfigProvider.camelCase(key)] !== undefined)
            .forEach(key => {
                const camelCaseKey = ConfigProvider.camelCase(key);
                const value: string = process.env[key]!;
                let newValue;

                // Ignore the default Node variable LANGUAGE
                if (camelCaseKey === 'language') return;

                // Operate types checking
                switch (typeof this[camelCaseKey]) {
                    case 'number':
                        newValue = parseFloat(value);
                        break;
                    case 'boolean':
                        newValue = value.toLowerCase() === 'true';
                        break;
                    case 'string':
                    case 'object':
                    default:
                        newValue = value.toString();

                        if (Array.isArray(this[camelCaseKey])) {
                            newValue = newValue.split(',');
                        }
                        break;
                }

                this[camelCaseKey] = newValue;
            });
    }

    private verifyValues(): void {
        const emptyKey = Object.keys(this).find(key => this[key] === '');
        if (emptyKey) {
            throw new Error(`Config key ${emptyKey} must be defined`);
        }
    }

    private static camelCase(str: string): string {
        return str.toLowerCase().replace(/_([a-z])/g, g => {
            return g[1].toUpperCase();
        });
    }
}
