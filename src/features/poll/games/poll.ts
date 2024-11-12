import TelegramBot from 'node-telegram-bot-api';
import { Game } from './model';
import { state } from '../../../shared/state/state';
import { Poll } from '../model';
import {
  isPollForGameCreated,
  saveLastPollToDB,
} from '../../../shared/utils/date';
import { connectDB } from '../../../bot/db/utils';
import { findNextGames } from './utils/findNextGame';

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
  bot: TelegramBot,
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
        return bot.sendMessage(chatId, 'Время ебать свиней');
      }
    })
    .catch((err) => {
      console.error('Ошибка: ', err);
      const errorMessage = err?.response?.body?.description;
      bot.sendMessage(chatId, `Ошибка, братья, \n${errorMessage}`);
    });
};

export const sendGamePoll = async (
  bot: TelegramBot,
  chatId: number,
  sender?: string
) => {
  const { isPolling } = state;

  if (isPolling) {
    bot.sendMessage(chatId, `${sender}, мразь, я занят, повтори позже`);

    return;
  }

  state.isPolling = true;

  const isCoachOrOwner =
    sender === 'Alexey' || sender === 'Viacheslav' || sender === 'Никита';

  if (sender && !isCoachOrOwner) {
    bot.sendMessage(
      chatId,
      `${sender}, опросы на игры могут создавать только тренер или хозяин, мразь`
    );
    state.isPolling = false;

    return;
  }

  const db = await connectDB();
  const pollsCollection = db.collection('polls');
  const nextGames = await findNextGames();
  if (nextGames.length) {
    // Проверка, был ли уже создан опрос на эту игру
    const isCreatedForThatGame = await isPollForGameCreated(
      pollsCollection,
      Poll.game,
      nextGames[0].GameID
    );
    if (isCreatedForThatGame) {
      if (sender) {
        const message = `${sender}, на следующую игру уже есть опрос, мразь`;
        bot.sendMessage(chatId, message);
      } else {
        console.log('Опрос на эту игру уже создан');
      }

      state.isPolling = false;

      return;
    }

    for (const game of nextGames) {
      const isLastPoll = nextGames.indexOf(game) === nextGames.length - 1;
      await createPoll(bot, Number(chatId), game, isLastPoll);
      await saveLastPollToDB(pollsCollection, Poll.game, game.GameID);
      console.log('Автоматически отправлен опрос об игре');
    }
  } else {
    if (sender) {
      const message = `${sender}, в расписании нет игр`;
      await bot.sendMessage(chatId, message);
    } else {
      console.log('В расписании нет игр');
    }
  }

  state.isPolling = false;
};
