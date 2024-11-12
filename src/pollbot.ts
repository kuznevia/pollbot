import { PollBot } from './bot';

require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`, // Загружает соответствующий файл .env
});

const token = process.env.BOT_TOKEN;
const mongoURI = process.env.MONGO_URI;

if (token && mongoURI) {
  const bot = new PollBot(token, { polling: true });

  bot.init();

  bot.on('polling_error', (error) => {
    console.error('Ошибка polling:', error);
  });
} else {
  console.error('token is undefined');
}
