import TelegramBot from 'node-telegram-bot-api';
import { setCommands } from './features/setCommands';
import {
  startPracticePollListener,
  schedulePracticePoll,
} from './features/poll/practice';
import { activateMessageReactions } from './features/messageReactions';
import { scheduleGamePoll } from './features/poll/games';

require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`, // Загружает соответствующий файл .env
});

const token = process.env.BOT_TOKEN;

if (token) {
  const bot = new TelegramBot(token, { polling: true });

  setCommands(bot);

  startPracticePollListener(bot);

  schedulePracticePoll(bot);

  activateMessageReactions(bot);

  scheduleGamePoll(bot);

  bot.on('polling_error', (error) => {
    console.error('Ошибка polling:', error);
  });
} else {
  console.error('token is undefined');
}
