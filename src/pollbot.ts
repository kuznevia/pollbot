import express from 'express';
import bodyParser from 'body-parser';
import TelegramBot from 'node-telegram-bot-api';
import { setCommands } from './features/setCommands';
import {
  startPracticePollListener,
  schedulePracticePoll,
} from './features/poll/practice';
import { activateMessageReactions } from './features/messageReactions';
import { scheduleGamePoll } from './features/poll/games';

require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`,
});

const token = process.env.BOT_TOKEN;
const app = express();

if (token) {
  const bot = new TelegramBot(token);

  // Настройка тела запроса
  app.use(bodyParser.json());

  // Определение маршрута для вебхука
  app.post(`/webhook/${token}`, (req, res) => {
    bot.processUpdate(req.body); // Обработка входящих обновлений
    res.sendStatus(200); // Отправка успешного ответа
  });

  // Установка вебхука
  const setWebhook = async () => {
    const webhookUrl = `https://pollbot-4r78.onrender.com/webhook/${token}`;
    await bot.setWebHook(webhookUrl); // Установка вебхука
  };

  // Инициализация команд и функционала бота
  const initBot = () => {
    setCommands(bot);
    startPracticePollListener(bot);
    schedulePracticePoll(bot);
    activateMessageReactions(bot);
    scheduleGamePoll(bot);
  };

  // Запуск сервера
  const PORT = process.env.PORT || 10000;
  app.listen(PORT, async () => {
    await setWebhook(); // Установка вебхука перед запуском
    initBot(); // Инициализация бота после установки вебхука
    console.log(`Сервер запущен на порту ${PORT}`);
  });
}
