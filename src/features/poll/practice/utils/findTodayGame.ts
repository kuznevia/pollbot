import axios from 'axios';

import { competitionID } from '../../../../shared/consts/consts';
import { GamesResponse } from '../../games/model';

export const findTodayGame = async () => {
  try {
    const response = await axios.get(
      `https://reg.infobasket.su/Widget/TeamGames/23698?compId=${competitionID}&format=json`
    );
    const games = response.data as GamesResponse;

    const todayGame = games.find((game) => game.IsToday);

    if (!todayGame) return null;

    return todayGame;
  } catch (error) {
    console.error('Ошибка при получении расписания:', error);
    return null;
  }
};
