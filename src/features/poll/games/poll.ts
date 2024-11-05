import TelegramBot from 'node-telegram-bot-api';
import { Game } from './model';
import { checkGameTomorrow } from './utils/checkGameTommorow';
import { state } from '../../../shared/state/state';
import { Poll } from '../model';
import {
  isPollCreatedToday,
  saveLastPollDateToDB,
} from '../../../shared/utils/date';
import { connectDB } from '../../../db/db';

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

  const pollQuestion = `${LeagueNameRu}\n${DisplayDateTimeMsk}\n${teamA} - ${teamB}\n${ArenaRu}`;
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

export const sendPoll = async (
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

  const db = await connectDB();
  const pollsCollection = db.collection('polls');
  const tomorrowGames = await checkGameTomorrow();
  if (tomorrowGames.length) {
    // Проверка, был ли уже создан опрос сегодня
    const isCreatedToday = await isPollCreatedToday(pollsCollection, Poll.game);
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

    for (const game of tomorrowGames) {
      const isLastPoll =
        tomorrowGames.indexOf(game) === tomorrowGames.length - 1;
      await createPoll(bot, Number(chatId), game, isLastPoll);
      console.log('Автоматически отправлен опрос об игре');
    }
    await saveLastPollDateToDB(pollsCollection, Poll.game);
  } else {
    if (sender) {
      const message = `${sender}, завтра нет игр`;
      await bot.sendMessage(chatId, message);
    } else {
      console.log('Завтра нет игр');
    }
  }

  state.isPolling = false;
};
