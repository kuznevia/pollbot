import axios from 'axios';
import { IGameApiPort } from '../../application/ports/IGameApiPort';
import { Game, GamesResponse } from '../../domain/entities/Game';
import { competitionID } from '../../shared/consts/consts';

export class InfobasketApiClient implements IGameApiPort {
  async fetchTeamGames(): Promise<Game[]> {
    try {
      const response = await axios.get(
        `https://reg.infobasket.su/Widget/TeamGames/23698?compId=${competitionID}&format=json`
      );
      return response.data as GamesResponse;
    } catch (error) {
      console.error('Ошибка при получении расписания:', error);
      return [];
    }
  }
}
