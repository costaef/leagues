import { Tedis } from 'tedis';
import { config } from '../../../config/redisConfig';
import UniqueId from '../../../utils/UniqueId';
import { DateTime } from 'luxon';
import { League } from '../types/League';

const redis = new Tedis(config);

export const addLeagueHash = async (name: string, deadline: DateTime) => {
  const leagueId = new UniqueId('league');

  const league: League = {
    id: leagueId.id,
    name: name,
    deadline: deadline.toISODate()
  };

  await redis.hmset(leagueId.key, league);
  return league;
};
