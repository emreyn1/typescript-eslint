# Lichess Fork — Setup & Rebranding Plan

## 1. Clone lila-docker

```bash
git clone --recurse-submodules https://github.com/lichess-org/lila-docker.git
cd lila-docker
```

## 2. System Requirements

- Docker + Docker Compose
- 12GB+ RAM (Lichess runs Scala, MongoDB, Redis, Elasticsearch, etc.)
- 20GB+ disk space
- Linux recommended (macOS works but slower)

## 3. First Run

```bash
./lila-docker run
```

This starts all services: lila (Scala app), lila-ws (WebSocket), MongoDB, Redis, Elasticsearch, Lilastockfish, etc.

## 4. Rebranding Touchpoints

### Site Name & Title
- `lila/conf/application.conf` — `net.domain`, `net.base_url`, `net.asset.domain`
- `lila/app/views/base/layout.scala.html` — page title template
- `lila/conf/messages/` — i18n strings containing "Lichess"

### Logo & Favicon
- `lila/public/logo/` — SVG/PNG logos
- `lila/public/favicon.ico`
- `lila/public/images/` — various brand images

### Colors & Theme
- `lila/ui/common/css/theme/` — SCSS theme variables
- `lila/ui/common/css/abstract/` — color definitions
- Primary green (#629924) → your brand color

### Footer & About Pages
- `lila/app/views/site/` — about, terms, privacy pages
- `lila/app/views/base/` — footer template

### Email Templates
- `lila/app/views/auth/` — email verification, password reset

## 5. WebRTC Video Chat Integration

### Architecture
- Lichess uses a WebSocket server (`lila-ws`) for real-time game communication
- WebRTC signaling (SDP offer/answer, ICE candidates) should be piped through this same WebSocket
- No need for Firebase or a separate signaling server

### Integration Steps

1. **Add signaling messages to lila-ws**:
   - New message types: `videoOffer`, `videoAnswer`, `videoIce`, `videoEnd`
   - Route these between the two players in a game room

2. **Add TypeScript module to lila UI**:
   - Copy `webrtc-module/webrtc.ts` and `webrtc-module/useWebRTC.ts` into `lila/ui/`
   - Adapt: replace React hook with vanilla TypeScript class (Lichess UI is Mithril.js, not React)

3. **Add video UI to game page**:
   - Small video overlays (PiP style) in the game view
   - "Enable Video" button in game toolbar
   - Consent required from both players before starting

4. **TURN Server**:
   - Use ExpressTurn.com (free tier) initially
   - Env vars: `EXPRESSTURN_USERNAME`, `EXPRESSTURN_PASSWORD`
   - Upgrade to Metered.ca or self-hosted coturn when traffic grows

### Files to Port
- `webrtc-module/webrtc.ts` — ICE server resolution, peer connection factory
- `webrtc-module/useWebRTC.ts` — connection lifecycle (adapt from React hook to class)

## 6. Environment Variables

```env
# Lichess core
LILA_DOMAIN=chess.yourdomain.com
LILA_SECRET=generate-a-long-random-string

# MongoDB (included in lila-docker)
MONGO_URI=mongodb://localhost:27017/lichess

# Redis (included in lila-docker)
REDIS_HOST=localhost

# WebRTC TURN server
EXPRESSTURN_USERNAME=
EXPRESSTURN_PASSWORD=
EXPRESSTURN_SERVER=free.expressturn.com
```

## 7. Deployment

1. Set up AlexHost VPS with 12GB+ RAM
2. Install Docker + Docker Compose
3. Clone this repo to VPS
4. Configure `.env` with domain and secrets
5. Run `./lila-docker run` behind Nginx reverse proxy
6. Point Cloudflare DNS to VPS
7. SSL via Cloudflare Full (Strict)

## 8. OPSEC Notes

- Register domain via Njalla (anonymous)
- Pay AlexHost with crypto
- Remove all Lichess attribution that violates AGPL-3.0 — you MUST keep the license and link to source code
- AGPL-3.0 requires: if you modify and serve, you must publish your source code
