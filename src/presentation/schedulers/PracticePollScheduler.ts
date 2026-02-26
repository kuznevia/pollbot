import cron from 'node-cron';
import { SendPracticePollUseCase } from '../../application/use-cases/practice-poll/SendPracticePollUseCase';
import { botName, chatId, practiceSchedule } from '../../shared/consts/consts';

export class PracticePollScheduler {
  constructor(private readonly useCase: SendPracticePollUseCase) {}

  start(): void {
    cron.schedule(practiceSchedule, () => {
      console.log('Пробую автоматически отправить опрос на тренировку');
      this.useCase.execute(Number(chatId), botName);
    });
  }
}
