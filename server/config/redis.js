import Redis from "ioredis";
import "dotenv/config";

const redis = new Redis({
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_HOST,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  db: 0,
});

export default redis;
