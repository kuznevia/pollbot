import cron from 'node-cron';
import { sendPracticePoll } from './poll';
import { botName, chatId } from '../../../shared/consts/consts';
import { PollBot } from '../../../bot';
import { getChatId, getSender } from '../../../shared/utils/utils';

export const startPracticePollListener = (bot: PollBot) => {
  // Команда для запуска опроса
  bot.onText(/\/poll/, async (msg) => {
    const chatId = getChatId(msg);
    const sender = getSender(msg);

    await sendPracticePoll(bot, chatId, sender);
  });
};

const schedulePollEveryMondayAndThursday10AM = (bot: PollBot) => {
  console.log('Пробую автоматически отправить опрос на тренировку');
  sendPracticePoll(bot, Number(chatId), botName);
};

export const schedulePracticePoll = (bot: PollBot) => {
  cron.schedule('0 10 * * 1,4', () =>
    schedulePollEveryMondayAndThursday10AM(bot)
  );
};
