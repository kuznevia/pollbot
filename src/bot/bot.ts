import TelegramBot from 'node-telegram-bot-api';
import { DB } from './DB';
import { commands } from './commands';
import { BotListeners } from './plugins/listeners';
import { BotScheduler } from './plugins/scheduledActions';

require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`, // Загружает соответствующий файл .env
});

export class PollBot extends TelegramBot {
  db: DB;
  listener: BotListeners;
  scheduler: BotScheduler;

  constructor(token: string, options?: TelegramBot.ConstructorOptions) {
    super(token, options);
    this.db = new DB();
    this.listener = new BotListeners();
    this.scheduler = new BotScheduler();
  }

  init() {
    this.setMyCommands(commands);
    this.listener.startListening(this);
    this.scheduler.schedule(this);
  }
}
