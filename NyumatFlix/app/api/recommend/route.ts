import { NextRequest, NextResponse } from "next/server";
import { TMDB_BASE } from "@/lib/constants";

const TMDB_KEY = process.env.TMDB_API_KEY || "";
const OPENAI_KEY = process.env.OPENAI_API_KEY || "";

interface TmdbResult {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: string;
}

async function tmdbSearch(query: string): Promise<TmdbResult[]> {
  const url = `${TMDB_BASE}/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}&language=en-US`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.results || []).filter(
    (r: TmdbResult) =>
      (r.media_type === "movie" || r.media_type === "tv") && r.poster_path,
  );
}

async function tmdbDiscover(genreId: number): Promise<TmdbResult[]> {
  const url = `${TMDB_BASE}/discover/movie?api_key=${TMDB_KEY}&with_genres=${genreId}&sort_by=popularity.desc&page=1`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.results || []).slice(0, 5);
}

const GENRE_KEYWORDS: Record<string, number> = {
  action: 28, comedy: 35, horror: 27, drama: 18,
  "sci-fi": 878, romance: 10749, thriller: 53,
  animation: 16, documentary: 99, crime: 80,
  korku: 27, komedi: 35, aksiyon: 28, dram: 18,
};

function detectGenre(text: string): number | null {
  const lower = text.toLowerCase();
  for (const [keyword, id] of Object.entries(GENRE_KEYWORDS)) {
    if (lower.includes(keyword)) return id;
  }
  return null;
}

async function askOpenAI(
  userMessage: string,
  movies: TmdbResult[],
): Promise<string> {
  if (!OPENAI_KEY) {
    if (movies.length === 0) {
      return "I can help you find movies! Try asking about a genre (action, comedy, horror) or search for a specific title.";
    }
    const list = movies
      .slice(0, 5)
      .map((m, i) => {
        const title = m.title || m.name || "Unknown";
        const year = (m.release_date || m.first_air_date || "").slice(0, 4);
        const rating = m.vote_average?.toFixed(1) || "?";
        return `${i + 1}. **${title}** (${year}) — ⭐ ${rating}\n   ${(m.overview || "").slice(0, 100)}...`;
      })
      .join("\n\n");
    return `Here are some recommendations:\n\n${list}`;
  }

  const movieContext = movies
    .slice(0, 5)
    .map(
      (m) =>
        `${m.title || m.name} (${(m.release_date || m.first_air_date || "").slice(0, 4)}) — ${m.vote_average}/10 — ${(m.overview || "").slice(0, 100)}`,
    )
    .join("\n");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful movie recommendation assistant. Keep responses concise (max 200 words). Recommend movies from the provided list. Use markdown bold for titles.",
        },
        {
          role: "user",
          content: `User asks: "${userMessage}"\n\nAvailable movies:\n${movieContext}\n\nRecommend the best matches and explain why briefly.`,
        },
      ],
      max_tokens: 300,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    return movies.length > 0
      ? `Here are some picks:\n\n${movies
          .slice(0, 3)
          .map((m) => `• **${m.title || m.name}** — ${(m.overview || "").slice(0, 80)}...`)
          .join("\n")}`
      : "Sorry, I couldn't process that. Try asking about a genre or movie title!";
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "No response generated.";
}

export async function POST(req: NextRequest) {
  const { message } = await req.json();
  if (!message || typeof message !== "string") {
    return NextResponse.json(
      { error: "message is required" },
      { status: 400 },
    );
  }

  const genre = detectGenre(message);
  let movies: TmdbResult[] = [];

  if (genre) {
    movies = await tmdbDiscover(genre);
  } else {
    movies = await tmdbSearch(message);
  }

  const response = await askOpenAI(message, movies);

  const recommendations = movies.slice(0, 5).map((m) => ({
    id: m.id,
    title: m.title || m.name || "Unknown",
    year: (m.release_date || m.first_air_date || "").slice(0, 4),
    rating: m.vote_average,
    poster: m.poster_path
      ? `https://image.tmdb.org/t/p/w185${m.poster_path}`
      : null,
    type: m.media_type || "movie",
  }));

  return NextResponse.json({ response, recommendations });
}
