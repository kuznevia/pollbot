import { toZonedTime, format } from 'date-fns-tz';

const timeZone = 'Europe/Moscow';

export const getMoscowDate = () => {
  const now = new Date();
  return toZonedTime(now, timeZone);
};

// Парсинг даты из апи невки, для получения чистых милисекунд
export const getGameDateMilliseconds = (date: string) =>
  parseInt(date.match(/\d+/)?.[0] || '', 10);

// Функция для получения сегодняшней даты в формате YYYY-MM-DD
export function getTodayDate() {
  const today = getMoscowDate();
  return format(today, 'yyyy-MM-dd', { timeZone });
}

export function getTommorowDate() {
  const tomorrow = getMoscowDate();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return format(tomorrow, 'yyyy-MM-dd', { timeZone });
}

// Функция для получения даты в формате YYYY-MM-DD
export function getDate(date: Date) {
  return format(toZonedTime(date, timeZone), 'yyyy-MM-dd', { timeZone });
}

// Функция для проверки, является ли сегодня понедельником или четвергом
export function isMondayOrThursday() {
  const today = getMoscowDate();
  const dayOfWeek = today.getDay();
  return dayOfWeek === 1 || dayOfWeek === 4;
}
