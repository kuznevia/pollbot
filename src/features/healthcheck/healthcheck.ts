import { PollBot } from '../../bot';
import { checkMessage } from '../../shared/consts/consts';
import { getChatId } from '../../shared/utils/utils';

export const startHealthCheckListener = (bot: PollBot) => {
  // Команда для пинания бота
  bot.onText(/\/check/, (msg) => {
    const chatId = getChatId(msg);
    bot.sendMessage(chatId, checkMessage);
  });
};
