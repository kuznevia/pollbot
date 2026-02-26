export interface ILLMPort {
  sendMessage(content: string, model: string): Promise<string>;
}
