import TelegramBot from 'node-telegram-bot-api';
import { TelegramBotAdapter } from '../../infrastructure/telegram/TelegramBotAdapter';

export class ChatIdHandler {
  constructor(private readonly adapter: TelegramBotAdapter) {}

  register(): void {
    this.adapter.registerCommand(
      /\/chat_id/,
      async (msg: TelegramBot.Message) => {
        await this.adapter.sendMessage(msg.chat.id, `Ваш chatId: ${msg.chat.id}`);
      }
    );
  }
}
