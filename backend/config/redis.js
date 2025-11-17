import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;

let redisClient;

if (!redisUrl) {
  console.warn("🚫 REDIS_URL not found — Redis disabled");
  redisClient = {
    connect: async () => {},
    get: async () => null,
    set: async () => {},
    del: async () => {},
    ping: async () => "disabled",
    on: () => {},
  };
} else {
  redisClient = createClient({
    url: redisUrl,
    socket: {
      tls: true, // VERY IMPORTANT FOR UPSTASH
      rejectUnauthorized: false,
    },
  });

  redisClient.on("error", (err) => {
    console.error("❌ Redis Client Error:", err);
  });

  redisClient.on("ready", () => {
    console.log("✅ Connected to Upstash Redis");
  });

  (async () => {
    try {
      await redisClient.connect();
    } catch (err) {
      console.error("❌ Redis connection failed:", err);
    }
  })();
}

export default redisClient;

// END OF FILE