import { AxiosError } from 'axios';
import { ILLMPort } from '../../ports/ILLMPort';
import { INotifierPort } from '../../ports/INotifierPort';
import { geminiModel, gigaChatPollMessage } from '../../../shared/consts/consts';

const DEFAULT_POLL_MESSAGE = 'Тренировка в 22:00';
const DEFAULT_POLL_OPTIONS = ['Да', 'Нет', 'Не знаю'];

export class GenerateAIPollContentUseCase {
  constructor(
    private readonly llm: ILLMPort,
    private readonly notifier: INotifierPort
  ) {}

  async execute(
    chatId: number,
    userTopic: string | null,
    isBotSender: boolean
  ): Promise<{ question: string; options: string[] }> {
    if (!userTopic) {
      return { question: DEFAULT_POLL_MESSAGE, options: DEFAULT_POLL_OPTIONS };
    }

    const pollMessage = gigaChatPollMessage + userTopic;

    try {
      const content = await this.llm.sendMessage(pollMessage, geminiModel);
      const jsonMatch = content.match(/```json\n([\s\S]*?)```/);

      if (jsonMatch) {
        const parsedJson = JSON.parse(jsonMatch[1]);
        const question = parsedJson?.question || DEFAULT_POLL_MESSAGE;
        const options =
          parsedJson?.yes && parsedJson?.no && parsedJson?.dunno
            ? [parsedJson.yes, parsedJson.no, parsedJson.dunno]
            : DEFAULT_POLL_OPTIONS;

        return { question, options };
      }

      if (isBotSender) {
        console.log(content);
      } else {
        await this.notifier.sendMessage(chatId, content);
      }

      return { question: DEFAULT_POLL_MESSAGE, options: DEFAULT_POLL_OPTIONS };
    } catch (err) {
      const error = err as AxiosError;
      const message = error.response
        ? (error.response.data as string)
        : error.message;

      if (isBotSender) {
        console.log(message);
      } else {
        await this.notifier.sendMessage(chatId, message);
      }

      return { question: DEFAULT_POLL_MESSAGE, options: DEFAULT_POLL_OPTIONS };
    }
  }
}
