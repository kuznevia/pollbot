import TelegramBot from 'node-telegram-bot-api';
import { Game } from './model';
import { Poll } from '../model';
import {
  isPollForGameCreated,
  saveLastPollToDB,
} from '../../../shared/utils/date';
import { findNextGames } from './utils/findNextGame';
import { PollBotError } from '../../../shared/model/model';
import { PollBot } from '../../../bot';
import {
  defaultAppeal,
  gamePollMessage,
  gamePollReady,
} from '../../../shared/consts/consts';
import { isAdminOrBot, isBot } from '../../../shared/utils/utils';
import { ROUTES } from '../../../shared/routes/routes';

// Регулярный опрос на игру
const createGamePoll = (
  bot: TelegramBot,
  chatId: TelegramBot.ChatId,
  game: Game
) => {
  const {
    DisplayDateTimeMsk,
    ShortTeamNameAen,
    ShortTeamNameBen,
    LeagueNameRu,
    ArenaRu,
  } = game;

  const pollQuestion = `${LeagueNameRu}\u000A${DisplayDateTimeMsk} - ${ArenaRu}\u000A${ShortTeamNameAen} - ${ShortTeamNameBen}`;
  const options = [gamePollReady, 'Не готов'];

  return bot.sendPoll(Number(chatId), pollQuestion, options, {
    is_anonymous: false,
  });
};

const createPoll = (
  bot: PollBot,
  chatId: number,
  game: Game,
  isLastPoll: boolean
) => {
  return createGamePoll(bot, Number(chatId), game)
    .then((pollMessage) => {
      //Добавляем сообщение закреп
      const messageId = pollMessage.message_id;
      return bot.pinChatMessage(chatId, messageId);
    })
    .then(() => {
      if (isLastPoll) {
        return bot.sendMessage(chatId, gamePollMessage);
      }
    })
    .catch((err) => {
      console.error('Ошибка: ', err);
      const errorMessage = err?.response?.body?.description;
      bot.sendMessage(chatId, `Ошибка, братья, \n${errorMessage}`);
    });
};

export const sendGamePoll = async (
  bot: PollBot,
  chatId: number,
  sender: string
) => {
  try {
    if (!isAdminOrBot(sender)) {
      bot.sendMessage(
        chatId,
        `${sender}, опросы на игры могут создавать только тренер или хозяин, ${defaultAppeal}`
      );

      return;
    }

    const db = await bot.connectDB();
    const pollsCollection = db.collection('games');
    const nextGames = await findNextGames();

    if (!nextGames.length) {
      const message = `${sender}, в расписании нет игр`;
      await bot.sendMessageOrConsole(chatId, message, {
        isBotSender: isBot(sender),
      });

      return;
    }

    // Проверка, был ли уже создан опрос на эту игру
    const isCreatedForThatGame = await isPollForGameCreated(
      pollsCollection,
      Poll.game,
      nextGames[0].GameID
    );

    if (isCreatedForThatGame) {
      const message = `${sender}, на следующую игру уже есть опрос, ${defaultAppeal}`;
      await bot.sendMessageOrConsole(chatId, message, {
        isBotSender: isBot(sender),
      });

      return;
    }

    // Путь к локальному GIF файлу
    const gifPath = ROUTES.HELLO_JPG;
    await bot.sendAnimation(chatId, gifPath);

    for (const game of nextGames) {
      const isLastPoll = nextGames.indexOf(game) === nextGames.length - 1;
      await createPoll(bot, Number(chatId), game, isLastPoll);
      await saveLastPollToDB(pollsCollection, Poll.game, game.GameID);
    }
  } catch (err) {
    const error = err as PollBotError;
    const errorMessage = error?.response?.body?.description;
    bot.sendMessage(chatId, `Ошибка, братья, \n${errorMessage}`);
  }
};
