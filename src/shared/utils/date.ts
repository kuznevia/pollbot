import { Collection } from 'mongodb';
import { Poll } from '../../features/poll/model';

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

// Функция для сохранения даты последнего опроса в файл
export async function saveLastPollDateToDB(
  collection: Collection,
  pollType: Poll
) {
  const pollRecord = {
    type: pollType,
    date: new Date(),
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
