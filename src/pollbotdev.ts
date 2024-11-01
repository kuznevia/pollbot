import TelegramBot from 'node-telegram-bot-api';
import { initBot } from './initbot';

require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`, // Загружает соответствующий файл .env
});

const token = process.env.BOT_TOKEN;
const mongoURI = process.env.MONGO_URI;

if (token && mongoURI) {
  const bot = new TelegramBot(token, { polling: true });

  initBot(bot);

  bot.on('polling_error', (error) => {
    console.error('Ошибка polling:', error);
  });
} else {
  console.error('token is undefined');
}
