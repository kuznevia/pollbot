import { IGameApiPort } from '../../ports/IGameApiPort';
import { Game } from '../../../domain/entities/Game';
import {
  getGameDateMilliseconds,
  getMoscowDate,
  getTommorowDate,
  getDate,
} from '../../../shared/utils/date';

export class CheckGamesScheduleUseCase {
  constructor(private readonly gameApi: IGameApiPort) {}

  async findNextGames(): Promise<Game[]> {
    const games = await this.gameApi.fetchTeamGames();
    if (!games.length) return [];

    const now = getMoscowDate();

    const futureGames = games.filter(
      ({ GameDateTime }) =>
        new Date(getGameDateMilliseconds(GameDateTime)) > now
    );

    if (!futureGames.length) return [];

    const nextGameDate = futureGames.reduce(
      (minDate, { GameDateTime }) => {
        const gameDate = new Date(getGameDateMilliseconds(GameDateTime));
        return gameDate < minDate ? gameDate : minDate;
      },
      new Date(getGameDateMilliseconds(futureGames[0].GameDateTime))
    );

    const endRangeDate = new Date(nextGameDate);
    endRangeDate.setDate(endRangeDate.getDate() + 1);

    return futureGames.filter(({ GameDateTime }) => {
      const gameDate = new Date(getGameDateMilliseconds(GameDateTime));
      return gameDate >= nextGameDate && gameDate <= endRangeDate;
    });
  }

  async hasGameTomorrow(): Promise<boolean> {
    const games = await this.gameApi.fetchTeamGames();
    if (!games.length) return false;

    const tomorrow = getTommorowDate();

    const tomorrowGames = games.filter(({ GameDateTime }) => {
      const gameDate = getDate(
        new Date(getGameDateMilliseconds(GameDateTime))
      );
      return tomorrow === gameDate;
    });

    return tomorrowGames.length > 0;
  }
}
