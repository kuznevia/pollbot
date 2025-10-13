import axios from 'axios';
import { GamesResponse } from '../model';
import {
  getGameDateMilliseconds,
  getMoscowDate,
} from '../../../../shared/utils/date';
import { competitionID } from '../../../../shared/consts/consts';

// Преобразуем строки в объекты Date и находим ближайшую к текущей дате
export const findNextGames = async () => {
  try {
    const response = await axios.get(
      `https://reg.infobasket.su/Widget/TeamGames/23698?compId=${competitionID}&format=json`
    );
    const games = response.data as GamesResponse;

    const now = getMoscowDate();

    // Фильтруем игры, оставляя только будущие
    const futureGames = games.filter(
      ({ GameDateTime }) =>
        new Date(getGameDateMilliseconds(GameDateTime)) > now
    );

    //Находим дату ближайшей игры
    const nextGameDate = futureGames.reduce(
      (minDate, { GameDateTime }) => {
        const gameDate = new Date(getGameDateMilliseconds(GameDateTime));
        return gameDate < minDate ? gameDate : minDate;
      },
      new Date(getGameDateMilliseconds(futureGames[0].GameDateTime))
    );

    // Вычисляем конечную дату диапазона (ближайшая дата + 1 день)
    const endRangeDate = new Date(nextGameDate);
    endRangeDate.setDate(endRangeDate.getDate() + 1);

    // Фильтруем игры на ближайшую дату
    const nextGames = futureGames.filter(({ GameDateTime }) => {
      const gameDate = new Date(getGameDateMilliseconds(GameDateTime));
      return gameDate >= nextGameDate && gameDate <= endRangeDate;
    });

    return nextGames;
  } catch (error) {
    console.error('Ошибка при получении расписания:', error);
    return [];
  }
};
