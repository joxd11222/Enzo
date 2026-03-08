import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import path from 'node:path';
import * as p from '@clack/prompts';
import chalk from 'chalk';
import { readConfig } from './config.js';

const execAsync = promisify(exec);

const allowed_path = process.cwd();

function resolveSafe(filePath: string): string {
    const resolvedPath = path.resolve(allowed_path, filePath);
    if (!resolvedPath.startsWith(allowed_path)) {
        throw new Error('Access denied: Path is outside the allowed directory.');
    }
    return resolvedPath;
}

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
                "required": ["command"],
                "additionalProperties": false
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "Read",
            "description": "Reads a file from the local filesystem. Always prefer this over Bash for reading files.",
            "parameters": {
                "type": "object",
                "properties": {
                    "file_path": {
                        "type": "string",
                        "description": "The absolute path to the file to read"
                    }
                },
                "required": ["file_path"],
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
                "required": ["file_path", "content"],
                "additionalProperties": false
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "LS",
            "description": "Lists files and directories in a given path. Always prefer this over Bash for listing directories.",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": "The abstract path to the directory to list"
                    }
                },
                "required": ["path"],
                "additionalProperties": false
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "WebFetch",
            "description": "Fetches the content of a URL and returns it as text. Use this to read web pages, documentation, CVEs, GitHub repos, API references, or any external URL provided by the user. Always use this when the user provides a URL or asks about external resources.",
            "parameters": {
                "type": "object",
                "properties": {
                    "url": {
                        "type": "string",
                        "description": "The full URL to fetch"
                    }
                },
                "required": ["url"],
                "additionalProperties": false
            }
        }
    }
];

export async function executeTool(name: string, args: any): Promise<string> {
    switch (name) {
        case 'Bash': {
            const command = args['command'] ?? '';
            const config = readConfig();

            if (!config.autoRunTools) {
                const confirmed = await p.confirm({
                    message: `Allow Enzo to run: ${chalk.yellow(command)}`,
                    initialValue: false,
                });
                if (p.isCancel(confirmed) || !confirmed) {
                    return 'User declined to run the command.';
                }
            }

            try {
                const { stdout, stderr } = await execAsync(command, {
                    cwd: allowed_path,
                    timeout: 30_000,
                });
                return stdout || stderr || '(no output)';
            } catch (e: unknown) {
                const err = e as NodeJS.ErrnoException & { stderr?: string };
                return `Error: ${err.message}\n${err.stderr ?? ''}`;
            }
        }
        case 'Read': {
            const filePath = args['file_path'] ?? '';
            try {
                const safe = resolveSafe(filePath);
                return await fs.readFile(safe, 'utf-8');
            } catch (e: unknown) {
                return `Error reading file: ${(e as Error).message}`;
            }
        }
        case 'Write': {
            const filePath = args['file_path'] ?? '';
            const content = args['content'] ?? '';
            try {
                const safe = resolveSafe(filePath);
                await fs.mkdir(path.dirname(safe), { recursive: true });
                await fs.writeFile(safe, content, 'utf-8');
                return `Successfully wrote to ${filePath}`;
            } catch (e: unknown) {
                return `Error writing file: ${(e as Error).message}`;
            }
        }
        case 'LS': {
            const dirPath = args['path'] ?? '.';
            try {
                const safe = resolveSafe(dirPath);
                const entries = await fs.readdir(safe, { withFileTypes: true });
                return entries
                    .map((e) => (e.isDirectory() ? `[DIR] ${e.name}` : e.name))
                    .join('\n');
            } catch (e: unknown) {
                return `Error listing directory: ${(e as Error).message}`;
            }
        }
        case 'WebFetch': {
            const url = args['url'] ?? '';
            try {
                const res = await fetch(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (compatible; EnzoCLI/1.0)',
                        'Accept': 'text/html,application/xhtml+xml,application/json,text/plain,*/*'
                    }
                });
                if (!res.ok) return `Error: HTTP ${res.status} ${res.statusText}`;
                const contentType = res.headers.get('content-type') ?? '';
                const text = await res.text();
                const cleaned = contentType.includes('html')
                    ? text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                          .replace(/<[^>]+>/g, ' ')
                          .replace(/\s{2,}/g, ' ')
                          .trim()
                    : text;
                return cleaned.slice(0, 24000);
            } catch (e: unknown) {
                return `Error fetching URL: ${(e as Error).message}`;
            }
        }
        default:
            return `Unknown tool: ${name}`;
    }
}