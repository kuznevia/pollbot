import TelegramBot from 'node-telegram-bot-api';
import { ROUTES } from '../../../shared/routes/routes';
import {
  isMondayOrTuesdayOrThursday,
  isPollCreatedToday,
  saveLastPollToDB,
} from '../../../shared/utils/date';
import { Poll } from '../model';
import { PollBotError } from '../../../shared/model/model';
import { PollBot } from '../../../bot';
import {
  defaultAppeal,
  gigaChatPollMessage_1,
  gigaChatPollMessage_2,
  letsGoMessage,
  outranMessage,
} from '../../../shared/consts/consts';
import { isBot } from '../../../shared/utils/utils';
import { defaultPollOptions } from './const';
import { getAIPollData, getUsersTopic } from '../AI';
import { getDefaultPollMessage, getPollMessage } from './utils';

// Регулярный опрос на тренировку
const createPoll = async (
  bot: PollBot,
  chatId: TelegramBot.ChatId,
  sender: string
) => {
  if (isBot(sender)) {
    return bot.sendPoll(chatId, getDefaultPollMessage(), defaultPollOptions, {
      is_anonymous: false,
    });
  }

  const userTopic = await getUsersTopic(bot, chatId, sender);
  const pollMessage = userTopic
    ? gigaChatPollMessage_1 +
      getPollMessage() +
      gigaChatPollMessage_2 +
      userTopic
    : userTopic;

  const { AIPollQuestion, AIoptions } = await getAIPollData(
    bot,
    chatId,
    sender,
    pollMessage
  );
  const pollQuestion = AIPollQuestion || getDefaultPollMessage();
  const options = AIoptions || defaultPollOptions;

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
    if (!isMondayOrTuesdayOrThursday()) {
      bot.sendMessage(
        chatId,
        `${sender}, опросы можно создавать только по понедельникам, вторникам и четвергам, ${defaultAppeal}`
      );

      return;
    }

    // Проверка, был ли уже создан опрос сегодня
    const db = await bot.connectDB();
    const pollsCollection = db.collection('polls');
    const isCreatedToday = await isPollCreatedToday(
      pollsCollection,
      Poll.practice
    );

    if (isCreatedToday) {
      const message = `${sender}, на сегодня уже есть опрос, ${defaultAppeal}`;
      await bot.sendMessageOrConsole(chatId, message, {
        isBotSender: isBot(sender),
      });

      return;
    }

    await bot.sendAnimation(chatId, gifPath);
    const pollMessage = await createPoll(bot, chatId, sender);
    await bot.pinChatMessage(chatId, pollMessage.message_id);
    await bot.sendMessage(
      chatId,
      isBot(sender) ? outranMessage : letsGoMessage
    );

    // Сохраняем дату последнего опроса
    await saveLastPollToDB(pollsCollection, Poll.practice);
  } catch (err) {
    const error = err as PollBotError;
    const errorMessage = error?.response?.body?.description;
    bot.sendMessage(chatId, `Ошибка, братья, \n${errorMessage}`);
  }
};
