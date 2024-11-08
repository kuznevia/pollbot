import TelegramBot from 'node-telegram-bot-api';
import cron from 'node-cron';
import { sendGamePoll } from './poll';
import { chatId } from '../../../shared/consts/consts';
import { checkGameTomorrow } from './utils/checkGameTommorow';

export const startGamePollListener = (bot: TelegramBot) => {
  // Команда для запуска опроса
  bot.onText(/\/game/, (msg) => {
    sendGamePoll(bot, msg.chat.id, msg.from?.first_name);
  });
};

export const scheduleGamePoll = (bot: TelegramBot) => {
  // Периодическая проверка расписания
  // Каждое утро в 11:00 мск
  cron.schedule('0 11 * * *', async () => {
    const tommorrowGames = await checkGameTomorrow();
    if (tommorrowGames.length) {
      console.log('Пробую автоматически отправить опрос на игру');
      sendGamePoll(bot, Number(chatId));
    } else {
      console.log('Завтра нет игр');
    }
  });
};
