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
import { envConfig } from '../../../shared/config/config';
import { defaultAppeal } from '../../../shared/consts/consts';
import { isAdminOrBot, isBot } from '../../../shared/utils/utils';

// Регулярный опрос на игру
const createGamePoll = (
  bot: TelegramBot,
  chatId: TelegramBot.ChatId,
  game: Game
) => {
  const {
    DisplayDateTimeMsk,
    CompTeamNameAen,
    CompTeamNameBen,
    LeagueNameRu,
    ArenaRu,
  } = game;
  const teamA = CompTeamNameAen.slice(0, 12);
  const teamB = CompTeamNameBen.slice(0, 12);

  const pollQuestion = `${LeagueNameRu}\u000A${DisplayDateTimeMsk}\u000A${teamA} - ${teamB}\u000A${ArenaRu}`;
  const options = ['Готов ебать', 'Не готов'];

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
        const message = envConfig.get('GAME_POLL_MESSAGE');
        return bot.sendMessage(chatId, message);
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
    const pollsCollection = db?.collection('polls');
    const nextGames = await findNextGames();

    if (!nextGames.length) {
      const message = `${sender}, в расписании нет игр`;
      await bot.sendMessageOrConsole(chatId, message, {
        isBotSender: isBot(sender),
      });

      return;
    }

    // Проверка, был ли уже создан опрос на эту игру
    const isCreatedForThatGame =
      pollsCollection &&
      (await isPollForGameCreated(
        pollsCollection,
        Poll.game,
        nextGames[0].GameID
      ));

    if (isCreatedForThatGame) {
      const message = `${sender}, на следующую игру уже есть опрос, ${defaultAppeal}`;
      await bot.sendMessageOrConsole(chatId, message, {
        isBotSender: isBot(sender),
      });

      return;
    }

    for (const game of nextGames) {
      const isLastPoll = nextGames.indexOf(game) === nextGames.length - 1;
      await createPoll(bot, Number(chatId), game, isLastPoll);
      pollsCollection &&
        (await saveLastPollToDB(pollsCollection, Poll.game, game.GameID));
    }
  } catch (err) {
    const error = err as PollBotError;
    const errorMessage = error?.response?.body?.description;
    bot.sendMessage(chatId, `Ошибка, братья, \n${errorMessage}`);
  }
};
