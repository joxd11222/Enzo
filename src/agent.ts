import { askNvidia } from './api.js';
import { SYSTEM_PROMPT } from './prompt.js';
import { executeTool } from './tools.js';
import * as p from '@clack/prompts';
import chalk from 'chalk';

export async function runAgentLoop() {
    const messages: any[] = [
        { role: 'system', content: SYSTEM_PROMPT }
    ];

    while (true) {
        const userInput = await p.text({
            message: 'You:',
            placeholder: 'What would you like to do? (Type "exit" to quit)',
        });

        if (p.isCancel(userInput) || userInput === 'exit' || userInput === 'quit') {
            p.outro(chalk.green('Goodbye.'));
            process.exit(0);
        }

        if (!userInput) continue;

        messages.push({ role: 'user', content: userInput });

        let agentDone = false;

        while (!agentDone) {
            const s = p.spinner();
            s.start('Thinking');

            try {
                const stream = await askNvidia(messages);
                if (!stream) {
                    s.stop('Failed to connect to API.');
                    break;
                }

                const reader = stream.getReader();
                const decoder = new TextDecoder("utf-8");

                let fullResponse = '';
                let currentToolCall: any = null;
                let currentToolArgs = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\n');

                    for (const line of lines) {
                        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                            try {
                                const data = JSON.parse(line.slice(6));
                                const delta = data.choices[0]?.delta;

                                if (delta?.content) {
                                    if (fullResponse === '') {
                                        s.stop('Response:');
                                    }
                                    process.stdout.write(chalk.blue(delta.content));
                                    fullResponse += delta.content;
                                }

                                if (delta?.tool_calls) {
                                    if (fullResponse !== '') {
                                        console.log('\n');
                                    }
                                    for (const toolCall of delta.tool_calls) {
                                        if (toolCall.id) {
                                            s.stop(`Calling tool ${chalk.cyan(toolCall.function.name)}...`);
                                            currentToolCall = toolCall;
                                            currentToolArgs = toolCall.function.arguments || '';
                                        } else if (currentToolCall) {
                                            currentToolArgs += toolCall.function.arguments || '';
                                        }
                                    }
                                }
                            } catch (e) { }
                        }
                    }
                }

                if (fullResponse !== '' && !currentToolCall) {
                    console.log('\n');
                } else if (!currentToolCall) {
                    s.stop('');
                }

                if (fullResponse !== '' || currentToolCall) {
                    messages.push({
                        role: 'assistant',
                        content: fullResponse || null,
                        tool_calls: currentToolCall ? [{
                            id: currentToolCall.id,
                            type: 'function',
                            function: {
                                name: currentToolCall.function.name,
                                arguments: currentToolArgs
                            }
                        }] : undefined
                    });
                }

                if (currentToolCall) {
                    let parsedArgs = {};
                    try {
                        parsedArgs = JSON.parse(currentToolArgs);
                    } catch (e) {
                        console.log(chalk.yellow(`Warning: Invalid arguments for ${currentToolCall.function.name}.`));
                    }

                    const result = await executeTool(currentToolCall.function.name, parsedArgs);

                    messages.push({
                        role: 'tool',
                        tool_call_id: currentToolCall.id,
                        content: result
                    });
                } else {
                    agentDone = true;
                }

            } catch (error: any) {
                s.stop('Error occurred.');
                console.error(chalk.red(error.message));
                agentDone = true;
            }
        }
    }
}
