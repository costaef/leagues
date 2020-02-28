export enum Result {
  Success = 'Success',
  Error = 'Error'
}

export enum ErrorResult {
  LeagueNotFound = 'League not found.',
  ContestantNotFound = 'Contestant not found.',
  ContestantAlreadyMember = 'Contestant is already in the league.',
  ContestantNotAMember = 'Contestant is not a member of this league.',
  DeadlineExpired = 'Deadline expired. League entry not allowed.',
  UnknownError = 'Unknown error.'
}

export type LeagueResult = {
  status: Result;
  error?: ErrorResult;
};
