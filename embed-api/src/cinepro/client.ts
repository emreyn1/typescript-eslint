import { config } from "../config.js";

export interface CineProSource {
  url: string;
  type: "hls" | "mp4" | "mkv" | "dash" | "webm";
  quality: string;
  provider: { id: string; name: string };
  audioTracks?: { language: string; label: string }[];
}

export interface CineProSubtitle {
  url: string;
  format: string;
  label: string;
}

export interface CineProResponse {
  responseId: string;
  expiresAt: string;
  sources: CineProSource[];
  subtitles?: CineProSubtitle[];
}

const CINEPRO_TIMEOUT = 30_000;

function getCineProUrl(): string {
  return config.cineproUrl;
}

export async function getMovieSources(
  tmdbId: number,
): Promise<CineProResponse | null> {
  const url = `${getCineProUrl()}/v1/movies/${tmdbId}`;
  return fetchCinePro(url);
}

export async function getTVSources(
  tmdbId: number,
  season: number,
  episode: number,
): Promise<CineProResponse | null> {
  const url = `${getCineProUrl()}/v1/tv/${tmdbId}/seasons/${season}/episodes/${episode}`;
  return fetchCinePro(url);
}

async function fetchCinePro(url: string): Promise<CineProResponse | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CINEPRO_TIMEOUT);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (!res.ok) return null;
    return (await res.json()) as CineProResponse;
  } catch {
    return null;
  }
}

/**
 * Pick the best source: prefer HLS 1080p > MP4 1080p > any HLS > any MP4
 */
export function pickBestSource(sources: CineProSource[]): CineProSource | null {
  if (sources.length === 0) return null;

  const score = (s: CineProSource): number => {
    let pts = 0;
    if (s.type === "hls") pts += 100;
    else if (s.type === "mp4") pts += 50;
    else if (s.type === "mkv") pts += 10;

    const q = parseInt(s.quality) || 0;
    if (q >= 2160) pts += 40;
    else if (q >= 1080) pts += 30;
    else if (q >= 720) pts += 20;
    else if (q >= 480) pts += 10;

    return pts;
  };

  return sources.reduce((best, cur) =>
    score(cur) > score(best) ? cur : best,
  );
}

/**
 * Group sources by provider for UI display
 */
export function groupByProvider(
  sources: CineProSource[],
): Record<string, CineProSource[]> {
  const groups: Record<string, CineProSource[]> = {};
  for (const s of sources) {
    const key = s.provider.name;
    if (!groups[key]) groups[key] = [];
    groups[key].push(s);
  }
  return groups;
}
