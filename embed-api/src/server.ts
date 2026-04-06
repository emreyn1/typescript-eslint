import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { config } from "./config.js";
import { apiRoutes } from "./routes/api.js";
import { embedRoutes } from "./routes/embed.js";
import { siteRoutes } from "./routes/site.js";

const app = Fastify({
  logger: {
    level: process.env.NODE_ENV === "production" ? "warn" : "info",
  },
  trustProxy: true,
});

await app.register(cors, {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (config.allowedOrigins.length === 0) return cb(null, true);
    if (config.allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error("CORS blocked"), false);
  },
  methods: ["GET"],
  credentials: false,
});

await app.register(rateLimit, {
  max: 60,
  timeWindow: "1 minute",
  keyGenerator: (req) =>
    (req.headers["cf-connecting-ip"] as string) ||
    (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
    req.ip,
});

app.addHook("onSend", async (_req, reply) => {
  reply.header("X-Content-Type-Options", "nosniff");
  reply.header("X-DNS-Prefetch-Control", "off");
  reply.header("Referrer-Policy", "no-referrer");
  reply.header("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  reply.header("Server", "nginx");
});

await app.register(apiRoutes);
await app.register(embedRoutes);
await app.register(siteRoutes);

try {
  await app.listen({ port: config.port, host: config.host });
  console.log(`Embed API running on http://${config.host}:${config.port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
