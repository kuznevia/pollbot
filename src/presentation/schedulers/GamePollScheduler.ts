import cron from 'node-cron';
import { SendGamePollUseCase } from '../../application/use-cases/game-poll/SendGamePollUseCase';
import { CheckGamesScheduleUseCase } from '../../application/use-cases/game-poll/CheckGamesScheduleUseCase';
import { botName, chatId, gamesSchedule } from '../../shared/consts/consts';

export class GamePollScheduler {
  constructor(
    private readonly sendGamePollUseCase: SendGamePollUseCase,
    private readonly checkGamesSchedule: CheckGamesScheduleUseCase
  ) {}

  start(): void {
    cron.schedule(gamesSchedule, async () => {
      const hasGamesTomorrow = await this.checkGamesSchedule.hasGameTomorrow();
      if (hasGamesTomorrow) {
        console.log('Пробую автоматически отправить опрос на игру');
        await this.sendGamePollUseCase.execute(Number(chatId), botName);
      } else {
        console.log('Завтра нет игр');
      }
    });
  }
}
