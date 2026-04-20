import { scheduleGamePoll } from '../../features/poll/games';
import { schedulePracticePoll } from '../../features/poll/practice';
import { PollBot } from '../bot';
import { BotConfig } from '../model';

export class BotScheduler {
  scheduledActions: Array<(bot: PollBot) => void>;

  constructor(config: BotConfig) {
    this.scheduledActions = [];

    if (config.isSeasonOngoing) {
      this.addAllScheduledActions();
    }
  }

  addSchedulePracticePoll() {
    this.scheduledActions.push(schedulePracticePoll);
  }

  addScheduleGamePoll() {
    this.scheduledActions.push(scheduleGamePoll);
  }

  addAllScheduledActions() {
    this.addSchedulePracticePoll();
    this.addScheduleGamePoll();
  }

  schedule(bot: PollBot) {
    this.scheduledActions.forEach((scheduledActions) => scheduledActions(bot));
  }
}
