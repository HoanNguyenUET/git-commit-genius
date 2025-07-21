#!/usr/bin/env node

const { program } = require('commander');
const generateCommand = require('../src/commands/generate');
const configCommand = require('../src/commands/config');
const hookCommand = require('../src/commands/hook');
const i18n = require('../src/locales/language-manager');

// Setup CLI program
program
  .version('1.0.0', '-v, --version', 'output the current version')
  .description('Git Commit Genius - Generate high-quality commit messages using AI');

// Register commands
generateCommand(program);
configCommand(program);
hookCommand(program);

// Parse arguments
program.parse(process.argv);

// If no arguments, show help
if (!process.argv.slice(2).length) {
  program.help();
}
