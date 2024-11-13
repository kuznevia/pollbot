import { PollBot } from '../../bot';
import { getChatId } from '../../shared/utils/utils';

export const startChatIdListener = (bot: PollBot) => {
  // Команда для получения айди текущего чата
  bot.onText(/\/chat_id/, (msg) => {
    const chatId = getChatId(msg);
    bot.sendMessage(chatId, `Ваш chatId: ${chatId}`);
  });
};
