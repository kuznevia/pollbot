import { PollBot } from '../../bot';
import { envConfig } from '../../shared/config/config';
import { getChatId } from '../../shared/utils/utils';

export const startHealthCheckListener = (bot: PollBot) => {
  // Команда для пинания бота
  bot.onText(/\/check/, (msg) => {
    const chatId = getChatId(msg);
    const message = envConfig.get('CHECK_MESSAGE');
    bot.sendMessage(chatId, message);
  });
};
