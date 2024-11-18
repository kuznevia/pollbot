import { Db, MongoClient } from 'mongodb';
import { mongoURI } from '../../shared/consts/consts';

export class DB {
  client: MongoClient;
  connection: Db | null = null;
  constructor() {
    this.client = new MongoClient(mongoURI);
  }

  async connect() {
    if (!this.connection) {
      try {
        await this.client.connect();
        console.log('Подключение к MongoDB успешно!');
        this.connection = this.client.db('pollbotDB');
      } catch (error) {
        throw new Error(`Can't connect to DB, error: ${error}`);
      }
    }

    return this.connection;
  }
}
