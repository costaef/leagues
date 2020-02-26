import { DateTime } from 'luxon';

export const isValidDateString = (ISODateString: string) => {
  const date = DateTime.fromISO(ISODateString);

  return date.isValid;
};
