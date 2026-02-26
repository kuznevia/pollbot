import { ILLMPort } from '../../application/ports/ILLMPort';
import { GeminiAdapter } from './GeminiAdapter';
import { GigaChatAdapter } from './GigaChatAdapter';

export type LLMModelType = 'gemini' | 'gigachat';

export class LLMFactory {
  private providers: Map<LLMModelType, ILLMPort> = new Map<LLMModelType, ILLMPort>([
    ['gemini', new GeminiAdapter()],
    ['gigachat', new GigaChatAdapter()],
  ]);

  getProvider(modelType: LLMModelType = 'gemini'): ILLMPort {
    const provider = this.providers.get(modelType);
    if (!provider) {
      throw new Error(`Provider for ${modelType} not found`);
    }
    return provider;
  }
}
