export interface OllamaResponse {
  response: string;
}

export interface CommitMessageRequest {
  diff: string;
  language: 'en' | 'vi';
  conventional: boolean;
  model?: string;
  temperature?: number;
}

// Using a public API service instead of local Ollama
const API_BASE_URL = 'https://api.openai.com/v1'; // You can change this to any other API
const API_KEY = 'your-api-key-here'; // This should be in environment variables

export class OllamaService {
  static async isAvailable(): Promise<boolean> {
    try {
      // For demo purposes, we'll always return true for online API
      // In production, you might want to test the API endpoint
      return true;
    } catch (error) {
      return false;
    }
  }

  static async getAvailableModels(): Promise<string[]> {
    try {
      // Return some common models for online API
      return ['gpt-3.5-turbo', 'gpt-4', 'claude-3-sonnet', 'llama2-online'];
    } catch (error) {
      return ['gpt-3.5-turbo']; // Default fallback
    }
  }

  // Fallback to a simple local AI service or mock response
  static async generateCommitMessage({
    diff,
    language = 'en',
    conventional = false,
    model = 'gpt-3.5-turbo',
    temperature = 0.7
  }: CommitMessageRequest): Promise<string> {
    if (!diff) {
      throw new Error('No diff provided');
    }

    // For demo purposes, let's create a simple rule-based generator
    // since we don't have a real online API configured
    return this.generateMockCommitMessage(diff, language, conventional);
  }

  private static generateMockCommitMessage(diff: string, language: 'en' | 'vi', conventional: boolean): string {
    // Simple pattern matching for demo
    const lines = diff.split('\n');
    const addedLines = lines.filter(line => line.startsWith('+') && !line.startsWith('+++'));
    const removedLines = lines.filter(line => line.startsWith('-') && !line.startsWith('---'));
    
    let action = '';
    let subject = '';
    
    // Determine action based on changes
    if (addedLines.length > removedLines.length) {
      action = language === 'vi' ? 'Thêm' : 'Add';
    } else if (removedLines.length > addedLines.length) {
      action = language === 'vi' ? 'Xóa' : 'Remove';
    } else {
      action = language === 'vi' ? 'Cập nhật' : 'Update';
    }
    
    // Try to determine what was changed
    if (diff.includes('function') || diff.includes('const ') || diff.includes('let ')) {
      subject = language === 'vi' ? 'hàm' : 'function';
    } else if (diff.includes('class ')) {
      subject = language === 'vi' ? 'lớp' : 'class';
    } else if (diff.includes('import') || diff.includes('require')) {
      subject = language === 'vi' ? 'import' : 'imports';
    } else if (diff.includes('.css') || diff.includes('style')) {
      subject = language === 'vi' ? 'CSS' : 'styles';
    } else if (diff.includes('.md') || diff.includes('README')) {
      subject = language === 'vi' ? 'tài liệu' : 'documentation';
    } else {
      subject = language === 'vi' ? 'mã' : 'code';
    }
    
    let message = `${action} ${subject}`;
    
    if (conventional) {
      const type = addedLines.length > removedLines.length ? 'feat' : 
                   removedLines.length > 0 ? 'fix' : 'refactor';
      message = `${type}: ${message}`;
    }
    
    return message;
  }

  // Alternative: Use a real online API (commented out for demo)
  /*
  static async generateCommitMessage({
    diff,
    language = 'en',
    conventional = false,
    model = 'gpt-3.5-turbo',
    temperature = 0.7
  }: CommitMessageRequest): Promise<string> {
    const languagePrompts = {
      en: 'Generate a concise git commit message (max 50 chars) for this diff:',
      vi: 'Tạo thông điệp commit ngắn gọn (tối đa 50 ký tự) cho diff này:'
    };

    const prompt = `${languagePrompts[language]}\n\n${diff}\n\n${conventional ? 'Use conventional commits format.' : ''}`;

    try {
      const response = await fetch(`${API_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature,
          max_tokens: 100
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      throw new Error(`Error generating commit message: ${error.message}`);
    }
  }
  */
}
