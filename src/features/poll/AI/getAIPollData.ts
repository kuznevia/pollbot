import { AxiosError } from 'axios';
import TelegramBot from 'node-telegram-bot-api';
import { PollBot } from '../../../bot';
import { gigaChatModel } from '../../../shared/consts/consts';
import { isBot } from '../../../shared/utils/utils';
import { defaultPollMessage, defaultPollOptions } from '../practice/const';

//Запрос оригинальных текстовок опросов через GigaChat
export const getAIPollData = async (
  bot: PollBot,
  chatId: TelegramBot.ChatId,
  sender: string,
  pollMessage: string | null
) => {
  try {
    if (!pollMessage) {
      return { AIPollQuestion: null, AIoptions: null };
    }

    const gigaChatResponse = await bot.AI.sendMessage(
      pollMessage,
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

    await bot.sendMessageOrConsole(chatId, content, {
      isBotSender: isBot(sender),
    });
    return { AIPollQuestion: null, AIoptions: null };
  } catch (err) {
    const error = err as AxiosError;
    console.log(error);
    const message = error.response
      ? (error.response.data as string)
      : error.message;

    bot.sendMessageOrConsole(chatId, message, {
      isBotSender: isBot(sender),
    });
    return { AIPollQuestion: null, AIoptions: null };
  }
};
