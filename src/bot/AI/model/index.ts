export interface AuthResponse {
  access_token: string;
  expires_at: number;
}

export interface LLMProvider {
  sendMessage(content: string, model: string): Promise<string>;
}

export enum LLMModelType {
  GEMINI = 'gemini',
  GIGACHAT = 'gigachat',
}

export interface GigaChatChoices {
  message: {
    role: string;
    content: string;
    name: string;
  };
  index: number;
  finish_reason: string;
}

export interface GigaChatResponse {
  choices: GigaChatChoices[];
}
