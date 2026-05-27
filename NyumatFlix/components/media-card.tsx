import Image from "next/image";
import Link from "next/link";
import type { TmdbMedia } from "@/lib/tmdb";

export function MediaCard({ item }: { item: TmdbMedia }) {
  const isMovie = item.media_type === "movie" || !!item.title;
  const title = item.title || item.name || "Unknown";
  const href = isMovie ? `/watch/movie/${item.id}` : `/watch/tv/${item.id}`;
  const year = (item.release_date || item.first_air_date || "").slice(0, 4);

  return (
    <Link href={href} className="group block">
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-white/5">
        {item.poster_path ? (
          <Image
            src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, 200px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm">{title}</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {item.vote_average > 0 && (
          <div className="absolute top-2 right-2 bg-black/70 text-yellow-400 text-xs px-1.5 py-0.5 rounded font-medium">
            {item.vote_average.toFixed(1)}
          </div>
        )}
      </div>
      <h3 className="mt-2 text-sm font-medium text-gray-200 truncate">{title}</h3>
      {year && <p className="text-xs text-gray-500">{year}</p>}
    </Link>
  );
}
