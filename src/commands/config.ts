import * as p from '@clack/prompts';
import chalk from 'chalk';
import { readConfig, writeConfig, DEFAULT_MODEL } from '../config.js';

export async function configCommand() {
    p.intro(chalk.bgCyan.black(' EnzoCLI Configuration '));

    const config = readConfig();

    const response = await p.select({
        message: 'Select a configuration to update:',
        options: [
            { label: 'NVIDIA Build API Key', value: 'nvidiaApiKey' },
            { label: 'Default Model', value: 'defaultModel' },
            { label: 'Auto-run Tools', value: 'autoRunTools' },
            { label: 'Exit', value: 'exit' },
        ],
    });

    if (p.isCancel(response) || response === 'exit') {
        p.cancel('Configuration cancelled.');
        return;
    }

    switch (response) {
        case 'nvidiaApiKey': {
            const apiKey = await p.password({
                message: 'Enter your NVIDIA Build API Key:',
            });
            if (p.isCancel(apiKey)) {
                p.cancel('Cancelled.');
                return;
            }
            if (apiKey) {
                writeConfig({ ...config, nvidiaApiKey: apiKey as string });
                p.outro(chalk.green('NVIDIA Build API Key updated successfully!'));
            } else {
                p.outro(chalk.yellow('No key entered, config unchanged.'));
            }
            break;
        }
        case 'defaultModel': {
            const model = await p.text({
                message: 'Enter the default model:',
                placeholder: DEFAULT_MODEL,
                defaultValue: config.defaultModel || DEFAULT_MODEL,
            });
            if (p.isCancel(model)) {
                p.cancel('Cancelled.');
                return;
            }
            writeConfig({ ...config, defaultModel: model as string });
            p.outro(chalk.green('Default model updated successfully!'));
            break;
        }
        case 'autoRunTools': {
            const autoRun = await p.confirm({
                message: 'Enable auto-run tools (skip confirmation prompts)?',
                initialValue: config.autoRunTools ?? false,
            });
            if (p.isCancel(autoRun)) {
                p.cancel('Cancelled.');
                return;
            }
            writeConfig({ ...config, autoRunTools: autoRun as boolean });
            p.outro(chalk.green(`Auto-run tools ${autoRun ? 'enabled' : 'disabled'}.`));
            break;
        }
    }
}