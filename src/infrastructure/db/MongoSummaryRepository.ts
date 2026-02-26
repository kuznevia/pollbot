import { ISummaryRepository } from '../../domain/repositories/ISummaryRepository';
import { SummaryMessage } from '../../domain/entities/SummaryMessage';
import { MongoDBClient } from './MongoDBClient';
import { DAY_IN_SECONDS } from '../../shared/consts/date';

export class MongoSummaryRepository implements ISummaryRepository {
  constructor(private readonly dbClient: MongoDBClient) {}

  async save(message: SummaryMessage): Promise<void> {
    const db = await this.dbClient.connect();
    await db.collection('summary').insertOne(message);
    console.log('Сообщение записано в базу.');
  }

  async findByChatId(chatId: number): Promise<SummaryMessage[]> {
    const db = await this.dbClient.connect();
    return db.collection('summary').find({ chatId }).toArray() as unknown as Promise<SummaryMessage[]>;
  }

  async setupTTLCollection(): Promise<void> {
    const db = await this.dbClient.connect();

    try {
      await db.collection('summary').drop();
    } catch {
      // Collection doesn't exist yet, that's fine
    }

    const collection = await db.createCollection('summary');
    await collection.createIndex({ date: 1 }, { expireAfterSeconds: DAY_IN_SECONDS });

    console.log('[SummaryRepository] Коллекция summary создана с TTL-индексом (24ч)');
  }
}
