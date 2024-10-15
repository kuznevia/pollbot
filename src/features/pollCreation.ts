import TelegramBot from 'node-telegram-bot-api';
import path from 'path';
import {
  getTodayDate,
  isMondayOrThursday,
  saveLastPollDate,
} from '../shared/utils/date';
import { state } from '../shared/state/state';

// Регулярный опрос на тренировку
const schedulePoll = (bot: TelegramBot, chatId: TelegramBot.ChatId) => {
  const pollQuestion = 'Тренировка в 22:00';
  const options = ['Да', 'Нет', 'Не знаю'];

  return bot.sendPoll(chatId, pollQuestion, options, {
    is_anonymous: false,
  });
};

export const startPollListener = (bot: TelegramBot) => {
  // Команда для запуска регулярного опроса
  bot.onText(/\/poll/, (msg) => {
    const chatId = msg.chat.id;
    // Путь к локальному GIF файлу
    const gifPath = path.join(__dirname, 'assets', 'hello_chat.mp4');

    const today = getTodayDate();

    const { lastPollDate, isPolling } = state;

    // // Проверяем, является ли сегодня понедельником или четвергом
    // if (!isMondayOrThursday()) {
    //   bot.sendMessage(chatId, `${msg.from?.first_name}, опросы можно создавать только по понедельникам и четвергам, мразь`);

    //   return;
    // }

    // Проверка, был ли уже создан опрос сегодня
    if (lastPollDate === today) {
      bot.sendMessage(
        chatId,
        `${msg.from?.first_name}, на сегодня уже есть опрос, мразь`
      );

      return;
    }

    if (isPolling) {
      bot.sendMessage(
        chatId,
        `${msg.from?.first_name}, опоздал, мразь, уже создаю другой опрос`
      );

      return;
    }

    state.isPolling = true;

    bot
      .sendAnimation(chatId, gifPath)
      .then(() => schedulePoll(bot, chatId))
      .then((pollMessage) => {
        //Добавляем сообщение закреп
        const messageId = pollMessage.message_id;
        return bot.pinChatMessage(chatId, messageId);
      })
      .then(() => {
        return bot.sendMessage(chatId, 'Гойда, братья');
      })
      .catch((err) => {
        console.error('Ошибка: ', err);
        const errorMessage = err?.response?.body?.description;
        bot.sendMessage(
          chatId,
          `Ошибка, братья, 
${errorMessage}`
        );
      })
      .finally(() => {
        // Обновляем и сохраняем дату последнего опроса
        state.lastPollDate = today;
        saveLastPollDate(today);
        state.isPolling = false;
      });
  });
};
