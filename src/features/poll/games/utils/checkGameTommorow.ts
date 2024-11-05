import axios from 'axios';
import { getTommorowDate, getDate } from '../../../../shared/utils/date';
import { GamesResponse } from '../model';

export const checkGameTomorrow = async () => {
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
