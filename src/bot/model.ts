import TelegramBot from 'node-telegram-bot-api';

export enum BotState {
  IDLE = 'idle',
  PENDING = 'pending',
}

export interface PollBotMessageOptions extends TelegramBot.SendMessageOptions {
  isBotSender?: Boolean;
}
