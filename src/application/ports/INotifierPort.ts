export interface INotifierPort {
  sendMessage(chatId: number, text: string): Promise<void>;
  sendPoll(
    chatId: number,
    question: string,
    options: string[],
    isAnonymous: boolean
  ): Promise<{ message_id: number }>;
  pinMessage(chatId: number, messageId: number): Promise<void>;
  sendAnimation(chatId: number, filePath: string): Promise<void>;
  listCollections(): Promise<string[]>;
  dropCollection(name: string): Promise<void>;
}
