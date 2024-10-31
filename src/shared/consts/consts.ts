require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`, // Загружает соответствующий файл .env
});

export const chatId = process.env.CHAT_ID;
