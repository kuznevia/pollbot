export interface Game {
  DaysFromToday: number;
  ArenaRu: string;
  CompTeamNameAen: string;
  CompTeamNameBen: string;
  DisplayDateTimeMsk: string;
  LeagueNameRu: string;
  GameDateTime: string;
  GameID: number;
}

export type GamesResponse = Game[];
