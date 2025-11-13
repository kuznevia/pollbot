import TelegramBot from 'node-telegram-bot-api';
import { getChatId } from '../../../shared/utils/utils';
import { Summary } from './model';
import { PollBot } from '../../bot';
import { getMoscowDate } from '../../../shared/utils/date';
import {
  defaultAppeal,
  floodChatId,
  geminiModel,
} from '../../../shared/consts/consts';
import {
  DAY_IN_SECONDS,
  HOUR_IN_MILLISECONDS,
} from '../../../shared/consts/date';

export class SummaryService implements Summary {
  bot: PollBot;
  private realToMasked = new Map<string, string>();
  private maskedToReal = new Map<string, string>();
  private lastSummaryCall = new Map<number, number>();
  private errorHandler?: (
    fn: () => Promise<void>,
    config?: { context: string; chatId: number }
  ) => Promise<void>;

  constructor(bot: PollBot) {
    this.bot = bot;
  }

  async init(errorHandler?: typeof this.errorHandler) {
    this.errorHandler = errorHandler;
    await this.setupCollection();

    this.bot.on('message', (msg) =>
      this.errorHandler?.(() => this.handleMessage(msg), {
        context: 'handleSummaryCommand',
        chatId: msg.chat.id,
      })
    );

    this.bot.onText(/\/summary/, (msg) =>
      this.errorHandler?.(() => this.handleSummaryCommand(msg), {
        context: 'handleSummaryCommand',
        chatId: msg.chat.id,
      })
    );

    console.log('[SummaryService] Инициализация завершена');
  }

  private async setupCollection() {
    const db = await this.bot.connectDB();
    db.collection('summary').drop();

    const collection = await db.createCollection('summary');

    await collection.createIndex(
      { date: 1 },
      { expireAfterSeconds: DAY_IN_SECONDS }
    );

    console.log(
      '[SummaryService] Коллекция summary создана с TTL-индексом (24ч)'
    );
  }

  private async handleMessage(msg: TelegramBot.Message) {
    const chatId = getChatId(msg);
    const user =
      msg.from?.username || msg.from?.first_name || msg.from?.last_name;
    const text = msg.text;

    if (
      !user ||
      !text ||
      text.startsWith('/') ||
      chatId !== Number(floodChatId)
    ) {
      return;
    }

    await this.collectMessage({ user, text, chatId });
  }

  private async handleSummaryCommand(msg: TelegramBot.Message) {
    const chatId = getChatId(msg);

    const db = await this.bot.connectDB();

    const summaries = await db.collection('summary').find({ chatId }).toArray();

    if (summaries.length === 0) {
      await this.bot.sendMessage(
        chatId,
        'Нет сохраненных сообщений для доклада'
      );
      return;
    }

    const now = Date.now();
    const lastCall = this.lastSummaryCall.get(chatId);

    if (lastCall && now - lastCall < HOUR_IN_MILLISECONDS) {
      const minutesLeft = Math.ceil(
        (HOUR_IN_MILLISECONDS - (now - lastCall)) / 60000
      );
      await this.bot.sendMessage(
        chatId,
        `⌛ Команду /summary можно использовать не чаще одного раза в час, ${defaultAppeal}\nПопробуй снова через ${minutesLeft} мин.`
      );
      return;
    }

    const dialog = summaries
      .map((s) => `${this.decryptUser(s.user)}: ${s.text.trim()}`)
      .join('\n');

    const prompt = this.buildPrompt(dialog);

    await this.bot.sendMessage(
      chatId,
      'Диалог собран. Отправляю в нейросеть...'
    );
    const response = await this.bot.AI.sendMessage(prompt, geminiModel);

    await this.sendLongMessage(chatId, response);

    this.lastSummaryCall.set(chatId, now);
  }

  private async sendLongMessage(chatId: number, text: string) {
    const MAX_LENGTH = 4000;

    const chunks = [];
    for (let i = 0; i < text.length; i += MAX_LENGTH) {
      chunks.push(text.slice(i, i + MAX_LENGTH));
    }

    for (const chunk of chunks) {
      await this.bot.sendMessage(chatId, chunk);
    }
  }

  private buildPrompt(dialog: string): string {
    return `
        Ниже приведён диалог нескольких участников.

        Проанализируй его и составь краткое структурированное резюме **по каждому участнику**.  
        Для каждого участника выдели основные мысли, аргументы, мнения или решения, которые он выразил.

        Формат вывода:

        **Имя участника:**
        – Ключевая мысль 1
        – Ключевая мысль 2
        ...

        Если участник ничего не добавил, просто не включай его в итог.

        Резюме должно быть не более 4096 символов, чтобы поместиться в одном сообщение телеграма. Соответственно, тебе нужно будет еще описывать тезисно мысли каждого участника, 
        а не все подробности. 

        Диалог:
        ${dialog}
    `.trim();
  }

  private encryptUser(user: string) {
    const existing = this.realToMasked.get(user);
    if (existing) return existing;

    const masked = `username${Math.random().toString(36).slice(2, 8)}`;
    this.realToMasked.set(user, masked);
    this.maskedToReal.set(masked, user);
    return masked;
  }

  private decryptUser(masked: string) {
    return this.maskedToReal.get(masked) || masked;
  }

  private async collectMessage({
    user,
    text,
    chatId,
  }: {
    user: string;
    text: string;
    chatId: number;
  }) {
    const db = await this.bot.connectDB();
    const encryptedUserName = this.encryptUser(user);

    const summaryCollection = db.collection('summary');

    const messageRecord = {
      date: getMoscowDate(),
      text,
      user: encryptedUserName,
      chatId,
    };

    await summaryCollection.insertOne(messageRecord);
    console.log('Сообщение записано в базу.');
  }
}
