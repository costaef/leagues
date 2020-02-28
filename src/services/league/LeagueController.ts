import {
  HTTP404Error,
  HttpClientError,
  HTTP400Error
} from '../../utils/httpErrors';
import { LeagueStore } from './store/LeagueStore';
import { Result } from './types';

const isEmptyObject = (obj: object) => Object.keys(obj).length === 0;
const isHTTPClientError = (error: Error) => error instanceof HttpClientError;

export class LeagueController {
  private leagueStore: LeagueStore;

  constructor(store: LeagueStore) {
    this.leagueStore = store;
  }

  async createLeague(name: string, deadline: string) {
    try {
      return await this.leagueStore.createLeague(name, deadline);
    } catch (error) {
      throw new Error('An error occured creating a league.');
    }
  }

  async getLeagueInfo(id: string) {
    try {
      const league = await this.leagueStore.getLeague(id);

      if (isEmptyObject(league)) {
        throw new HTTP404Error('League ID not found.');
      } else {
        return league;
      }
    } catch (error) {
      if (error instanceof HttpClientError) {
        throw error;
      } else {
        throw new Error('Unable to retrieve league info.');
      }
    }
  }

  async createContestant(name: string) {
    try {
      return await this.leagueStore.createContestant(name);
    } catch (error) {
      throw new Error('An error occured creating a contestant.');
    }
  }

  async getContestantInfo(id: string) {
    try {
      const contestant = await this.leagueStore.getContestant(id);

      if (isEmptyObject(contestant)) {
        throw new HTTP404Error('Contestant ID not found.');
      } else {
        return contestant;
      }
    } catch (error) {
      if (isHTTPClientError(error)) {
        throw error;
      } else {
        throw new Error('Unable to retrieve contestant info.');
      }
    }
  }

  async addContestantToLeague(leagueId: string, contestantId: string) {
    try {
      const result = await this.leagueStore.addContestantToLeague(
        leagueId,
        contestantId
      );

      if (result.status === Result.Error) {
        throw new HTTP400Error(result.error);
      }

      return result;
    } catch (error) {
      if (isHTTPClientError(error)) {
        throw error;
      } else {
        throw new Error('Unable to add contestant to league.');
      }
    }
  }

  async getLeagueContestants(leagueId: string) {
    try {
      const contestants = await this.leagueStore.getLeagueMembers(leagueId);
      return contestants.map(contestant => contestant.id);
    } catch (error) {
      throw new Error('Unable to retrieve league members.');
    }
  }

  async updateContestantScore(
    leagueId: string,
    contestantId: string,
    pointsToAdd: number
  ) {
    try {
      const result = await this.leagueStore.updateContestantPoints(
        leagueId,
        contestantId,
        pointsToAdd
      );

      if (result.status === Result.Error) {
        throw new HTTP400Error(result.error);
      }

      return result;
    } catch (error) {
      if (isHTTPClientError(error)) {
        throw error;
      } else {
        throw new Error('Unable to increment contestant points.');
      }
    }
  }

  async getLeagueRanking(leagueId: string) {
    try {
      return await this.leagueStore.getLeagueScoreboard(leagueId);
    } catch (error) {
      throw new Error('Unable to retrieve league scoreboard.');
    }
  }
}
