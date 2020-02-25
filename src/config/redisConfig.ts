const port: number = parseInt(process.env.REDIS_PORT as string);
const host: string = process.env.REDIS_HOST as string;

export default {
  port,
  host
};
