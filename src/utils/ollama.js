const axios = require('axios');

/**
 * Check if Ollama service is available
 * @returns {Promise<boolean>} True if Ollama is available
 */
async function isAvailable() {
  try {
    await axios.get('http://localhost:11434/api/tags');
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get available models from Ollama
 * @returns {Promise<string[]>} Array of available model names
 */
async function getAvailableModels() {
  try {
    const response = await axios.get('http://localhost:11434/api/tags');
    if (response.data && response.data.models) {
      return response.data.models.map(model => model.name);
    }
    return [];
  } catch (error) {
    throw new Error('Failed to get available models from Ollama');
  }
}

/**
 * Generate a commit message using the Ollama API
 * @param {string} diff - The git diff to analyze
 * @param {string} model - The model to use
 * @param {number} temperature - Randomness of generation (0.0 to 1.0)
 * @param {string} language - Language for the commit message
 * @returns {Promise<string>} The generated commit message
 */
async function generateCommitMessage(diff, model = 'llama2', temperature = 0.7, language = 'en') {
  if (!diff) {
    throw new Error('No diff provided');
  }

  // Language-specific prompts
  const languagePrompts = {
    en: {
      intro: 'You are a senior software engineer tasked with writing concise git commit messages.',
      instructions: '- Keep commit messages extremely short (max 30 chars preferred, never more than 50)\n- Use imperative mood (e.g., "Add", "Fix", "Update")\n- No additional description needed\n- Focus only on the primary change',
      conventionalFormat: 'Use the Conventional Commits format: type(scope): description\nTypes: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert\nBe extremely brief.',
      ending: 'Respond ONLY with the commit message, nothing else. Be short and concise.'
    },
    vi: {
      intro: 'Bạn là một kỹ sư phần mềm viết các thông điệp commit git ngắn gọn bằng tiếng Việt.',
      instructions: '- Viết thông điệp commit cực kỳ ngắn gọn (tốt nhất là 30 ký tự, không bao giờ quá 50)\n- Sử dụng động từ mệnh lệnh tiếng Việt (ví dụ: "Thêm", "Sửa", "Cập nhật")\n- Không cần thêm mô tả chi tiết\n- Chỉ tập trung vào thay đổi chính',
      conventionalFormat: 'Sử dụng định dạng Conventional Commits: type(scope): mô tả ngắn bằng tiếng Việt\nCác loại: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert\nViết cực kỳ ngắn gọn.',
      ending: 'Chỉ trả lời bằng thông điệp commit, không gì khác. Ngắn gọn và súc tích.'
    }
  };

  // Default to English if language not supported
  const promptText = languagePrompts[language] || languagePrompts.en;

  // Get configuration to check if we should include conventional format instructions
  const config = require('../config/config').getConfig();
  const useConventional = config.format.useConventionalCommits;

  const promptIntro = language === 'vi' ? 
  `${promptText.intro}
Dựa vào git diff sau đây, hãy tạo một thông điệp commit CỰC KỲ ngắn gọn (dưới 30 ký tự nếu có thể) bằng tiếng Việt:` : 
  `${promptText.intro}
Based on the following git diff, create an EXTREMELY concise commit message (under 30 chars if possible):`;

const prompt = `
${promptIntro}
${promptText.instructions}
${useConventional ? `\n${promptText.conventionalFormat}` : ''}

IMPORTANT: KEEP YOUR RESPONSE EXTREMELY SHORT! Aim for less than 30 characters in the description part.

Git diff:
\`\`\`
${diff}
\`\`\`

${promptText.ending}
REMEMBER: BE EXTREMELY CONCISE!
`;

  try {
    const response = await axios.post('http://localhost:11434/api/generate', {
      model,
      prompt,
      temperature,
      stream: false
    });

    return response.data.response.trim();
  } catch (error) {
    if (error.response) {
      throw new Error(`Ollama API error: ${error.response.data.error || error.response.statusText}`);
    } else if (error.request) {
      throw new Error('No response from Ollama API. Make sure Ollama is running.');
    } else {
      throw new Error(`Error setting up request: ${error.message}`);
    }
  }
}

module.exports = {
  isAvailable,
  getAvailableModels,
  generateCommitMessage,
  defaultModel: 'llama2'
};
