import { Poll } from '../entities/Poll';

export interface IGamePollRepository {
  isPollCreatedForGame(pollType: Poll, gameId: number): Promise<boolean>;
  saveLastPoll(pollType: Poll, gameId: number): Promise<void>;
}
