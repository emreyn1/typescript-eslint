export interface EmbedProvider {
  id: string;
  name: string;
  getMovieUrl(tmdbId: number): string;
  getTvUrl(tmdbId: number, season: number, episode: number): string;
  priority: number;
}

const providers: EmbedProvider[] = [
  {
    id: "vidsrc",
    name: "VidSrc",
    priority: 1,
    getMovieUrl: (id) => `https://vidsrc.store/embed/movie/${id}`,
    getTvUrl: (id, s, e) => `https://vidsrc.store/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: "embed2",
    name: "2Embed",
    priority: 2,
    getMovieUrl: (id) => `https://www.2embed.stream/embed/movie/${id}`,
    getTvUrl: (id, s, e) =>
      `https://www.2embed.stream/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: "autoembed",
    name: "AutoEmbed",
    priority: 3,
    getMovieUrl: (id) => `https://player.autoembed.cc/embed/movie/${id}`,
    getTvUrl: (id, s, e) =>
      `https://player.autoembed.cc/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: "multiembed",
    name: "SuperEmbed",
    priority: 4,
    getMovieUrl: (id) => `https://multiembed.mov/?video_id=${id}&tmdb=1`,
    getTvUrl: (id, s, e) =>
      `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}`,
  },
  {
    id: "vidsrc2",
    name: "VidSrc.cc",
    priority: 5,
    getMovieUrl: (id) => `https://vidsrc.cc/v2/embed/movie/${id}`,
    getTvUrl: (id, s, e) =>
      `https://vidsrc.cc/v2/embed/tv/${id}/${s}/${e}`,
  },
];

export function getProviders(): EmbedProvider[] {
  return providers.sort((a, b) => a.priority - b.priority);
}

export function getProviderById(id: string): EmbedProvider | undefined {
  return providers.find((p) => p.id === id);
}

export function getSourcesForMovie(tmdbId: number) {
  return providers.map((p) => ({
    id: p.id,
    name: p.name,
    url: p.getMovieUrl(tmdbId),
  }));
}

export function getSourcesForTv(
  tmdbId: number,
  season: number,
  episode: number,
) {
  return providers.map((p) => ({
    id: p.id,
    name: p.name,
    url: p.getTvUrl(tmdbId, season, episode),
  }));
}
