# Chess Lichess Fork + WebRTC Video/Audio

Lichess clone with real-time peer video and voice during live games.

## Architecture

- **Lichess (lila-docker)**: chess moves via `lila-ws`
- **Signaling server** (`signaling-server/`, port 3012): WebSocket JSON relay for SDP/ICE
- **WebRTC P2P**: browser video/audio after signaling
- **STUN/TURN**: Google STUN + optional [ExpressTurn](https://www.expressturn.com/) TURN

```
Player A ──ws──► signaling-server ◄──ws── Player B
    └──────────── WebRTC P2P (video+audio) ────────────┘
```

## Quick start

### 1. Signaling server

```bash
cd signaling-server && npm install && npm start
# ws://localhost:3012/lichess-rt
```

Or with Docker:

```bash
docker compose -f docker-compose.signaling.yml up -d
```

### 2. Lichess (lila-docker)

Requires Docker Desktop, **12GB+ RAM**, ~20GB disk.

```bash
cd lila-docker
./lila-docker start   # first run: setup wizard, pulls images
# Site: http://localhost:8080
```

The `lila` source is at `lila-docker/repos/lila` (cloned automatically or via setup).

### 3. Environment (TURN + signaling)

Copy `.env.example` to `.env` and set:

```env
EXPRESSTURN_USERNAME=your_user
EXPRESSTURN_PASSWORD=your_pass
EXPRESSTURN_SERVER=free.expressturn.com
LICHESS_RT_SIGNAL_URL=ws://localhost:3012/lichess-rt
LICHESS_RT_ENABLED=true
```

Pass these into the lila container via `lila-docker` env or `conf/lila.conf` host env.

### 4. Re-apply client patches (after lila pull)

```bash
./scripts/apply-video-chat-to-lila.sh
```

## Repo layout

| Path | Purpose |
|------|---------|
| `lila-docker/` | Official Lichess dev stack |
| `lila-docker/repos/lila/` | Lichess source (patched) |
| `signaling-server/` | WebRTC signaling (raw `ws`) |
| `webrtc-module/` | ICE helpers + `VideoChatCtrl` |
| `client-patch/` | Source copies for `ui/round` |
| `docker-compose.signaling.yml` | Signaling-only compose |

## In-game behavior

On **player** pages (not spectator, not vs AI):

1. Camera/mic permission prompt
2. PiP panel (bottom-right): local + remote video
3. Mute video/audio, hang up

Disable globally: `LICHESS_RT_ENABLED=false`

## AGPL

Lichess is AGPL-3.0. If you deploy a modified version, you must publish your source.
