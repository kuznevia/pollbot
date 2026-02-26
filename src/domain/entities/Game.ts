export interface Game {
  DaysFromToday: number;
  ArenaRu: string;
  ShortTeamNameAen: string;
  ShortTeamNameBen: string;
  DisplayDateTimeMsk: string;
  LeagueNameRu: string;
  GameDateTime: string;
  GameID: number;
}

export type GamesResponse = Game[];
