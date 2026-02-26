import { ISummaryRepository } from '../../../domain/repositories/ISummaryRepository';
import { ILLMPort } from '../../ports/ILLMPort';
import { INotifierPort } from '../../ports/INotifierPort';
import { CollectMessageUseCase } from './CollectMessageUseCase';
import { defaultAppeal, geminiModel } from '../../../shared/consts/consts';
import { HOUR_IN_MILLISECONDS } from '../../../shared/consts/date';

export class GenerateSummaryUseCase {
  private lastSummaryCall = new Map<number, number>();

  constructor(
    private readonly summaryRepo: ISummaryRepository,
    private readonly llm: ILLMPort,
    private readonly notifier: INotifierPort,
    private readonly collectUseCase: CollectMessageUseCase
  ) {}

  async execute(chatId: number): Promise<void> {
    const summaries = await this.summaryRepo.findByChatId(chatId);

    if (summaries.length === 0) {
      await this.notifier.sendMessage(
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
      await this.notifier.sendMessage(
        chatId,
        `⌛ Команду /summary можно использовать не чаще одного раза в час, ${defaultAppeal}\nПопробуй снова через ${minutesLeft} мин.`
      );
      return;
    }

    const dialog = summaries
      .map((s) => `${this.collectUseCase.decryptUser(s.user)}: ${s.text.trim()}`)
      .join('\n');

    const prompt = this.buildPrompt(dialog);

    await this.notifier.sendMessage(chatId, 'Диалог собран. Отправляю в нейросеть...');
    const response = await this.llm.sendMessage(prompt, geminiModel);

    await this.sendLongMessage(chatId, response);
    this.lastSummaryCall.set(chatId, now);
  }

  private async sendLongMessage(chatId: number, text: string): Promise<void> {
    const MAX_LENGTH = 4000;
    for (let i = 0; i < text.length; i += MAX_LENGTH) {
      await this.notifier.sendMessage(chatId, text.slice(i, i + MAX_LENGTH));
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

        Диалог:
        ${dialog}
    `.trim();
  }
}
