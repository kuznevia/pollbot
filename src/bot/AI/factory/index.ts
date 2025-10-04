import { GeminiProvider } from '../LLMS/Gemini';
import { GigaChatProvider } from '../LLMS/Gigachat';
import { LLMModelType, LLMProvider } from '../model';

export class LLMFactory {
  private providers: Map<LLMModelType, LLMProvider> = new Map();
  private currentModel: LLMModelType;

  constructor(defaultModel: LLMModelType = LLMModelType.GEMINI) {
    this.providers.set(LLMModelType.GEMINI, new GeminiProvider());
    this.providers.set(LLMModelType.GIGACHAT, new GigaChatProvider());
    this.currentModel = defaultModel;
  }

  getProvider(modelType?: LLMModelType): LLMProvider {
    const type = modelType || this.currentModel;
    const provider = this.providers.get(type);

    if (!provider) {
      throw new Error(`Provider for ${type} not found`);
    }

    return provider;
  }

  switchModel(modelType: LLMModelType): void {
    if (!this.providers.has(modelType)) {
      throw new Error(`Model ${modelType} is not supported`);
    }
    this.currentModel = modelType;
  }

  getCurrentModel(): LLMModelType {
    return this.currentModel;
  }
}
