/**
 * Legacy Torrent_Pipeline — torrent-based content sourcing helpers
 * (design component 10, "Legacy Torrent Pipeline"; Req 9.4 "retain the code").
 *
 * RETAINED-BUT-DORMANT. This module is the reconstructed TypeScript port of the
 * legacy `dist/pipeline/torrent.js`. It is intentionally kept in the source tree
 * so the torrent/YTS/EZTV/Real-Debrid path can be re-enabled via configuration
 * (`config.torrentPipelineEnabled`), even though the new CinePro Core aggregator
 * is the default resolution source for `/watch` and `/embed` (Req 9.1).
 *
 * These functions are pure network helpers (TMDB → IMDB → YTS/EZTV → magnet →
 * optional Real-Debrid → direct HTTP URL). They are only ever reached from
 * `catalog.ts#processFromTorrent`, which short-circuits to `null` while the
 * torrent pipeline flag is off (Req 9.2, 9.3) — so importing this module has no
 * side effects on its own.
 *
 * Flow:
 *   TMDB ID → IMDB ID (TMDB API)
 *         → YTS API (movie) / EZTV API (tv)
 *         → magnet link
 *         → Real-Debrid (if configured) → direct HTTP → (ffmpeg → HLS, see catalog)
 *
 * Requirements: 9.4 (retain pipeline code for re-enablement).
 */
import { config } from "../config.js";

/** A torrent candidate discovered from YTS / EZTV. */
export interface TorrentRef {
  magnet: string;
  quality: string;
  size: number;
  title: string;
}

/** A resolved torrent — either a Real-Debrid direct URL or a raw magnet. */
export interface ResolvedTorrent {
  directUrl: string;
  quality: string;
  title: string;
  via: "debrid" | "magnet";
}

// ─── TMDB → IMDB ─────────────────────────────────────────────────────────────

/** Resolve a TMDB id to its IMDB id via the TMDB external_ids endpoint. */
export async function getImdbId(
  tmdbId: number,
  type: "movie" | "tv",
): Promise<string | null> {
  const apiKey = config.tmdbApiKey;
  if (!apiKey) return null;
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/${type}/${tmdbId}/external_ids?api_key=${apiKey}`,
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { imdb_id?: string | null };
    return data.imdb_id ?? null;
  } catch {
    return null;
  }
}

// ─── YTS API (movie) ─────────────────────────────────────────────────────────

interface YtsTorrent {
  hash: string;
  quality: string;
  size_bytes: number;
}

/** Find 1080p/720p YTS torrents for an IMDB id, best source first. */
export async function findYtsTorrents(imdbId: string): Promise<TorrentRef[]> {
  try {
    const res = await fetch(
      `https://yts.mx/api/v2/movie_details.json?imdb_id=${imdbId}&with_images=false&with_cast=false`,
    );
    if (!res.ok) return [];
    const data = (await res.json()) as {
      data?: { movie?: { title?: string; torrents?: YtsTorrent[] } };
    };
    const movie = data?.data?.movie;
    if (!movie?.torrents?.length) return [];
    const title = movie.title ?? "";
    return movie.torrents
      .filter((t) => t.quality === "1080p" || t.quality === "720p")
      .sort((a, b) => {
        // 1080p first; within the same quality, larger size first (better source).
        if (a.quality !== b.quality) return a.quality === "1080p" ? -1 : 1;
        return b.size_bytes - a.size_bytes;
      })
      .map((t) => ({
        magnet: buildMagnet(t.hash, title, t.quality),
        quality: t.quality,
        size: t.size_bytes,
        title,
      }));
  } catch {
    return [];
  }
}

/** Compose a magnet URI from a hash plus a fixed tracker set. */
function buildMagnet(hash: string, title: string, quality: string): string {
  const trackers = [
    "udp://glotorrents.pw:6969/announce",
    "udp://tracker.opentrackr.org:1337/announce",
    "udp://torrent.gresille.org:80/announce",
    "udp://tracker.openbittorrent.com:80",
    "udp://tracker.coppersurfer.tk:6969",
    "udp://tracker.leechers-paradise.org:6969",
    "udp://p4p.arenabg.ch:1337",
    "udp://tracker.internetwarriors.net:1337",
  ]
    .map((t) => `&tr=${encodeURIComponent(t)}`)
    .join("");
  return `magnet:?xt=urn:btih:${hash}&dn=${encodeURIComponent(
    title + " " + quality + " YTS",
  )}${trackers}`;
}

// ─── EZTV API (tv) ─────────────────────────────────────────────────────────

interface EztvTorrent {
  magnet_url?: string;
  filename?: string;
  title?: string;
  size_bytes?: string | number;
}

/** Find EZTV torrents for a given IMDB id + season/episode (SxxExx match). */
export async function findEztvTorrents(
  imdbId: string,
  season: number,
  episode: number,
): Promise<TorrentRef[]> {
  try {
    const imdbNum = imdbId.replace("tt", "");
    const res = await fetch(
      `https://eztvx.to/api/get-torrents?imdb_id=${imdbNum}&limit=10`,
    );
    if (!res.ok) return [];
    const data = (await res.json()) as { torrents?: EztvTorrent[] };
    const torrents = data?.torrents;
    if (!torrents?.length) return [];

    // Filter to the SxxExx form.
    const ep = `S${String(season).padStart(2, "0")}E${String(episode).padStart(2, "0")}`;
    return torrents
      .filter(
        (t) =>
          t.filename?.toUpperCase().includes(ep) ||
          t.title?.toUpperCase().includes(ep),
      )
      .map((t) => ({
        magnet: t.magnet_url ?? "",
        quality: t.filename?.includes("1080") ? "1080p" : "720p",
        size: Number(t.size_bytes) || 0,
        title: t.title ?? "",
      }))
      .slice(0, 3);
  } catch {
    return [];
  }
}

// ─── Real-Debrid (optional) ──────────────────────────────────────────────────

const RD_API = "https://api.real-debrid.com/rest/1.0";

/** Unrestrict a magnet to a direct HTTP URL via Real-Debrid, when configured. */
export async function unrestrictWithDebrid(magnet: string): Promise<string | null> {
  const apiKey = config.realDebridApiKey;
  if (!apiKey) return null;
  try {
    // 1. Add the magnet → get a torrent id.
    const addRes = await fetch(`${RD_API}/torrents/addMagnet`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ magnet }),
    });
    if (!addRes.ok) return null;
    const addData = (await addRes.json()) as { id: string };
    const torrentId = addData.id;

    // 2. Select all files.
    await fetch(`${RD_API}/torrents/selectFiles/${torrentId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ files: "all" }),
    });

    // 3. Poll until the torrent is ready (max ~60s).
    for (let i = 0; i < 12; i++) {
      await sleep(5000);
      const infoRes = await fetch(`${RD_API}/torrents/info/${torrentId}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!infoRes.ok) break;
      const info = (await infoRes.json()) as {
        status: string;
        links?: string[];
      };
      if (info.status === "downloaded" && (info.links?.length ?? 0) > 0) {
        // 4. Unrestrict the first link to a direct download URL.
        const unRes = await fetch(`${RD_API}/unrestrict/link`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({ link: info.links![0] }),
        });
        if (!unRes.ok) break;
        const unData = (await unRes.json()) as { download: string };
        return unData.download;
      }
      if (info.status === "error" || info.status === "dead") break;
    }
    return null;
  } catch {
    return null;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Movie: TMDB id → a direct HTTP URL (Real-Debrid) or a magnet fallback.
 */
export async function resolveMovieTorrent(
  tmdbId: number,
): Promise<ResolvedTorrent | null> {
  const imdbId = await getImdbId(tmdbId, "movie");
  if (!imdbId) return null;
  const torrents = await findYtsTorrents(imdbId);
  if (!torrents.length) return null;
  const best = torrents[0];
  if (!best.magnet) return null;

  const directUrl = await unrestrictWithDebrid(best.magnet);
  if (directUrl) {
    return { directUrl, quality: best.quality, title: best.title, via: "debrid" };
  }
  // No Real-Debrid → return the magnet (usable via webtorrent).
  return { directUrl: best.magnet, quality: best.quality, title: best.title, via: "magnet" };
}

/**
 * TV: TMDB id + season + episode → a direct HTTP URL or a magnet fallback.
 */
export async function resolveTvTorrent(
  tmdbId: number,
  season: number,
  episode: number,
): Promise<ResolvedTorrent | null> {
  const imdbId = await getImdbId(tmdbId, "tv");
  if (!imdbId) return null;
  const torrents = await findEztvTorrents(imdbId, season, episode);
  if (!torrents.length) return null;
  const best = torrents[0];
  if (!best.magnet) return null;

  const directUrl = await unrestrictWithDebrid(best.magnet);
  if (directUrl) {
    return { directUrl, quality: best.quality, title: best.title, via: "debrid" };
  }
  return { directUrl: best.magnet, quality: best.quality, title: best.title, via: "magnet" };
}
