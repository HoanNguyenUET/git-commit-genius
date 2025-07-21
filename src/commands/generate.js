const inquirer = require('inquirer');
const ora = require('ora');
const chalk = require('chalk');
const git = require('../utils/git');
const ollama = require('../utils/ollama');
const config = require('../config/config');
const i18n = require('../locales/language-manager');
const conventionalCommits = require('../utils/conventional-commits');
const hookManager = require('../hooks/hook-manager');

/**
 * Register the generate command with the CLI program
 * @param {import('commander').Command} program - The commander program
 */
function registerCommand(program) {
  program
    .command('generate')
    .description('Generate a commit message based on staged changes')
    .option('-m, --model <model>', 'Ollama model to use')
    .option('-t, --temperature <temperature>', 'Temperature for generation (0.0-1.0)', parseFloat)
    .option('-c, --commit', 'Automatically commit with the generated message')
    .option('-p, --preview', 'Just preview the diff without generating a message')
    .option('-v, --conventional', 'Use conventional commit format')
    .option('-l, --language <language>', 'Language for the commit message')
    .option('--type <type>', 'Conventional commit type (feat, fix, docs, etc.)')
    .option('--scope <scope>', 'Scope for conventional commit')
    .option('--hook', 'Run in hook mode for git hooks integration')
    .action(async (options) => {
      try {
        // Get user configuration
        const userConfig = config.getConfig();
        
        // Set language from options or config
        const language = options.language || userConfig.language.defaultLanguage;
        
        // Check if in git repository
        if (!git.isGitRepository()) {
          console.error(chalk.red(i18n.get('messages.notGitRepository', [], language)));
          return;
        }

        // Check if there are staged changes
        if (!git.hasStagedChanges()) {
          console.error(chalk.yellow(i18n.get('messages.noStagedChanges', [], language)));
          return;
        }

        // Get the list of staged files
        const stagedFiles = git.getStagedFiles();
        console.log(chalk.blue(i18n.get('messages.stagedFiles', [], language)));
        stagedFiles.forEach(file => console.log(`  ${chalk.green('•')} ${file}`));
        console.log();

        // Get the staged diff
        const diff = git.getStagedDiff();
        
        // If preview only, show the diff and exit
        if (options.preview) {
          console.log(chalk.blue(i18n.get('messages.stagedChanges', [], language)));
          console.log(diff);
          return;
        }

        // Check if Ollama is running
        const spinner = ora(i18n.get('messages.checkingOllama', [], language)).start();
        const ollamaAvailable = await ollama.isAvailable();
        
        if (!ollamaAvailable) {
          spinner.fail(i18n.get('messages.ollamaNotAvailable', [], language));
          return;
        }
        spinner.succeed(i18n.get('messages.ollamaAvailable', [], language));
        
        // Check for available models
        try {
          const models = await ollama.getAvailableModels();
          if (models.length === 0) {
            console.error(chalk.red(i18n.get('messages.noModelsFound', [], language)));
            console.error(chalk.yellow('  ollama pull llama2') + i18n.get('messages.orAnotherModel', [], language));
            return;
          }
        } catch (error) {
          console.error(chalk.red(i18n.get('messages.errorCheckingModels', [error.message], language)));
          return;
        }

        // Determine which model to use
        const model = options.model || userConfig.model.defaultModel;
        
        // Generate commit message
        spinner.text = `Generating commit message with ${chalk.green(model)} model...`;
        spinner.start();
        
        // Get temperature from options or config
        const temperature = options.temperature || userConfig.model.temperature;
        
        // Generate the commit message using the Ollama API
        let commitMessage = await ollama.generateCommitMessage(
          diff,
          model,
          temperature,
          language
        );
        
        spinner.succeed('Generated commit message');
        
        // Apply conventional commit format if requested
        if (options.conventional || userConfig.format.useConventionalCommits) {
          const type = options.type || userConfig.format.defaultType;
          const scope = options.scope;
          commitMessage = conventionalCommits.formatCommitMessage(commitMessage, type, scope);
        }
        
        // Display the generated commit message
        console.log('\n' + chalk.blue(i18n.get('messages.generatedCommitMessage', [], language)));
        console.log(chalk.green(commitMessage));
        console.log();
        
        // If --commit flag is set, commit directly
        if (options.commit) {
          git.commit(commitMessage);
          console.log(chalk.green('Changes committed successfully!'));
          return;
        }
        
        // Ask for confirmation and possibly edit
        const { action } = await inquirer.prompt([
          {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: [
              { name: 'Use this message and commit', value: 'commit' },
              { name: 'Edit the message before committing', value: 'edit' },
              { name: 'Generate another message', value: 'regenerate' },
              { name: 'Cancel', value: 'cancel' }
            ]
          }
        ]);
        
        if (action === 'commit') {
          git.commit(commitMessage);
          console.log(chalk.green('Changes committed successfully!'));
          
          // If running as a hook, tell the hook manager the commit was successful
          if (options.hook) {
            hookManager.completeHook(true, commitMessage);
          }
        } else if (action === 'edit') {
          const { editedMessage } = await inquirer.prompt([
            {
              type: 'editor',
              name: 'editedMessage',
              message: 'Edit the commit message:',
              default: commitMessage
            }
          ]);
          
          if (editedMessage.trim()) {
            git.commit(editedMessage);
            console.log(chalk.green('Changes committed successfully with edited message!'));
            
            // If running as a hook, tell the hook manager the commit was successful
            if (options.hook) {
              hookManager.completeHook(true, editedMessage);
            }
          } else {
            console.log(chalk.yellow('Commit cancelled: Empty commit message'));
            
            // If running as a hook, tell the hook manager the commit was cancelled
            if (options.hook) {
              hookManager.completeHook(false);
            }
          }
        } else if (action === 'regenerate') {
          // Re-run the command with the same options
          const commandArgs = ['node', 'git-commit-genius', 'generate'];
          
          // Add all the original options
          if (options.model) commandArgs.push(`--model=${options.model}`);
          if (options.temperature) commandArgs.push(`--temperature=${options.temperature}`);
          if (options.conventional) commandArgs.push('--conventional');
          if (options.language) commandArgs.push(`--language=${options.language}`);
          if (options.type) commandArgs.push(`--type=${options.type}`);
          if (options.scope) commandArgs.push(`--scope=${options.scope}`);
          if (options.hook) commandArgs.push('--hook');
          
          program.parse(commandArgs);
        } else {
          console.log(chalk.yellow('Commit cancelled'));
          
          // If running as a hook, tell the hook manager the commit was cancelled
          if (options.hook) {
            hookManager.completeHook(false);
          }
        }
        
      } catch (error) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });
}

module.exports = registerCommand;
