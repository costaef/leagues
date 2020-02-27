import { EntityId } from '../../../utils/entityId';
import { League, Contestant } from '../types';

export interface LeagueStore {
  createLeague(name: string, deadline: string): Promise<EntityId>;
  getLeague(id: string): Promise<League>;

  createContestant(name: string): Promise<EntityId>;
  getContestant(id: string): Promise<Contestant>;
}
