import TelegramBot from 'node-telegram-bot-api';
import { Db } from 'mongodb';
import { PollBot } from '../../bot';

export const chooseCollection = async (
  bot: PollBot,
  chatId: TelegramBot.ChatId,
  db: Db,
  sender: string
) => {
  const collections = await db.listCollections().toArray();

  return new Promise<string>((resolve, reject) => {
    const inlineKeyBoardOptions = collections.map(({ name }) => ({
      text: name,
      callback_data: name,
    }));

    if (inlineKeyBoardOptions.length === 0) {
      throw new Error('список коллекций пуст');
    }

    bot.sendMessage(chatId, `${sender}, какую коллекцию хочешь удалить?`, {
      reply_markup: {
        inline_keyboard: [inlineKeyBoardOptions],
      },
    });

    const timeOutId = setTimeout(() => {
      bot.removeListener('callback_query', onCallbackQuery);
      reject(new Error('долго думал'));
    }, 20000);

    const onCallbackQuery = (query: TelegramBot.CallbackQuery) => {
      if (query.message?.chat.id !== chatId) return;

      if (query.from?.first_name !== sender) return;

      const answer = query.data;
      clearTimeout(timeOutId);
      bot.removeListener('callback_query', onCallbackQuery);

      if (answer) {
        resolve(answer);
      } else {
        throw new Error('ответ пуст');
      }
    };

    bot.on('callback_query', onCallbackQuery);
  });
};
