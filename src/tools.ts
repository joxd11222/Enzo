import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import { resolve } from 'path';

const execAsync = promisify(exec);

export const TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "Bash",
            "description": "Executes a given bash command in a persistent shell session with optional timeout, ensuring proper handling and security measures.",
            "parameters": {
                "type": "object",
                "properties": {
                    "command": {
                        "type": "string",
                        "description": "The command to execute"
                    }
                },
                "required": [
                    "command"
                ],
                "additionalProperties": false
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "Read",
            "description": "Reads a file from the local filesystem.",
            "parameters": {
                "type": "object",
                "properties": {
                    "file_path": {
                        "type": "string",
                        "description": "The absolute path to the file to read"
                    }
                },
                "required": [
                    "file_path"
                ],
                "additionalProperties": false
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "Write",
            "description": "Writes a file to the local filesystem.",
            "parameters": {
                "type": "object",
                "properties": {
                    "file_path": {
                        "type": "string",
                        "description": "The absolute path to the file to write"
                    },
                    "content": {
                        "type": "string",
                        "description": "The content to write to the file"
                    }
                },
                "required": [
                    "file_path",
                    "content"
                ],
                "additionalProperties": false
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "LS",
            "description": "Lists files and directories in a given path.",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": "The abstract path to the directory to list"
                    }
                },
                "required": [
                    "path"
                ],
                "additionalProperties": false
            }
        }
    }
];

export async function executeTool(name: string, args: any): Promise<string> {
    try {
        if (name === 'Bash') {
            const { stdout, stderr } = await execAsync(args.command, { cwd: process.cwd() });
            return stdout || stderr || 'Command executed successfully with no output.';
        } else if (name === 'Read') {
            const content = await fs.readFile(resolve(args.file_path), 'utf8');
            return content;
        } else if (name === 'Write') {
            await fs.writeFile(resolve(args.file_path), args.content, 'utf8');
            return 'File written successfully.';
        } else if (name === 'LS') {
            const files = await fs.readdir(resolve(args.path));
            return files.join('\\n');
        } else {
            return `Error: Tool ${name} not found or not implemented.`;
        }
    } catch (e: any) {
        return `Error executing tool ${name}: ${e.message}`;
    }
}
