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
      intro: 'You are a senior software engineer tasked with writing high-quality git commit messages.',
      instructions: '- Start with a short summary line (max 50 chars) that completes the sentence "If applied, this commit will..."\n- Use imperative mood (e.g., "Add", "Fix", "Update")\n- Optionally include a more detailed description after the summary, with line breaks at 72 chars\n- Focus on WHY and WHAT, not HOW\n- Reference issue numbers if relevant',
      conventionalFormat: 'Use the Conventional Commits format: type(scope): description\nTypes: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert\nChoose the most appropriate type based on the changes.',
      ending: 'Respond ONLY with the commit message, nothing else.'
    },
    es: {
      intro: 'Eres un ingeniero de software senior encargado de escribir mensajes de commit de git de alta calidad.',
      instructions: '- Comienza con una línea de resumen corta (máximo 50 caracteres) que complete la frase "Si se aplica, este commit..."\n- Usa el modo imperativo (ej. "Añadir", "Arreglar", "Actualizar")\n- Opcionalmente incluye una descripción más detallada después del resumen, con saltos de línea a los 72 caracteres\n- Enfócate en POR QUÉ y QUÉ, no en CÓMO\n- Referencia números de issue si es relevante',
      conventionalFormat: 'Usa el formato de Commits Convencionales: tipo(ámbito): descripción\nTipos: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert\nElige el tipo más apropiado basado en los cambios.',
      ending: 'Responde SOLO con el mensaje de commit, nada más.'
    },
    fr: {
      intro: 'Vous êtes un ingénieur logiciel senior chargé de rédiger des messages de commit git de haute qualité.',
      instructions: '- Commencez par une ligne de résumé courte (max 50 caractères) qui complète la phrase "Si appliqué, ce commit va..."\n- Utilisez le mode impératif (ex. "Ajouter", "Corriger", "Mettre à jour")\n- Incluez éventuellement une description plus détaillée après le résumé, avec des sauts de ligne à 72 caractères\n- Concentrez-vous sur POURQUOI et QUOI, pas sur COMMENT\n- Référencez les numéros de problèmes si pertinent',
      conventionalFormat: 'Utilisez le format Conventional Commits: type(portée): description\nTypes: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert\nChoisissez le type le plus approprié en fonction des changements.',
      ending: 'Répondez UNIQUEMENT avec le message de commit, rien d\'autre.'
    },
    de: {
      intro: 'Sie sind ein erfahrener Software-Ingenieur mit der Aufgabe, hochwertige Git-Commit-Nachrichten zu schreiben.',
      instructions: '- Beginnen Sie mit einer kurzen Zusammenfassung (max. 50 Zeichen), die den Satz "Wenn angewendet, wird dieser Commit..." vervollständigt\n- Verwenden Sie den Imperativ (z.B. "Hinzufügen", "Beheben", "Aktualisieren")\n- Fügen Sie optional eine detailliertere Beschreibung nach der Zusammenfassung hinzu, mit Zeilenumbrüchen bei 72 Zeichen\n- Konzentrieren Sie sich auf WARUM und WAS, nicht auf WIE\n- Referenzieren Sie Issue-Nummern, falls relevant',
      conventionalFormat: 'Verwenden Sie das Conventional Commits Format: Typ(Umfang): Beschreibung\nTypen: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert\nWählen Sie den passendsten Typ basierend auf den Änderungen.',
      ending: 'Antworten Sie NUR mit der Commit-Nachricht, nichts anderes.'
    },
    vi: {
      intro: 'Bạn là một kỹ sư phần mềm senior có nhiệm vụ viết các thông điệp commit git chất lượng cao.',
      instructions: '- Bắt đầu bằng một dòng tóm tắt ngắn (tối đa 50 ký tự) hoàn thành câu "Nếu áp dụng, commit này sẽ..."\n- Sử dụng thì mệnh lệnh (ví dụ: "Thêm", "Sửa", "Cập nhật")\n- Tùy chọn thêm mô tả chi tiết hơn sau phần tóm tắt, với ngắt dòng ở ký tự thứ 72\n- Tập trung vào TẠI SAO và CÁI GÌ, không phải LÀM THẾ NÀO\n- Tham chiếu số issue nếu có liên quan',
      conventionalFormat: 'Sử dụng định dạng Conventional Commits: type(scope): description\nCác loại: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert\nChọn loại phù hợp nhất dựa trên các thay đổi.',
      ending: 'Chỉ trả lời với thông điệp commit, không có gì khác.'
    }
  };

  // Default to English if language not supported
  const promptText = languagePrompts[language] || languagePrompts.en;

  // Get configuration to check if we should include conventional format instructions
  const config = require('../config/config').getConfig();
  const useConventional = config.format.useConventionalCommits;

  const prompt = `
${promptText.intro}
Based on the following git diff, create a concise and informative commit message following best practices:
${promptText.instructions}
${useConventional ? `\n${promptText.conventionalFormat}` : ''}

Git diff:
\`\`\`
${diff}
\`\`\`

${promptText.ending}
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
