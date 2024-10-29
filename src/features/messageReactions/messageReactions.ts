import TelegramBot from 'node-telegram-bot-api';
import { activateDvachReaction } from './reactions/dvach';

export const activateMessageReactions = (bot: TelegramBot) => {
  activateDvachReaction(bot);
};
