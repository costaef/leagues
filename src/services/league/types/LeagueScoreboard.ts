export type Ranking = {
  contestantId: string;
  score: string;
};

export type LeagueScoreboard = {
  id: string;
  name: string;
  ranking: Ranking[];
};
