import TelegramBot from 'node-telegram-bot-api';
import cron from 'node-cron';
import { sendPoll } from './poll';
import { chatId } from '../../../shared/consts/consts';

export const startGamePollListener = (bot: TelegramBot) => {
  // Команда для запуска опроса
  bot.onText(/\/game/, (msg) => {
    sendPoll(bot, msg.chat.id, msg.from?.first_name);
  });
};

const sendGamePoll = async (bot: TelegramBot) => {
  console.log('Пробую автоматически отправить опрос на игру');
  sendPoll(bot, Number(chatId));
};

export const scheduleGamePoll = (bot: TelegramBot) => {
  // Периодическая проверка расписания
  // Каждое утро в 11:00 мск
  cron.schedule('0 8 * * *', () => sendGamePoll(bot));
};
