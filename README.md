# Git Commit Genius

Generate high-quality commit messages automatically using AI and git diff.

## Overview

Git Commit Genius is a command-line tool that helps developers create meaningful, consistent commit messages by analyzing git diffs and using AI (Ollama) to generate appropriate commit messages. It streamlines the commit process and ensures high-quality documentation of code changes.

## Features

- Automatically analyze staged changes in your git repository
- Generate context-aware, high-quality commit messages using Ollama
- Interactive mode for reviewing, editing, or regenerating commit messages
- Customizable AI model and temperature settings
- Option to automatically commit with the generated message

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [Git](https://git-scm.com/)
- [Ollama](https://ollama.ai/) running locally with models installed

## Installation

### Local Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/git-commit-genius.git

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

## Usage

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
```

## Options

- `-m, --model <model>` - Specify which Ollama model to use (default: llama3)
- `-t, --temperature <temperature>` - Set the temperature for AI generation (0.0-1.0)
- `-c, --commit` - Automatically commit with the generated message
- `-p, --preview` - Show the diff without generating a message
- `-v, --version` - Show the version number
- `-h, --help` - Display help for command

## Workflow Integration

Git Commit Genius is designed to fit seamlessly into your development workflow:

1. Make your code changes
2. Stage the changes using `git add`
3. Run `git-commit-genius generate`
4. Review the generated commit message
5. Optionally edit the message
6. Commit your changes

## License

ISC
