import { PollBot } from '../../bot';

export const startChatIdListener = (bot: PollBot) => {
  // Команда для получения айди текущего чата
  bot.onText(/\/chat_id/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `Ваш chatId: ${chatId}`);
  });
};
