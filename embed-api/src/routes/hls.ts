import type { FastifyInstance } from "fastify";
import { createHmac } from "node:crypto";
import { config } from "../config.js";

export async function hlsRoutes(app: FastifyInstance) {
  /**
   * Serve HLS segments with HMAC validation.
   * URL pattern: /hls/:token/:prefix(..)/:segment.jpg?e=expires
   *
   * Validates the HMAC token against the client IP and expiry,
   * then proxies to R2 or serves from local cache.
   */
  app.get<{
    Params: { "*": string };
    Querystring: { e?: string };
  }>("/hls/*", async (req, reply) => {
    const path = (req.params as any)["*"] as string;
    const expires = Number(req.query.e) || 0;

    // Parse: first segment is the HMAC token, rest is the R2 key
    const parts = path.split("/");
    if (parts.length < 3) {
      return reply.status(400).send("Invalid path");
    }

    const token = parts[0];
    const r2Key = parts.slice(1).join("/");

    // Special case: bumper ads bypass HMAC validation
    if (token === "bumper") {
      return proxyFromR2(r2Key, reply);
    }

    const clientIp =
      (req.headers["cf-connecting-ip"] as string) ||
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
      req.ip;

    if (!verifySegmentToken(token, r2Key, clientIp, expires)) {
      return reply.status(403).send("Invalid or expired token");
    }

    return proxyFromR2(r2Key, reply);
  });
}

function verifySegmentToken(
  token: string,
  r2Key: string,
  clientIp: string,
  expires: number,
): boolean {
  if (expires < Math.floor(Date.now() / 1000)) return false;

  const payload = `${r2Key}:${clientIp}:${expires}`;
  const expected = createHmac("sha256", config.hmacSecret)
    .update(payload)
    .digest("hex")
    .slice(0, 16);

  return token === expected;
}

async function proxyFromR2(r2Key: string, reply: any) {
  const r2Url = config.cfR2PublicUrl
    ? `${config.cfR2PublicUrl}/${r2Key}`
    : `https://${config.cfAccountId}.r2.cloudflarestorage.com/${config.cfR2Bucket}/${r2Key}`;

  try {
    const resp = await fetch(r2Url);
    if (!resp.ok) {
      return reply.status(resp.status).send("Segment not found");
    }

    const isPlaylist = r2Key.endsWith(".m3u8");
    const contentType = isPlaylist
      ? "application/vnd.apple.mpegurl"
      : "video/MP2T";

    reply
      .header("Content-Type", contentType)
      .header("Access-Control-Allow-Origin", "*")
      .header(
        "Cache-Control",
        isPlaylist
          ? "public, max-age=3600"
          : "public, max-age=31536000, immutable",
      );

    const body = Buffer.from(await resp.arrayBuffer());
    return reply.send(body);
  } catch {
    return reply.status(502).send("Upstream error");
  }
}
