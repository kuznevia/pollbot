import axios from 'axios';
import { GamesResponse } from '../model';
import { getGameDateMilliseconds } from '../../../../shared/utils/date';
import { competitionID } from '../../../../shared/consts/consts';

// Преобразуем строки в объекты Date и находим ближайшую к текущей дате
export const findNextGames = async () => {
  try {
    const response = await axios.get(
      `https://reg.infobasket.su/Widget/TeamGames/23698?compId=${competitionID}&format=json`
    );
    const games = response.data as GamesResponse;

    const now = new Date();

    // Фильтруем игры, оставляя только будущие
    const futureGames = games.filter(
      ({ GameDateTime }) =>
        new Date(getGameDateMilliseconds(GameDateTime)) > now
    );

    if (futureGames.length === 0) return [];

    //Находим дату ближайшей игры
    const nextGameDate = futureGames.reduce(
      (minDate, { GameDateTime }) => {
        const gameDate = new Date(getGameDateMilliseconds(GameDateTime));
        return gameDate < minDate ? gameDate : minDate;
      },
      new Date(getGameDateMilliseconds(futureGames[0].GameDateTime))
    );

    // Нормализуем к началу и концу календарного дня
    const startRangeDate = new Date(nextGameDate);
    startRangeDate.setHours(0, 0, 0, 0);

    // Вычисляем конечную дату диапазона (ближайшая дата + 1 день)
    const endRangeDate = new Date(startRangeDate);
    endRangeDate.setDate(endRangeDate.getDate() + 1);
    endRangeDate.setHours(23, 59, 59, 999);

    // Фильтруем игры на ближайшую дату
    const nextGames = futureGames.filter(({ GameDateTime }) => {
      const gameDate = new Date(getGameDateMilliseconds(GameDateTime));
      return gameDate >= startRangeDate && gameDate <= endRangeDate;
    });

    return nextGames;
  } catch (error) {
    console.error('Ошибка при получении расписания:', error);
    return [];
  }
};
