import { tvDetail, tvSeason } from "@/lib/tmdb";
import Image from "next/image";
import Link from "next/link";

const EMBED_API = process.env.NEXT_PUBLIC_EMBED_API_URL || "http://localhost:3001";

export default async function WatchTv({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ s?: string; e?: string }> }) {
  const { id } = await params;
  const { s, e } = await searchParams;
  const tmdbId = Number(id);
  const season = Number(s) || 1;
  const episode = Number(e) || 1;

  let show: any = null;
  let episodes: any[] = [];
  try {
    show = await tvDetail(tmdbId);
    const seasonData = await tvSeason(tmdbId, season);
    episodes = seasonData.episodes || [];
  } catch {}

  const title = show?.name || `TV Show #${tmdbId}`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden mb-6 border border-white/10">
        <iframe
          src={`${EMBED_API}/watch/tv/${tmdbId}/${season}/${episode}`}
          className="absolute inset-0 w-full h-full"
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture"
        />
      </div>
      <h1 className="text-2xl font-bold mb-1">{title}</h1>
      <p className="text-gray-400 text-sm mb-4">Season {season} • Episode {episode}</p>

      {show?.seasons && show.seasons.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {show.seasons.filter((ss: any) => ss.season_number > 0).map((ss: any) => (
            <Link key={ss.season_number} href={`/watch/tv/${tmdbId}?s=${ss.season_number}&e=1`}
              className={`px-3 py-1 rounded text-sm ${ss.season_number === season ? "bg-indigo-600 text-white" : "bg-white/10 text-gray-300 hover:bg-white/20"}`}>
              S{ss.season_number}
            </Link>
          ))}
        </div>
      )}

      {episodes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {episodes.map((ep) => (
            <Link key={ep.episode_number} href={`/watch/tv/${tmdbId}?s=${season}&e=${ep.episode_number}`}
              className={`p-3 rounded-lg border transition-colors ${ep.episode_number === episode ? "border-indigo-500 bg-indigo-500/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`}>
              <p className="font-medium text-sm">Ep {ep.episode_number}: {ep.name}</p>
              {ep.overview && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{ep.overview}</p>}
            </Link>
          ))}
        </div>
      )}

      {show?.overview && <p className="text-gray-300 max-w-2xl mt-6">{show.overview}</p>}
    </div>
  );
}
