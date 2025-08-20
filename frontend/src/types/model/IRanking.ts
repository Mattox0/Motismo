export interface IRankingPlayer {
  rank: number;
  id: string;
  name: string;
  avatar: string;
  points: number;
  roundPoints: number;
  isAuthor: boolean;
  isFastest: boolean;
}

export interface IRankingStatistics {
  gameId: string;
  totalPlayers: number;
  ranking: IRankingPlayer[];
}
