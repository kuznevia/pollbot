export interface Game {
  DaysFromToday: number;
  ArenaRu: string;
  ShortTeamNameAen: string;
  ShortTeamNameBen: string;
  DisplayDateTimeMsk: string;
  LeagueNameRu: string;
  GameDateTime: string;
  GameID: number;
  IsToday: boolean;
}

export type GamesResponse = Game[];
