import { PollBot } from '../../bot';
import { defaultAppeal } from '../../shared/consts/consts';
import { getChatId, getSender, isCreator } from '../../shared/utils/utils';
import { chooseCollection } from './chooseCollection';

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

    try {
      const collectionName = await chooseCollection(bot, chatId, db, sender);
      await db.collection(collectionName).drop();
      bot.sendMessage(
        chatId,
        `${sender}, коллекция ${collectionName} дропнута`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'неизвестная ошибка';

      bot.sendMessage(
        chatId,
        `${sender}, что-то пошло не так. Ошибка: ${errorMessage}`
      );
    }
  });
};
