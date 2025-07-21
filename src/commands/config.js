/**
 * Command to manage Git Commit Genius configuration
 */
const config = require('../config/config');
const i18n = require('../locales/language-manager');
const { colors, indicators, createBox, gradient } = require('../utils/colors');

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
            console.error(`${indicators.error} ${colors.error('Invalid format. Use --set key=value')}`);
            return;
          }
          
          const [, key, value] = match;
          config.setConfigValue(key, value);
          console.log(`${indicators.success} ${colors.success(`Configuration ${colors.accent(key)} set to ${colors.highlight(value)}`)}`);
        } else if (options.get) {
          const value = config.getConfigValue(options.get);
          if (value !== undefined) {
            console.log(createBox(
              `${colors.info('Configuration:')} ${colors.accent(options.get)}\n\n${colors.code(typeof value === 'object' ? JSON.stringify(value, null, 2) : value)}`,
              { color: colors.gradient.blue, padding: 1 }
            ));
          } else {
            console.error(`${indicators.warning} ${colors.warning('Configuration not found')}`);
          }
        } else if (options.list) {
          console.log(createBox(
            `${colors.primary('Current Configuration')}\n\n${colors.code(JSON.stringify(userConfig, null, 2))}`,
            { color: colors.gradient.green, padding: 2 }
          ));
        } else if (options.reset) {
          config.resetConfig();
          console.log(chalk.green('Configuration reset to defaults'));
        } else {
          // Default to listing all config
          console.log(createBox(
            `${colors.primary('Current Configuration')}\n\n${colors.code(JSON.stringify(userConfig, null, 2))}`,
            { color: colors.gradient.green, padding: 2 }
          ));
        }
      } catch (error) {
        console.error(`${indicators.error} ${colors.error(`Error: ${error.message}`)}`);
      }
    });
}

module.exports = registerCommand;
