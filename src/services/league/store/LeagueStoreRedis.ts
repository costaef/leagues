import { LeagueStore } from './LeagueStore';
import { Tedis } from 'tedis';
import { generateEntityId, getEntityIdfromKey } from '../../../utils/entityId';
import {
  League,
  Contestant,
  LeagueResult,
  Result,
  ErrorResult,
  LeagueScoreboard,
  Ranking
} from '../types';
import { isDeadlineExpired } from '../../../utils/dateUtils';

const LEAGUE_PREFIX = 'league';
const CONTESTANT_PREFIX = 'contestant';
const LEAGUE_CONTESTANTS_PREFIX = 'leaguecontestants';
const LEAGUE_RANKING_PREFIX = 'leagueranking';

const getLeagueKey = (id: string) => `${LEAGUE_PREFIX}:${id}`;
const getContestantKey = (id: string) => `${CONTESTANT_PREFIX}:${id}`;
const getLeagueContestantsKey = (id: string) =>
  `${LEAGUE_CONTESTANTS_PREFIX}:${id}`;
const getLeagueRankingKey = (id: string) => `${LEAGUE_RANKING_PREFIX}:${id}`;

export class LeagueStoreRedis implements LeagueStore {
  private redis: Tedis;

  constructor(redis: Tedis) {
    this.redis = redis;
  }

  async createLeague(name: string, deadline: string) {
    const leagueId = generateEntityId(LEAGUE_PREFIX);

    const league: League = {
      id: leagueId.id,
      name: name,
      deadline: deadline
    };

    await this.redis.hmset(leagueId.key, league);
    return leagueId;
  }

  async getLeague(id: string) {
    const leagueKey = getLeagueKey(id);

    return (await this.redis.hgetall(leagueKey)) as League;
  }

  async createContestant(name: string) {
    const contestantId = generateEntityId(CONTESTANT_PREFIX);

    const contestant: Contestant = {
      id: contestantId.id,
      name: name
    };

    await this.redis.hmset(contestantId.key, contestant);
    return contestantId;
  }

  async getContestant(id: string) {
    const contestantKey = getContestantKey(id);

    return (await this.redis.hgetall(contestantKey)) as Contestant;
  }

  async addContestantToLeague(leagueId: string, contestantId: string) {
    const leagueKey = getLeagueKey(leagueId);
    const contestantKey = getContestantKey(contestantId);
    const leagueContestantsKey = getLeagueContestantsKey(leagueId);

    let result: LeagueResult;

    // League exists?
    if (!(await this.redis.hexists(leagueKey, 'id'))) {
      result = {
        status: Result.Error,
        error: ErrorResult.LeagueNotFound
      };

      return result;
    }

    // Contestant exists?
    if (!(await this.redis.hexists(contestantKey, 'id'))) {
      result = {
        status: Result.Error,
        error: ErrorResult.ContestantNotFound
      };

      return result;
    }

    // Deadline expired?
    const deadline = await this.redis.hget(leagueKey, 'deadline');
    if (deadline && isDeadlineExpired(deadline)) {
      result = {
        status: Result.Error,
        error: ErrorResult.DeadlineExpired
      };

      return result;
    } else if (!deadline) {
      result = {
        status: Result.Error,
        error: ErrorResult.UnknownError
      };

      return result;
    }

    const addCount = await this.redis.sadd(leagueContestantsKey, contestantKey);
    if (addCount > 0) {
      result = {
        status: Result.Success
      };
    } else {
      result = {
        status: Result.Error,
        error: ErrorResult.ContestantAlreadyMember
      };
    }

    return result;
  }

  async getLeagueMembers(leagueId: string) {
    const leagueContestantsKey = getLeagueContestantsKey(leagueId);

    const memberKeys = await this.redis.smembers(leagueContestantsKey);

    return memberKeys.map(key => getEntityIdfromKey(key));
  }

  async updateContestantPoints(
    leagueId: string,
    contestantId: string,
    pointsToAdd: number
  ) {
    const leagueKey = getLeagueKey(leagueId);
    const contestantKey = getContestantKey(contestantId);

    let result: LeagueResult;

    // League exists?
    if (!(await this.redis.hexists(leagueKey, 'id'))) {
      result = {
        status: Result.Error,
        error: ErrorResult.LeagueNotFound
      };

      return result;
    }

    // Contestant exists?
    if (!(await this.redis.hexists(contestantKey, 'id'))) {
      result = {
        status: Result.Error,
        error: ErrorResult.ContestantNotFound
      };

      return result;
    }

    // Contestant is member of the league?
    const leagueContestantsKey = getLeagueContestantsKey(leagueId);
    if (!(await this.redis.sismember(leagueContestantsKey, contestantKey))) {
      result = {
        status: Result.Error,
        error: ErrorResult.ContestantNotAMember
      };

      return result;
    }

    const leagueRankingKey = getLeagueRankingKey(leagueId);

    const newScore = await this.redis.zincrby(
      leagueRankingKey,
      pointsToAdd,
      contestantKey
    );
    if (newScore) {
      result = {
        status: Result.Success
      };
    } else {
      result = {
        status: Result.Error,
        error: ErrorResult.UnknownError
      };
    }

    return result;
  }

  async getLeagueScoreboard(leagueId: string) {
    const leagueKey = getLeagueKey(leagueId);

    const league = (await this.redis.hgetall(leagueKey)) as League;

    if (!isDeadlineExpired(league.deadline)) {
      return {
        id: league.id,
        name: league.name,
        ranking: []
      } as LeagueScoreboard;
    }

    const leagueRankingKey = getLeagueRankingKey(leagueId);

    const ranking = await this.redis.zrevrange(
      leagueRankingKey,
      0,
      -1,
      'WITHSCORES'
    );

    const contestantIds = Object.keys(ranking);
    const scores = Object.values(ranking);

    const scoreboard: LeagueScoreboard = {
      id: league.id,
      name: league.name,
      ranking: contestantIds.map(
        (id, index) => ({ contestantId: id, score: scores[index] } as Ranking)
      )
    };

    return scoreboard;
  }
}
