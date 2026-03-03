import * as p from '@clack/prompts';
import chalk from 'chalk';
import { readConfig, writeConfig, DEFAULT_MODEL } from '../config.js';

export async function configCommand() {
    p.intro(chalk.bgCyan.black(' EnzoCLI Configuration '));

    const currentConfig = readConfig();

    const apiKey = await p.password({
        message: 'Enter your NVIDIA Build API Key:',
        mask: '*',
        validate: (value) => {
            if (!value && !currentConfig.nvidiaApiKey) return 'Please enter an API key.';
        }
    });

    if (p.isCancel(apiKey)) {
        p.cancel('Configuration cancelled.');
        process.exit(0);
    }

    const model = await p.text({
        message: 'Default model (leave blank for default):',
        placeholder: DEFAULT_MODEL,
        initialValue: currentConfig.defaultModel || '',
    });

    if (p.isCancel(model)) {
        p.cancel('Configuration cancelled.');
        process.exit(0);
    }

    const finalModel = model.trim() === '' ? DEFAULT_MODEL : model;

    writeConfig({
        nvidiaApiKey: apiKey === '' ? currentConfig.nvidiaApiKey : apiKey as string,
        defaultModel: finalModel as string,
    });

    p.outro(chalk.green('Configuration saved successfully!'));
}
