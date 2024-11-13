import TelegramBot from 'node-telegram-bot-api';
import { botName, coachName, creatorName, ownerName } from '../consts/consts';

export const isAdminOrBot = (sender?: string) =>
  sender === coachName ||
  sender === creatorName ||
  sender === ownerName ||
  sender === botName;

export const isCreator = (sender?: string) => sender === creatorName;

export const isBot = (sender?: string) => sender === botName;

export const getChatId = (message: TelegramBot.Message) => message.chat.id;

export const getSender = (message: TelegramBot.Message) => {
  const sender = message.from?.first_name;

  if (!sender) {
    throw new Error('No sender name');
  }

  return sender;
};
