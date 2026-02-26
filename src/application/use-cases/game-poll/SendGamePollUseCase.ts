import { INotifierPort } from '../../ports/INotifierPort';
import { IGamePollRepository } from '../../../domain/repositories/IGamePollRepository';
import { CheckGamesScheduleUseCase } from './CheckGamesScheduleUseCase';
import { Poll } from '../../../domain/entities/Poll';
import { Game } from '../../../domain/entities/Game';
import { PollBotError } from '../../../shared/model/model';
import {
  defaultAppeal,
  gamePollMessage,
  gamePollReady,
} from '../../../shared/consts/consts';
import { isAdminOrBot, isBot } from '../../../shared/utils/utils';
import { ROUTES } from '../../../shared/routes/routes';

export class SendGamePollUseCase {
  constructor(
    private readonly notifier: INotifierPort,
    private readonly gamePollRepo: IGamePollRepository,
    private readonly checkGamesSchedule: CheckGamesScheduleUseCase
  ) {}

  async execute(chatId: number, sender: string): Promise<void> {
    if (!isAdminOrBot(sender)) {
      await this.notifier.sendMessage(
        chatId,
        `${sender}, опросы на игры могут создавать только тренер или хозяин, ${defaultAppeal}`
      );
      return;
    }

    try {
      const nextGames = await this.checkGamesSchedule.findNextGames();

      if (!nextGames.length) {
        const message = `${sender}, в расписании нет игр`;
        if (isBot(sender)) {
          console.log(message);
        } else {
          await this.notifier.sendMessage(chatId, message);
        }
        return;
      }

      const isCreatedForThatGame =
        await this.gamePollRepo.isPollCreatedForGame(
          Poll.game,
          nextGames[0].GameID
        );

      if (isCreatedForThatGame) {
        const message = `${sender}, на следующую игру уже есть опрос, ${defaultAppeal}`;
        if (isBot(sender)) {
          console.log(message);
        } else {
          await this.notifier.sendMessage(chatId, message);
        }
        return;
      }

      await this.notifier.sendAnimation(chatId, ROUTES.HELLO_JPG);

      for (const game of nextGames) {
        const isLastPoll = nextGames.indexOf(game) === nextGames.length - 1;
        await this.createGamePoll(chatId, game, isLastPoll);
        await this.gamePollRepo.saveLastPoll(Poll.game, game.GameID);
      }
    } catch (err) {
      const error = err as PollBotError;
      const errorMessage = error?.response?.body?.description;
      await this.notifier.sendMessage(chatId, `Ошибка, братья, \n${errorMessage}`);
    }
  }

  private async createGamePoll(
    chatId: number,
    game: Game,
    isLastPoll: boolean
  ): Promise<void> {
    const {
      DisplayDateTimeMsk,
      ShortTeamNameAen,
      ShortTeamNameBen,
      LeagueNameRu,
      ArenaRu,
    } = game;

    const pollQuestion = `${LeagueNameRu}\u000A${DisplayDateTimeMsk} - ${ArenaRu}\u000A${ShortTeamNameAen} - ${ShortTeamNameBen}`;

    const pollMsg = await this.notifier.sendPoll(
      chatId,
      pollQuestion,
      [gamePollReady, 'Не готов'],
      false
    );

    await this.notifier.pinMessage(chatId, pollMsg.message_id);

    if (isLastPoll) {
      await this.notifier.sendMessage(chatId, gamePollMessage);
    }
  }
}
