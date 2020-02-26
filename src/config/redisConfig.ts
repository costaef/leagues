export const config = {
  port: parseInt(`${process.env.REDIS_PORT}`),
  host: process.env.REDIS_HOST
};

export const configWithPassword = {
  port: parseInt(`${process.env.REDIS_PORT}`),
  host: process.env.REDIS_HOST,
  password: process.env.REDIS_PASSWORD
};
