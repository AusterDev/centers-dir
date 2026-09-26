import { Redis } from "@upstash/redis/cloudflare";

export const REDIS = Redis.fromEnv({
    UPSTASH_REDIS_REST_TOKEN: import.meta.env.UPSTASH_REDIS_REST_TOKEN,
    UPSTASH_REDIS_REST_URL: import.meta.env.UPSTASH_REDIS_REST_URL,
});