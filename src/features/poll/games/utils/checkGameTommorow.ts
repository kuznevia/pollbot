import axios from 'axios';
import { getTommorowDate, getDate } from '../../../../shared/utils/date';
import { GamesResponse } from '../model';
import { competitionID } from '../../../../shared/consts/consts';

export const checkGameTomorrow = async () => {
  try {
    const response = await axios.get(
      `https://reg.infobasket.su/Widget/TeamGames/23698?compId=${competitionID}&format=json`
    );
    const games = response.data as GamesResponse;

    const tomorrow = getTommorowDate();

    // Фильтруем игры по завтрашней дате
    const tomorrowGames = games.filter(({ GameDateTime }) => {
      const gameDateMiliseconds = parseInt(
        GameDateTime.match(/\d+/)?.[0] || '',
        10
      );
      const gameDate = getDate(new Date(gameDateMiliseconds));

      return tomorrow === gameDate;
    });

    return !!tomorrowGames.length;
  } catch (error) {
    console.error('Ошибка при получении расписания:', error);
    return false;
  }
};
