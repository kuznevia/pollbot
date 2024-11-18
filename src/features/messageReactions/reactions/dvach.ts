import TelegramBot from 'node-telegram-bot-api';
import { getChatId } from '../../../shared/utils/utils';

const dvachChannelId = -1001009232144;

export const activateDvachReaction = (bot: TelegramBot) => {
  bot.on('message', (msg) => {
    const chatId = getChatId(msg);
    const isDvachRepost = msg.forward_from_chat?.id === dvachChannelId;

    // Проверяем, есть ли ключевое слово "паблик" в сообщении
    if (isDvachRepost) {
      bot
        .sendMessage(chatId, '🤡', {
          reply_to_message_id: msg.message_id,
        })
        .then(() => {
          bot.sendMessage(chatId, 'БАЯЯЯЯЯЯЯЯЯЯЯЯН', {
            reply_to_message_id: msg.message_id,
          });
        });
    }
  });
};
