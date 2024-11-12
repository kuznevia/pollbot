import { PollBot } from '../../bot';

export const startHealthCheckListener = (bot: PollBot) => {
  // Команда для пинания бота
  bot.onText(/\/check/, (msg) => {
    const chatId = msg.chat.id;
    const message = 'Ебать свиней';
    bot.sendMessage(chatId, message);
  });
};
