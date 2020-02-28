import { TedisPool } from 'tedis';

const localConfig = {
  port: 6379,
  host: '127.0.0.1'
};

const remoteConfig = {
  port: parseInt(`${process.env.REDIS_PORT}`),
  host: process.env.REDIS_HOST,
  password: process.env.REDIS_PASSWORD
};

export const tedisPool = new TedisPool(
  process.env.NODE_ENV === 'production' ? remoteConfig : localConfig
);
