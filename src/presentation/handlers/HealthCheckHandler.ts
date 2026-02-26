import TelegramBot from 'node-telegram-bot-api';
import { TelegramBotAdapter } from '../../infrastructure/telegram/TelegramBotAdapter';
import { HealthCheckUseCase } from '../../application/use-cases/admin/HealthCheckUseCase';

export class HealthCheckHandler {
  constructor(
    private readonly adapter: TelegramBotAdapter,
    private readonly useCase: HealthCheckUseCase
  ) {}

  register(): void {
    this.adapter.registerCommand(/\/check/, async (msg: TelegramBot.Message) => {
      await this.useCase.execute(msg.chat.id);
    });
  }
}
