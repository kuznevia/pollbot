import TelegramBot from 'node-telegram-bot-api';
import { setCommands } from './features/setCommands';
import { startPollListener } from './features/pollCreation';

require('dotenv').config();

const token = process.env.BOT_DEV_TOKEN;

if (token) {
  const bot = new TelegramBot(token, { polling: true });

  setCommands(bot);

  startPollListener(bot);
} else {
  console.error('token is undefined');
}
