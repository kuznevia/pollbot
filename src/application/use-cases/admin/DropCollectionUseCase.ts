import { INotifierPort } from '../../ports/INotifierPort';
import { IInteractionPort } from '../../ports/IInteractionPort';

export class DropCollectionUseCase {
  constructor(
    private readonly notifier: INotifierPort,
    private readonly interaction: IInteractionPort
  ) {}

  async execute(chatId: number, sender: string): Promise<void> {
    const collections = await this.notifier.listCollections();

    try {
      const collectionName = await this.interaction.askInlineChoice(
        chatId,
        `${sender}, какую коллекцию хочешь удалить?`,
        collections,
        sender,
        20000
      );

      if (!collectionName) return;

      await this.notifier.dropCollection(collectionName);
      await this.notifier.sendMessage(
        chatId,
        `${sender}, коллекция ${collectionName} дропнута`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'неизвестная ошибка';
      await this.notifier.sendMessage(
        chatId,
        `${sender}, что-то пошло не так. Ошибка: ${errorMessage}`
      );
    }
  }
}
