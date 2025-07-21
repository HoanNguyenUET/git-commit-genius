# Git Commit Genius

Generate high-quality commit messages automatically using AI and git diff.

## Overview

Git Commit Genius is a command-line tool that helps developers create meaningful, consistent commit messages by analyzing git diffs and using AI (Ollama) to generate appropriate commit messages. It streamlines the commit process and ensures high-quality documentation of code changes.

## Features

- 🤖 **Automatic Analysis**: Analyze staged changes in your git repository
- 🧠 **AI-Generated Messages**: Generate context-aware, high-quality commit messages using Ollama
- 📝 **Conventional Commits Support**: Follow the Conventional Commits standard (type(scope): message)
- 🌍 **Multilingual**: Support for English and Vietnamese
- 🪝 **Git Hooks Integration**: Install as a git hook to automate your commit process
- ⚙️ **Customizable Configuration**: Store and manage user configuration

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [Git](https://git-scm.com/)
- [Ollama](https://ollama.ai/) running locally with models installed

## Installation

### Local Installation

```bash
# Clone the repository
git clone https://github.com/HoanNguyenUET/git-commit-genius.git

# Navigate to the project directory
cd git-commit-genius

# Install dependencies
npm install

# Link the package globally
npm link
```

### Global Installation (once published)

```bash
npm install -g git-commit-genius
```

### Web Interface Setup

Git Commit Genius also includes a web interface for easier interaction:

```bash
# Navigate to the web directory
cd web

# Install web dependencies
npm install

# Start the development server
npm run dev
```

The web interface will be available at `http://localhost:5173`

## Usage

### Command Line Interface

```bash
# Basic usage - generates a commit message for staged changes
git add .
git-commit-genius generate

# Use a specific Ollama model
git-commit-genius generate --model codellama

# Adjust the temperature (randomness) of generation
git-commit-genius generate --temperature 0.5

# Generate and automatically commit
git-commit-genius generate --commit

# Preview the diff without generating a message
git-commit-genius generate --preview

# Generate commit message using conventional format
git-commit-genius generate --conventional

# Generate commit message in Vietnamese
git-commit-genius generate --language vi
```

### Web Interface

The web interface provides an intuitive way to generate commit messages:

1. **Start the web server**:
   ```bash
   cd web
   npm run dev
   ```

2. **Open your browser** and navigate to `http://localhost:5173`

3. **Use the interface**:
   - Paste your git diff in the text area
   - Select your preferred model (llama2, codellama, mistral)
   - Adjust temperature for creativity (0.0-1.0)
   - Enable "Conventional Commits" for standardized format
   - Click "Generate Commit Message"

4. **Review and copy** the generated message for your commit

#### Web Interface Features

- 🖥️ **User-friendly UI**: Clean and intuitive interface
- 🔄 **Real-time generation**: Instant commit message generation
- 📊 **Model selection**: Choose from available Ollama models
- ⚙️ **Temperature control**: Fine-tune creativity level
- 📝 **Conventional commits**: Toggle standardized format
- 🚨 **Error handling**: Clear error messages and status indicators
- 📋 **Easy copy**: One-click copy generated messages

## Options

### Generate Command

| Option | Description |
|--------|-------------|
| `-m, --model <model>` | Specify which Ollama model to use (default: llama3) |
| `-t, --temperature <temperature>` | Set the temperature for AI generation (0.0-1.0) |
| `-c, --commit` | Automatically commit with the generated message |
| `-p, --preview` | Show the diff without generating a message |
| `-v, --conventional` | Use conventional commit format |
| `-l, --language <language>` | Language for commit message (en, vi) |
| `--type <type>` | Conventional commit type (feat, fix, docs, ...) |
| `--scope <scope>` | Scope for conventional commit |

### Config Command

| Option | Description |
|--------|-------------|
| `-s, --set <key=value>` | Set configuration value |
| `-g, --get <key>` | Get configuration value |
| `-l, --list` | List all configuration values |
| `-r, --reset` | Reset configuration to defaults |

### Hook Command

| Option | Description |
|--------|-------------|
| `-i, --install` | Install Git hooks |
| `-r, --remove` | Remove Git hooks |

## Workflow Integration

Git Commit Genius is designed to fit seamlessly into your development workflow:

### CLI Workflow
1. Make your code changes
2. Stage the changes using `git add`
3. Run `git-commit-genius generate`
4. Review the generated commit message
5. Optionally edit the message
6. Commit your changes

### Web Interface Workflow
1. Make your code changes and stage them with `git add`
2. Get the diff using `git diff --staged`
3. Start the web interface with `cd web && npm run dev`
4. Open `http://localhost:5173` in your browser
5. Paste the diff into the text area
6. Configure your preferences (model, temperature, conventional commits)
7. Generate and copy the commit message
8. Use the generated message with `git commit -m "your-message"`

## Project Structure

### Key Files

- **bin/index.js**: Main entry point of the application, registers commands
- **src/commands/generate.js**: Command to generate commit messages
- **src/commands/config.js**: Command to manage configuration
- **src/commands/hook.js**: Command to manage Git hooks
- **src/utils/git.js**: Utilities for Git operations
- **src/utils/ollama.js**: Utilities for interacting with Ollama API
- **src/utils/conventional-commits.js**: Handling conventional commits format
- **src/config/config.js**: User configuration management
- **src/hooks/hook-manager.js**: Manages installing/removing Git hooks
- **src/locales/**: Directory containing language files (en.json, vi.json)

## Technical Details

### src/utils/git.js

This file contains utility functions for interacting with Git:
- `isGitRepository()`: Check if the current directory is a Git repository
- `getStagedDiff()`: Get the diff of staged changes
- `getStagedFiles()`: Get a list of staged files
- `hasStagedChanges()`: Check if there are any staged changes
- `commit(message)`: Perform a commit with the provided message

### src/utils/ollama.js

This file handles interaction with the Ollama API:
- `isAvailable()`: Check if Ollama is available
- `getAvailableModels()`: Get a list of available models from Ollama
- `generateCommitMessage(diff, model, temperature, language)`: Generate a commit message based on diff and provided parameters

### src/utils/conventional-commits.js

This file handles conventional commits formatting:
- `formatCommitMessage(message, type, scope)`: Format a message according to conventional commits standard
- `getCommitTypes()`: Get a list of conventional commit types

### src/config/config.js

This file manages user configuration:
- `getConfig()`: Get the current configuration
- `setConfigValue(key, value)`: Set a configuration value
- `getConfigValue(key)`: Get a configuration value by key
- `resetConfig()`: Reset the configuration to defaults

### src/hooks/hook-manager.js

This file manages Git hooks:
- `installHooks()`: Install Git hooks
- `removeHooks()`: Remove Git hooks
- `completeHook(success, message)`: Complete the hook process

### src/locales/language-manager.js

This file manages the multilingual system:
- `get(key, args, language)`: Get a translated string by key and language
- `getAvailableLanguages()`: Get a list of available languages


