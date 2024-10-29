export interface Game {
  DaysFromToday: number;
  ArenaRu: string;
  CompTeamNameAen: string;
  CompTeamNameBen: string;
  DisplayDateTimeMsk: string;
  LeagueNameRu: string;
  GameDateTime: string;
}

export type GamesResponse = Game[];
