import TelegramBot from 'node-telegram-bot-api';

export const startHealthCheckListener = (bot: TelegramBot) => {
  // Команда для пинания бота
  bot.onText(/\/check/, (msg) => {
    const chatId = msg.chat.id;
    const message = 'Ебать свиней';
    bot.sendMessage(chatId, message);
  });
};
