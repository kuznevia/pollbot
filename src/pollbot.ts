import TelegramBot from 'node-telegram-bot-api';
import { setCommands } from './features/setCommands';
import {
  startPracticePollListener,
  schedulePracticePoll,
} from './features/poll/practice';

require('dotenv').config();

const token = process.env.BOT_DEV_TOKEN;

if (token) {
  const bot = new TelegramBot(token, { polling: true });

  setCommands(bot);

  startPracticePollListener(bot);

  schedulePracticePoll(bot);

  bot.on('polling_error', (error) => {
    console.error('Ошибка polling:', error);
  });
} else {
  console.error('token is undefined');
}
