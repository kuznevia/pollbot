import fs from 'fs';
import { ROUTES } from '../routes/routes';

const pollDateFile = ROUTES.POLL_DATE;

// Функция для получения сегодняшней даты в формате YYYY-MM-DD
export function getTodayDate() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

export function getTommorowDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

// Функция для получения даты в формате YYYY-MM-DD
export function getDate(date: Date) {
  return date.toISOString().split('T')[0];
}

// Функция для проверки, является ли сегодня понедельником или четвергом
export function isMondayOrThursday() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // Получаем день недели (0 - воскресенье, 1 - понедельник, ..., 6 - суббота)
  return dayOfWeek === 1 || dayOfWeek === 4; // Возвращаем true, если понедельник или четверг
}

// Функция для загрузки даты последнего опроса из фйла
export function loadLastPollDate() {
  if (fs.existsSync(pollDateFile)) {
    const data = fs.readFileSync(pollDateFile, 'utf8');
    return JSON.parse(data).lastPollDate || null;
  }
  return null;
}

// Функция для сохранения даты последнего опроса в файл
export function saveLastPollDate(date: string) {
  const data = { lastPollDate: date };
  fs.writeFileSync(pollDateFile, JSON.stringify(data), 'utf8');
}
