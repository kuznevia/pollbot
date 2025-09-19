import { GoogleGenAI } from '@google/genai';
import { AI } from '../factory';

export class GeminiChat extends AI {
  authUrl = 'https://gemini.example.com/api/v1/auth';
  sendMessageUrl = 'https://gemini.example.com/api/v1/chat';
  accessToken: string | null = null;
  tokenTimeout: NodeJS.Timeout | null = null;
  gemini = new GoogleGenAI({});

  async sendMessage(content: string, model: string): Promise<string> {
    try {
      const response = await this.gemini.models.generateContent({
        model,
        contents: content,
      });

      return response.text || '';
    } catch (error) {
      console.error('Message sending failed:', error);
      throw new Error('Unable to send message to Gemini API.');
    }
  }
}
