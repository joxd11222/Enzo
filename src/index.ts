#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { configCommand } from './commands/config.js';
import { runAgentLoop } from './agent.js';
import * as p from '@clack/prompts';

const program = new Command();

program
    .name('enzo')
    .description(chalk.blue('A CLI for AI coding with fully free AI agents using NVIDIA Build API'))
    .version('1.0.0');

program
    .command('config')
    .description('Configure the CLI with your NVIDIA Build API Key and default model')
    .action(() => {
        configCommand();
    });

program.action(async () => {
    p.intro(chalk.bgCyan.black(' EnzoCLI Agent '));
    await runAgentLoop();
});

program.parse(process.argv);
