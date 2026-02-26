import { INotifierPort } from '../../ports/INotifierPort';
import { checkMessage } from '../../../shared/consts/consts';

export class HealthCheckUseCase {
  constructor(private readonly notifier: INotifierPort) {}

  async execute(chatId: number): Promise<void> {
    await this.notifier.sendMessage(chatId, checkMessage);
  }
}
