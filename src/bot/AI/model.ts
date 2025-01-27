export interface AuthResponse {
  access_token: string;
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
