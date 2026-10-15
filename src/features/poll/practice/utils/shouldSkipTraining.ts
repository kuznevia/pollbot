import { findTodayGame } from './findTodayGame';
import { isMonday, isTuesdayOrThursday } from '../../../../shared/utils/date';

const divisionsMap = {
  first: ['Высший Мужской Дивизион', 'NORD LEAGUE'],
  second: [''],
};

export const shouldSkipTraining = async () => {
  const todayGame = await findTodayGame();

  if (!todayGame) return false;

  if (isMonday() && divisionsMap.second.includes(todayGame.LeagueNameRu)) {
    return true;
  }

  if (
    isTuesdayOrThursday() &&
    divisionsMap.first.includes(todayGame.LeagueNameRu)
  ) {
    return true;
  }

  return false;
};
