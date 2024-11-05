import { Db } from 'mongodb';
import TelegramBot from 'node-telegram-bot-api';
import { DB } from './DB';

require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`, // Загружает соответствующий файл .env
});

interface IPollBot {
  db: DB;
}

export class PollBot extends TelegramBot implements IPollBot {
  db: DB;

  constructor(token: string, options?: TelegramBot.ConstructorOptions) {
    super(token, options);
  }

  init() {
    this.db = new DB();
  }
}
