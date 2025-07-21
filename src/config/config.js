/**
 * Configuration module for Git Commit Genius
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

// Configuration file path
const CONFIG_DIR = path.join(os.homedir(), '.gitcommitgenius');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

// Default configuration
const DEFAULT_CONFIG = {
  model: {
    defaultModel: 'llama2',
    temperature: 0.7
  },
  format: {
    useConventionalCommits: false,
    defaultType: 'feat'
  },
  language: {
    defaultLanguage: 'en'
  },
  hooks: {
    prepareCommitMsg: true,
    skipDuplicatePrompt: false
  }
};

/**
 * Ensure the configuration directory exists
 */
function ensureConfigDir() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

/**
 * Get the current configuration, or create default if none exists
 * @returns {Object} - The current configuration
 */
function getConfig() {
  ensureConfigDir();
  
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const content = fs.readFileSync(CONFIG_FILE, 'utf8');
      const config = JSON.parse(content);
      // Merge with defaults in case new options were added
      return mergeWithDefaults(config);
    }
  } catch (error) {
    console.error('Error reading configuration:', error.message);
  }
  
  // Return default config if none exists or error reading
  saveConfig(DEFAULT_CONFIG);
  return { ...DEFAULT_CONFIG };
}

/**
 * Save the configuration to disk
 * @param {Object} config - The configuration to save
 */
function saveConfig(config) {
  ensureConfigDir();
  
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving configuration:', error.message);
  }
}

/**
 * Merge the user config with defaults for any missing properties
 * @param {Object} userConfig - The user configuration
 * @returns {Object} - The merged configuration
 */
function mergeWithDefaults(userConfig) {
  const result = { ...DEFAULT_CONFIG };
  
  for (const [section, values] of Object.entries(DEFAULT_CONFIG)) {
    if (userConfig[section]) {
      result[section] = { ...values, ...userConfig[section] };
    }
  }
  
  return result;
}

/**
 * Set a specific configuration value
 * @param {string} key - The configuration key in dot notation (e.g., 'model.defaultModel')
 * @param {any} value - The value to set
 * @returns {boolean} - Success or failure
 */
function setConfigValue(key, value) {
  const config = getConfig();
  const keys = key.split('.');
  
  let current = config;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (!current[k] || typeof current[k] !== 'object') {
      current[k] = {};
    }
    current = current[k];
  }
  
  // Convert string values to proper types
  let typedValue = value;
  if (value === 'true' || value === 'false') {
    typedValue = value === 'true';
  } else if (!isNaN(value) && value !== '') {
    typedValue = Number(value);
  }
  
  current[keys[keys.length - 1]] = typedValue;
  saveConfig(config);
  return true;
}

/**
 * Get a specific configuration value
 * @param {string} key - The configuration key in dot notation
 * @returns {any} - The configuration value, or undefined if not found
 */
function getConfigValue(key) {
  const config = getConfig();
  const keys = key.split('.');
  
  let current = config;
  for (const k of keys) {
    if (!current[k]) {
      return undefined;
    }
    current = current[k];
  }
  
  return current;
}

/**
 * Reset the configuration to defaults
 */
function resetConfig() {
  saveConfig(DEFAULT_CONFIG);
}

module.exports = {
  getConfig,
  saveConfig,
  setConfigValue,
  getConfigValue,
  resetConfig
};
