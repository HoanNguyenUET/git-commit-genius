# Git Commit Genius - Setup and Testing Guide

This guide provides instructions for setting up the required environment and testing the basic features of Git Commit Genius.

## Setup Requirements

### 1. Install Node.js

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# macOS (using Homebrew)
brew install node

# Windows
# Download and install from https://nodejs.org/en/download/
```

Verify installation:
```bash
node --version  # Should show v18.x or higher
npm --version   # Should show 8.x or higher
```

### 2. Install Git

```bash
# Ubuntu/Debian
sudo apt-get install git

# macOS
brew install git

# Windows
# Download and install from https://git-scm.com/download/win
```

Verify installation:
```bash
git --version  # Should show 2.x or higher
```

### 3. Install Ollama

```bash
# macOS/Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows
# Download from https://ollama.com/download
```

Start Ollama service:
```bash
# macOS/Linux
ollama serve

# Windows
# Run the Ollama application
```

### 4. Install a Language Model

```bash
# Install a small model to start with
ollama pull llama2  # ~4GB

# Alternative smaller model
ollama pull mistral  # ~4GB
```

Verify Ollama is running with installed models:
```bash
ollama list  # Should show your installed models
curl http://localhost:11434/api/tags  # Should return JSON with models
```

### 5. Install Git Commit Genius

```bash
# Clone the repository
git clone https://github.com/HoanNguyenUET/git-commit-genius.git
cd git-commit-genius

# Install dependencies
npm install

# Link package for global usage
npm link
```

## Basic Feature Testing

### Test 1: Verify Installation

```bash
# Check if git-commit-genius is available
git-commit-genius --version
```

Expected output: Should display version information

### Test 2: Create Test Repository

```bash
# Create a test directory
mkdir gcg-test
cd gcg-test
git init

# Create some test files
echo "# Test Project" > README.md
echo "console.log('Hello world');" > index.js

# Make initial commit
git add .
git commit -m "Initial commit"
```

### Test 3: Generate Basic Commit Message

```bash
# Make changes to test
echo "// New function" >> index.js
echo "function test() { return true; }" >> index.js

# Stage the changes
git add index.js

# Generate commit message
git-commit-genius generate
```

Expected output:
- List of staged files
- Confirmation that Ollama is available
- Generated commit message
- Options to commit, edit, regenerate or cancel

### Test 4: Test Commit Option

After running the generate command and seeing the generated message:
- Select "Use this message and commit"

Expected output:
- Confirmation that changes were committed
- Verify with `git log -1` to see your new commit

### Test 5: Test Preview Feature

```bash
# Make another change
echo "const VERSION = '1.0.0';" >> index.js
git add index.js

# Use preview option
git-commit-genius generate --preview
```

Expected output:
- Should show git diff without generating a commit message

### Test 6: Test Language Options

```bash
# Make another change
echo "// Multilanguage test" >> index.js
git add index.js

# Generate in Spanish
git-commit-genius generate --language es
```

Expected output:
- Interface text should be in Spanish
- Generated commit message should be in Spanish

### Test 7: Test Vietnamese Language

```bash
# Make another change
echo "// Kiểm tra tiếng Việt" >> index.js
git add index.js

# Generate in Vietnamese
git-commit-genius generate --language vi
```

Expected output:
- Interface text should be in Vietnamese
- Generated commit message should be in Vietnamese

### Test 8: Test Conventional Commits

```bash
# Add a new file
echo "body { margin: 0; }" > styles.css
git add styles.css

# Generate with conventional format
git-commit-genius generate --conventional
```

Expected output:
- Generated message should follow conventional format (e.g., "feat: Add styles.css with basic CSS")

### Test 9: Test Direct Commit

```bash
# Add another change
echo "* { box-sizing: border-box; }" >> styles.css
git add styles.css

# Generate and commit directly
git-commit-genius generate --commit
```

Expected output:
- Tool should generate message and commit immediately
- Verify with `git log -1` to see your commit

### Test 10: Test Configuration

```bash
# View current configuration
git-commit-genius config

# Set default model
git-commit-genius config --set model.defaultModel=llama2

# Set default language
git-commit-genius config --set language.defaultLanguage=vi

# Test that configuration works
git-commit-genius generate
```

Expected output:
- Default settings should be applied (Vietnamese language)
- Reset configuration when done:
```bash
git-commit-genius config --reset
```

## Troubleshooting Common Issues

### 1. Ollama Connection Issues

If you see "Ollama is not available" error:
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If not running, start it
ollama serve
```

### 2. Model Not Found Issues

If you see errors about models not being available:
```bash
# List installed models
ollama list

# Install a model if needed
ollama pull llama2
```

### 3. Git Issues

If Git operations fail:
```bash
# Check if you're in a git repository
git status

# Check if you have changes staged
git diff --staged
```

### 4. Node.js/NPM Issues

If you encounter JavaScript errors:
```bash
# Make sure all dependencies are installed
npm install

# Check for Node.js version compatibility
node --version # Should be v14.x or higher
```

## Next Steps

After verifying these basic features work correctly, you can explore more advanced features:

- Git hooks integration (`git-commit-genius hook --install`)
- Custom temperature settings (`--temperature` option)
- Different Ollama models (try with different models)

For more detailed options, run:
```bash
git-commit-genius --help
git-commit-genius generate --help
```
