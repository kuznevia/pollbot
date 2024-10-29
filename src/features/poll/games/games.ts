import axios from 'axios';
import TelegramBot from 'node-telegram-bot-api';
import cron from 'node-cron';
import { sendPoll } from './poll';
import { getDate, getTommorowDate } from '../../../shared/utils/date';
import { GamesResponse } from './model';
import { chatId } from '../../../shared/consts/consts';

const checkGameTomorrow = async () => {
  try {
    const response = await axios.get(
      'https://reg.infobasket.su/Widget/TeamGames/23698?compId=88649&format=json'
    );
    const games = response.data as GamesResponse;

    const tomorrow = getTommorowDate();

    // Фильтруем игры по завтрашней дате
    const tomorrowsGames = games.filter(({ GameDateTime }) => {
      const gameDateMiliseconds = parseInt(
        GameDateTime.match(/\d+/)?.[0] || '',
        10
      );
      const gameDate = getDate(new Date(gameDateMiliseconds));

      return tomorrow === gameDate;
    });

    return tomorrowsGames;
  } catch (error) {
    console.error('Ошибка при получении расписания:', error);
    return [];
  }
};

const sendGamePoll = async (bot: TelegramBot) => {
  const tomorrowGames = await checkGameTomorrow();
  if (tomorrowGames.length) {
    tomorrowGames.forEach((game) => {
      sendPoll(bot, Number(chatId), game);
    });
    console.log('Автоматически отправлен опрос об игре');
  } else {
    console.log('Завтра нет игр');
  }
};

export const scheduleGamePoll = (bot: TelegramBot) => {
  // Периодическая проверка расписания
  // Каждое утро в 11:00
  cron.schedule('0 11 * * *', () => sendGamePoll(bot));
};