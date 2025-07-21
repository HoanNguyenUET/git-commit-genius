const { spawn } = require('child_process');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

/**
 * Get the default editor based on environment variables and system availability
 * @returns {string} The editor command
 */
function getDefaultEditor() {
  // Check environment variables first
  const envEditor = process.env.EDITOR || process.env.VISUAL;
  if (envEditor) {
    return envEditor;
  }

  // Common editors to try in order of preference
  const editors = ['nano', 'vim', 'vi', 'code', 'gedit', 'notepad'];
  
  for (const editor of editors) {
    if (isCommandAvailable(editor)) {
      return editor;
    }
  }
  
  return null;
}

/**
 * Check if a command is available on the system
 * @param {string} command - The command to check
 * @returns {boolean} True if command is available
 */
function isCommandAvailable(command) {
  try {
    const isWindows = process.platform === 'win32';
    const checkCommand = isWindows ? 'where' : 'which';
    
    const result = require('child_process').execSync(`${checkCommand} ${command}`, {
      stdio: 'ignore',
      timeout: 5000
    });
    
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Set the editor environment variable for inquirer
 */
function setupEditor() {
  const editor = getDefaultEditor();
  if (editor && !process.env.EDITOR) {
    process.env.EDITOR = editor;
  }
}

module.exports = {
  getDefaultEditor,
  isCommandAvailable,
  setupEditor
};
