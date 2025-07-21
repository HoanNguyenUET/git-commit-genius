export interface OllamaResponse {
  response: string;
}

export interface CommitMessageRequest {
  diff: string;
  conventional: boolean;
  model?: string;
  temperature?: number;
}

export class OllamaService {
  private static readonly OLLAMA_BASE_URL = 'http://localhost:11434';

  static async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.OLLAMA_BASE_URL}/api/tags`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch (error) {
      console.error('Ollama availability check failed:', error);
      return false;
    }
  }

  static async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.OLLAMA_BASE_URL}/api/tags`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }
      
      const data = await response.json();
      if (data && data.models) {
        return data.models.map((model: { name: string }) => model.name);
      }
      return [];
    } catch (error) {
      console.error('Error fetching models:', error);
      return ['llama2']; // Default fallback
    }
  }

  static async generateCommitMessage({
    diff,
    conventional = false,
    model = 'llama2',
    temperature = 0.7
  }: CommitMessageRequest): Promise<string> {
    if (!diff) {
      throw new Error('No diff provided');
    }

    // Create the prompt for commit message generation (default to English)
    const prompt = this.createPrompt(diff);

    try {
      const response = await fetch(`${this.OLLAMA_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          prompt: prompt,
          temperature: Math.min(temperature, 0.3), // Reduce temperature for faster, more consistent responses
          stream: false,
          options: {
            num_predict: 50, // Limit response length
            top_p: 0.9,
            top_k: 40
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data: OllamaResponse = await response.json();
      
      if (!data.response) {
        throw new Error('No response from Ollama API');
      }

      return this.cleanCommitMessage(data.response);
    } catch (error) {
      console.error('Error calling Ollama API:', error);
      throw new Error(`Failed to generate commit message: ${error}`);
    }
  }

  private static cleanCommitMessage(message: string): string {
    // Remove common unwanted prefixes and suffixes
    let cleaned = message
      .replace(/^(commit message:|commit:|message:)/i, '')
      .replace(/^(here is|this is|the commit message is)/i, '')
      .replace(/\.$/, '') // Remove trailing period
      .trim();
    
    // Take only the first line if multiple lines
    cleaned = cleaned.split('\n')[0].trim();
    
    // Limit to reasonable length (50 chars)
    if (cleaned.length > 50) {
      cleaned = cleaned.substring(0, 47) + '...';
    }
    
    return cleaned;
  }

  private static createPrompt(diff: string): string {
    const promptIntro = `Create a SHORT commit message (max 10 words) for this git diff:`;
    const examples = 'EXAMPLES: "Add test function", "Fix auth bug", "Update README"';
    const ending = 'ONLY respond with commit message, NO explanation:';

    return `${promptIntro}

${diff}

${examples}

${ending}`;
  }
}
