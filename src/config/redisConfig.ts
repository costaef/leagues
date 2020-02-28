import { Tedis } from 'tedis';

const localConfig = {
  port: 6379,
  host: '127.0.0.1'
};

const remoteConfig = {
  port: parseInt(`${process.env.REDIS_PORT}`),
  host: process.env.REDIS_HOST,
  password: process.env.REDIS_PASSWORD
};

export const redis = new Tedis(
  process.env.NODE_ENV === 'production' ? remoteConfig : localConfig
);
