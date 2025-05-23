import cron from 'node-cron';
import { sendPracticePoll } from './poll';
import { botName, chatId } from '../../../shared/consts/consts';
import { PollBot } from '../../../bot';
import { getChatId, getSender } from '../../../shared/utils/utils';

const EVERY_MONDAY_TUESDAY_THURSDAY_10_00_AM = '0 10 * * 1,2,4';

export const startPracticePollListener = (bot: PollBot) => {
  // Команда для запуска опроса
  bot.onText(/\/practicepoll/, async (msg) => {
    const chatId = getChatId(msg);
    const sender = getSender(msg);

    await sendPracticePoll(bot, chatId, sender);
  });
};

const schedulePoll = (bot: PollBot) => {
  console.log('Пробую автоматически отправить опрос на тренировку');
  sendPracticePoll(bot, Number(chatId), botName);
};

export const schedulePracticePoll = (bot: PollBot) => {
  cron.schedule(EVERY_MONDAY_TUESDAY_THURSDAY_10_00_AM, () =>
    schedulePoll(bot)
  );
};
