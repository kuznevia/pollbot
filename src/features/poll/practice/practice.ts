import cron from 'node-cron';
import { sendPracticePoll } from './poll';
import { chatId } from '../../../shared/consts/consts';
import { PollBot } from '../../../bot';

export const startPracticePollListener = (bot: PollBot) => {
  // Команда для запуска опроса
  bot.onText(/\/poll/, async (msg) => {
    await sendPracticePoll(bot, msg.chat.id, msg.from?.first_name);
  });
};

export const schedulePracticePoll = (bot: PollBot) => {
  // Периодическое создание опроса по расписанию
  // В понедельник и четверг в 10:00 мск
  cron.schedule('0 10 * * 1,4', () => {
    console.log('Пробую автоматически отправить опрос на тренировку');
    sendPracticePoll(bot, Number(chatId));
  });
};
