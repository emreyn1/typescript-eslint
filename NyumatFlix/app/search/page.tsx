import { searchMulti } from "@/lib/tmdb";
import { MediaGrid } from "@/components/media-grid";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const results = q ? await searchMulti(q).catch(() => ({ results: [] })) : { results: [] };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <form className="mb-8">
        <input
          name="q"
          defaultValue={q || ""}
          placeholder="Search movies and TV shows..."
          className="w-full max-w-lg bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </form>
      {q && results.results.length > 0 && <MediaGrid title={`Results for "${q}"`} items={results.results.filter(r => r.poster_path)} />}
      {q && results.results.length === 0 && <p className="text-gray-400">No results found for &ldquo;{q}&rdquo;</p>}
    </div>
  );
}
