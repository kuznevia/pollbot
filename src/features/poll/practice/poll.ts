import TelegramBot from 'node-telegram-bot-api';
import { AxiosError } from 'axios';
import { ROUTES } from '../../../shared/routes/routes';
import {
  isMondayOrThursday,
  isPollCreatedToday,
  saveLastPollToDB,
} from '../../../shared/utils/date';
import { Poll } from '../model';
import { PollBotError } from '../../../shared/model/model';
import { PollBot } from '../../../bot';
import {
  defaultAppeal,
  gigaChatModel,
  gigaChatPollMessage,
  letsGoMessage,
  outranMessage,
} from '../../../shared/consts/consts';
import { isBot } from '../../../shared/utils/utils';
import { defaultPollMessage, defaultPollOptions } from './const';

//Запрос оригинальных текстовок опросов через GigaChat
const getAIPollData = async (bot: PollBot) => {
  try {
    const gigaChatResponse = await bot.AI.sendMessage(
      gigaChatPollMessage,
      gigaChatModel
    );

    const content = gigaChatResponse.data.choices[0].message.content;
    const jsonMatch = content.match(/```json\n([\s\S]*?)```/);

    if (jsonMatch) {
      const parsedJson = JSON.parse(jsonMatch[1]);
      const AIPollQuestion = parsedJson?.question || defaultPollMessage;

      const AIoptions =
        parsedJson?.yes && parsedJson?.no && parsedJson?.dunno
          ? [parsedJson.yes, parsedJson.no, parsedJson.dunno]
          : defaultPollOptions;

      return { AIPollQuestion, AIoptions };
    }

    return { AIPollQuestion: null, AIoptions: null };
  } catch (err) {
    const error = err as AxiosError;
    console.error(error.response ? error.response.data : error.message);
    return { AIPollQuestion: null, AIoptions: null };
  }
};

// Регулярный опрос на тренировку
const createPoll = async (bot: PollBot, chatId: TelegramBot.ChatId) => {
  const { AIPollQuestion, AIoptions } = await getAIPollData(bot);
  const pollQuestion = AIPollQuestion || defaultPollMessage;
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
    if (!isMondayOrThursday()) {
      bot.sendMessage(
        chatId,
        `${sender}, опросы можно создавать только по понедельникам и четвергам, ${defaultAppeal}`
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
    const pollMessage = await createPoll(bot, chatId);
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
