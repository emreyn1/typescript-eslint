"""
Multi-brand otomatik Telegram kanal paylaşımcısı.
Haftanın her günü farklı iş birimi için otomatik post atar.

Kullanım:
  python auto_post.py              # Bugünün postunu at
  python auto_post.py --all        # Tüm kanalları test et
  python auto_post.py --brand film # Sadece film kanalını çalıştır

Cron (VPS):
  0 19 * * * cd /opt/telegram-bot && python auto_post.py

Env:
  TELEGRAM_BOT_TOKEN  - Bot token
  TMDB_API_KEY        - TMDB API key
  CHANNEL_FILM        - Film kanalı ID (@filmvault)
  CHANNEL_CARD        - Kart kanalı ID (@privacycard)
  CHANNEL_SMS         - SMS kanalı ID (@getsmsnow)
  CHANNEL_GAMES       - Oyun kanalı ID (@browsergames)
  SITE_FILM           - Film sitesi URL
  SITE_CARD           - Kart sitesi URL
  SITE_SMS            - SMS sitesi URL
  SITE_GAMES          - Oyun sitesi URL
"""

import os
import sys
import random
import asyncio
import logging
from datetime import datetime

import httpx

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
TMDB_KEY = os.environ.get("TMDB_API_KEY", "")
TMDB_BASE = "https://api.themoviedb.org/3"
TMDB_IMG = "https://image.tmdb.org/t/p/w500"

CHANNELS = {
    "film": os.environ.get("CHANNEL_FILM", ""),
    "card": os.environ.get("CHANNEL_CARD", ""),
    "sms": os.environ.get("CHANNEL_SMS", ""),
    "games": os.environ.get("CHANNEL_GAMES", ""),
}

SITES = {
    "film": os.environ.get("SITE_FILM", "https://streamvault.to"),
    "card": os.environ.get("SITE_CARD", "https://privacycard.to"),
    "sms": os.environ.get("SITE_SMS", "https://getsmsnow.com"),
    "games": os.environ.get("SITE_GAMES", "https://browsergames.to"),
}

SCHEDULE = {
    0: ["film"],           # Monday
    1: ["card", "sms"],    # Tuesday
    2: ["film", "games"],  # Wednesday
    3: ["sms", "card"],    # Thursday
    4: ["film"],           # Friday
    5: ["games", "film"],  # Saturday
    6: [],                 # Sunday = planning day
}


async def tmdb_get(path: str, params: dict | None = None) -> dict:
    p = {"api_key": TMDB_KEY, "language": "en-US"}
    if params:
        p.update(params)
    async with httpx.AsyncClient() as client:
        r = await client.get(f"{TMDB_BASE}{path}", params=p)
        r.raise_for_status()
        return r.json()


async def send_telegram(channel_id: str, text: str, photo_url: str | None = None):
    base = f"https://api.telegram.org/bot{BOT_TOKEN}"
    async with httpx.AsyncClient() as client:
        if photo_url:
            await client.post(f"{base}/sendPhoto", json={
                "chat_id": channel_id,
                "photo": photo_url,
                "caption": text,
                "parse_mode": "Markdown",
            })
        else:
            await client.post(f"{base}/sendMessage", json={
                "chat_id": channel_id,
                "text": text,
                "parse_mode": "Markdown",
            })


async def post_film():
    channel = CHANNELS.get("film")
    if not channel:
        logger.warning("CHANNEL_FILM not set, skipping film post")
        return

    data = await tmdb_get("/trending/movie/day")
    results = data.get("results", [])
    if not results:
        return

    movie = random.choice(results[:5])
    title = movie.get("title", "Unknown")
    year = (movie.get("release_date") or "")[:4]
    rating = movie.get("vote_average", 0)
    overview = (movie.get("overview") or "")[:200]
    poster = f"{TMDB_IMG}{movie['poster_path']}" if movie.get("poster_path") else None
    tmdb_id = movie.get("id", "")

    text = (
        f"🎬 *Movie of the Day*\n\n"
        f"*{title}* ({year})\n"
        f"⭐ {rating:.1f}/10\n\n"
        f"{overview}...\n\n"
        f"▶️ [Watch Now]({SITES['film']}/watch/movie/{tmdb_id})"
    )

    await send_telegram(channel, text, poster)
    logger.info(f"Film post sent: {title}")


async def post_card():
    channel = CHANNELS.get("card")
    if not channel:
        logger.warning("CHANNEL_CARD not set, skipping card post")
        return

    tips = [
        (
            "🔒 *Privacy Tip of the Day*\n\n"
            "Your credit card is stored on 47+ websites on average.\n\n"
            "Use a virtual card for each merchant — even if one gets leaked, your real card stays safe.\n\n"
            f"🔗 [Get a No-KYC Card]({SITES['card']})"
        ),
        (
            "💳 *Did You Know?*\n\n"
            "Under EU AMLD5, you can get a virtual Visa card up to €150 without any ID verification.\n\n"
            "Perfect for online subscriptions, trials, and one-time purchases.\n\n"
            f"🔗 [Try It]({SITES['card']})"
        ),
        (
            "🛡️ *Online Shopping Safety*\n\n"
            "Stop saving your real card on every website.\n\n"
            "Virtual cards = unique number per merchant = zero risk if breached.\n\n"
            f"🔗 [Get Protected]({SITES['card']})"
        ),
    ]
    text = random.choice(tips)
    await send_telegram(channel, text)
    logger.info("Card post sent")


async def post_sms():
    channel = CHANNELS.get("sms")
    if not channel:
        logger.warning("CHANNEL_SMS not set, skipping SMS post")
        return

    tips = [
        (
            "📱 *SMS Verification Tip*\n\n"
            "Stop giving every app your real phone number.\n\n"
            "Get a temporary number in seconds — works with WhatsApp, Telegram, Instagram, and 200+ services.\n\n"
            f"🔗 [Get a Number]({SITES['sms']}/order)"
        ),
        (
            "🔐 *Privacy Reminder*\n\n"
            "Your phone number is basically your digital ID.\n\n"
            "SIM swap attacks are rising. Use temporary numbers for verification.\n\n"
            f"🔗 [Try It]({SITES['sms']}/order)"
        ),
        (
            "✅ *Quick Tip*\n\n"
            "Need to verify an account without your real number?\n\n"
            "Real non-VoIP numbers, crypto payment, no KYC.\n\n"
            f"🔗 [GetSMSNow]({SITES['sms']})"
        ),
    ]
    text = random.choice(tips)
    await send_telegram(channel, text)
    logger.info("SMS post sent")


async def post_games():
    channel = CHANNELS.get("games")
    if not channel:
        logger.warning("CHANNEL_GAMES not set, skipping games post")
        return

    games_list = [
        ("💣 BomBom", "Multiplayer Bomberman in your browser — blast your friends!", f"{SITES['games']}/bombom"),
        ("🎯 Wild Ones", "Artillery battle — aim, shoot, destroy! No download needed.", f"{SITES['games']}/wildones"),
        ("♟️ Chess Arena", "Play chess with video chat — see your opponent's face!", f"{SITES['games']}/chess"),
    ]
    name, desc, url = random.choice(games_list)
    text = (
        f"🎮 *Game of the Day*\n\n"
        f"*{name}*\n"
        f"{desc}\n\n"
        f"📱 Works on mobile + desktop\n"
        f"👥 No login required\n\n"
        f"▶️ [Play Now]({url})"
    )
    await send_telegram(channel, text)
    logger.info(f"Games post sent: {name}")


BRAND_FUNCS = {
    "film": post_film,
    "card": post_card,
    "sms": post_sms,
    "games": post_games,
}


async def main():
    if not BOT_TOKEN:
        logger.error("TELEGRAM_BOT_TOKEN not set")
        return

    args = sys.argv[1:]

    if "--all" in args:
        brands = list(BRAND_FUNCS.keys())
    elif "--brand" in args:
        idx = args.index("--brand")
        brand = args[idx + 1] if idx + 1 < len(args) else ""
        if brand not in BRAND_FUNCS:
            logger.error(f"Unknown brand: {brand}. Available: {list(BRAND_FUNCS.keys())}")
            return
        brands = [brand]
    else:
        day = datetime.now().weekday()
        brands = SCHEDULE.get(day, [])
        if not brands:
            logger.info(f"No posts scheduled for today ({datetime.now().strftime('%A')})")
            return

    for brand in brands:
        try:
            await BRAND_FUNCS[brand]()
        except Exception as e:
            logger.error(f"Error posting {brand}: {e}")


if __name__ == "__main__":
    asyncio.run(main())
