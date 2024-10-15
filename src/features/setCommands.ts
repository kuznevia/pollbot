import TelegramBot from "node-telegram-bot-api";

export const setCommands = (bot: TelegramBot) => {
  // Устанавливаем команды для бота
  bot.setMyCommands([
    { command: '/poll', description: 'Запустить опрос на тренировку' },
  ]);

  bot.on('polling_error', (error) => {
    console.error('Ошибка polling:', error);
  });
};
