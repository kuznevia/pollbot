import { Collection } from 'mongodb';
import { Poll } from '../../features/poll/model';

//Парсинг даты из апи невки, для получения чистых милисекунд
export const getGameDateMilliseconds = (date: string) =>
  parseInt(date.match(/\d+/)?.[0] || '', 10);

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

// Функция для проверки, является ли сегодня понедельником, вторником или четвергом
export function isMondayOrTuesdayOrThursday() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  return dayOfWeek === 1 || dayOfWeek === 2 || dayOfWeek === 4;
}

// Функция для проверки, является ли сегодня вторником
export function isTodayTuesday() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  return dayOfWeek === 2;
}

// Функция для сохранения даты последнего опроса в файл
export async function saveLastPollToDB(
  collection: Collection,
  pollType: Poll,
  id?: number
) {
  const pollRecord = {
    type: pollType,
    date: new Date(),
    id,
  };
  await collection.insertOne(pollRecord);
  console.log('Опрос создан и записан в базу данных.');
}

export async function isPollCreatedToday(
  collection: Collection,
  pollType: Poll
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Установить время в 00:00

  const poll = await collection.findOne({
    type: pollType,
    date: { $gte: today },
  });

  return !!poll; // Возвращает true, если опрос найден
}

export async function isPollForGameCreated(
  collection: Collection,
  pollType: Poll,
  id: number
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Установить время в 00:00

  const poll = await collection.findOne({
    type: pollType,
    id,
  });

  return !!poll; // Возвращает true, если опрос найден
}
