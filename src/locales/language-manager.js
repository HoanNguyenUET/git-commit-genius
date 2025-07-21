/**
 * Language manager for git-commit-genius
 */
const fs = require('fs');
const path = require('path');
const config = require('../config/config');

class LanguageManager {
  constructor() {
    this.localesDir = __dirname;
    this.languages = {};
    this.loadLanguages();
  }
  
  /**
   * Load all available language files
   */
  loadLanguages() {
    try {
      // Only load supported languages: en and vi
      const supportedLanguages = ['en', 'vi'];
      
      // Load each supported language file
      for (const lang of supportedLanguages) {
        const langPath = path.join(this.localesDir, `${lang}.json`);
        if (fs.existsSync(langPath)) {
          try {
            this.languages[lang] = JSON.parse(fs.readFileSync(langPath, 'utf8'));
          } catch (err) {
            console.error(`Error loading language file ${lang}.json:`, err);
          }
        }
      }
      
      // Ensure default language (English) is loaded
      if (!this.languages['en']) {
        this.languages['en'] = this.loadFallbackLanguage();
      }
    } catch (error) {
      console.error(`Error loading languages:`, error);
      this.languages = { en: this.loadFallbackLanguage() };
    }
  }
  
  /**
   * Load English as fallback language
   */
  loadFallbackLanguage() {
    const fallbackPath = path.join(this.localesDir, 'en.json');
    try {
      return JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
    } catch (err) {
      console.error(`Critical error: Failed to load fallback language file:`, err);
      return {}; // Empty object as last resort
    }
  }
  
  /**
   * Get a translated string
   * @param {string} key - Dot-notated key path (e.g., 'messages.stagedFiles')
   * @param {any[]} args - Optional arguments for string formatting
   * @param {string} language - Optional language code (defaults to config)
   * @returns {string} Translated string
   */
  get(key, args = [], language = null) {
    // Determine which language to use
    const lang = language || config.getConfig().language.defaultLanguage;
    const langData = this.languages[lang] || this.languages.en || {};
    
    // Get the string by path
    const value = this.getByPath(langData, key);
    
    // If not found, try fallback to English
    if (value === undefined && lang !== 'en' && this.languages.en) {
      return this.getByPath(this.languages.en, key) || key;
    }
    
    // If still not found, return the key itself
    if (value === undefined) {
      return key;
    }
    
    // Format the string with arguments
    if (typeof value === 'string' && args.length > 0) {
      return this.format(value, args);
    }
    
    return value;
  }
  
  /**
   * Get a value by dot-notated path
   * @param {Object} obj - Object to traverse
   * @param {string} path - Dot-notated path
   * @returns {any} Value at the path or undefined
   */
  getByPath(obj, path) {
    return path.split('.').reduce((acc, part) => {
      return acc && acc[part] !== undefined ? acc[part] : undefined;
    }, obj);
  }
  
  /**
   * Format a string with arguments
   * @param {string} str - String with %s placeholders
   * @param {any[]} args - Arguments to substitute
   * @returns {string} Formatted string
   */
  format(str, args) {
    return args.reduce((result, arg) => {
      return result.replace('%s', arg);
    }, str);
  }
  
  /**
   * Get all available languages
   * @returns {string[]} Array of language codes
   */
  getAvailableLanguages() {
    return Object.keys(this.languages);
  }
}

module.exports = new LanguageManager();
