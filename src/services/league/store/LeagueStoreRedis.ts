import { LeagueStore } from './LeagueStore';
import { Tedis } from 'tedis';
import { generateEntityId } from '../../../utils/entityId';
import { League, Contestant } from '../types';

export class LeagueStoreRedis implements LeagueStore {
  private redis: Tedis;

  constructor(redis: Tedis) {
    this.redis = redis;
  }

  async createLeague(name: string, deadline: string) {
    const leagueId = generateEntityId('league');

    const league: League = {
      id: leagueId.id,
      name: name,
      deadline: deadline
    };

    await this.redis.hmset(leagueId.key, league);
    return leagueId;
  }

  async getLeague(id: string) {
    const leagueKey = `league:${id}`;

    return (await this.redis.hgetall(leagueKey)) as League;
  }

  async createContestant(name: string) {
    const contestantId = generateEntityId('contestant');

    const contestant: Contestant = {
      id: contestantId.id,
      name: name
    };

    await this.redis.hmset(contestantId.key, contestant);
    return contestantId;
  }

  async getContestant(id: string) {
    const contestantKey = `contestant:${id}`;

    return (await this.redis.hgetall(contestantKey)) as Contestant;
  }
}
