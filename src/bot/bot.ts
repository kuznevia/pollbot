import TelegramBot from 'node-telegram-bot-api';
import { DB } from './db/DB';
import { commands } from './commands';
import { BotListeners } from './plugins/listeners';
import { BotScheduler } from './plugins/scheduledActions';
import { BotState, PollBotMessageOptions } from './model';
import { defaultAppeal } from '../shared/consts/consts';
import { getChatId, getSender } from '../shared/utils/utils';
export class PollBot extends TelegramBot {
  db: DB;
  listener: BotListeners;
  scheduler: BotScheduler;
  state = BotState.IDLE;

  constructor(token: string, options?: TelegramBot.ConstructorOptions) {
    super(token, options);
    this.db = new DB();
    this.listener = new BotListeners();
    this.scheduler = new BotScheduler();
    this.db.connect();
  }

  init() {
    this.setMyCommands(commands);
    this.listener.startListening(this);
    this.scheduler.schedule(this);
  }

  getState() {
    return this.state;
  }

  isPending() {
    return this.state === BotState.PENDING;
  }

  setPendingState() {
    this.state = BotState.PENDING;
  }

  setIdleState() {
    this.state = BotState.IDLE;
  }

  connectDB() {
    return this.db.connect();
  }

  onText(
    regexp: RegExp,
    callback: (
      msg: TelegramBot.Message,
      match: RegExpExecArray | null
    ) => Promise<void> | void
  ): void {
    super.onText(regexp, async (msg, match) => {
      const chatId = getChatId(msg);
      const sender = getSender(msg);

      if (this.isPending()) {
        this.sendMessage(
          chatId,
          `${sender}, ${defaultAppeal}, я занят, повтори позже`
        );

        return;
      }

      // Устанавливаем состояние ожидания перед выполнением запроса
      this.setPendingState();
      try {
        await callback(msg, match);
      } finally {
        this.setIdleState();
      }
    });
  }

  /**
   * Проверяет, является ли бот инициатором события, чтобы не отправлять сообщения в чат самому себе
   */
  sendMessageOrConsole(
    chatId: TelegramBot.ChatId,
    text: string,
    options?: PollBotMessageOptions
  ): Promise<TelegramBot.Message> | undefined {
    const isBotSender = options?.isBotSender;

    if (isBotSender) {
      console.log(text);

      return;
    }

    return super.sendMessage(chatId, text, options);
  }
}
