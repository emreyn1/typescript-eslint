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
} as const;
