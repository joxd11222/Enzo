import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const CONFIG_PATH = path.join(os.homedir(), '.enzocli.json');

export interface EnzoConfig {
    nvidiaApiKey?: string;
    defaultModel?: string;
}

export const DEFAULT_MODEL = 'mistralai/devstral-2-123b-instruct-2512';

export function readConfig(): EnzoConfig {
    try {
        if (fs.existsSync(CONFIG_PATH)) {
            const data = fs.readFileSync(CONFIG_PATH, 'utf-8');
            return JSON.parse(data);
        }
    } catch (error) {
        // Return empty if there's an error parsing
    }
    return {};
}

export function writeConfig(config: EnzoConfig): void {
    const currentConfig = readConfig();
    const newConfig = { ...currentConfig, ...config };
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(newConfig, null, 2), 'utf-8');
}
