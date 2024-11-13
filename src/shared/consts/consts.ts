import { envConfig } from '../config/config';

export const chatId = envConfig.get('CHAT_ID');
export const defaultAppeal = envConfig.get('DEFAULT_APPEAL');

export const botName = envConfig.get('BOT_NAME');
export const coachName = envConfig.get('COACH_NAME');
export const creatorName = envConfig.get('CREATOR_NAME');
export const ownerName = envConfig.get('OWNER_NAME');
