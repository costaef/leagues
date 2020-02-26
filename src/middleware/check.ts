import { Request, Response, NextFunction } from 'express';
import { HTTP400Error, HTTP422Error } from '../utils/httpErrors';
import { isValidDateString } from '../utils/dateUtils';

const isString = (value: any): value is string => {
  return typeof value === 'string';
};

export const checkLeagueSchema = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.body.name || !req.body.deadline) {
    throw new HTTP400Error('A name and deadline must be specified.');
  } else if (!isString(req.body.name)) {
    throw new HTTP422Error('The name property must be a string.');
  } else if (!isValidDateString(req.body.deadline)) {
    throw new HTTP422Error('Deadline string is not a valid date.');
  } else {
    next();
  }
};
