import TelegramBot from 'node-telegram-bot-api';
import { TelegramBotAdapter } from '../../infrastructure/telegram/TelegramBotAdapter';
import { CollectMessageUseCase } from '../../application/use-cases/summary/CollectMessageUseCase';
import { GenerateSummaryUseCase } from '../../application/use-cases/summary/GenerateSummaryUseCase';
import { floodChatId } from '../../shared/consts/consts';

export class SummaryHandler {
  constructor(
    private readonly adapter: TelegramBotAdapter,
    private readonly collectUseCase: CollectMessageUseCase,
    private readonly generateUseCase: GenerateSummaryUseCase
  ) {}

  register(): void {
    this.adapter.onMessage(async (msg: TelegramBot.Message) => {
      const chatId = msg.chat.id;
      const user =
        msg.from?.username || msg.from?.first_name || msg.from?.last_name;
      const text = msg.text;

      if (
        !user ||
        !text ||
        text.startsWith('/') ||
        chatId !== Number(floodChatId)
      ) {
        return;
      }

      try {
        await this.collectUseCase.execute(user, text, chatId);
      } catch (err) {
        console.error('[SummaryHandler] Error collecting message:', err);
      }
    });

    this.adapter.registerCommand(
      /\/summary/,
      async (msg: TelegramBot.Message) => {
        try {
          await this.generateUseCase.execute(msg.chat.id);
        } catch (err) {
          console.error('[SummaryHandler] Error generating summary:', err);
          await this.adapter.sendMessage(
            msg.chat.id,
            `Ошибка при генерации саммари: ${err}`
          );
        }
      }
    );
  }
}
