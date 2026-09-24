/// <reference types="astro/client" />

interface Env {
  DB: D1Database;
}

declare module "cloudflare:workers" {
  export const env: Env;
}