import TelegramBot from 'node-telegram-bot-api';

export const startChatIdListener = (bot: TelegramBot) => {
  // Команда для получения айди текущего чата
  bot.onText(/\/chat_id/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `Ваш chatId: ${chatId}`);
  });
};
