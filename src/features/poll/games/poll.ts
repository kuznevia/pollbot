import TelegramBot from 'node-telegram-bot-api';
import { Game } from './model';

// Регулярный опрос на игру
export const createGamePoll = (
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
  const form = CompTeamNameAen === 'BIP LIONS' ? 'белая' : 'черная';
  const teamA = CompTeamNameAen.slice(0, 12);
  const teamB = CompTeamNameBen.slice(0, 12);

  const pollQuestion = `${LeagueNameRu}\n${DisplayDateTimeMsk}\n${teamA} - ${teamB}\n${ArenaRu}\n Форма ${form}`;
  const options = ['Готов играть', 'Не готов'];

  return bot.sendPoll(Number(chatId), pollQuestion, options, {
    is_anonymous: false,
  });
};

export const sendPoll = (
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
