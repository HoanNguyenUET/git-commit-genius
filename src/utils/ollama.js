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
 * @param {boolean} skipConventionalFormat - Skip conventional format in prompt (will be applied later)
 * @returns {Promise<string>} The generated commit message
 */
async function generateCommitMessage(diff, model = 'llama2', temperature = 0.7, language = 'en', skipConventionalFormat = false) {
  if (!diff) {
    throw new Error('No diff provided');
  }

  // Language-specific prompts
  const languagePrompts = {
    en: {
      intro: 'You are a senior software engineer tasked with writing concise git commit messages.',
      instructions: '- Keep commit messages short (max 50 chars)\n- Use imperative mood (e.g., "Add", "Fix", "Update")\n- No additional description needed\n- Focus only on the primary change\n- Do not include prefixes like "Commit:" or explanatory text',
      conventionalFormat: 'Use the Conventional Commits format: type(scope): description\nTypes: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert\nKeep the description part brief.',
      ending: 'Respond ONLY with the commit message, nothing else. No explanatory text, no prefixes.'
    },
    vi: {
      intro: 'Bạn là một kỹ sư phần mềm viết thông điệp commit git ngắn gọn.',
      instructions: '- Viết thông điệp commit ngắn gọn (tối đa 10 ký tự)\n- Sử dụng động từ mệnh lệnh tiếng Việt (ví dụ: "Thêm", "Sửa", "Cập nhật")\n- Không thêm tiền tố như "Commit:" hay text giải thích\n- Chỉ tập trung vào thay đổi chính\n- Không thêm mô tả dài',
      conventionalFormat: 'Sử dụng định dạng Conventional Commits: type(scope): mô tả ngắn bằng tiếng Việt\nCác loại: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert\nGiữ phần mô tả ngắn gọn.',
      ending: 'CHỈ trả lời bằng thông điệp commit thôi, không thêm gì khác. Không có text giải thích, không có tiền tố.'
    }
  };

  // Default to English if language not supported
  const promptText = languagePrompts[language] || languagePrompts.en;

  // Check if we should include conventional format instructions
  const config = require('../config/config').getConfig();
  const shouldUseConventional = config.format.useConventionalCommits && !skipConventionalFormat;

  const promptIntro = language === 'vi' ? 
  `Git diff:
${diff}

Tạo commit message bằng tiếng Việt (chỉ 3-5 từ):` : 
  `Git diff:
${diff}

Create commit message (max 10 words):`;

const prompt = language === 'vi' ? 
`${promptIntro}

Ví dụ đúng: "Thêm test function", "Sửa lỗi auth", "Cập nhật README"
KHÔNG viết: "Đây là commit message" hoặc giải thích dài

Trả lời:` :
`Git diff:
${diff}

Create SHORT English commit message (3-5 words):

Examples: "Add test function", "Fix auth bug", "Update README", "Remove unused code"
DO NOT write: "Here is", "The commit message", explanations

Answer:`;

  try {
    const response = await axios.post('http://localhost:11434/api/generate', {
      model,
      prompt,
      temperature: Math.min(temperature, 0.3), // Reduce temperature for faster, more consistent responses
      stream: false,
      options: {
        num_predict: 50, // Limit response length
        top_p: 0.9,
        top_k: 40
      }
    });

    const cleanedMessage = cleanCommitMessage(response.data.response);
    return cleanedMessage;
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

/**
 * Clean up the generated commit message
 * @param {string} message - The raw commit message from Ollama
 * @returns {string} - The cleaned commit message
 */
function cleanCommitMessage(message) {
  // Remove common unwanted prefixes and suffixes (English & Vietnamese)
  let cleaned = message
    .replace(/^(commit message:|commit:|message:|here is|this is|the commit message is)/i, '')
    .replace(/^(đây là|thông điệp commit|commit message|here are \d+ possible|dưới đây là)/i, '')
    .replace(/^(for the changes?|cho những thay đổi|for this diff|a possible|diff result)/i, '')
    .replace(/^(trả lời:|answer:|response:|result:)/i, '')
    .replace(/^(based on|dựa trên|according to)/i, '')
    .replace(/\.$/, '') // Remove trailing period
    .replace(/"/g, '') // Remove quotes
    .trim();
  
  // Take only the first line if multiple lines
  cleaned = cleaned.split('\n')[0].trim();
  
  // Remove numbered lists (1., 2., etc.)
  cleaned = cleaned.replace(/^\d+\.\s*/, '');
  
  // Remove bullet points
  cleaned = cleaned.replace(/^[-•*]\s*/, '');
  
  // Remove common English words that appear at the start
  cleaned = cleaned.replace(/^(the |a |an |that |which |what |how |when |where )/i, '');
  
  // Remove colons at the end of short phrases
  cleaned = cleaned.replace(/:$/, '');
  
  // If starts with lowercase, capitalize first letter
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  
  // If still too long, take first meaningful part
  if (cleaned.length > 50) {
    // Try to find first sentence or phrase
    const parts = cleaned.split(/[.,:;]/);
    if (parts[0] && parts[0].length <= 50) {
      cleaned = parts[0].trim();
    } else {
      cleaned = cleaned.substring(0, 47) + '...';
    }
  }
  
  return cleaned;
}

module.exports = {
  isAvailable,
  getAvailableModels,
  generateCommitMessage,
  cleanCommitMessage,
  defaultModel: 'llama2'
};
