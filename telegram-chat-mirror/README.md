# Telegram Chat Mirror

**User-account** Telegram utility: copy a chat’s history into another chat as **new messages** (not forwards), then **keep mirroring** new posts. Use when forwarding is blocked or you want a clean destination feed.

| | |
|--|--|
| **Entry point** | [`telegram_mirror.py`](telegram_mirror.py) |
| **Stack** | Python 3.9+, [Telethon](https://github.com/LonamiWebs/Telethon) |
| **License** | [MIT](LICENSE) |
| **Interactive** | `python3 -u telegram_mirror.py -i` (English prompts, TTY) |

---

## Naming (GitHub)

| What | Recommendation |
|------|----------------|
| **Repository name** | `telegram-chat-mirror` (lowercase, hyphens — easy to read, search-friendly) |
| **Description** | *Mirror Telegram chats as new messages — Telethon, Python, backfill + live sync* |
| **Topics** (repo Settings → General) | `telegram` `telethon` `python` `telegram-client` `channel-sync` `automation` `chat-mirror` |

If this folder lives inside a **monorepo**, keep any path you like locally; when you publish, create a **new GitHub repo** with the name above and push only this directory as the root (or use a subtree split).

---

## Features

- Backfill + live listener with **resume** (`last_id.txt` next to the session file)
- **Interactive** menu: standard / reset history / live-only / re-login
- **CLI flags** for automation (`--reset-progress`, `--skip-history`, `--relogin`, `--source`, `--target`)
- Caption / message length limits (Telegram 1024 / 4096)
- Optional **footer** via `TG_FOOTER`
- **No secrets in code** — `.env.example` + local `.env` (gitignored)

---

## Quick start

```bash
git clone <repository-url>
cd telegram-chat-mirror
pip install -r requirements.txt
cp .env.example .env
# Edit .env: TG_API_ID, TG_API_HASH, TG_PHONE, TG_SOURCE_CHAT, TG_TARGET_CHAT
python3 -u telegram_mirror.py -i
```

`.env` in the **same folder as** `telegram_mirror.py` is loaded automatically (existing shell variables are **not** overridden).

---

## Interactive flow (`-i`)

1. Missing source/target in env → prompted for numeric chat IDs (often `-100…`).
2. Both set → `Change source/target IDs? [y/N]:`.
3. **Mode:** `1` Standard · `2` Reset all history · `3` Live only · `4` Re-login.
4. First login: code to `TG_PHONE`.

**Headless / cron:** `TG_NON_INTERACTIVE=1 python3 -u telegram_mirror.py`

---

## CLI flags

| Flag | Meaning |
|------|--------|
| `-i`, `--interactive` | Menu (TTY) |
| `--reset-progress` | Full history again |
| `--skip-history` | New messages only |
| `--relogin` | Wipe session before connect |
| `--source ID` / `--target ID` | Override chats |

---

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `TG_API_ID` | yes | [my.telegram.org](https://my.telegram.org) |
| `TG_API_HASH` | yes | Same |
| `TG_PHONE` | yes | E.164 |
| `TG_SOURCE_CHAT` | yes* | Source chat ID |
| `TG_TARGET_CHAT` | yes* | Target chat ID |
| `TG_FOOTER` | no | Suffix per copy; unset = none |
| `TG_SESSION_DIR` | no | Session + `last_id.txt` directory |
| `TG_NON_INTERACTIVE` | no | `1` / `true` / `yes` = no prompts |
| `RESET_PROGRESS` / `SKIP_HISTORY` / `FORCE_NEW_LOGIN` | no | Same as flags |

\*Or `--source` / `--target`, or `-i` and type IDs.

### Chat IDs

Use **user-client** IDs (e.g. @RawDataBot). Supergroups/channels are usually `-100…`. You must **join** the target and **be allowed to post**.

---

## Diagnostics

```bash
python3 diagnose.py
```

---

## Security & legal

- Never commit `.env`, `*.session`, or `last_id.txt`. See [SECURITY.md](SECURITY.md).
- Follow **Telegram ToS**, channel rules, and copyright. You are responsible for use.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
