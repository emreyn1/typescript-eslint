import { getCachedContent, upsertContentCache, pool } from "../db/index.js";
import { downloadTelegramFile } from "../telegram/client.js";
import { remuxBufferToHls, remuxUrlToHls } from "./remux.js";
import {
  resolveMovieTorrent,
  resolveTvTorrent,
} from "./torrent.js";
import { join } from "node:path";
import { config } from "../config.js";
import { mkdir } from "node:fs/promises";

export interface ContentInfo {
  tmdbId: number;
  type: "movie" | "tv";
  season?: number;
  episode?: number;
}

export interface CachedContentResult {
  hlsUrl: string;
  r2Prefix: string;
  duration: number;
}

/**
 * Ana resolve fonksiyonu. Öncelik sırası:
 *   1. HLS zaten cache'de → direkt dön
 *   2. Telegram'da dosya kayıtlı → indir + remux
 *   3. YTS/EZTV'den torrent bul → Real-Debrid (varsa) → remux
 *   4. Bulunamadı → null
 */
export async function resolveContent(
  info: ContentInfo,
): Promise<CachedContentResult | null> {
  // 1. Cache kontrolü
  const cached = await getCachedContent(
    info.tmdbId,
    info.type,
    info.season,
    info.episode,
  );

  if (cached?.hls_path) {
    return {
      hlsUrl: cached.hls_path,
      r2Prefix: buildR2Prefix(info),
      duration: cached.duration || 0,
    };
  }

  // 2. Telegram kaydı var mı?
  if (cached?.telegram_file_id) {
    return processFromTelegram(info, cached.telegram_file_id);
  }

  // 3. Torrent pipeline (YTS / EZTV → isteğe bağlı Real-Debrid → ffmpeg)
  return processFromTorrent(info);
}

async function processFromTelegram(
  info: ContentInfo,
  telegramFileId: string,
): Promise<CachedContentResult> {
  const r2Prefix = buildR2Prefix(info);
  const outputDir = join(config.hlsCachePath, r2Prefix);
  await mkdir(outputDir, { recursive: true });

  const buffer = await downloadTelegramFile(telegramFileId);
  const result = await remuxBufferToHls(buffer, outputDir);
  const hlsUrl = await saveAndCache(info, result, r2Prefix, {
    fileSize: buffer.length,
    telegramFileId,
  });

  return { hlsUrl, r2Prefix, duration: result.duration };
}

async function processFromTorrent(
  info: ContentInfo,
): Promise<CachedContentResult | null> {
  // Torrent pipeline'ı aktif mi?
  if (process.env.TORRENT_PIPELINE_ENABLED !== "true") return null;

  const r2Prefix = buildR2Prefix(info);
  const outputDir = join(config.hlsCachePath, r2Prefix);

  let resolved;
  if (info.type === "movie") {
    resolved = await resolveMovieTorrent(info.tmdbId);
  } else {
    resolved = await resolveTvTorrent(
      info.tmdbId,
      info.season ?? 1,
      info.episode ?? 1,
    );
  }

  if (!resolved) return null;

  // magnet ise Real-Debrid olmadan şu an işleyemeyiz
  if (resolved.via === "magnet") return null;

  // Direkt HTTP URL → ffmpeg → HLS
  await mkdir(outputDir, { recursive: true });
  const result = await remuxUrlToHls(resolved.directUrl, outputDir);
  const hlsUrl = await saveAndCache(info, result, r2Prefix, {
    fileSize: result.duration * 150_000, // tahmini boyut
  });

  return { hlsUrl, r2Prefix, duration: result.duration };
}

async function saveAndCache(
  info: ContentInfo,
  result: { playlistPath: string; segmentPaths: string[]; duration: number },
  r2Prefix: string,
  extra: { fileSize?: number; telegramFileId?: string },
): Promise<string> {
  // R2 varsa yükle, yoksa lokal path'i döndür
  let hlsUrl: string;
  if (config.cfR2Bucket && config.cfR2AccessKey) {
    const { uploadHlsToR2 } = await import("../cdn/cloudflare.js");
    hlsUrl = await uploadHlsToR2(
      result.playlistPath,
      result.segmentPaths,
      r2Prefix,
    );
  } else {
    // R2 yok: lokal HTTP üzerinden serve et
    hlsUrl = `/hls/local/${r2Prefix}/index.m3u8`;
  }

  await upsertContentCache({
    tmdbId: info.tmdbId,
    contentType: info.type,
    season: info.season,
    episode: info.episode,
    telegramFileId: extra.telegramFileId,
    hlsPath: hlsUrl,
    fileSize: extra.fileSize,
    duration: result.duration,
  });

  return hlsUrl;
}

export function buildR2Prefix(info: ContentInfo): string {
  if (info.type === "tv") {
    return `tv/${info.tmdbId}/s${info.season}e${info.episode}`;
  }
  return `movie/${info.tmdbId}`;
}

export async function registerTelegramContent(
  info: ContentInfo,
  telegramFileId: string,
) {
  await upsertContentCache({
    tmdbId: info.tmdbId,
    contentType: info.type,
    season: info.season,
    episode: info.episode,
    telegramFileId,
  });
}

export async function getCacheStats() {
  const result = await pool.query(`
    SELECT
      COUNT(*) as total,
      COUNT(CASE WHEN hls_path IS NOT NULL THEN 1 END) as cached,
      COUNT(CASE WHEN telegram_file_id IS NOT NULL THEN 1 END) as registered,
      COALESCE(SUM(file_size), 0) as total_bytes
    FROM content_cache
  `);
  return result.rows[0];
}
