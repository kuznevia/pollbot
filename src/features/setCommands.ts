import TelegramBot from 'node-telegram-bot-api';

export const setCommands = (bot: TelegramBot) => {
  // Устанавливаем команды для бота
  bot.setMyCommands([
    { command: '/poll', description: 'Запустить опрос на тренировку' },
    { command: '/game', description: 'Запустить опрос на игру' },
    { command: '/check', description: 'Проверка связи' },
  ]);
  bot.onText(/\/chat_id/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `Ваш chatId: ${chatId}`);
  });
};
