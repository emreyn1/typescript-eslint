import { createHmac } from "node:crypto";
import { config } from "../config.js";

export function generateSignedUrl(
  fileId: string,
  clientIp: string,
): { path: string; expires: number } {
  const expires = Math.floor(Date.now() / 1000) + config.urlTtlSeconds;
  const payload = `${fileId}:${clientIp}:${expires}`;
  const hmac = createHmac("sha256", config.hmacSecret)
    .update(payload)
    .digest("hex")
    .slice(0, 16);

  const fakeExts = [".jpg", ".css", ".woff2", ".png", ".js"];
  const ext = fakeExts[Math.floor(Math.random() * fakeExts.length)];

  return {
    path: `/cdn/${hmac}/${fileId}${ext}?e=${expires}`,
    expires,
  };
}

export function verifySignedUrl(
  hmacToken: string,
  fileId: string,
  clientIp: string,
  expires: number,
): boolean {
  if (expires < Math.floor(Date.now() / 1000)) return false;

  const payload = `${fileId}:${clientIp}:${expires}`;
  const expected = createHmac("sha256", config.hmacSecret)
    .update(payload)
    .digest("hex")
    .slice(0, 16);

  return hmacToken === expected;
}

export function generateSessionToken(clientIp: string, ua: string): string {
  const payload = `${clientIp}:${ua}:${Math.floor(Date.now() / 3600000)}`;
  return createHmac("sha256", config.hmacSecret)
    .update(payload)
    .digest("hex");
}
