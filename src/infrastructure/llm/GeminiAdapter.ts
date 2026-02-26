import { GoogleGenAI } from '@google/genai';
import { ILLMPort } from '../../application/ports/ILLMPort';

export class GeminiAdapter implements ILLMPort {
  private gemini = new GoogleGenAI({});

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
