import { readConfig, DEFAULT_MODEL } from './config.js';
import chalk from 'chalk';
import { TOOLS } from './tools.js';

export async function askNvidia(messages: any[]) {
    const config = readConfig();
    const model = config.defaultModel || DEFAULT_MODEL;

    try {
        const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.nvidiaApiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json, text/event-stream'
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                temperature: 0.7,
                top_p: 0.8,
                frequency_penalty: 0,
                presence_penalty: 0,
                max_tokens: 4096,
                stream: true,
                tools: TOOLS
            })
        });

        if (!response.ok) {
            console.error(chalk.red(`\nError communicating with NVIDIA API: ${response.status} status code`));
            try {
                const errText = await response.text();
                console.error(chalk.red(errText));
            } catch (e) { }
            process.exit(1);
        }

        return response.body;

    } catch (error: any) {
        console.error(chalk.red(`\nError communicating with NVIDIA API: ${error.message}`));
        process.exit(1);
    }
}
