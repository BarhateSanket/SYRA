import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;

let redisClient;

if (!redisUrl) {
  console.warn("❌ No REDIS_URL found — Redis is disabled");
  
  // Return a dummy object so app doesn't break
  redisClient = {
    connect: async () => {},
    get: async () => null,
    set: async () => {},
    exists: async () => false,
  };
} else {
  redisClient = createClient({
    url: redisUrl,
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 5) {
          console.log("Redis: Retry limit exceeded");
          return new Error("Retry limit exceeded");
        }
        return Math.min(retries * 200, 2000);
      },
    },
  });

  redisClient.on("error", (err) => console.error("Redis Client Error:", err));
  
  redisClient.connect()
    .then(() => console.log("✅ Connected to Redis on Render"))
    .catch((err) => console.error("❌ Redis Connection Failed:", err));
}

export default redisClient;
