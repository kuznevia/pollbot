import { isTodayTuesday } from '../../../shared/utils/date';

export const getDefaultPollMessage = () => {
  const isTuesday = isTodayTuesday();
  const time = isTuesday ? '19:30' : '22:00';

  return `Тренировка в ${time}`;
};

export const getPollMessage = () => {
  const isTuesday = isTodayTuesday();
  const time = isTuesday ? '19:30' : '22:00';

  return `Кто придет на тренировку в ${time}?`;
};
