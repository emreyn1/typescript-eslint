/**
 * embed-api configuration layer.
 *
 * Every runtime value is read from environment variables with documented
 * defaults — no cost/abuse lever is hard-coded at a call site. The config is
 * intentionally *tolerant*: a missing/blank value falls back to its default and,
 * for `CINEPRO_BASE_URL`, emits a startup warning rather than crashing
 * (Req 8.4). The one strict-in-production check (the insecure `HMAC_SECRET`
 * guard, Req 13.4) is NOT implemented here — it is task 10.5
 * (`src/security/secretGuard.ts`). This module only exposes the inputs that
 * guard needs: `hmacSecret`, `refuseStartOnInsecureSecret`, and `env`.
 *
 * Mirrors the env table in design.md ("Config / env additions").
 */
import "dotenv/config";

/** Lightweight storage backend selector (cheap-VPS default = sqlite). */
export type StorageBackend = "sqlite" | "json" | "postgres";
/** Stream proxy strategy — the dominant cheap-VPS egress lever. */
export type ProxyMode = "proxy" | "playlist-only" | "redirect";
/** Rate-limit counter store. */
export type RateLimitBackend = "memory" | "redis";

// --- env parsing helpers (all default-tolerant) ---------------------------

/** Read a string, falling back to `defaultValue` when unset or blank. */
function envStr(value: string | undefined, defaultValue: string): string {
  if (value === undefined) return defaultValue;
  const trimmed = value.trim();
  return trimmed === "" ? defaultValue : value;
}

/** Read an optional string (no default); blank/unset → empty string. */
function envOpt(value: string | undefined): string {
  return value === undefined ? "" : value;
}

/** Parse a finite number, falling back to `defaultValue` on missing/NaN. */
function envNum(value: string | undefined, defaultValue: number): number {
  if (value === undefined || value.trim() === "") return defaultValue;
  const n = Number(value);
  return Number.isFinite(n) ? n : defaultValue;
}

/** Parse a boolean (true/1/yes, false/0/no), else `defaultValue`. */
function envBool(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) return defaultValue;
  const v = value.trim().toLowerCase();
  if (v === "") return defaultValue;
  if (v === "true" || v === "1" || v === "yes" || v === "on") return true;
  if (v === "false" || v === "0" || v === "no" || v === "off") return false;
  return defaultValue;
}

/** Parse a comma-separated list into a trimmed, non-empty array. */
function envList(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Constrain a value to a known set of literals, else fall back. */
function envEnum<T extends string>(
  value: string | undefined,
  allowed: readonly T[],
  defaultValue: T
): T {
  if (value === undefined) return defaultValue;
  const v = value.trim() as T;
  return allowed.includes(v) ? v : defaultValue;
}

const STORAGE_BACKENDS = ["sqlite", "json", "postgres"] as const;
const PROXY_MODES = ["proxy", "playlist-only", "redirect"] as const;
const RATE_LIMIT_BACKENDS = ["memory", "redis"] as const;

/** Default insecure HMAC secret — the value the prod guard (10.5) refuses. */
export const INSECURE_HMAC_SECRET_DEFAULT = "change-this-secret-in-production";

export const config = {
  // --- Carry-over keys (preserved from the previous dist/config.js) -------
  port: envNum(process.env.PORT, 3001),
  host: envStr(process.env.HOST, "0.0.0.0"),
  urlTtlSeconds: envNum(process.env.URL_TTL_SECONDS, 7200),
  allowedOrigins: envList(process.env.ALLOWED_ORIGINS),
  embedDomain: envStr(process.env.EMBED_DOMAIN, "localhost:3001"),
  siteDomain: envStr(process.env.SITE_DOMAIN, "localhost:3000"),
  bumperAdPath: envStr(process.env.BUMPER_AD_PATH, "./assets/bumper.ts"),
  hlsCachePath: envStr(process.env.HLS_CACHE_PATH, "/tmp/hls-cache"),
  realDebridApiKey: envOpt(process.env.REAL_DEBRID_API_KEY),
  // Telegram (legacy torrent pipeline support)
  tgApiId: envNum(process.env.TG_API_ID, 0),
  tgApiHash: envOpt(process.env.TG_API_HASH),
  tgSession: envOpt(process.env.TG_SESSION),
  tgChannelId: envOpt(process.env.TG_CHANNEL_ID),
  // Cloudflare / R2 (legacy remux upload target)
  cfAccountId: envOpt(process.env.CLOUDFLARE_ACCOUNT_ID),
  cfR2AccessKey: envOpt(process.env.CLOUDFLARE_R2_ACCESS_KEY),
  cfR2SecretKey: envOpt(process.env.CLOUDFLARE_R2_SECRET_KEY),
  cfR2Bucket: envOpt(process.env.CLOUDFLARE_R2_BUCKET),
  cfR2PublicUrl: envOpt(process.env.CLOUDFLARE_R2_PUBLIC_URL),

  // --- CinePro Core / aggregator (Req 8.1, 7.3, 9.1) ----------------------
  cineproBaseUrl: envStr(process.env.CINEPRO_BASE_URL, "http://127.0.0.1:8080"),
  cineproTimeoutMs: envNum(process.env.CINEPRO_TIMEOUT_MS, 10000),
  aggregatorEnabled: envBool(process.env.AGGREGATOR_ENABLED, true),
  torrentPipelineEnabled: envBool(process.env.TORRENT_PIPELINE_ENABLED, false),
  excludeUnhealthyProviders: envBool(process.env.EXCLUDE_UNHEALTHY_PROVIDERS, true),

  // --- Health testing / reporting (Req 2.3, 3.2, 8.2) ---------------------
  healthAuthToken: envOpt(process.env.HEALTH_AUTH_TOKEN),
  healthReportPath: envStr(process.env.HEALTH_REPORT_PATH, "./data/provider-report.json"),
  healthTestTitlesPath: envStr(process.env.HEALTH_TEST_TITLES_PATH, "./test-titles.json"),
  healthCronSchedule: envStr(process.env.HEALTH_CRON_SCHEDULE, "0 4 * * *"),
  tmdbApiKey: envOpt(process.env.TMDB_API_KEY),

  // --- Storage backend (cheap-VPS default = sqlite) -----------------------
  storageBackend: envEnum<StorageBackend>(
    process.env.STORAGE_BACKEND,
    STORAGE_BACKENDS,
    "sqlite"
  ),
  sqlitePath: envStr(process.env.SQLITE_PATH, "./data/embed.db"),
  databaseUrl: envOpt(process.env.DATABASE_URL), // only used when STORAGE_BACKEND=postgres

  // --- Proxy / caching economics (Req 14.x, Resource Footprint §2/§3) -----
  proxyMode: envEnum<ProxyMode>(process.env.PROXY_MODE, PROXY_MODES, "proxy"),
  coreOmssCacheEnabled: envBool(process.env.CORE_OMSS_CACHE_ENABLED, true),
  aggregatorCacheTtlMs: envNum(process.env.AGGREGATOR_CACHE_TTL_MS, 15000),
  providerFanoutConcurrency: envNum(process.env.PROVIDER_FANOUT_CONCURRENCY, 4),
  coreMaxOldSpaceMb: envNum(process.env.CORE_MAX_OLD_SPACE_MB, 512),
  manifestCacheTtlSec: envNum(process.env.MANIFEST_CACHE_TTL_SEC, 30),

  // --- Public embed surface + ads (Req 11.1, 12.x) ------------------------
  publicEmbedEnabled: envBool(process.env.PUBLIC_EMBED_ENABLED, true),
  adBumperEnabled: envBool(process.env.AD_BUMPER_ENABLED, false),
  adVastUrl: envOpt(process.env.AD_VAST_URL),

  // --- Abuse / rate limiting (Req 13.1, 13.6) -----------------------------
  rateLimitBackend: envEnum<RateLimitBackend>(
    process.env.RATE_LIMIT_BACKEND,
    RATE_LIMIT_BACKENDS,
    "memory"
  ),
  rateLimitWindowSec: envNum(process.env.RATE_LIMIT_WINDOW_SEC, 60),
  rateLimitMaxPerIp: envNum(process.env.RATE_LIMIT_MAX_PER_IP, 120),
  rateLimitMaxPerReferer: envNum(process.env.RATE_LIMIT_MAX_PER_REFERER, 600),
  apiRateLimitMaxPerIp: envNum(process.env.API_RATE_LIMIT_MAX_PER_IP, 60),
  redisUrl: envOpt(process.env.REDIS_URL), // only used when RATE_LIMIT_BACKEND=redis

  // --- Bot check (Cloudflare Turnstile, Req 13.2) -------------------------
  turnstileEnabled: envBool(process.env.TURNSTILE_ENABLED, false),
  turnstileSiteKey: envOpt(process.env.TURNSTILE_SITE_KEY),
  turnstileSecret: envOpt(process.env.TURNSTILE_SECRET),

  // --- Stream-token / secret guard inputs (Req 13.3, 13.4) ----------------
  // NOTE: the production insecure-secret *guard behavior* is task 10.5;
  // these three keys are exposed here only so that guard can consume them.
  hmacSecret: envStr(process.env.HMAC_SECRET, INSECURE_HMAC_SECRET_DEFAULT),
  refuseStartOnInsecureSecret: envBool(process.env.REFUSE_START_ON_INSECURE_SECRET, true),

  // --- Hotlink protection (Req 13.5) --------------------------------------
  refererAllowlist: envList(process.env.REFERER_ALLOWLIST), // empty = open embedding

  // --- Runtime environment (Req 13.4) -------------------------------------
  env: envStr(process.env.NODE_ENV, "production"),
} as const;

export type Config = typeof config;

/**
 * Startup validation (Req 8.4): tolerant by design. If `CINEPRO_BASE_URL` is
 * missing/empty, log a WARNING naming the key — the server still starts (the
 * defaulted loopback URL is used). Returns the list of warning messages so the
 * behavior is testable. Does NOT throw and does NOT implement the production
 * secret guard (that is task 10.5).
 */
export function validateConfig(
  env: NodeJS.ProcessEnv = process.env,
  logger: (msg: string) => void = (msg) => console.warn(msg)
): string[] {
  const warnings: string[] = [];

  const rawBaseUrl = env.CINEPRO_BASE_URL;
  if (rawBaseUrl === undefined || rawBaseUrl.trim() === "") {
    const message =
      "[config] WARNING: CINEPRO_BASE_URL is not set; " +
      `falling back to default "${config.cineproBaseUrl}". ` +
      "Set CINEPRO_BASE_URL to your CinePro Core address (Req 8.4).";
    warnings.push(message);
    logger(message);
  }

  return warnings;
}

// Emit startup warnings at load time so operators see them immediately, while
// keeping the server tolerant (no throw). Tests can call validateConfig()
// directly with a stub logger.
validateConfig();
