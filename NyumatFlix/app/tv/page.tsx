import { popularTv } from "@/lib/tmdb";
import { MediaGrid } from "@/components/media-grid";

export default async function TvPage() {
  const data = await popularTv().catch(() => ({ results: [] }));
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <MediaGrid title="Popular TV Shows" items={data.results.map(t => ({ ...t, media_type: "tv" }))} />
    </div>
  );
}
