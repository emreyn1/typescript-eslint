// HTTP routes: /watch (cinex, ad-free), /embed (public, ad-supported),
// /stream proxy, /api/v1/*, /admin health endpoint. Filled in by tasks 13, 15, 8.9, 10.10.

// Task 13.3: the /stream proxy with the stream gate and configurable proxyMode.
export { streamRoutes } from "./stream.js";

// Task 15.1: the ad-free cinex /watch routes (movie + tv).
export { watchRoutes } from "./watch.js";

// Task 15.2: the public, ad-supported, abuse-controlled /embed routes (movie + tv).
export { embedRoutes } from "./embed.js";

// Task 10.10: /api/v1/* protection (per-IP rate limit + fingerprint validation
// before any coin/heartbeat/referral side effect, Req 13.6).
export {
  apiV1Guard,
  apiV1Routes,
  clientIpOf,
  extractFingerprint,
  isValidFingerprint,
} from "./apiV1.js";
export type {
  ApiV1Effects,
  ApiV1GuardOptions,
  ApiV1RoutesOptions,
} from "./apiV1.js";

// Task 8.9: the authed health report endpoint (/admin/providers/report).
export { adminRoutes } from "./admin.js";
