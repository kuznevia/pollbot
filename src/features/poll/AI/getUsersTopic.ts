import TelegramBot from 'node-telegram-bot-api';
import { PollBot } from '../../../bot';
import { lazyMember } from '../../../shared/consts/consts';

export const getUsersTopic = async (
  bot: PollBot,
  chatId: TelegramBot.ChatId,
  sender: string
) => {
  return new Promise<string | null>((resolve) => {
    bot.sendMessage(chatId, `${sender}, Хотите задать тему сами?`, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Да', callback_data: 'yes' },
            { text: 'Нет', callback_data: 'no' },
          ],
        ],
      },
    });

    const timeOutId = setTimeout(() => {
      bot.removeListener('callback_query', onCallbackQuery);
      bot.sendMessage(
        chatId,
        `${sender}, долго думал, отправляю дефолтный опрос`
      );
      resolve(null);
    }, 10000);

    const onCallbackQuery = (query: TelegramBot.CallbackQuery) => {
      if (query.message?.chat.id !== chatId) return;

      if (query.from?.first_name !== sender) return;

      const answer = query.data;
      clearTimeout(timeOutId);
      bot.removeListener('callback_query', onCallbackQuery);

      if (answer === 'yes') {
        bot.sendMessage(
          chatId,
          'Напишите сообщение, которое бот будет использовать в качестве темы для шутки. Можно несколько тем через запятую. У тебя 30 секунд'
        );

        const timeOutId = setTimeout(() => {
          bot.removeListener('message', onMessage);
          bot.sendMessage(
            chatId,
            `${sender}, время на ввод темы истекло, отправляю дефолтный опрос`
          );
          resolve(null);
        }, 30000);

        const onMessage = (msg: TelegramBot.Message) => {
          if (msg.chat.id !== chatId) return;

          if (msg.from?.first_name !== sender) return;

          clearTimeout(timeOutId);

          const themes = msg.text;

          if (!themes) {
            bot.sendMessage(chatId, `${sender}, не были введены темы`);
            resolve(null);

            return;
          }

          bot.removeListener('message', onMessage);
          resolve(themes);
        };

        bot.on('message', onMessage);
      } else if (answer === 'no') {
        bot.sendMessage(chatId, `${sender}, ${lazyMember}`);
        resolve(null);
      }
    };

    bot.on('callback_query', onCallbackQuery);
  });
};
