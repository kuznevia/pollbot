import TelegramBot from 'node-telegram-bot-api';
import { TelegramBotAdapter } from '../../infrastructure/telegram/TelegramBotAdapter';
import { SendGamePollUseCase } from '../../application/use-cases/game-poll/SendGamePollUseCase';
import { BotStateManager } from '../../application/shared/BotStateManager';

export class GamePollHandler {
  constructor(
    private readonly adapter: TelegramBotAdapter,
    private readonly useCase: SendGamePollUseCase,
    private readonly stateManager: BotStateManager
  ) {}

  register(): void {
    this.adapter.registerCommand(
      /\/gamepoll/,
      async (msg: TelegramBot.Message) => {
        const sender = msg.from?.first_name || '';
        await this.useCase.execute(msg.chat.id, sender);
      },
      this.stateManager
    );
  }
}
