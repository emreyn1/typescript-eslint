/**
 * Torrent-based content sourcing pipeline.
 *
 * Flow:
 *   TMDB ID → IMDB ID (TMDB API)
 *         → YTS API (film için) / EZTV API (dizi için)
 *         → magnet link
 *         → Real-Debrid (varsa) → direkt HTTP → ffmpeg → HLS
 *         → yoksa webtorrent sequential → ffmpeg → HLS
 */

const TMDB_API_KEY = process.env.TMDB_API_KEY || "";

export interface TorrentSource {
  magnet?: string;
  directUrl?: string;
  quality: string;
  size: number;
  title: string;
}

// ─── TMDB → IMDB ─────────────────────────────────────────────────────────────

export async function getImdbId(
  tmdbId: number,
  type: "movie" | "tv",
): Promise<string | null> {
  if (!TMDB_API_KEY) return null;
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/${type}/${tmdbId}/external_ids?api_key=${TMDB_API_KEY}`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.imdb_id ?? null;
  } catch {
    return null;
  }
}

// ─── YTS API (film) ───────────────────────────────────────────────────────────

export async function findYtsTorrents(
  imdbId: string,
): Promise<TorrentSource[]> {
  try {
    const res = await fetch(
      `https://yts.mx/api/v2/movie_details.json?imdb_id=${imdbId}&with_images=false&with_cast=false`,
    );
    if (!res.ok) return [];
    const data = await res.json();
    const movie = data?.data?.movie;
    if (!movie?.torrents?.length) return [];

    return (movie.torrents as any[])
      .filter((t) => t.quality === "1080p" || t.quality === "720p")
      .sort((a, b) => {
        // 1080p önce, aynı kalitede büyük boyut önce (daha iyi kaynak)
        if (a.quality !== b.quality)
          return a.quality === "1080p" ? -1 : 1;
        return b.size_bytes - a.size_bytes;
      })
      .map((t) => ({
        magnet: buildMagnet(t.hash, movie.title, t.quality),
        quality: t.quality,
        size: t.size_bytes,
        title: movie.title,
      }));
  } catch {
    return [];
  }
}

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

  return `magnet:?xt=urn:btih:${hash}&dn=${encodeURIComponent(title + " " + quality + " YTS")}${trackers}`;
}

// ─── EZTV API (dizi) ──────────────────────────────────────────────────────────

export async function findEztvTorrents(
  imdbId: string,
  season: number,
  episode: number,
): Promise<TorrentSource[]> {
  try {
    const imdbNum = imdbId.replace("tt", "");
    const res = await fetch(
      `https://eztvx.to/api/get-torrents?imdb_id=${imdbNum}&limit=10`,
    );
    if (!res.ok) return [];
    const data = await res.json();
    const torrents = data?.torrents as any[];
    if (!torrents?.length) return [];

    // S01E01 formatında filtrele
    const ep = `S${String(season).padStart(2, "0")}E${String(episode).padStart(2, "0")}`;

    return torrents
      .filter(
        (t) =>
          t.filename?.toUpperCase().includes(ep) ||
          t.title?.toUpperCase().includes(ep),
      )
      .map((t) => ({
        magnet: t.magnet_url,
        quality: t.filename?.includes("1080") ? "1080p" : "720p",
        size: Number(t.size_bytes) || 0,
        title: t.title ?? "",
      }))
      .slice(0, 3);
  } catch {
    return [];
  }
}

// ─── Real-Debrid (opsiyonel) ──────────────────────────────────────────────────

const RD_API = "https://api.real-debrid.com/rest/1.0";

export async function unrestrictWithDebrid(
  magnet: string,
): Promise<string | null> {
  const apiKey = process.env.REAL_DEBRID_API_KEY;
  if (!apiKey) return null;

  try {
    // 1. Magnet ekle → torrent ID al
    const addRes = await fetch(`${RD_API}/torrents/addMagnet`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ magnet }),
    });
    if (!addRes.ok) return null;
    const addData = await addRes.json();
    const torrentId = addData.id as string;

    // 2. Tüm dosyaları seç
    await fetch(`${RD_API}/torrents/selectFiles/${torrentId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ files: "all" }),
    });

    // 3. Torrent hazır olana kadar bekle (max 60s)
    for (let i = 0; i < 12; i++) {
      await sleep(5000);
      const infoRes = await fetch(`${RD_API}/torrents/info/${torrentId}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!infoRes.ok) break;
      const info = await infoRes.json();

      if (info.status === "downloaded" && info.links?.length > 0) {
        // 4. En büyük video dosyasının linkini unrestrict et
        const unRes = await fetch(`${RD_API}/unrestrict/link`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({ link: info.links[0] }),
        });
        if (!unRes.ok) break;
        const unData = await unRes.json();
        return unData.download as string;
      }

      if (info.status === "error" || info.status === "dead") break;
    }
    return null;
  } catch {
    return null;
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Ana Fonksiyon ────────────────────────────────────────────────────────────

export interface ResolvedTorrent {
  directUrl: string;
  quality: string;
  title: string;
  via: "debrid" | "magnet";
}

/**
 * Film için TMDB ID → direkt HTTP URL döner.
 * Real-Debrid varsa kullanır, yoksa magnet döner.
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

  // Real-Debrid yoksa magnet'i döndür (webtorrent ile kullanılabilir)
  return {
    directUrl: best.magnet,
    quality: best.quality,
    title: best.title,
    via: "magnet",
  };
}

/**
 * Dizi için TMDB ID + sezon + bölüm → direkt HTTP URL döner.
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

  return {
    directUrl: best.magnet,
    quality: best.quality,
    title: best.title,
    via: "magnet",
  };
}
