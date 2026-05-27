import { movieDetail } from "@/lib/tmdb";
import Image from "next/image";

const EMBED_API = process.env.NEXT_PUBLIC_EMBED_API_URL || "http://localhost:3001";

export default async function WatchMovie({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tmdbId = Number(id);
  let movie: any = null;
  try { movie = await movieDetail(tmdbId); } catch {}

  const title = movie?.title || `Movie #${tmdbId}`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden mb-6 border border-white/10">
        <iframe
          src={`${EMBED_API}/watch/movie/${tmdbId}`}
          className="absolute inset-0 w-full h-full"
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture"
        />
      </div>
      <div className="flex gap-6">
        {movie?.poster_path && (
          <Image
            src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`}
            alt={title}
            width={185}
            height={278}
            className="rounded-lg hidden md:block"
          />
        )}
        <div>
          <h1 className="text-2xl font-bold mb-2">{title}</h1>
          {movie?.release_date && <p className="text-gray-400 text-sm mb-2">{movie.release_date.slice(0, 4)} • {movie.runtime || "?"}min • ⭐ {movie.vote_average?.toFixed(1)}</p>}
          {movie?.genres && <p className="text-gray-400 text-sm mb-4">{movie.genres.map((g: any) => g.name).join(", ")}</p>}
          {movie?.overview && <p className="text-gray-300 max-w-2xl">{movie.overview}</p>}
        </div>
      </div>
    </div>
  );
}
