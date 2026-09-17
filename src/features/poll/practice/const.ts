import { isMonday } from '../../../shared/utils/date';

export const getDefaultPollMessage = () =>
  isMonday() ? 'Тренировка в 22:00' : 'Тренировка в 20:30';
export const defaultPollOptions = ['Да', 'Нет', 'Не знаю'];
