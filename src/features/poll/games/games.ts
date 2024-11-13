import cron from 'node-cron';
import { sendGamePoll } from './poll';
import { botName, chatId } from '../../../shared/consts/consts';
import { checkGameTomorrow } from './utils/checkGameTommorow';
import { PollBot } from '../../../bot';
import { getChatId, getSender } from '../../../shared/utils/utils';

export const startGamePollListener = (bot: PollBot) => {
  // Команда для запуска опроса
  bot.onText(/\/game/, async (msg) => {
    const chatId = getChatId(msg);
    const sender = getSender(msg);

    await sendGamePoll(bot, chatId, sender);
  });
};

const schedulePollEveryMorning11AM = async (bot: PollBot) => {
  const tommorrowGames = await checkGameTomorrow();
  if (tommorrowGames.length) {
    console.log('Пробую автоматически отправить опрос на игру');
    sendGamePoll(bot, Number(chatId), botName);
  } else {
    console.log('Завтра нет игр');
  }
};

export const scheduleGamePoll = (bot: PollBot) => {
  cron.schedule('0 11 * * *', () => schedulePollEveryMorning11AM(bot));
};
