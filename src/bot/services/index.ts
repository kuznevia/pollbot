import { Service } from './model';
import { SummaryService } from './summary';
import { PollBot } from '../bot';

export class BotServices {
  services: Array<Service> = [];
  bot: PollBot;

  constructor(bot: PollBot) {
    this.bot = bot;
    this.services.push(new SummaryService(bot));
  }

  private safeExecute = async (
    fn: () => Promise<void>,
    config?: { context: string; chatId: number }
  ) => {
    try {
      await fn();
    } catch (err) {
      console.error(
        `[BotServices] Ошибка${config?.context ? ` в ${config.context}` : ''}: ${err}`
      );

      if (config?.chatId) {
        await this.bot.sendMessage(
          config.chatId,
          `[BotServices] Ошибка${config?.context ? ` в ${config.context}` : ''}: ${err}`
        );
      }
    }
  };

  init() {
    this.services.forEach((service) => service.init(this.safeExecute));
  }
}
