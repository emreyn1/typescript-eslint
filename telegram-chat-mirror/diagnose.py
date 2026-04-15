#!/usr/bin/env python3
"""Check writable session directories and Telethon version."""
import os
import sys
import tempfile

try:
    import telethon
except ImportError:
    print("Install telethon: pip install -r requirements.txt")
    sys.exit(1)

print("Telethon:", getattr(telethon, "__version__", "?"))
print("Python:", sys.version.split()[0])
print("HOME:", os.path.expanduser("~"))
print("tempdir:", tempfile.gettempdir())
print()

candidates = [
    os.environ.get("TG_SESSION_DIR", "").strip(),
    os.path.join(os.path.expanduser("~"), ".cache", "telegram_autoforwarder"),
    os.path.join(os.path.expanduser("~"), ".telegram_autoforwarder"),
    os.path.join(
        os.path.expanduser("~"),
        "Library",
        "Application Support",
        "TelegramAutoforwarder",
    ),
    os.path.join(tempfile.gettempdir(), f"tg_autoforwarder_{getattr(os, 'getuid', lambda: 0)()}"),
]

seen = set()
for raw in candidates:
    if not raw:
        continue
    d = os.path.abspath(os.path.expanduser(raw))
    if d in seen:
        continue
    seen.add(d)
    ok = False
    err = ""
    try:
        os.makedirs(d, mode=0o700, exist_ok=True)
        t = os.path.join(d, ".probe")
        with open(t, "w", encoding="utf-8") as f:
            f.write("x")
        os.remove(t)
        ok = True
    except OSError as e:
        err = str(e)
    print(f"{'OK ' if ok else 'BAD'} {d}")
    if not ok:
        print(f"     -> {err}")

print()
print(
    "Example: mkdir -p /tmp/tg_session && export TG_SESSION_DIR=/tmp/tg_session && python3 -u telegram_mirror.py"
)
