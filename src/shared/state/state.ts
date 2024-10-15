import { loadLastPollDate } from '../utils/date';

export const state = {
  lastPollDate: loadLastPollDate(),
  isPolling: false,
};
