import { Tedis } from 'tedis';

const config = {
  port: parseInt(`${process.env.REDIS_PORT}`),
  host: process.env.REDIS_HOST
};

const configWithPassword = {
  port: parseInt(`${process.env.REDIS_PORT}`),
  host: process.env.REDIS_HOST,
  password: process.env.REDIS_PASSWORD
};

export const redis = new Tedis(
  process.env.NODE_ENV === 'production' ? configWithPassword : config
);
