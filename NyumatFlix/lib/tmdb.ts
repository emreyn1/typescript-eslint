import { TMDB_BASE } from "./constants";

const key = process.env.TMDB_API_KEY || "";
const opts: RequestInit = { next: { revalidate: 3600 } };

async function tmdbFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set("api_key", key);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString(), opts);
  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  return res.json();
}

export interface TmdbMedia {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: string;
  genre_ids?: number[];
}

interface TmdbPage { page: number; results: TmdbMedia[]; total_pages: number; }

export const trending = () => tmdbFetch<TmdbPage>("/trending/all/week");
export const popularMovies = (page = 1) => tmdbFetch<TmdbPage>("/movie/popular", { page: String(page) });
export const popularTv = (page = 1) => tmdbFetch<TmdbPage>("/tv/popular", { page: String(page) });
export const searchMulti = (query: string, page = 1) => tmdbFetch<TmdbPage>("/search/multi", { query, page: String(page) });
export const movieDetail = (id: number) => tmdbFetch<TmdbMedia & { genres: {id:number;name:string}[]; runtime: number }>(`/movie/${id}`, { append_to_response: "videos" });
export const tvDetail = (id: number) => tmdbFetch<TmdbMedia & { genres: {id:number;name:string}[]; number_of_seasons: number; seasons: {season_number:number;episode_count:number;name:string}[] }>(`/tv/${id}`, { append_to_response: "videos" });
export const tvSeason = (id: number, season: number) => tmdbFetch<{ episodes: { episode_number: number; name: string; overview: string; still_path: string | null }[] }>(`/tv/${id}/season/${season}`);
