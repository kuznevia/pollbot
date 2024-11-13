import TelegramBot from 'node-telegram-bot-api';
import { ROUTES } from '../../../shared/routes/routes';
import {
  isMondayOrThursday,
  isPollCreatedToday,
  saveLastPollToDB,
} from '../../../shared/utils/date';
import { Poll } from '../model';
import { PollBotError } from '../../../shared/model/model';
import { PollBot } from '../../../bot';
import { defaultAppeal } from '../../../shared/consts/consts';
import { envConfig } from '../../../shared/config/config';
import { isBot } from '../../../shared/utils/utils';

// Регулярный опрос на тренировку
const createPoll = (bot: PollBot, chatId: TelegramBot.ChatId) => {
  const pollQuestion = 'Тренировка в 22:00';
  const options = ['Да', 'Нет', 'Не знаю'];

  return bot.sendPoll(chatId, pollQuestion, options, {
    is_anonymous: false,
  });
};

export const sendPracticePoll = async (
  bot: PollBot,
  chatId: number,
  sender: string
) => {
  // Путь к локальному GIF файлу
  const gifPath = ROUTES.HELLO_JPG;

  try {
    // Проверяем, является ли сегодня понедельником или четвергом
    if (isMondayOrThursday()) {
      bot.sendMessage(
        chatId,
        `${sender}, опросы можно создавать только по понедельникам и четвергам, ${defaultAppeal}`
      );

      return;
    }

    // Проверка, был ли уже создан опрос сегодня
    const db = await bot.connectDB();
    const pollsCollection = db?.collection('polls');
    const isCreatedToday =
      pollsCollection &&
      (await isPollCreatedToday(pollsCollection, Poll.practice));

    if (isCreatedToday) {
      const message = `${sender}, на сегодня уже есть опрос, ${defaultAppeal}`;
      await bot.sendMessageOrConsole(chatId, message, {
        isBotSender: isBot(sender),
      });

      return;
    }

    const outranMessage = envConfig.get('OUTRAN_MESSAGE');

    await bot.sendAnimation(chatId, gifPath);
    const pollMessage = await createPoll(bot, chatId);
    await bot.pinChatMessage(chatId, pollMessage.message_id);
    await bot.sendMessage(chatId, sender ? 'Гойда, братья' : outranMessage);

    // Сохраняем дату последнего опроса
    pollsCollection && (await saveLastPollToDB(pollsCollection, Poll.practice));
  } catch (err) {
    const error = err as PollBotError;
    const errorMessage = error?.response?.body?.description;
    bot.sendMessage(chatId, `Ошибка, братья, \n${errorMessage}`);
  }
};
