// @ts-check
import { defineConfig, logHandlers } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  adapter: cloudflare({
  }),
  logger: logHandlers.json({
    level: "warn"
  })
});