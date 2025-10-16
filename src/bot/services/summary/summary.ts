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
  usersMap = new Map<string, string>();
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

  private async handleMessage(msg: any) {
    const chatId = getChatId(msg);
    const user = msg.from?.username;
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

  private async handleSummaryCommand(msg: any) {
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

    this.lastSummaryCall.set(chatId, now);

    const dialog = summaries
      .map((s) => `${this.decryptUser(s.user)}: ${s.text.trim()}`)
      .join('\n');

    const prompt = this.buildPrompt(dialog);

    await this.bot.sendMessage(
      chatId,
      'Диалог собран. Отправляю в нейросеть...'
    );
    const response = await this.bot.AI.sendMessage(prompt, geminiModel);

    await this.bot.sendMessage(chatId, response);
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

        Диалог:
        ${dialog}
    `.trim();
  }

  private encryptUser(user: string) {
    const encryptedUserName = this.usersMap.get(user);

    if (!encryptedUserName) {
      const encryptedUserName = `username${Math.random()}`;
      this.usersMap.set(encryptedUserName, user);
      return encryptedUserName;
    }

    return encryptedUserName;
  }

  private decryptUser(user: string) {
    const decryptedUser = this.usersMap.get(user);

    return decryptedUser || user;
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
