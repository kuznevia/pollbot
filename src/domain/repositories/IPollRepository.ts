import { Poll } from '../entities/Poll';

export interface IPollRepository {
  isPollCreatedToday(pollType: Poll): Promise<boolean>;
  saveLastPoll(pollType: Poll): Promise<void>;
}
