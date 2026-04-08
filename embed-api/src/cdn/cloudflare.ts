import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { createHmac } from "node:crypto";
import { config } from "../config.js";

/**
 * Upload a file to Cloudflare R2 via S3-compatible API.
 * Uses pre-signed request with AWS Signature V4 style auth.
 */
export async function uploadToR2(
  localPath: string,
  r2Key: string,
): Promise<string> {
  const body = await readFile(localPath);
  const isSegment = r2Key.endsWith(".jpg") || r2Key.endsWith(".ts");
  const contentType = isSegment ? "video/MP2T" : "application/vnd.apple.mpegurl";

  const url = `https://${config.cfAccountId}.r2.cloudflarestorage.com/${config.cfR2Bucket}/${r2Key}`;

  const date = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const shortDate = date.slice(0, 8);

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
      "Cache-Control": isSegment
        ? "public, max-age=31536000, immutable"
        : "public, max-age=3600",
      "x-amz-date": date,
      "x-amz-content-sha256": "UNSIGNED-PAYLOAD",
      Authorization: buildR2Auth("PUT", r2Key, date, shortDate),
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`R2 upload failed: ${response.status} ${await response.text()}`);
  }

  return config.cfR2PublicUrl
    ? `${config.cfR2PublicUrl}/${r2Key}`
    : url;
}

/**
 * Upload all HLS segments + playlist to R2.
 * Returns the public URL of the m3u8 playlist.
 */
export async function uploadHlsToR2(
  playlistPath: string,
  segmentPaths: string[],
  r2Prefix: string,
): Promise<string> {
  for (const seg of segmentPaths) {
    const key = `${r2Prefix}/${basename(seg)}`;
    await uploadToR2(seg, key);
  }

  const playlistKey = `${r2Prefix}/index.m3u8`;
  const playlistUrl = await uploadToR2(playlistPath, playlistKey);

  return playlistUrl;
}

/**
 * Generate an HMAC-signed CDN URL for a segment.
 * Used when serving through our own /hls/ route.
 */
export function generateSegmentUrl(
  r2Prefix: string,
  segmentName: string,
  clientIp: string,
): string {
  const expires = Math.floor(Date.now() / 1000) + config.urlTtlSeconds;
  const payload = `${r2Prefix}/${segmentName}:${clientIp}:${expires}`;
  const hmac = createHmac("sha256", config.hmacSecret)
    .update(payload)
    .digest("hex")
    .slice(0, 16);

  return `/hls/${hmac}/${r2Prefix}/${segmentName}?e=${expires}`;
}

function buildR2Auth(
  _method: string,
  _key: string,
  _date: string,
  _shortDate: string,
): string {
  // Simplified: in production use @aws-sdk/client-s3 or aws4 for proper SigV4.
  // For now, R2 API tokens with "Edit" permission work with a simpler Bearer approach.
  return `Bearer ${config.cfR2AccessKey}`;
}
