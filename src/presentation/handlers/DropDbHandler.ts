import TelegramBot from 'node-telegram-bot-api';
import { TelegramBotAdapter } from '../../infrastructure/telegram/TelegramBotAdapter';
import { DropCollectionUseCase } from '../../application/use-cases/admin/DropCollectionUseCase';
import { defaultAppeal } from '../../shared/consts/consts';
import { isCreator } from '../../shared/utils/utils';

export class DropDbHandler {
  constructor(
    private readonly adapter: TelegramBotAdapter,
    private readonly useCase: DropCollectionUseCase
  ) {}

  register(): void {
    this.adapter.registerCommand(/\/drop/, async (msg: TelegramBot.Message) => {
      const sender = msg.from?.first_name || '';
      const chatId = msg.chat.id;

      if (!isCreator(sender)) {
        await this.adapter.sendMessage(
          chatId,
          `${sender}, дропать БД может только хозяин, ${defaultAppeal}`
        );
        return;
      }

      await this.useCase.execute(chatId, sender);
    });
  }
}
