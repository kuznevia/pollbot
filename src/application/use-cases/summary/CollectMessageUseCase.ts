import { ISummaryRepository } from '../../../domain/repositories/ISummaryRepository';
import { getMoscowDate } from '../../../shared/utils/date';

export class CollectMessageUseCase {
  private realToMasked = new Map<string, string>();
  private maskedToReal = new Map<string, string>();

  constructor(private readonly summaryRepo: ISummaryRepository) {}

  async execute(user: string, text: string, chatId: number): Promise<void> {
    const encryptedUser = this.encryptUser(user);
    await this.summaryRepo.save({
      user: encryptedUser,
      text,
      chatId,
      date: getMoscowDate(),
    });
  }

  decryptUser(masked: string): string {
    return this.maskedToReal.get(masked) || masked;
  }

  private encryptUser(user: string): string {
    const existing = this.realToMasked.get(user);
    if (existing) return existing;
    const masked = `username${Math.random().toString(36).slice(2, 8)}`;
    this.realToMasked.set(user, masked);
    this.maskedToReal.set(masked, user);
    return masked;
  }
}
