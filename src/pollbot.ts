import { PollBot } from './bot';
import { envConfig } from './shared/config/config';
import { isSeasonOngoing } from './shared/consts/consts';

const token = envConfig.get('BOT_TOKEN');

const bot = new PollBot(token, { isSeasonOngoing }, { polling: true });

bot.init();

bot.on('polling_error', (error) => {
  console.error('Ошибка polling:', error);
});
