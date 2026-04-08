import { readFile, access } from "node:fs/promises";
import { config } from "../config.js";

/**
 * Inject pre-roll bumper ad segments into an HLS playlist.
 *
 * The bumper is a pre-encoded 3-5 second video segment stored alongside
 * the content segments. It uses the same domain, same URL pattern, same
 * file extension (.jpg), and same Content-Type (video/MP2T) — making it
 * indistinguishable from real content for any ad blocker.
 */
export async function injectBumperAd(
  playlistContent: string,
  bumperSegmentUrl: string,
  bumperDuration: number = 5,
): Promise<string> {
  if (!config.adBumperEnabled) return playlistContent;

  const lines = playlistContent.split("\n");
  const result: string[] = [];
  let injected = false;

  for (const line of lines) {
    result.push(line);

    // Inject after #EXT-X-TARGETDURATION or the first #EXTINF
    if (!injected && (line.startsWith("#EXTINF:") || line.startsWith("#EXT-X-TARGETDURATION"))) {
      if (line.startsWith("#EXT-X-TARGETDURATION")) {
        result.push(`#EXTINF:${bumperDuration.toFixed(1)},`);
        result.push(bumperSegmentUrl);
        injected = true;
      }
    }
  }

  if (!injected) {
    // Fallback: inject at the beginning of segments
    const headerEnd = lines.findIndex((l) => l.startsWith("#EXTINF:"));
    if (headerEnd >= 0) {
      result.splice(headerEnd, 0, `#EXTINF:${bumperDuration.toFixed(1)},`, bumperSegmentUrl);
    }
  }

  return result.join("\n");
}

/**
 * Build a bumper segment URL that matches the content URL pattern.
 * Uses the same domain, same /hls/ prefix, same .jpg extension.
 */
export function getBumperSegmentUrl(r2Prefix: string): string {
  return `/hls/bumper/${r2Prefix}/ad_pre.jpg`;
}

/**
 * Check if bumper ad assets are available.
 */
export async function isBumperAvailable(): Promise<boolean> {
  if (!config.adBumperEnabled) return false;
  try {
    await access(config.bumperAdPath);
    return true;
  } catch {
    return false;
  }
}
