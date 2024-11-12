import { PollBot } from '../../bot';

export const startDropDbListener = (bot: PollBot) => {
  // Команда для дропа бд
  bot.onText(/\/drop/, async (msg) => {
    const chatId = msg.chat.id;
    const sender = msg.from?.first_name;

    const isOwner = sender === 'Viacheslav';

    if (sender && !isOwner) {
      bot.sendMessage(
        chatId,
        `${sender}, дропать БД может только хозяин, мразь`
      );

      return;
    }

    const db = await bot.connectDB();
    await db?.dropDatabase();
    bot.sendMessage(chatId, `${sender}, БД дропнута`);
  });
};
