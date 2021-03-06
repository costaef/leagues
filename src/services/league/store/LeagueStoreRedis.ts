import { LeagueStore } from './LeagueStore';
import { TedisPool } from 'tedis';
import {
  generateEntityId,
  getEntityIdfromKey,
  getIdFromKey
} from '../../../utils/entityId';
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
import { isEmptyObject } from '../../../utils';

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
  private pool: TedisPool;

  constructor(pool: TedisPool) {
    this.pool = pool;
  }

  async createLeague(name: string, deadline: string) {
    const leagueId = generateEntityId(LEAGUE_PREFIX);

    const league: League = {
      id: leagueId.id,
      name: name,
      deadline: deadline
    };

    const redis = await this.pool.getTedis();

    await redis.hmset(leagueId.key, league);
    return leagueId;
  }

  async getLeague(id: string) {
    const leagueKey = getLeagueKey(id);

    const redis = await this.pool.getTedis();
    return (await redis.hgetall(leagueKey)) as League;
  }

  async getLeagueList() {
    const redis = await this.pool.getTedis();

    return (await redis.keys('league:*')).map(key => getIdFromKey(key));
  }

  async createContestant(name: string) {
    const contestantId = generateEntityId(CONTESTANT_PREFIX);

    const contestant: Contestant = {
      id: contestantId.id,
      name: name
    };

    const redis = await this.pool.getTedis();
    await redis.hmset(contestantId.key, contestant);
    return contestantId;
  }

  async getContestant(id: string) {
    const contestantKey = getContestantKey(id);

    const redis = await this.pool.getTedis();
    return (await redis.hgetall(contestantKey)) as Contestant;
  }

  async addContestantToLeague(leagueId: string, contestantId: string) {
    const leagueKey = getLeagueKey(leagueId);
    const contestantKey = getContestantKey(contestantId);
    const leagueContestantsKey = getLeagueContestantsKey(leagueId);

    let result: LeagueResult;

    const redis = await this.pool.getTedis();

    // League exists?
    if (!(await redis.hexists(leagueKey, 'id'))) {
      result = {
        status: Result.Error,
        error: ErrorResult.LeagueNotFound
      };

      return result;
    }

    // Contestant exists?
    if (!(await redis.hexists(contestantKey, 'id'))) {
      result = {
        status: Result.Error,
        error: ErrorResult.ContestantNotFound
      };

      return result;
    }

    // Deadline expired?
    const deadline = await redis.hget(leagueKey, 'deadline');
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

    const addCount = await redis.sadd(leagueContestantsKey, contestantKey);
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
    const leagueKey = getLeagueKey(leagueId);
    const leagueContestantsKey = getLeagueContestantsKey(leagueId);

    const redis = await this.pool.getTedis();

    // League exists?
    if (!(await redis.hexists(leagueKey, 'id'))) {
      return null;
    }

    const memberKeys = await redis.smembers(leagueContestantsKey);

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

    const redis = await this.pool.getTedis();

    // League exists?
    if (!(await redis.hexists(leagueKey, 'id'))) {
      result = {
        status: Result.Error,
        error: ErrorResult.LeagueNotFound
      };

      return result;
    }

    // Contestant exists?
    if (!(await redis.hexists(contestantKey, 'id'))) {
      result = {
        status: Result.Error,
        error: ErrorResult.ContestantNotFound
      };

      return result;
    }

    // Contestant is member of the league?
    const leagueContestantsKey = getLeagueContestantsKey(leagueId);
    if (!(await redis.sismember(leagueContestantsKey, contestantKey))) {
      result = {
        status: Result.Error,
        error: ErrorResult.ContestantNotAMember
      };

      return result;
    }

    const leagueRankingKey = getLeagueRankingKey(leagueId);

    const newScore = await redis.zincrby(
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

    const redis = await this.pool.getTedis();
    const league = (await redis.hgetall(leagueKey)) as League;

    if (isEmptyObject(league)) {
      return null;
    }

    if (!isDeadlineExpired(league.deadline)) {
      return {
        id: league.id,
        name: league.name,
        ranking: []
      } as LeagueScoreboard;
    }

    const leagueRankingKey = getLeagueRankingKey(leagueId);

    const ranking = await redis.zrevrange(
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
