import { Db, MongoClient } from 'mongodb';

require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`, // Загружает соответствующий файл .env
});

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri!);

let dbConnection: Db | null = null;

export async function connectDB() {
  if (!dbConnection) {
    await client.connect();
    console.log('Подключение к MongoDB успешно!');
    dbConnection = client.db('pollbotDB');
  }

  return dbConnection;
}
