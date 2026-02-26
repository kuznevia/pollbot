import { Game } from '../../domain/entities/Game';

export interface IGameApiPort {
  fetchTeamGames(): Promise<Game[]>;
}
