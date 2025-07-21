/**
 * Color utilities for CLI output
 */
const chalk = require('chalk');

// Define color themes
const colors = {
  // Status colors
  success: chalk.green.bold,
  error: chalk.red.bold,
  warning: chalk.yellow.bold,
  info: chalk.blue.bold,
  
  // Text colors
  primary: chalk.cyan.bold,
  secondary: chalk.gray,
  accent: chalk.magenta.bold,
  
  // Special colors
  highlight: chalk.yellow.inverse.bold,
  code: chalk.green,
  path: chalk.cyan,
  
  // Gradients and fancy styles
  rainbow: chalk.rainbow,
  gradient: {
    blue: chalk.blue.bold,
    cyan: chalk.cyan.bold,
    green: chalk.green.bold,
    yellow: chalk.yellow.bold,
    red: chalk.red.bold,
    magenta: chalk.magenta.bold
  }
};

// Logo and branding
const logo = () => {
  return `
${chalk.cyan('╭─────────────────────────────────╮')}
${chalk.cyan('│')}  ${chalk.yellow.bold('🧠 Git Commit Genius')}        ${chalk.cyan('│')}
${chalk.cyan('│')}  ${chalk.gray('AI-Powered Commit Messages')}   ${chalk.cyan('│')}
${chalk.cyan('╰─────────────────────────────────╯')}
`;
};

// Status indicators
const indicators = {
  success: chalk.green('✅'),
  error: chalk.red('❌'),
  warning: chalk.yellow('⚠️'),
  info: chalk.blue('ℹ️'),
  loading: chalk.cyan('🔄'),
  arrow: chalk.gray('➤'),
  bullet: chalk.cyan('•'),
  star: chalk.yellow('⭐'),
  rocket: chalk.red('🚀'),
  gear: chalk.gray('⚙️'),
  check: chalk.green('✓'),
  cross: chalk.red('✗')
};

// Box drawing
const box = {
  top: '╭',
  bottom: '╰',
  left: '│',
  right: '│',
  horizontal: '─',
  topRight: '╮',
  bottomRight: '╯',
  topLeft: '╭',
  bottomLeft: '╰'
};

// Helper function to strip ANSI codes
const stripAnsi = (str) => {
  return str.replace(/\u001b\[[0-9;]*m/g, '');
};

// Helper functions
const createBox = (content, options = {}) => {
  const lines = content.split('\n');
  const maxLength = Math.max(...lines.map(line => stripAnsi(line).length));
  const padding = options.padding || 1;
  const color = options.color || chalk.gray;
  
  const horizontalLine = color(box.horizontal.repeat(maxLength + padding * 2));
  const result = [];
  
  result.push(color(box.topLeft) + horizontalLine + color(box.topRight));
  
  for (const line of lines) {
    const paddedLine = line + ' '.repeat(maxLength - stripAnsi(line).length);
    result.push(color(box.left) + ' '.repeat(padding) + paddedLine + ' '.repeat(padding) + color(box.right));
  }
  
  result.push(color(box.bottomLeft) + horizontalLine + color(box.bottomRight));
  
  return result.join('\n');
};

const gradient = (text, colors = ['red', 'yellow', 'green', 'cyan', 'blue', 'magenta']) => {
  const chars = text.split('');
  const colorCount = colors.length;
  return chars.map((char, index) => {
    const colorIndex = Math.floor((index / chars.length) * colorCount);
    return chalk[colors[colorIndex] || colors[0]](char);
  }).join('');
};

module.exports = {
  colors,
  logo,
  indicators,
  box,
  createBox,
  gradient,
  chalk,
  stripAnsi
};
