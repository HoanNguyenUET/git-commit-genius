/**
 * Command to manage Git Commit Genius configuration
 */
const chalk = require('chalk');
const config = require('../config/config');
const i18n = require('../locales/language-manager');

/**
 * Register the config command with the CLI program
 * @param {import('commander').Command} program - The commander program
 */
function registerCommand(program) {
  program
    .command('config')
    .description('Manage configuration settings')
    .option('-s, --set <key=value>', 'Set a configuration value')
    .option('-g, --get <key>', 'Get a configuration value')
    .option('-l, --list', 'List all configuration values')
    .option('-r, --reset', 'Reset configuration to defaults')
    .action((options) => {
      try {
        const userConfig = config.getConfig();
        const language = userConfig.language.defaultLanguage;

        if (options.set) {
          // Parse key=value format
          const match = options.set.match(/^([^=]+)=(.*)$/);
          if (!match) {
            console.error(chalk.red('Invalid format. Use --set key=value'));
            return;
          }
          
          const [, key, value] = match;
          config.setConfigValue(key, value);
          console.log(chalk.green('Configuration saved successfully'));
        } else if (options.get) {
          const value = config.getConfigValue(options.get);
          if (value !== undefined) {
            if (typeof value === 'object') {
              console.log(JSON.stringify(value, null, 2));
            } else {
              console.log(value);
            }
          } else {
            console.error(chalk.yellow('Configuration not found'));
          }
        } else if (options.list) {
          console.log(JSON.stringify(userConfig, null, 2));
        } else if (options.reset) {
          config.resetConfig();
          console.log(chalk.green('Configuration reset to defaults'));
        } else {
          // Default to listing all config
          console.log(JSON.stringify(userConfig, null, 2));
        }
      } catch (error) {
        console.error(chalk.red(`Error: ${error.message}`));
      }
    });
}

module.exports = registerCommand;
