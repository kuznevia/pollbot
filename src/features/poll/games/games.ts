import cron from 'node-cron';
import { sendGamePoll } from './poll';
import { botName, chatId } from '../../../shared/consts/consts';
import { checkGameTomorrow } from './utils/checkGameTommorow';
import { PollBot } from '../../../bot';
import { getChatId, getSender } from '../../../shared/utils/utils';

const EVERY_MORNING_10_10_AM = '10 10 * * *';

export const startGamePollListener = (bot: PollBot) => {
  // Команда для запуска опроса
  bot.onText(/\/game/, async (msg) => {
    const chatId = getChatId(msg);
    const sender = getSender(msg);

    await sendGamePoll(bot, chatId, sender);
  });
};

const schedulePoll = async (bot: PollBot) => {
  const hasGamesTommorow = await checkGameTomorrow();
  if (hasGamesTommorow) {
    console.log('Пробую автоматически отправить опрос на игру');
    sendGamePoll(bot, Number(chatId), botName);
  } else {
    console.log('Завтра нет игр');
  }
};

export const scheduleGamePoll = (bot: PollBot) => {
  cron.schedule(EVERY_MORNING_10_10_AM, () => schedulePoll(bot));
};
