const TelegramBot = require('node-telegram-bot-api');
const path = require('path');
const fs = require('fs');

const token = '7871528931:AAEia8GBL_8Eb9qVnrCQ-hi2qPjR4FTdQW0';
const pollDateFile = path.join(__dirname, 'pollDate.json');

const bot = new TelegramBot(token, {polling: true});

let isPolling = false;

// Функция для получения сегодняшней даты в формате YYYY-MM-DD
function getTodayDate() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

// Функция для проверки, является ли сегодня понедельником или четвергом
function isMondayOrThursday() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // Получаем день недели (0 - воскресенье, 1 - понедельник, ..., 6 - суббота)
  return dayOfWeek === 1 || dayOfWeek === 4; // Возвращаем true, если понедельник или четверг
}

// Функция для загрузки даты последнего опроса из файла
function loadLastPollDate() {
  if (fs.existsSync(pollDateFile)) {
      const data = fs.readFileSync(pollDateFile, 'utf8');
      return JSON.parse(data).lastPollDate || null;
  }
  return null;
} 

// Функция для сохранения даты последнего опроса в файл
async function saveLastPollDate(date) {
  const data = { lastPollDate: date };
  fs.writeFileSync(pollDateFile, JSON.stringify(data), 'utf8');
}

// Загружаем дату последнего опроса при старте
let lastPollDate = loadLastPollDate();

// Регулярный опрос
const schedulePoll = (chatId) => {
  const pollQuestion = "Тренировка в 22:00";
  const options = ['Да', 'Нет', 'Не знаю'];

 return bot.sendPoll(chatId, pollQuestion, options, {
      is_anonymous: false
  });

};

// Устанавливаем команды для бота
bot.setMyCommands([
  { command: '/poll', description: 'Запустить опрос на тренировку' },
]);

// Команда для запуска регулярного опроса
bot.onText(/\/poll/, (msg) => {
  const chatId = msg.chat.id;
  // Путь к локальному GIF файлу
  const gifPath = path.join(__dirname, 'assets', 'hello_chat.mp4');

  const today = getTodayDate();

  // Проверяем, является ли сегодня понедельником или четвергом
  if (!isMondayOrThursday()) {
    bot.sendMessage(chatId, `${msg.from.first_name}, опросы можно создавать только по понедельникам и четвергам, мразь`);

    return;
  }

  // Проверка, был ли уже создан опрос сегодня
  if (lastPollDate === today) {
      bot.sendMessage(chatId, `${msg.from.first_name}, на сегодня уже есть опрос, мразь`);

      return;
  }

  if(isPolling) {
    bot.sendMessage(chatId, `${msg.from.first_name}, опоздал, мразь, уже создаю другой опрос`);

    return;
  }

  isPolling = true;

  bot.sendAnimation(chatId, gifPath)
  .then(() => schedulePoll(chatId))
  .then((pollMessage) => {
    //Добавляем сообщение закреп
    const messageId = pollMessage.message_id;
    return bot.pinChatMessage(chatId, messageId)

  })
  .then(() => {
    return bot.sendMessage(chatId, 'Гойда, братья');
  })
  .catch((err) => {
      console.error("Ошибка: ", err);
      const errorMessage = err?.response?.body?.description;
      bot.sendMessage(chatId, `Ошибка, братья, 
${errorMessage}`);
  })
  .finally(() => {
    // Обновляем и сохраняем дату последнего опроса
    lastPollDate = today;
    saveLastPollDate(today);
    isPolling = false;
  })
});

bot.on('polling_error', (error) => {
  console.error('Ошибка polling:', error);
});