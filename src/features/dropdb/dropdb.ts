import TelegramBot from 'node-telegram-bot-api';
import { state } from '../../shared/state/state';
import { connectDB } from '../../bot/db/utils';

export const startDropDbListener = (bot: TelegramBot) => {
  // Команда для дропа бд
  bot.onText(/\/drop/, async (msg) => {
    const chatId = msg.chat.id;
    const sender = msg.from?.first_name;

    const { isPolling } = state;

    if (isPolling) {
      bot.sendMessage(chatId, `${sender}, мразь, я занят, повтори позже`);

      return;
    }

    const isOwner = sender === 'Viacheslav';

    if (sender && !isOwner) {
      bot.sendMessage(
        chatId,
        `${sender}, дропать БД может только хозяин, мразь`
      );
      state.isPolling = false;

      return;
    }

    const db = await connectDB();
    await db.dropDatabase();
    bot.sendMessage(chatId, `${sender}, БД дропнута`);
    state.isPolling = false;
  });
};
