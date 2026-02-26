import { INotifierPort } from '../../ports/INotifierPort';
import { IInteractionPort } from '../../ports/IInteractionPort';
import { IPollRepository } from '../../../domain/repositories/IPollRepository';
import { GenerateAIPollContentUseCase } from './GenerateAIPollContentUseCase';
import { Poll } from '../../../domain/entities/Poll';
import { PollBotError } from '../../../shared/model/model';
import {
  defaultAppeal,
  lazyMember,
  letsGoMessage,
  outranMessage,
} from '../../../shared/consts/consts';
import { isMondayOrThursday } from '../../../shared/utils/date';
import { isBot } from '../../../shared/utils/utils';
import { ROUTES } from '../../../shared/routes/routes';

export class SendPracticePollUseCase {
  constructor(
    private readonly notifier: INotifierPort,
    private readonly interaction: IInteractionPort,
    private readonly pollRepo: IPollRepository,
    private readonly generateAIContent: GenerateAIPollContentUseCase
  ) {}

  async execute(chatId: number, sender: string): Promise<void> {
    if (!isMondayOrThursday()) {
      await this.notifier.sendMessage(
        chatId,
        `${sender}, опросы можно создавать только по понедельникам и четвергам, ${defaultAppeal}`
      );
      return;
    }

    const isCreatedToday = await this.pollRepo.isPollCreatedToday(
      Poll.practice
    );

    if (isCreatedToday) {
      const message = `${sender}, на сегодня уже есть опрос, ${defaultAppeal}`;
      if (isBot(sender)) {
        console.log(message);
      } else {
        await this.notifier.sendMessage(chatId, message);
      }
      return;
    }

    try {
      await this.notifier.sendAnimation(chatId, ROUTES.HELLO_JPG);

      let userTopic: string | null = null;

      if (!isBot(sender)) {
        const wantsCustomTopic = await this.interaction.askYesNo(
          chatId,
          `${sender}, хочешь задать тему сам?`,
          sender,
          20000
        );

        if (wantsCustomTopic === null) {
          await this.notifier.sendMessage(
            chatId,
            `${sender}, долго думал, отправляю дефолтный опрос`
          );
        } else if (wantsCustomTopic) {
          const topic = await this.interaction.askText(
            chatId,
            'Напиши сообщение, которое бот будет использовать в качестве темы для шутки. Можно несколько тем через запятую. У тебя 30 секунд',
            sender,
            60000
          );

          if (topic === null) {
            await this.notifier.sendMessage(
              chatId,
              `${sender}, время на ввод темы истекло, отправляю дефолтный опрос`
            );
          } else if (!topic) {
            await this.notifier.sendMessage(
              chatId,
              `${sender}, не были введены темы`
            );
          } else {
            userTopic = topic;
          }
        } else {
          await this.notifier.sendMessage(chatId, `${sender}, ${lazyMember}`);
        }
      }

      const { question, options } = await this.generateAIContent.execute(
        chatId,
        userTopic,
        isBot(sender)
      );

      const pollMsg = await this.notifier.sendPoll(chatId, question, options, false);
      await this.notifier.pinMessage(chatId, pollMsg.message_id);
      await this.notifier.sendMessage(
        chatId,
        isBot(sender) ? outranMessage : letsGoMessage
      );

      await this.pollRepo.saveLastPoll(Poll.practice);
    } catch (err) {
      const error = err as PollBotError;
      const errorMessage = error?.response?.body?.description;
      await this.notifier.sendMessage(chatId, `Ошибка, братья, \n${errorMessage}`);
    }
  }
}
