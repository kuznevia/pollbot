import { envConfig } from '../config/config';

export const chatId = envConfig.get('CHAT_ID');

export const botName = envConfig.get('BOT_NAME');
export const coachName = envConfig.get('COACH_NAME');
export const creatorName = envConfig.get('CREATOR_NAME');
export const ownerName = envConfig.get('OWNER_NAME');

export const defaultAppeal = envConfig.get('DEFAULT_APPEAL');
export const outranMessage = envConfig.get('OUTRAN_MESSAGE');
export const letsGoMessage = envConfig.get('LETS_GO_MESSAGE');
export const gamePollMessage = envConfig.get('GAME_POLL_MESSAGE');
export const gamePollReady = envConfig.get('READY');
export const checkMessage = envConfig.get('CHECK_MESSAGE');

export const mongoURI = envConfig.get('MONGO_URI');

export const gigaToken = envConfig.get('GIGA_CHAT_KEY');
export const gigaChatModel = envConfig.get('GIGA_CHAT_MODEL');

export const geminiModel = envConfig.get('GEMINI_MODEL');

export const gigaChatPollMessage = envConfig.get('GIGA_CHAT_POLLMESSAGE');

export const lazyMember = envConfig.get('LAZY_MEMBER');

export const currentLLMModel = envConfig.get('CURRENT_LLM_MODEL');

export const competitionID = envConfig.get('COMP_ID');
