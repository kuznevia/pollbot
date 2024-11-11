import axios from 'axios';
import { GamesResponse } from '../model';
import { getGameDateMilliseconds } from '../../../../shared/utils/date';

// Преобразуем строки в объекты Date и находим ближайшую к текущей дате
export const findNextGames = async () => {
  try {
    const response = await axios.get(
      'https://reg.infobasket.su/Widget/TeamGames/23698?compId=88649&format=json'
    );
    const games = response.data as GamesResponse;

    const now = new Date();

    // Фильтруем игры, оставляя только будущие
    const futureGames = games.filter(
      ({ GameDateTime }) =>
        new Date(getGameDateMilliseconds(GameDateTime)) > now
    );

    const nextGameDate = futureGames.reduce(
      (minDate, { GameDateTime }) => {
        const gameDate = new Date(getGameDateMilliseconds(GameDateTime));
        return gameDate < minDate ? gameDate : minDate;
      },
      new Date(getGameDateMilliseconds(futureGames[0].GameDateTime))
    );

    // Фильтруем игры на ближайшую дату
    const nextGames = futureGames.filter(({ GameDateTime }) => {
      const gameDate = new Date(getGameDateMilliseconds(GameDateTime));
      return gameDate.getDate() === nextGameDate.getDate();
    });

    return nextGames;
  } catch (error) {
    console.error('Ошибка при получении расписания:', error);
    return [];
  }
};
