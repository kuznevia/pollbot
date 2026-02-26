import { SummaryMessage } from '../entities/SummaryMessage';

export interface ISummaryRepository {
  save(message: SummaryMessage): Promise<void>;
  findByChatId(chatId: number): Promise<SummaryMessage[]>;
  setupTTLCollection(): Promise<void>;
}
