import { Db, MongoClient } from 'mongodb';

require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`, // Загружает соответствующий файл .env
});

const uri = process.env.MONGO_URI;

export class DB {
  client: MongoClient;
  connection: Db | null = null;
  constructor() {
    this.client = new MongoClient(uri!);
  }

  async connect() {
    if (!this.connection) {
      try {
        await this.client.connect();
        console.log('Подключение к MongoDB успешно!');
        this.connection = this.client.db('pollbotDB');
      } catch (error) {
        console.error(error);
      }
    }

    return this.connection;
  }
}
