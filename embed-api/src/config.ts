import "dotenv/config";

export const config = {
  port: Number(process.env.PORT) || 3001,
  host: process.env.HOST || "0.0.0.0",

  hmacSecret: process.env.HMAC_SECRET || "change-this-secret-in-production",
  urlTtlSeconds: Number(process.env.URL_TTL_SECONDS) || 7200,

  allowedOrigins: (process.env.ALLOWED_ORIGINS || "").split(",").filter(Boolean),
  embedDomain: process.env.EMBED_DOMAIN || "localhost:3001",
  siteDomain: process.env.SITE_DOMAIN || "localhost:3000",

  turnstileSiteKey: process.env.TURNSTILE_SITE_KEY || "",
  turnstileSecret: process.env.TURNSTILE_SECRET || "",

  adVastUrl: process.env.AD_VAST_URL || "",
  adBumperEnabled: process.env.AD_BUMPER_ENABLED === "true",
  bumperAdPath: process.env.BUMPER_AD_PATH || "./assets/bumper.ts",

  databaseUrl:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/streamvault",

  tgApiId: Number(process.env.TG_API_ID) || 0,
  tgApiHash: process.env.TG_API_HASH || "",
  tgSession: process.env.TG_SESSION || "",
  tgChannelId: process.env.TG_CHANNEL_ID || "",

  cfAccountId: process.env.CLOUDFLARE_ACCOUNT_ID || "",
  cfR2AccessKey: process.env.CLOUDFLARE_R2_ACCESS_KEY || "",
  cfR2SecretKey: process.env.CLOUDFLARE_R2_SECRET_KEY || "",
  cfR2Bucket: process.env.CLOUDFLARE_R2_BUCKET || "",
  cfR2PublicUrl: process.env.CLOUDFLARE_R2_PUBLIC_URL || "",

  hlsCachePath: process.env.HLS_CACHE_PATH || "/tmp/hls-cache",

  // Torrent pipeline (YTS + EZTV + isteğe bağlı Real-Debrid)
  torrentPipelineEnabled: process.env.TORRENT_PIPELINE_ENABLED === "true",
  realDebridApiKey: process.env.REAL_DEBRID_API_KEY || "",
  tmdbApiKey: process.env.TMDB_API_KEY || "",
} as const;
