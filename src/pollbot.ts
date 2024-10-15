import TelegramBot from 'node-telegram-bot-api';
import { setCommands } from './features/setCommands';
import { startPollListener } from './features/pollCreation';

const token = '7871528931:AAEia8GBL_8Eb9qVnrCQ-hi2qPjR4FTdQW0';

const bot = new TelegramBot(token, { polling: true });

setCommands(bot);

startPollListener(bot);
