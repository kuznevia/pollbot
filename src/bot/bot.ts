import TelegramBot from 'node-telegram-bot-api';
import { DB } from './db/DB';
import { commands } from './commands';
import { BotListeners } from './plugins/listeners';
import { BotScheduler } from './plugins/scheduledActions';
import { BotState } from './model';
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
      const chatId = msg.chat.id;
      const sender = msg.from?.first_name;

      if (this.isPending()) {
        this.sendMessage(chatId, `${sender}, мразь, я занят, повтори позже`);

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
}
