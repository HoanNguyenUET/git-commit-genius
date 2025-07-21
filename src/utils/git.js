const { execSync } = require('child_process');

/**
 * Git utility functions
 */
const git = {
  /**
   * Check if the current directory is a git repository
   * @returns {boolean} True if current directory is a git repository
   */
  isGitRepository() {
    try {
      execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Get the staged diff
   * @returns {string} The staged diff
   */
  getStagedDiff() {
    try {
      return execSync('git diff --staged').toString();
    } catch (e) {
      throw new Error(`Failed to get staged diff: ${e.message}`);
    }
  },

  /**
   * Get the list of staged files
   * @returns {string[]} Array of staged file paths
   */
  getStagedFiles() {
    try {
      const result = execSync('git diff --staged --name-only').toString();
      return result.split('\n').filter(Boolean);
    } catch (e) {
      throw new Error(`Failed to get staged files: ${e.message}`);
    }
  },

  /**
   * Check if there are staged changes
   * @returns {boolean} True if there are staged changes
   */
  hasStagedChanges() {
    try {
      const output = execSync('git diff --staged --quiet || echo "has changes"').toString();
      return output.includes('has changes');
    } catch (e) {
      // If the command fails, it means there are staged changes
      return true;
    }
  },

  /**
   * Commit changes with the given message
   * @param {string} message - The commit message
   * @returns {boolean} True if commit was successful
   */
  commit(message) {
    try {
      // Use single quotes to avoid issues with special characters in the message
      execSync(`git commit -m '${message.replace(/'/g, "'\\''")}'`);
      return true;
    } catch (e) {
      throw new Error(`Failed to commit: ${e.message}`);
    }
  }
};

module.exports = git;
