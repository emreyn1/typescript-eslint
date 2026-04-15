"""
Telegram chat mirror (Telethon): copy history as new messages, then listen.

  python3 -u telegram_mirror.py -i
  TG_NON_INTERACTIVE=1 python3 -u telegram_mirror.py

Requires TG_API_ID, TG_API_HASH, TG_PHONE, TG_SOURCE_CHAT, TG_TARGET_CHAT — see .env.example.
"""
from __future__ import annotations

import asyncio
import os
import random
import sys
from typing import Optional

from telethon import TelegramClient, events


def load_dotenv_local() -> None:
    """Load `.env` next to this script if present (no python-dotenv dependency). Does not override existing env."""
    path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    if not os.path.isfile(path):
        return
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" not in line:
                continue
            k, _, v = line.partition("=")
            k, v = k.strip(), v.strip()
            if len(v) >= 2 and ((v[0] == v[-1] == '"') or (v[0] == v[-1] == "'")):
                v = v[1:-1]
            if k and k not in os.environ:
                os.environ[k] = v


def parse_chat_id_str(s: str) -> int:
    """Parse chat ID; tolerate accidental '--100…' from copy-paste."""
    t = s.strip().replace(" ", "")
    while t.startswith("--"):
        t = t[1:]
    return int(t)


def log(msg: str) -> None:
    print(msg, flush=True)


def mandatory_env(name: str) -> str:
    v = os.environ.get(name, "").strip()
    if not v:
        log(f"Missing {name}. Copy .env.example to .env and set variables (see README).")
        raise SystemExit(1)
    return v


def optional_chat_id(key: str) -> Optional[int]:
    v = os.environ.get(key, "").strip()
    if not v:
        return None
    return parse_chat_id_str(v)


# Optional suffix (unset = no extra text). Example in .env: TG_FOOTER=$'\n\nMyChannel'
_f = os.environ.get("TG_FOOTER")
FOOTER = "" if _f is None else str(_f).rstrip()
DELAY = (1.2, 3.5)
CAPTION_MAX = 1024
MESSAGE_MAX = 4096


def trunc(s: str, max_len: int) -> str:
    s = s.strip()
    if len(s) <= max_len:
        return s
    if max_len <= 1:
        return "…"[:max_len]
    return s[: max_len - 1] + "…"


def flags() -> dict:
    a = sys.argv[1:]
    out: dict = {"i": False, "reset": False, "skip": False, "relogin": False, "source": None, "target": None}
    i = 0
    while i < len(a):
        x = a[i]
        if x in ("-i", "--interactive"):
            out["i"] = True
        elif x == "--reset-progress":
            out["reset"] = True
        elif x == "--skip-history":
            out["skip"] = True
        elif x == "--relogin":
            out["relogin"] = True
        elif x == "--source" and i + 1 < len(a):
            out["source"] = parse_chat_id_str(a[i + 1])
            i += 1
        elif x == "--target" and i + 1 < len(a):
            out["target"] = parse_chat_id_str(a[i + 1])
            i += 1
        i += 1
    return out


def session_path() -> str:
    base = os.environ.get("TG_SESSION_DIR", "").strip() or os.path.join(
        os.path.expanduser("~"), ".cache", "telegram_autoforwarder"
    )
    base = os.path.abspath(os.path.expanduser(base))
    os.makedirs(base, mode=0o700, exist_ok=True)
    return os.path.join(base, "session_signal")


def progress_file(session: str) -> str:
    return os.path.join(os.path.dirname(session), "last_id.txt")


def read_id(path: str) -> int:
    try:
        with open(path, encoding="utf-8") as f:
            return int(f.read().strip() or "0")
    except (OSError, ValueError):
        return 0


def write_id(path: str, n: int) -> None:
    try:
        with open(path, "w", encoding="utf-8") as f:
            f.write(str(n))
    except OSError as e:
        log(f"⚠️ could not save progress: {e}")


def wipe_session(base: str) -> None:
    for suf in (".session", ".session-journal", ".session-wal", ".session-shm"):
        p = base + suf
        if os.path.isfile(p):
            try:
                os.remove(p)
            except OSError:
                pass


def interactive(src: Optional[int], tgt: Optional[int]) -> tuple[int, int, bool, bool, bool]:
    log("\n=== Telegram Chat Mirror ===\nCtrl+C to stop.\n")
    had_both = src is not None and tgt is not None
    if src is None:
        s = input("Source chat ID (TG_SOURCE_CHAT, e.g. -100…): ").strip()
        if not s:
            log("Missing source chat ID.")
            raise SystemExit(1)
        src = parse_chat_id_str(s)
    if tgt is None:
        t = input("Target chat ID (TG_TARGET_CHAT, e.g. -100…): ").strip()
        if not t:
            log("Missing target chat ID.")
            raise SystemExit(1)
        tgt = parse_chat_id_str(t)
    if had_both:
        if input("Change source/target IDs? [y/N]: ").strip().lower() in ("y", "yes"):
            s = input(f"Source chat [{src}]: ").strip()
            if s:
                src = parse_chat_id_str(s)
            t = input(f"Target chat [{tgt}]: ").strip()
            if t:
                tgt = parse_chat_id_str(t)

    log("\n1) Standard  2) Reset all history  3) Live only  4) Re-login")
    c = input("Choice [1]: ").strip() or "1"
    reset = c == "2"
    skip = c == "3"
    relog = c == "4"
    if relog and input("Also reset copy progress? [y/N]: ").strip().lower() in ("y", "yes"):
        reset = True
    return src, tgt, reset, skip, relog


def skip_msg(m) -> bool:
    return not m or not getattr(m, "id", None) or getattr(m, "action", None)


async def copy_one(client, peer, msg) -> None:
    if skip_msg(msg):
        return
    await asyncio.sleep(random.uniform(*DELAY))
    try:
        if msg.media:
            cap = ((msg.text or "") + FOOTER).strip()
            cap = trunc(cap, CAPTION_MAX) if cap else None
            await client.send_file(peer, msg.media, caption=cap, force_document=False)
        else:
            text = trunc((msg.text or "") + FOOTER, MESSAGE_MAX)
            if text.strip():
                await client.send_message(peer, text)
    except Exception as e:
        try:
            await msg.forward_to(peer)
            log(f"⚠️ id={getattr(msg, 'id', '?')}: send as new failed ({e}); used forward fallback")
        except Exception as e2:
            log(f"❌ id={getattr(msg, 'id', '?')}: {e} | fallback: {e2}")


async def run() -> None:
    load_dotenv_local()
    api_id = int(mandatory_env("TG_API_ID"))
    api_hash = mandatory_env("TG_API_HASH")
    phone = mandatory_env("TG_PHONE")

    f = flags()
    src: Optional[int] = f["source"] if f["source"] is not None else optional_chat_id("TG_SOURCE_CHAT")
    tgt: Optional[int] = f["target"] if f["target"] is not None else optional_chat_id("TG_TARGET_CHAT")
    reset = f["reset"]
    skip = f["skip"]
    relog = f["relogin"]

    if f["i"] and sys.stdin.isatty() and os.environ.get("TG_NON_INTERACTIVE", "").strip() not in ("1", "true", "yes"):
        s, t, rp, sk, rl = interactive(src, tgt)
        src, tgt = s, t
        reset, skip, relog = reset or rp, skip or sk, relog or rl

    if os.environ.get("RESET_PROGRESS", "").strip() in ("1", "true", "yes"):
        reset = True
    if os.environ.get("SKIP_HISTORY", "").strip() in ("1", "true", "yes"):
        skip = True
    if os.environ.get("FORCE_NEW_LOGIN", "").strip() in ("1", "true", "yes"):
        relog = True

    if src is None or tgt is None:
        log(
            "Missing chat IDs. Set TG_SOURCE_CHAT and TG_TARGET_CHAT, "
            "or pass --source / --target, or run with -i (TTY) to enter them."
        )
        raise SystemExit(1)

    sess = session_path()
    prog = progress_file(sess)
    last0 = 0 if reset else read_id(prog)

    if relog:
        wipe_session(sess)
        log("Session cleared.")

    old = os.path.join(os.path.dirname(__file__), "session_signal.session")
    if not os.path.isfile(sess + ".session") and os.path.isfile(old):
        try:
            import shutil

            shutil.copy2(old, sess + ".session")
            os.chmod(sess + ".session", 0o600)
        except OSError:
            pass

    client = TelegramClient(sess, api_id, api_hash, timeout=60, connection_retries=5)
    log("Connecting…")
    await client.start(phone=phone)

    try:
        src_e = await client.get_entity(src)
        tgt_e = await client.get_entity(tgt)
    except Exception as e:
        log(
            f"Cannot resolve source/target chat IDs.\n"
            f"  TG_SOURCE_CHAT={src!r}  TG_TARGET_CHAT={tgt!r}\n"
            f"  Supergroups/channels usually need the -100… form.\n"
            f"  Error: {e}"
        )
        raise SystemExit(1) from e
    st = getattr(src_e, "title", None) or getattr(src_e, "username", None) or src_e
    tt = getattr(tgt_e, "title", None) or getattr(tgt_e, "username", None) or tgt_e
    log(f"Source → {st} (peer id {getattr(src_e, 'id', '?')})")
    log(f"Target → {tt} (peer id {getattr(tgt_e, 'id', '?')})")

    if not skip:
        log(f"Backfill… (after message id {last0})")
        n = 0
        last = last0
        async for msg in client.iter_messages(src_e, reverse=True):
            if msg.id <= last0 or skip_msg(msg):
                continue
            await copy_one(client, tgt_e, msg)
            last = msg.id
            write_id(prog, last)
            n += 1
            if n % 25 == 0:
                log(f"  … {n} msgs (last id {last})")
        log(f"Backfill done: {n} message(s).")
    else:
        log("History skipped.")

    last_seen = read_id(prog)

    async def on_new(ev):
        nonlocal last_seen
        msg = ev.message
        if msg.id <= last_seen or skip_msg(msg):
            return
        await copy_one(client, tgt_e, msg)
        last_seen = msg.id
        write_id(prog, last_seen)
        log(f"✅ new id={msg.id}")

    client.add_event_handler(on_new, events.NewMessage(chats=src_e))
    log("Listening (Ctrl+C to exit).\n")
    try:
        await client.run_until_disconnected()
    finally:
        if client.is_connected():
            await client.disconnect()


if __name__ == "__main__":
    try:
        asyncio.run(run())
    except KeyboardInterrupt:
        log("\nStopped.")
