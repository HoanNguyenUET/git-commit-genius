/**
 * Utility for handling conventional commits format
 */

/**
 * List of conventional commit types
 */
export const COMMIT_TYPES = {
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
export function formatCommitMessage(message: string, type: string = 'feat', scope?: string): string {
  // Validate the type
  if (!(type in COMMIT_TYPES)) {
    type = 'feat'; // Default to feat if invalid type
  }

  // Format the header according to conventional commits
  let header: string;
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

/**
 * Determine the appropriate commit type based on the diff content
 * @param {string} diff - The git diff content
 * @returns {string} - The suggested commit type
 */
export function determineCommitType(diff: string): string {
  const lowerDiff = diff.toLowerCase();
  
  // Check for different patterns in the diff
  if (lowerDiff.includes('test') || lowerDiff.includes('spec')) {
    return 'test';
  }
  
  if (lowerDiff.includes('readme') || lowerDiff.includes('doc') || lowerDiff.includes('comment')) {
    return 'docs';
  }
  
  if (lowerDiff.includes('package.json') || lowerDiff.includes('webpack') || lowerDiff.includes('build')) {
    return 'build';
  }
  
  if (lowerDiff.includes('ci') || lowerDiff.includes('github/workflows')) {
    return 'ci';
  }
  
  // Check for additions (new features)
  const additions = (diff.match(/^\+/gm) || []).length;
  const deletions = (diff.match(/^-/gm) || []).length;
  
  if (additions > deletions * 2) {
    return 'feat'; // More additions than deletions suggests new feature
  }
  
  if (lowerDiff.includes('fix') || lowerDiff.includes('bug') || lowerDiff.includes('error')) {
    return 'fix';
  }
  
  // Default to feat for new functionality
  return 'feat';
}

export function getCommitTypes(): typeof COMMIT_TYPES {
  return { ...COMMIT_TYPES };
}
