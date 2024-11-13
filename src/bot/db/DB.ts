import { Db, MongoClient } from 'mongodb';
import { envConfig } from '../../shared/config/config';

export class DB {
  client: MongoClient;
  connection: Db | null = null;
  constructor() {
    const uri = envConfig.get('MONGO_URI');
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
