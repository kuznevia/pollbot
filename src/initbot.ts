import TelegramBot from 'node-telegram-bot-api';
import { activateMessageReactions } from './features/messageReactions';
import { scheduleGamePoll, startGamePollListener } from './features/poll/games';
import {
  startPracticePollListener,
  schedulePracticePoll,
} from './features/poll/practice';
import { startHealthCheckListener } from './features/healthcheck';
import { startDropDbListener } from './features/dropdb';

// Инициализация команд и функционала бота
export const initBot = (bot: TelegramBot) => {
  startPracticePollListener(bot);
  startGamePollListener(bot);
  schedulePracticePoll(bot);
  activateMessageReactions(bot);
  scheduleGamePoll(bot);
  startHealthCheckListener(bot);
  startDropDbListener(bot);
};
