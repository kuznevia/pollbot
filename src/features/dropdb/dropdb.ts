import { PollBot } from '../../bot';
import { defaultAppeal } from '../../shared/consts/consts';
import { getChatId, getSender, isCreator } from '../../shared/utils/utils';

export const startDropDbListener = (bot: PollBot) => {
  // Команда для дропа бд
  bot.onText(/\/drop/, async (msg) => {
    const chatId = getChatId(msg);
    const sender = getSender(msg);

    if (!isCreator(sender)) {
      bot.sendMessage(
        chatId,
        `${sender}, дропать БД может только хозяин, ${defaultAppeal}`
      );

      return;
    }

    const db = await bot.connectDB();
    await db?.dropDatabase();
    bot.sendMessage(chatId, `${sender}, БД дропнута`);
  });
};
