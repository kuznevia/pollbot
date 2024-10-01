const TelegramBot = require('node-telegram-bot-api');
const path = require('path');
const token = '7871528931:AAEia8GBL_8Eb9qVnrCQ-hi2qPjR4FTdQW0';
const bot = new TelegramBot(token, {polling: true});

// Регулярный опрос
const schedulePoll = (chatId) => {
  const pollQuestion = "Тренировка в 22:00";
  const options = ['Да', 'Нет', 'Не знаю'];

  bot.sendPoll(chatId, pollQuestion, options, {
      is_anonymous: false
  });

  // // Повторить через 24 часа
  // setTimeout(() => schedulePoll(chatId), 24 * 60 * 60 * 1000);
};

// Команда для запуска регулярного опроса
bot.onText(/\/poll/, (msg) => {
  const chatId = msg.chat.id;
  // Путь к локальному GIF файлу
  const gifPath = path.join(__dirname, 'assets', 'hello_chat.mp4');

  bot.sendAnimation(chatId, gifPath)
  .then(() => {
      schedulePoll(chatId);
  })
  .catch((err) => {
      console.error("Ошибка отправки локального GIF:", err);
      bot.sendMessage(chatId, 'Hello chat');
  });
});

bot.on('polling_error', (error) => {
  console.error('Ошибка polling:', error);
});