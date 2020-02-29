import { Request, Response, NextFunction } from 'express';
import { LeagueController } from './LeagueController';
import {
  checkLeagueSchema,
  checkContestantSchema,
  checkUpdateLeaguePointsSchema
} from '../../middleware/check';
import { tedisPool } from '../../config/redisConfig';
import { LeagueStoreRedis } from './store/LeagueStoreRedis';

const leagueStore = new LeagueStoreRedis(tedisPool);
const leagueController = new LeagueController(leagueStore);

export default [
  {
    path: '/api/v1/league',
    method: 'post',
    handler: [
      checkLeagueSchema,
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          const leagueId = await leagueController.createLeague(
            req.body.name,
            req.body.deadline
          );

          res
            .status(201)
            .json({ id: leagueId.id, url: `/api/v1/league/${leagueId.id}` });
        } catch (error) {
          next(error);
        }
      }
    ]
  },
  {
    path: '/api/v1/league',
    method: 'get',
    handler: [
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          const leagues = await leagueController.getLeagues();
          res.status(200).json({ leagues });
        } catch (error) {
          next(error);
        }
      }
    ]
  },
  {
    path: '/api/v1/league/:leagueId',
    method: 'get',
    handler: [
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          const leagueId = req.params.leagueId;

          const league = await leagueController.getLeagueInfo(leagueId);

          res.status(200).json(league);
        } catch (error) {
          next(error);
        }
      }
    ]
  },
  {
    path: '/api/v1/contestant',
    method: 'post',
    handler: [
      checkContestantSchema,
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          const contestantId = await leagueController.createContestant(
            req.body.name
          );

          res.status(201).json({
            id: contestantId.id,
            url: `/api/v1/contestant/${contestantId.id}`
          });
        } catch (error) {
          next(error);
        }
      }
    ]
  },
  {
    path: '/api/v1/contestant/:contestantId',
    method: 'get',
    handler: [
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          const contestantId = req.params.contestantId;

          const contestant = await leagueController.getContestantInfo(
            contestantId
          );

          res.status(200).json(contestant);
        } catch (error) {
          next(error);
        }
      }
    ]
  },
  {
    path: '/api/v1/league/:leagueId/contestant/:contestantId',
    method: 'post',
    handler: [
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          const leagueId = req.params.leagueId;
          const contestantId = req.params.contestantId;

          await leagueController.addContestantToLeague(leagueId, contestantId);

          res.status(200).send();
        } catch (error) {
          next(error);
        }
      }
    ]
  },
  {
    path: '/api/v1/league/:leagueId/contestants',
    method: 'get',
    handler: [
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          const leagueId = req.params.leagueId;

          const contestants = await leagueController.getLeagueContestants(
            leagueId
          );

          res.status(200).json({ contestants });
        } catch (error) {
          next(error);
        }
      }
    ]
  },
  {
    path: '/api/v1/league/:leagueId/contestant/:contestantId',
    method: 'put',
    handler: [
      checkUpdateLeaguePointsSchema,
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          const leagueId = req.params.leagueId;
          const contestantId = req.params.contestantId;

          const pointsToAdd = req.body.pointsToAdd;

          await leagueController.updateContestantScore(
            leagueId,
            contestantId,
            pointsToAdd
          );

          res.status(200).send();
        } catch (error) {
          next(error);
        }
      }
    ]
  },
  {
    path: '/api/v1/league/:leagueId/ranking',
    method: 'get',
    handler: [
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          const leagueId = req.params.leagueId;

          const scoreboard = await leagueController.getLeagueRanking(leagueId);

          if (scoreboard.ranking.length === 0) {
            res.status(200).json({ message: 'League ranking not available.' });
          }

          res.status(200).json(scoreboard);
        } catch (error) {
          next(error);
        }
      }
    ]
  }
];
