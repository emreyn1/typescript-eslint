import { spawn } from "node:child_process";
import { mkdir, readdir, rename, readFile } from "node:fs/promises";
import { join, basename, extname } from "node:path";
import { createWriteStream } from "node:fs";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { config } from "../config.js";

export interface RemuxResult {
  playlistPath: string;
  segmentPaths: string[];
  duration: number;
}

/**
 * Remux MP4 to HLS using ffmpeg -c copy (no re-encoding).
 * Segments get .jpg extensions to leverage Cloudflare free-tier caching.
 */
export async function remuxToHls(
  inputPath: string,
  outputDir: string,
): Promise<RemuxResult> {
  await mkdir(outputDir, { recursive: true });

  const rawPlaylist = join(outputDir, "index.m3u8");
  const segmentPattern = join(outputDir, "seg_%04d.ts");

  await new Promise<void>((resolve, reject) => {
    const proc = spawn("ffmpeg", [
      "-i", inputPath,
      "-c", "copy",
      "-start_number", "0",
      "-hls_time", "10",
      "-hls_list_size", "0",
      "-hls_segment_filename", segmentPattern,
      "-f", "hls",
      rawPlaylist,
    ]);

    let stderr = "";
    proc.stderr.on("data", (d) => { stderr += d; });
    proc.on("close", (code) => {
      if (code !== 0) reject(new Error(`ffmpeg exited ${code}: ${stderr}`));
      else resolve();
    });
  });

  const files = await readdir(outputDir);
  const segmentPaths: string[] = [];

  for (const file of files) {
    if (file.endsWith(".ts")) {
      const newName = file.replace(".ts", ".jpg");
      await rename(join(outputDir, file), join(outputDir, newName));
      segmentPaths.push(join(outputDir, newName));
    }
  }

  let playlistContent = await readFile(rawPlaylist, "utf-8");
  playlistContent = playlistContent.replace(/\.ts/g, ".jpg");
  const { writeFile } = await import("node:fs/promises");
  await writeFile(rawPlaylist, playlistContent);

  const duration = parseDurationFromPlaylist(playlistContent);

  return { playlistPath: rawPlaylist, segmentPaths, duration };
}

/**
 * Remux directly from an HTTP URL (e.g. Real-Debrid direct link) to HLS.
 * ffmpeg reads straight from URL — no local download needed.
 */
export async function remuxUrlToHls(
  url: string,
  outputDir: string,
): Promise<RemuxResult> {
  await mkdir(outputDir, { recursive: true });

  const rawPlaylist = join(outputDir, "index.m3u8");
  const segmentPattern = join(outputDir, "seg_%04d.ts");

  await new Promise<void>((resolve, reject) => {
    const proc = spawn("ffmpeg", [
      "-user_agent", "Mozilla/5.0",
      "-i", url,
      "-c", "copy",
      "-start_number", "0",
      "-hls_time", "10",
      "-hls_list_size", "0",
      "-hls_segment_filename", segmentPattern,
      "-f", "hls",
      rawPlaylist,
    ]);

    let stderr = "";
    proc.stderr.on("data", (d) => { stderr += d; });
    proc.on("close", (code) => {
      if (code !== 0) reject(new Error(`ffmpeg exited ${code}: ${stderr.slice(-500)}`));
      else resolve();
    });
  });

  const files = await readdir(outputDir);
  const segmentPaths: string[] = [];

  for (const file of files) {
    if (file.endsWith(".ts")) {
      const newName = file.replace(".ts", ".jpg");
      await rename(join(outputDir, file), join(outputDir, newName));
      segmentPaths.push(join(outputDir, newName));
    }
  }

  let playlistContent = await readFile(rawPlaylist, "utf-8");
  playlistContent = playlistContent.replace(/\.ts/g, ".jpg");
  const { writeFile } = await import("node:fs/promises");
  await writeFile(rawPlaylist, playlistContent);

  const duration = parseDurationFromPlaylist(playlistContent);
  return { playlistPath: rawPlaylist, segmentPaths, duration };
}

/**
 * Remux from an in-memory buffer (e.g. Telegram download) to HLS.
 * Writes buffer to temp file first, then remuxes.
 */
export async function remuxBufferToHls(
  buffer: Buffer,
  outputDir: string,
): Promise<RemuxResult> {
  const tmpInput = join(config.hlsCachePath, `input_${Date.now()}.mp4`);
  await mkdir(config.hlsCachePath, { recursive: true });

  const ws = createWriteStream(tmpInput);
  await pipeline(Readable.from(buffer), ws);

  try {
    return await remuxToHls(tmpInput, outputDir);
  } finally {
    const { unlink } = await import("node:fs/promises");
    await unlink(tmpInput).catch(() => {});
  }
}

function parseDurationFromPlaylist(content: string): number {
  let total = 0;
  const lines = content.split("\n");
  for (const line of lines) {
    if (line.startsWith("#EXTINF:")) {
      const dur = parseFloat(line.split(":")[1]);
      if (!isNaN(dur)) total += dur;
    }
  }
  return Math.round(total);
}
