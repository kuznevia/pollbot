import TelegramBot from 'node-telegram-bot-api';
import { TelegramBotAdapter } from '../../infrastructure/telegram/TelegramBotAdapter';
import { SendPracticePollUseCase } from '../../application/use-cases/practice-poll/SendPracticePollUseCase';
import { BotStateManager } from '../../application/shared/BotStateManager';

export class PracticePollHandler {
  constructor(
    private readonly adapter: TelegramBotAdapter,
    private readonly useCase: SendPracticePollUseCase,
    private readonly stateManager: BotStateManager
  ) {}

  register(): void {
    this.adapter.registerCommand(
      /\/practicepoll/,
      async (msg: TelegramBot.Message) => {
        const sender = msg.from?.first_name || '';
        await this.useCase.execute(msg.chat.id, sender);
      },
      this.stateManager
    );
  }
}
