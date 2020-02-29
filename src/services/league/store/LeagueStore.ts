import { EntityId } from '../../../utils/entityId';
import { League, Contestant, LeagueResult, LeagueScoreboard } from '../types';

export interface LeagueStore {
  createLeague(name: string, deadline: string): Promise<EntityId>;
  getLeague(id: string): Promise<League>;
  getLeagueList(): Promise<string[]>;

  createContestant(name: string): Promise<EntityId>;
  getContestant(id: string): Promise<Contestant>;

  addContestantToLeague(
    leagueId: string,
    contestantId: string
  ): Promise<LeagueResult>;

  getLeagueMembers(leagueId: string): Promise<EntityId[] | null>;

  updateContestantPoints(
    leagueId: string,
    contestantId: string,
    pointsToAdd: number
  ): Promise<LeagueResult>;

  getLeagueScoreboard(leagueId: string): Promise<LeagueScoreboard | null>;
}
