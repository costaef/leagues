import { DateTime } from 'luxon';

export const isValidDateString = (ISODateString: string) => {
  const date = DateTime.fromISO(ISODateString);

  return date.isValid;
};

export const isDeadlineExpired = (DeadlineISODateString: string) => {
  if (!isValidDateString(DeadlineISODateString)) {
    throw new Error('Invalid date');
  }

  const now = DateTime.local();
  const deadline = DateTime.fromISO(DeadlineISODateString);

  return now.endOf('day') > deadline.endOf('day');
};
