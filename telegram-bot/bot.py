"""
Film Oneri Telegram Botu
TMDB API ile film/dizi önerisi + kanal otomatik paylaşım.

Kullanım:
  /start          - Hoş geldin
  /recommend       - Rastgele popüler film
  /search <query>  - Film ara
  /trending        - Bu haftanın trendleri
  /genre <tür>     - Türe göre öneri (action, comedy, horror, drama, sci-fi)

Env:
  TELEGRAM_BOT_TOKEN - BotFather'dan alınan token
  TMDB_API_KEY       - themoviedb.org API key
  CHANNEL_ID         - Otomatik paylaşım yapılacak kanal (@filmkanali)
  SITE_URL           - Film sitesi URL'si
"""

import os
import random
import logging
from datetime import datetime

import httpx
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    Application,
    CommandHandler,
    ContextTypes,
    MessageHandler,
    filters,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BOT_TOKEN = os.environ["TELEGRAM_BOT_TOKEN"]
TMDB_KEY = os.environ["TMDB_API_KEY"]
CHANNEL_ID = os.environ.get("CHANNEL_ID", "")
SITE_URL = os.environ.get("SITE_URL", "https://yourfilmsite.com")
TMDB_BASE = "https://api.themoviedb.org/3"
TMDB_IMG = "https://image.tmdb.org/t/p/w500"

GENRE_MAP = {
    "action": 28, "comedy": 35, "horror": 27, "drama": 18,
    "sci-fi": 878, "romance": 10749, "thriller": 53,
    "animation": 16, "documentary": 99, "crime": 80,
    "aksiyon": 28, "komedi": 35, "korku": 27, "dram": 18,
    "bilimkurgu": 878, "romantik": 10749, "gerilim": 53,
}


async def tmdb_get(path: str, params: dict | None = None) -> dict:
    p = {"api_key": TMDB_KEY, "language": "en-US"}
    if params:
        p.update(params)
    async with httpx.AsyncClient() as client:
        r = await client.get(f"{TMDB_BASE}{path}", params=p)
        r.raise_for_status()
        return r.json()


def format_movie(m: dict) -> tuple[str, str | None]:
    title = m.get("title") or m.get("name", "Unknown")
    year = (m.get("release_date") or m.get("first_air_date") or "")[:4]
    rating = m.get("vote_average", 0)
    overview = (m.get("overview") or "No description available.")[:300]
    tmdb_id = m.get("id", "")
    media_type = m.get("media_type", "movie")
    poster = f"{TMDB_IMG}{m['poster_path']}" if m.get("poster_path") else None

    watch_url = f"{SITE_URL}/watch/{media_type}/{tmdb_id}" if SITE_URL else ""

    text = (
        f"🎬 *{title}* ({year})\n"
        f"⭐ {rating:.1f}/10\n\n"
        f"{overview}\n\n"
    )
    if watch_url:
        text += f"▶️ [Watch Now]({watch_url})\n"

    return text, poster


async def start(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "🎬 *Film Recommendation Bot*\n\n"
        "Commands:\n"
        "/trending — This week's trending movies\n"
        "/recommend — Random popular movie\n"
        "/search <name> — Search for a movie\n"
        "/genre <type> — By genre (action, comedy, horror, drama, sci-fi)\n\n"
        f"🔗 {SITE_URL}",
        parse_mode="Markdown",
    )


async def trending(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    data = await tmdb_get("/trending/movie/week")
    results = data.get("results", [])[:5]
    if not results:
        await update.message.reply_text("No trending movies found.")
        return

    text = "🔥 *Trending This Week*\n\n"
    for i, m in enumerate(results, 1):
        title = m.get("title", "Unknown")
        year = (m.get("release_date") or "")[:4]
        rating = m.get("vote_average", 0)
        text += f"{i}. *{title}* ({year}) — ⭐ {rating:.1f}\n"

    text += f"\n▶️ Watch all at {SITE_URL}"
    await update.message.reply_text(text, parse_mode="Markdown")


async def recommend(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    page = random.randint(1, 20)
    data = await tmdb_get("/movie/popular", {"page": str(page)})
    results = data.get("results", [])
    if not results:
        await update.message.reply_text("No movies found.")
        return

    movie = random.choice(results)
    text, poster = format_movie(movie)

    if poster:
        await update.message.reply_photo(poster, caption=text, parse_mode="Markdown")
    else:
        await update.message.reply_text(text, parse_mode="Markdown")


async def search(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    query = " ".join(ctx.args) if ctx.args else ""
    if not query:
        await update.message.reply_text("Usage: /search <movie name>")
        return

    data = await tmdb_get("/search/multi", {"query": query})
    results = [
        r for r in data.get("results", [])
        if r.get("media_type") in ("movie", "tv")
    ][:3]

    if not results:
        await update.message.reply_text(f"No results for '{query}'")
        return

    for m in results:
        text, poster = format_movie(m)
        if poster:
            await update.message.reply_photo(poster, caption=text, parse_mode="Markdown")
        else:
            await update.message.reply_text(text, parse_mode="Markdown")


async def genre(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    genre_name = (ctx.args[0].lower() if ctx.args else "").strip()
    genre_id = GENRE_MAP.get(genre_name)

    if not genre_id:
        genres = ", ".join(sorted(set(GENRE_MAP.keys())))
        await update.message.reply_text(f"Usage: /genre <type>\nAvailable: {genres}")
        return

    page = random.randint(1, 5)
    data = await tmdb_get("/discover/movie", {
        "with_genres": str(genre_id),
        "sort_by": "popularity.desc",
        "page": str(page),
    })
    results = data.get("results", [])[:3]

    if not results:
        await update.message.reply_text(f"No {genre_name} movies found.")
        return

    for m in results:
        text, poster = format_movie(m)
        if poster:
            await update.message.reply_photo(poster, caption=text, parse_mode="Markdown")
        else:
            await update.message.reply_text(text, parse_mode="Markdown")


async def auto_daily_post(ctx: ContextTypes.DEFAULT_TYPE):
    """Runs daily via job_queue — posts trending movie to channel."""
    if not CHANNEL_ID:
        return

    data = await tmdb_get("/trending/movie/day")
    results = data.get("results", [])
    if not results:
        return

    movie = results[0]
    text, poster = format_movie(movie)
    text = f"🎬 *Movie of the Day*\n\n{text}"

    if poster:
        await ctx.bot.send_photo(CHANNEL_ID, poster, caption=text, parse_mode="Markdown")
    else:
        await ctx.bot.send_message(CHANNEL_ID, text, parse_mode="Markdown")


def main():
    app = Application.builder().token(BOT_TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("help", start))
    app.add_handler(CommandHandler("trending", trending))
    app.add_handler(CommandHandler("recommend", recommend))
    app.add_handler(CommandHandler("search", search))
    app.add_handler(CommandHandler("genre", genre))

    if CHANNEL_ID:
        app.job_queue.run_daily(
            auto_daily_post,
            time=datetime.strptime("19:00", "%H:%M").time(),
            name="daily_post",
        )
        logger.info(f"Daily auto-post scheduled for {CHANNEL_ID} at 19:00")

    logger.info("Bot starting...")
    app.run_polling()


if __name__ == "__main__":
    main()
