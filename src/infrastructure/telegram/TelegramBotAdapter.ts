import TelegramBot from 'node-telegram-bot-api';
import { INotifierPort } from '../../application/ports/INotifierPort';
import { IInteractionPort } from '../../application/ports/IInteractionPort';
import { BotStateManager } from '../../application/shared/BotStateManager';
import { MongoDBClient } from '../db/MongoDBClient';
import { defaultAppeal } from '../../shared/consts/consts';

export class TelegramBotAdapter implements INotifierPort, IInteractionPort {
  constructor(
    private readonly bot: TelegramBot,
    private readonly dbClient: MongoDBClient
  ) {}

  /**
   * Registers a command handler with an optional pending-state guard.
   * When stateManager is provided, concurrent commands are rejected.
   */
  registerCommand(
    pattern: RegExp,
    callback: (msg: TelegramBot.Message) => Promise<void>,
    stateManager?: BotStateManager
  ): void {
    this.bot.onText(pattern, async (msg) => {
      if (stateManager?.isPending()) {
        const sender = msg.from?.first_name || 'Чел';
        await this.bot.sendMessage(
          msg.chat.id,
          `${sender}, ${defaultAppeal}, я занят, повтори позже`
        );
        return;
      }

      stateManager?.setPending();
      try {
        await callback(msg);
      } finally {
        stateManager?.setIdle();
      }
    });
  }

  /**
   * Registers a handler for every incoming message (not command-filtered).
   */
  onMessage(callback: (msg: TelegramBot.Message) => Promise<void>): void {
    this.bot.on('message', callback);
  }

  // INotifierPort

  async sendMessage(chatId: number, text: string): Promise<void> {
    await this.bot.sendMessage(chatId, text);
  }

  async sendPoll(
    chatId: number,
    question: string,
    options: string[],
    isAnonymous: boolean
  ): Promise<{ message_id: number }> {
    const result = await this.bot.sendPoll(chatId, question, options, {
      is_anonymous: isAnonymous,
    });
    return { message_id: result.message_id };
  }

  async pinMessage(chatId: number, messageId: number): Promise<void> {
    await this.bot.pinChatMessage(chatId, messageId);
  }

  async sendAnimation(chatId: number, filePath: string): Promise<void> {
    await this.bot.sendAnimation(chatId, filePath);
  }

  async listCollections(): Promise<string[]> {
    const db = await this.dbClient.connect();
    const collections = await db.listCollections().toArray();
    return collections.map((c) => c.name);
  }

  async dropCollection(name: string): Promise<void> {
    const db = await this.dbClient.connect();
    await db.collection(name).drop();
  }

  // IInteractionPort

  async askYesNo(
    chatId: number,
    promptText: string,
    fromUser: string,
    timeoutMs: number
  ): Promise<boolean | null> {
    return new Promise((resolve) => {
      this.bot.sendMessage(chatId, promptText, {
        reply_markup: {
          inline_keyboard: [
            [
              { text: 'Да', callback_data: 'yes' },
              { text: 'Нет', callback_data: 'no' },
            ],
          ],
        },
      });

      const timeoutId = setTimeout(() => {
        this.bot.removeListener('callback_query', onCallbackQuery);
        resolve(null);
      }, timeoutMs);

      const onCallbackQuery = (query: TelegramBot.CallbackQuery) => {
        if (query.message?.chat.id !== chatId) return;
        if (query.from?.first_name !== fromUser) return;

        clearTimeout(timeoutId);
        this.bot.removeListener('callback_query', onCallbackQuery);
        resolve(query.data === 'yes');
      };

      this.bot.on('callback_query', onCallbackQuery);
    });
  }

  async askText(
    chatId: number,
    promptText: string,
    fromUser: string,
    timeoutMs: number
  ): Promise<string | null> {
    return new Promise((resolve) => {
      this.bot.sendMessage(chatId, promptText);

      const timeoutId = setTimeout(() => {
        this.bot.removeListener('message', onMessage);
        resolve(null);
      }, timeoutMs);

      const onMessage = (msg: TelegramBot.Message) => {
        if (msg.chat.id !== chatId) return;
        if (msg.from?.first_name !== fromUser) return;

        clearTimeout(timeoutId);
        this.bot.removeListener('message', onMessage);
        resolve(msg.text || null);
      };

      this.bot.on('message', onMessage);
    });
  }

  async askInlineChoice(
    chatId: number,
    promptText: string,
    choices: string[],
    fromUser: string,
    timeoutMs: number
  ): Promise<string | null> {
    return new Promise((resolve, reject) => {
      if (choices.length === 0) {
        reject(new Error('список коллекций пуст'));
        return;
      }

      const inlineKeyboard = choices.map((choice) => ({
        text: choice,
        callback_data: choice,
      }));

      this.bot.sendMessage(chatId, promptText, {
        reply_markup: { inline_keyboard: [inlineKeyboard] },
      });

      const timeoutId = setTimeout(() => {
        this.bot.removeListener('callback_query', onCallbackQuery);
        reject(new Error('долго думал'));
      }, timeoutMs);

      const onCallbackQuery = (query: TelegramBot.CallbackQuery) => {
        if (query.message?.chat.id !== chatId) return;
        if (query.from?.first_name !== fromUser) return;

        clearTimeout(timeoutId);
        this.bot.removeListener('callback_query', onCallbackQuery);

        if (query.data) {
          resolve(query.data);
        } else {
          reject(new Error('ответ пуст'));
        }
      };

      this.bot.on('callback_query', onCallbackQuery);
    });
  }
}
