import TelegramBot from 'node-telegram-bot-api';
import { ROUTES } from '../../../shared/routes/routes';
import { state } from '../../../shared/state/state';
import {
  isMondayOrThursday,
  isPollCreatedToday,
  saveLastPollDateToDB,
} from '../../../shared/utils/date';
import { connectDB } from '../../../db/db';
import { Poll } from '../model';

// Регулярный опрос на тренировку
const createPoll = (bot: TelegramBot, chatId: TelegramBot.ChatId) => {
  const pollQuestion = 'Тренировка в 22:00';
  const options = ['Да', 'Нет', 'Не знаю'];

  return bot.sendPoll(chatId, pollQuestion, options, {
    is_anonymous: false,
  });
};

export const sendPoll = async (
  bot: TelegramBot,
  chatId: number,
  sender?: string
) => {
  // Путь к локальному GIF файлу
  const gifPath = ROUTES.HELLO_JPG;

  const { isPolling } = state;

  // Проверяем, является ли сегодня понедельником или четвергом
  if (sender && !isMondayOrThursday()) {
    bot.sendMessage(
      chatId,
      `${sender}, опросы можно создавать только по понедельникам и четвергам, мразь`
    );

    return;
  }

  if (isPolling) {
    bot.sendMessage(chatId, `${sender}, мразь, я занят, повтори позже`);

    return;
  }

  state.isPolling = true;

  // Проверка, был ли уже создан опрос сегодня
  const db = await connectDB();
  const pollsCollection = db.collection('polls');
  const isCreatedToday = await isPollCreatedToday(
    pollsCollection,
    Poll.practice
  );
  if (isCreatedToday) {
    if (sender) {
      const message = `${sender}, на сегодня уже есть опрос, мразь`;
      bot.sendMessage(chatId, message);
    } else {
      console.log('Опрос уже создан');
    }

    state.isPolling = false;

    return;
  }

  bot
    .sendAnimation(chatId, gifPath)
    .then(() => createPoll(bot, chatId))
    .then((pollMessage) => {
      //Добавляем сообщение закреп
      const messageId = pollMessage.message_id;
      return bot.pinChatMessage(chatId, messageId);
    })
    .then(() => {
      const message = sender ? 'Гойда, братья' : 'Опередил вас, дрочилы';
      return bot.sendMessage(chatId, message);
    })
    .catch((err) => {
      console.error('Ошибка: ', err);
      const errorMessage = err?.response?.body?.description;
      bot.sendMessage(chatId, `Ошибка, братья, \n${errorMessage}`);
    })
    .finally(() => {
      // Обновляем и сохраняем дату последнего опроса
      saveLastPollDateToDB(pollsCollection, Poll.practice);
      state.isPolling = false;
    });
};
