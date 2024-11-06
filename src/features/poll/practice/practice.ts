import TelegramBot from 'node-telegram-bot-api';
import cron from 'node-cron';
import { sendPracticePoll } from './poll';
import { chatId } from '../../../shared/consts/consts';

export const startPracticePollListener = (bot: TelegramBot) => {
  // Команда для запуска опроса
  bot.onText(/\/poll/, (msg) => {
    sendPracticePoll(bot, msg.chat.id, msg.from?.first_name);
  });
};

export const schedulePracticePoll = (bot: TelegramBot) => {
  // Периодическое создание опроса по расписанию
  // В понедельник и четверг в 10:00 мск
  cron.schedule('0 10 * * 1,4', () => {
    console.log('Пробую автоматически отправить опрос');
    sendPracticePoll(bot, Number(chatId));
  });
};
