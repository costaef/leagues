import { Request, Response, NextFunction } from 'express';
import { HTTP400Error, HTTP422Error } from '../utils/httpErrors';
import { isValidDateString } from '../utils/dateUtils';

const isString = (value: any): value is string => {
  return typeof value === 'string';
};

const isNumber = (value: any): value is number => {
  return typeof value === 'number';
};

export const checkLeagueSchema = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  if (!req.body.name || !req.body.deadline) {
    throw new HTTP400Error('Invalid request body.');
  } else if (!isString(req.body.name)) {
    throw new HTTP422Error('The name property must be a string.');
  } else if (!isValidDateString(req.body.deadline)) {
    throw new HTTP422Error('Deadline string is not a valid date.');
  } else {
    next();
  }
};

export const checkContestantSchema = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  if (!req.body.name) {
    throw new HTTP400Error('Invalid request body.');
  } else if (!isString(req.body.name)) {
    throw new HTTP422Error('The name property must be a string.');
  } else {
    next();
  }
};

export const checkUpdateLeaguePointsSchema = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  if (!req.body.pointsToAdd) {
    throw new HTTP400Error('Invalid request body.');
  } else if (!isNumber(req.body.pointsToAdd)) {
    throw new HTTP422Error('The pointsToAdd property must be a number.');
  } else {
    next();
  }
};
