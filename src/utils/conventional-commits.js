/**
 * Utility for handling conventional commits format
 */

/**
 * List of conventional commit types
 */
const COMMIT_TYPES = {
  feat: 'A new feature',
  fix: 'A bug fix',
  docs: 'Documentation only changes',
  style: 'Changes that do not affect the meaning of the code (white-space, formatting, etc)',
  refactor: 'A code change that neither fixes a bug nor adds a feature',
  perf: 'A code change that improves performance',
  test: 'Adding missing tests or correcting existing tests',
  build: 'Changes that affect the build system or external dependencies',
  ci: 'Changes to our CI configuration files and scripts',
  chore: 'Other changes that don\'t modify src or test files',
  revert: 'Reverts a previous commit'
};

// Maximum length for the header line (type + scope + subject)
const MAX_HEADER_LENGTH = 72;

/**
 * Format a commit message according to the conventional commits specification
 * @param {string} message - The original commit message
 * @param {string} type - The type of commit (e.g. feat, fix, docs)
 * @param {string} scope - The scope of the commit (optional)
 * @returns {string} - The formatted commit message
 */
function formatCommitMessage(message, type = 'feat', scope = null) {
  // Validate the type
  if (!COMMIT_TYPES[type]) {
    type = 'feat'; // Default to feat if invalid type
  }

  // Format the header according to conventional commits
  let header;
  if (scope) {
    header = `${type}(${scope}): `;
  } else {
    header = `${type}: `;
  }

  // Clean up the message - take the first line as the subject
  const lines = message.trim().split('\n');
  const subject = lines[0].trim();

  // Format the body (if any)
  let body = '';
  if (lines.length > 1) {
    body = '\n\n' + lines.slice(1).join('\n').trim();
  }

  // Ensure the header doesn't exceed the maximum length
  const fullHeader = header + subject;
  const finalSubject = 
    fullHeader.length > MAX_HEADER_LENGTH 
      ? subject.substring(0, MAX_HEADER_LENGTH - header.length - 3) + '...'
      : subject;

  return `${header}${finalSubject}${body}`;
}

function getCommitTypes() {
  return { ...COMMIT_TYPES };
}

module.exports = {
  formatCommitMessage,
  getCommitTypes
};
