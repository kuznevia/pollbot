import TelegramBot from 'node-telegram-bot-api';
import { activateMessageReactions } from './features/messageReactions';
import { scheduleGamePoll } from './features/poll/games';
import {
  startPracticePollListener,
  schedulePracticePoll,
} from './features/poll/practice';
import { setCommands } from './features/setCommands';
import { startHealthCheckListener } from './features/healthcheck';
import { connectDB } from './db/db';

// Инициализация команд и функционала бота
export const initBot = (bot: TelegramBot) => {
  connectDB();
  setCommands(bot);
  startPracticePollListener(bot);
  schedulePracticePoll(bot);
  activateMessageReactions(bot);
  scheduleGamePoll(bot);
  startHealthCheckListener(bot);
};
