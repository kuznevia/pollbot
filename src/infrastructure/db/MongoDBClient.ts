import { Db, MongoClient } from 'mongodb';

export class MongoDBClient {
  private client: MongoClient;
  private connection: Db | null = null;

  constructor(uri: string) {
    this.client = new MongoClient(uri);
  }

  async connect(): Promise<Db> {
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
