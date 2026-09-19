import { Redis } from "@upstash/redis/cloudflare";

export const REDIS = Redis.fromEnv();