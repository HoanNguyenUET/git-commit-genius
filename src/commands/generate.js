const inquirer = require('inquirer');
const ora = require('ora');
const git = require('../utils/git');
const ollama = require('../utils/ollama');
const config = require('../config/config');
const i18n = require('../locales/language-manager');
const conventionalCommits = require('../utils/conventional-commits');
const hookManager = require('../hooks/hook-manager');
const { colors, indicators, createBox, gradient, chalk } = require('../utils/colors');
const editor = require('../utils/editor');

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
        // Setup editor environment
        editor.setupEditor();
        
        // Get user configuration
        const userConfig = config.getConfig();
        
        // Set language from options or config
        const language = options.language || userConfig.language.defaultLanguage;
        
        // Check if in git repository
        if (!git.isGitRepository()) {
          console.error(`${indicators.error} ${colors.error(i18n.get('messages.notGitRepository', [], language))}`);
          return;
        }

        // Check if there are staged changes
        if (!git.hasStagedChanges()) {
          console.error(`${indicators.warning} ${colors.warning(i18n.get('messages.noStagedChanges', [], language))}`);
          return;
        }

        // Get the list of staged files
        const stagedFiles = git.getStagedFiles();
        console.log(`\n${indicators.info} ${colors.info(i18n.get('messages.stagedFiles', [], language))}`);
        stagedFiles.forEach(file => console.log(`  ${indicators.bullet} ${colors.path(file)}`));
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
        const spinner = ora({
          text: colors.secondary(i18n.get('messages.checkingOllama', [], language)),
          color: 'cyan'
        }).start();
        const ollamaAvailable = await ollama.isAvailable();
        
        if (!ollamaAvailable) {
          spinner.fail(`${colors.error(i18n.get('messages.ollamaNotAvailable', [], language))}`);
          return;
        }
        spinner.succeed(`${indicators.success} ${colors.success(i18n.get('messages.ollamaAvailable', [], language))}`);
        
        // Check for available models
        let availableModels = [];
        try {
          availableModels = await ollama.getAvailableModels();
          if (availableModels.length === 0) {
            console.error(`${indicators.error} ${colors.error(i18n.get('messages.noModelsFound', [], language))}`);
            console.error(`  ${colors.code('ollama pull llama2')} ${colors.secondary('or another model of your choice')}`);
            return;
          }
        } catch (error) {
          console.error(`${indicators.error} ${colors.error('Error checking models:')} ${error.message}`);
          return;
        }

        // Determine which model to use - check if configured model is available
        let model = options.model || userConfig.model.defaultModel;
        if (!availableModels.includes(model)) {
          console.log(`${indicators.warning} ${colors.warning(`Model '${model}' not found. Available models:`)}`);
          availableModels.forEach(m => console.log(`  ${indicators.bullet} ${colors.accent(m)}`));
          
          // Use the first available model
          model = availableModels[0];
          console.log(`${indicators.info} ${colors.info(`Using '${model}' instead.`)}`);
        }
        
        // Generate commit message
        const generateSpinner = ora({
          text: `${colors.secondary('Generating commit message with')} ${colors.accent(model)} ${colors.secondary('model...')}`,
          color: 'magenta'
        }).start();
        
        // Get temperature from options or config
        const temperature = options.temperature || userConfig.model.temperature;
        
        // Generate the commit message using the Ollama API
        // Skip conventional format in prompt if we're going to apply it later
        const skipConventionalFormat = options.conventional || userConfig.format.useConventionalCommits;
        
        let commitMessage = await ollama.generateCommitMessage(
          diff,
          model,
          temperature,
          language,
          skipConventionalFormat
        );
        
        generateSpinner.succeed(`${indicators.success} ${colors.success('Generated commit message')}`);
        
        // Apply conventional commit format if requested
        if (options.conventional || userConfig.format.useConventionalCommits) {
          const type = options.type || userConfig.format.defaultType;
          const scope = options.scope;
          commitMessage = conventionalCommits.formatCommitMessage(commitMessage, type, scope);
        }
        
        // Display the generated commit message in a beautiful box
        console.log('\n' + createBox(
          `${indicators.star} ${colors.primary('Generated Commit Message')}\n\n${colors.highlight(commitMessage)}`,
          { color: colors.gradient.cyan, padding: 2 }
        ));
        console.log();
        
        // If --commit flag is set, commit directly
        if (options.commit) {
          git.commit(commitMessage);
          console.log(`${indicators.rocket} ${colors.success('Changes committed successfully!')}`);
          return;
        }
        
        // Ask for confirmation and possibly edit
        const { action } = await inquirer.prompt([
          {
            type: 'list',
            name: 'action',
            message: language === 'vi' ? colors.info('Bạn muốn làm gì?') : colors.info('What would you like to do?'),
            choices: language === 'vi' ? [
              { 
                name: `${indicators.check} ${colors.success('Sử dụng message này và commit')}`, 
                value: 'commit' 
              },
              { 
                name: `${indicators.gear} ${colors.warning('Chỉnh sửa message trước khi commit')}`, 
                value: 'edit' 
              },
              { 
                name: `${indicators.loading} ${colors.info('Tạo message khác')}`, 
                value: 'regenerate' 
              },
              { 
                name: `${indicators.cross} ${colors.error('Hủy bỏ')}`, 
                value: 'cancel' 
              }
            ] : [
              { 
                name: `${indicators.check} ${colors.success('Use this message and commit')}`, 
                value: 'commit' 
              },
              { 
                name: `${indicators.gear} ${colors.warning('Edit the message before committing')}`, 
                value: 'edit' 
              },
              { 
                name: `${indicators.loading} ${colors.info('Generate another message')}`, 
                value: 'regenerate' 
              },
              { 
                name: `${indicators.cross} ${colors.error('Cancel')}`, 
                value: 'cancel' 
              }
            ]
          }
        ]);
        
        if (action === 'commit') {
          git.commit(commitMessage);
          console.log(`${indicators.rocket} ${colors.success('Changes committed successfully!')}`);
          
          // If running as a hook, tell the hook manager the commit was successful
          if (options.hook) {
            hookManager.completeHook(true, commitMessage);
          }
        } else if (action === 'edit') {
          const availableEditor = editor.getDefaultEditor();
          
          if (availableEditor) {
            try {
              const { editedMessage } = await inquirer.prompt([
                {
                  type: 'editor',
                  name: 'editedMessage',
                  message: language === 'vi' ? colors.info('Chỉnh sửa commit message:') : colors.info('Edit the commit message:'),
                  default: commitMessage
                }
              ]);
              
              if (editedMessage.trim()) {
                git.commit(editedMessage);
                console.log(`${indicators.rocket} ${colors.success(language === 'vi' ? 'Commit thành công với message đã chỉnh sửa!' : 'Changes committed successfully with edited message!')}`);
                
                // If running as a hook, tell the hook manager the commit was successful
                if (options.hook) {
                  hookManager.completeHook(true, editedMessage);
                }
              } else {
                console.log(`${indicators.warning} ${colors.warning(language === 'vi' ? 'Commit đã hủy: Message trống' : 'Commit cancelled: Empty commit message')}`);
                
                // If running as a hook, tell the hook manager the commit was cancelled
                if (options.hook) {
                  hookManager.completeHook(false);
                }
              }
            } catch (error) {
              console.error(`${indicators.error} ${colors.error(language === 'vi' ? 'Lỗi khi mở editor:' : 'Error opening editor:')} ${error.message}`);
              
              // Fallback to input prompt
              await handleEditFallback(commitMessage, language, options, hookManager, git);
            }
          } else {
            // No editor available, use input fallback
            console.log(`${indicators.warning} ${colors.warning(language === 'vi' ? 'Không tìm thấy text editor. Sử dụng input thay thế:' : 'No text editor found. Using input fallback:')}`);
            await handleEditFallback(commitMessage, language, options, hookManager, git);
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
          console.log(`${indicators.warning} ${colors.warning('Commit cancelled')}`);
          
          // If running as a hook, tell the hook manager the commit was cancelled
          if (options.hook) {
            hookManager.completeHook(false);
          }
        }
        
      } catch (error) {
        console.error(`${indicators.error} ${colors.error(`Error: ${error.message}`)}`);
        process.exit(1);
      }
    });
}

/**
 * Handle fallback input when editor is not available
 * @param {string} commitMessage - Original commit message
 * @param {string} language - User language
 * @param {object} options - Command options
 * @param {object} hookManager - Hook manager instance
 * @param {object} git - Git utility instance
 */
async function handleEditFallback(commitMessage, language, options, hookManager, git) {
  const { editedMessage } = await inquirer.prompt([
    {
      type: 'input',
      name: 'editedMessage',
      message: language === 'vi' ? 'Nhập commit message:' : 'Enter commit message:',
      default: commitMessage
    }
  ]);
  
  if (editedMessage.trim()) {
    git.commit(editedMessage);
    console.log(`${indicators.rocket} ${colors.success(language === 'vi' ? 'Commit thành công với message đã chỉnh sửa!' : 'Changes committed successfully with edited message!')}`);
    
    // If running as a hook, tell the hook manager the commit was successful
    if (options.hook) {
      hookManager.completeHook(true, editedMessage);
    }
  } else {
    console.log(`${indicators.warning} ${colors.warning(language === 'vi' ? 'Commit đã hủy: Message trống' : 'Commit cancelled: Empty commit message')}`);
    
    // If running as a hook, tell the hook manager the commit was cancelled
    if (options.hook) {
      hookManager.completeHook(false);
    }
  }
}

module.exports = registerCommand;
