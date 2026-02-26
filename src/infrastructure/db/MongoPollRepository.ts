import { IPollRepository } from '../../domain/repositories/IPollRepository';
import { Poll } from '../../domain/entities/Poll';
import { MongoDBClient } from './MongoDBClient';
import { getMoscowDate } from '../../shared/utils/date';

export class MongoPollRepository implements IPollRepository {
  constructor(private readonly dbClient: MongoDBClient) {}

  async isPollCreatedToday(pollType: Poll): Promise<boolean> {
    const db = await this.dbClient.connect();
    const collection = db.collection('polls');

    const today = getMoscowDate();
    today.setHours(0, 0, 0, 0);

    const poll = await collection.findOne({
      type: pollType,
      date: { $gte: today },
    });

    return !!poll;
  }

  async saveLastPoll(pollType: Poll): Promise<void> {
    const db = await this.dbClient.connect();
    const collection = db.collection('polls');

    await collection.insertOne({
      type: pollType,
      date: getMoscowDate(),
    });

    console.log('Опрос создан и записан в базу данных.');
  }
}
