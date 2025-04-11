import { startChatIdListener } from '../../features/chatId';
import { startDropDbListener } from '../../features/dropdb';
import { startHealthCheckListener } from '../../features/healthcheck';
import { activateMessageReactions } from '../../features/messageReactions';
import { startGamePollListener } from '../../features/poll/games';
import { startPracticePollListener } from '../../features/poll/practice';
import { PollBot } from '../bot';

export class BotListeners {
  listeners: Array<(bot: PollBot) => void>;

  constructor() {
    this.listeners = [];
    this.addAllListeners();
  }

  addPracticePollListener() {
    this.listeners.push(startPracticePollListener);
  }

  addGamePollListener() {
    this.listeners.push(startGamePollListener);
  }

  addHealthCheckListener() {
    this.listeners.push(startHealthCheckListener);
  }

  addMessageReactionsListener() {
    this.listeners.push(activateMessageReactions);
  }

  addDropDbListener() {
    this.listeners.push(startDropDbListener);
  }

  addChatIdListener() {
    this.listeners.push(startChatIdListener);
  }

  addAllListeners() {
    this.addPracticePollListener();
    this.addGamePollListener();
    // this.addMessageReactionsListener(); отключил реакции на двач
    this.addHealthCheckListener();
    this.addDropDbListener();
    this.addChatIdListener();
  }

  startListening(bot: PollBot) {
    this.listeners.forEach((listenerFunc) => listenerFunc(bot));
  }
}
