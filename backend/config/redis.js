import { createClient } from 'redis';

// Redis connection URL (best way for Redis v4)
const redisUrl =
  process.env.REDIS_URL ||
  `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`;

const redisClient = createClient({
  url: redisUrl,
  password: process.env.REDIS_PASSWORD || undefined,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error("Redis reconnect attempts exceeded");
        return new Error("Retry attempts exceeded");
      }
      return Math.min(retries * 100, 3000);
    }
  }
});

// Event listeners
redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

redisClient.on("connect", () => {
  console.log("Connected to Redis");
});

redisClient.on("ready", () => {
  console.log("Redis client ready");
});

redisClient.on("end", () => {
  console.log("Redis connection ended");
});

// Attempt connection
redisClient.connect().catch((err) => {
  console.error("Redis connection failed:", err.message);
});

export default redisClient;
