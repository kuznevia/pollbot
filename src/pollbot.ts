import express from 'express';
import bodyParser from 'body-parser';
import TelegramBot from 'node-telegram-bot-api';
import { initBot } from './initbot';

require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`,
});

const token = process.env.BOT_TOKEN;
const serverUrl = process.env.SERVER_URL;
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
    const webhookUrl = `${serverUrl}webhook/${token}`;
    await bot.setWebHook(webhookUrl); // Установка вебхука
  };

  // Запуск сервера
  const PORT = process.env.PORT || 10000;
  app.listen(PORT, async () => {
    await setWebhook(); // Установка вебхука перед запуском
    initBot(bot); // Инициализация бота после установки вебхука
    console.log(`Сервер запущен на порту ${PORT}`);
  });
}
