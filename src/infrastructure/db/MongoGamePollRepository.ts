import { IGamePollRepository } from '../../domain/repositories/IGamePollRepository';
import { Poll } from '../../domain/entities/Poll';
import { MongoDBClient } from './MongoDBClient';
import { getMoscowDate } from '../../shared/utils/date';

export class MongoGamePollRepository implements IGamePollRepository {
  constructor(private readonly dbClient: MongoDBClient) {}

  async isPollCreatedForGame(pollType: Poll, gameId: number): Promise<boolean> {
    const db = await this.dbClient.connect();
    const collection = db.collection('games');

    const poll = await collection.findOne({
      type: pollType,
      id: gameId,
    });

    return !!poll;
  }

  async saveLastPoll(pollType: Poll, gameId: number): Promise<void> {
    const db = await this.dbClient.connect();
    const collection = db.collection('games');

    await collection.insertOne({
      type: pollType,
      date: getMoscowDate(),
      id: gameId,
    });

    console.log('Опрос создан и записан в базу данных.');
  }
}
