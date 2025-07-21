/**
 * Command to install or remove Git hooks
 */
const chalk = require('chalk');
const hookManager = require('../hooks/hook-manager');
const i18n = require('../locales/language-manager');

/**
 * Register the hook command with the CLI program
 * @param {import('commander').Command} program - The commander program
 */
function registerCommand(program) {
  program
    .command('hook')
    .description('Manage Git hooks integration')
    .option('-i, --install', 'Install git hooks')
    .option('-r, --remove', 'Remove git hooks')
    .action((options) => {
      try {
        const config = require('../config/config').getConfig();
        const language = config.language.defaultLanguage;

        if (options.install) {
          const result = hookManager.installHooks();
          if (result) {
            console.log(chalk.green('Git hooks installed successfully'));
          }
        } else if (options.remove) {
          const result = hookManager.removeHooks();
          if (result) {
            console.log(chalk.green('Git hooks removed successfully'));
          }
        } else {
          console.log(chalk.yellow('Please specify --install or --remove'));
        }
      } catch (error) {
        console.error(chalk.red(`Error: ${error.message}`));
      }
    });
}

module.exports = registerCommand;
