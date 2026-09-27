/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types" />

import type { TokenBudle } from "./lib/jwt";
import type { User } from "./models/common";

declare global {
  namespace App {
    interface Locals {
      currentUser: {
        user: User;
        tokens: TokenBudle | null;
      };
    }
  }
}