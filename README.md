# Enzo

Enzo is a CLI-based AI coding assistant that lets you write, edit, and understand code through natural language, straight from your terminal.

---

## Features

- **AI-powered coding:** Ask Enzo to write functions, fix bugs, refactor code, or explain complex logic
- **File awareness:** Enzo reads and edits files in your project directory directly
- **Multi-language support:** Works with any programming language
- **Conversation memory:** Maintains context across messages within a session
- **Shell command execution:** Enzo can run commands and interpret their output

---

## Installation

**Requirements:** Node.js 18+

```bash
git clone https://github.com/joxd11222/enzo
cd enzo
npm install
npm run build
```

**Then just:**

```bash
enzo
```

---

## Setup

Enzo requires a Build NVIDIA API key to run.

```bash
enzo config
```

---

## Usage

Start a session in your project directory:

```bash
enzo
```

Then just talk to it:

```
> Write a function that parses a CSV file and returns a list of objects
> Add error handling to the function you just wrote
> Explain what this file does
> Refactor index.js to use async/await instead of callbacks
```

---

## How It Works

Enzo sends your messages and relevant file context to the Nvidia API. When Enzo needs to read or modify files, run commands, or look something up, it uses a set of built-in tools, and it shows you what it's doing at each step.

---

## Contributing

Contributions are welcome! Please open an issue before submitting a pull request so we can discuss the change.

```bash
git clone https://github.com/joxd11222/enzo
cd enzo
npm install
npm run dev
```

---

## License

MIT