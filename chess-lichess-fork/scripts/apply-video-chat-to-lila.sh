#!/usr/bin/env bash
# Apply chess-lichess-fork WebRTC patches into lila-docker/repos/lila
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LILA="${LILA_ROOT:-$ROOT/lila-docker/repos/lila}"

if [[ ! -d "$LILA/ui/round" ]]; then
  echo "lila not found at $LILA — clone first:"
  echo "  git clone --depth 1 https://github.com/lichess-org/lila.git $LILA"
  exit 1
fi

echo "Copying WebRTC client modules..."
cp "$ROOT/webrtc-module/webrtc.ts" "$LILA/ui/round/src/webrtc.ts"
cp "$ROOT/webrtc-module/VideoChatCtrl.ts" "$LILA/ui/round/src/VideoChatCtrl.ts"
cp "$ROOT/client-patch/video-chat.ts" "$LILA/ui/round/src/video-chat.ts"
cp "$ROOT/client-patch/_video-chat.scss" "$LILA/ui/round/css/_video-chat.scss"

echo "Done. Rebuild lila UI assets inside lila-docker:"
echo "  cd lila-docker && ./lila-docker start"
