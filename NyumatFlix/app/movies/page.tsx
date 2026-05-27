import { popularMovies } from "@/lib/tmdb";
import { MediaGrid } from "@/components/media-grid";

export default async function MoviesPage() {
  const data = await popularMovies().catch(() => ({ results: [] }));
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <MediaGrid title="Popular Movies" items={data.results.map(m => ({ ...m, media_type: "movie" }))} />
    </div>
  );
}
