import TelegramBot from 'node-telegram-bot-api';
import cron from 'node-cron';
import { sendPoll } from './poll';
import { chatId } from '../../../shared/consts/consts';

export const startPracticePollListener = (bot: TelegramBot) => {
  // Команда для запуска опроса
  bot.onText(/\/poll/, (msg) => {
    sendPoll(bot, msg.chat.id, msg.from?.first_name);
  });
};

const sendPracticePoll = (bot: TelegramBot) => {
  sendPoll(bot, Number(chatId));
  console.log('Автоматически отправлен опрос');
};

export const schedulePracticePoll = (bot: TelegramBot) => {
  // Периодическое создание опроса по расписанию
  // В понедельник и четверг в 10:00 мск
  cron.schedule('0 7 * * 1,4', () => sendPracticePoll(bot));
};
