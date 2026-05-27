export const LOGGER_TITLE = "NyumatFlix";
export const TMDB_BASE = "https://api.themoviedb.org/3";
export const TMDB_BASE_URL = TMDB_BASE;
export const TMDB_IMG = "https://image.tmdb.org/t/p";
export const TMDB_API_KEY = process.env.TMDB_API_KEY || "";
export const isBrowser = typeof window !== "undefined";

export const MAGIC_LINK_RESEND_FROM = process.env.MAGIC_LINK_FROM || "noreply@streamvault.to";
export const MAGIC_LINK_RESEND_SUBJECT = "Sign in to StreamVault";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type P = Record<string, any>;

async function tmdbFetch(path: string, params: P = {}): Promise<any> {
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set("api_key", TMDB_API_KEY);
  for (const [k, v] of Object.entries(params)) {
    if (k !== "id") url.searchParams.set(k, String(v));
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  return res.json();
}

export const movieDb = {
  baseUrl: TMDB_BASE,
  apiKey: TMDB_API_KEY,
  fetch: tmdbFetch,
  movieInfo: (p: P) => tmdbFetch(`/movie/${p.id}`, p),
  tvInfo: (p: P) => tmdbFetch(`/tv/${p.id}`, p),
  searchMulti: (q: string) => tmdbFetch("/search/multi", { query: q }),
  trending: (mediaType = "all", timeWindow = "week") => tmdbFetch(`/trending/${mediaType}/${timeWindow}`),
  discoverMovie: (p?: P) => tmdbFetch("/discover/movie", p),
  discoverTv: (p?: P) => tmdbFetch("/discover/tv", p),
  movieRecommendations: (p: P) => tmdbFetch(`/movie/${p.id}/recommendations`),
  tvRecommendations: (p: P) => tmdbFetch(`/tv/${p.id}/recommendations`),
  personInfo: (p: P) => tmdbFetch(`/person/${p.id}`, p),
  personCombinedCredits: (p: P) => tmdbFetch(`/person/${p.id}/combined_credits`, p),
  searchPerson: (q: string) => tmdbFetch("/search/person", { query: q }),
  genreMovieList: () => tmdbFetch("/genre/movie/list"),
  genreTvList: () => tmdbFetch("/genre/tv/list"),
  seasonInfo: (id: number, season: number) => tmdbFetch(`/tv/${id}/season/${season}`),
  movieImages: (id: number) => tmdbFetch(`/movie/${id}/images`),
  tvImages: (id: number) => tmdbFetch(`/tv/${id}/images`),
  moviePopular: (p?: P) => tmdbFetch("/movie/popular", p),
  movieTopRated: (p?: P) => tmdbFetch("/movie/top_rated", p),
  movieNowPlaying: (p?: P) => tmdbFetch("/movie/now_playing", p),
  upcomingMovies: (p?: P) => tmdbFetch("/movie/upcoming", p),
  tvPopular: (p?: P) => tmdbFetch("/tv/popular", p),
  tvTopRated: (p?: P) => tmdbFetch("/tv/top_rated", p),
  tvAiringToday: (p?: P) => tmdbFetch("/tv/airing_today", p),
  tvOnTheAir: (p?: P) => tmdbFetch("/tv/on_the_air", p),
};

export const requiredEnvVars: string[] = process.env.NODE_ENV === "production" ? ["TMDB_API_KEY"] : [];
