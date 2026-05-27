/**
 * WebRTC Signaling Server for Lichess Fork
 *
 * Raw WebSocket protocol: JSON frames { event, data }
 * Compatible with client-patch/video-chat.ts
 *
 * Signaling flow:
 *   1. Two players connect with same gameId (via join-game)
 *   2. First: initiator (sends offer)
 *   3. Second: answerer (sends answer)
 *   4. ICE candidates relayed both ways
 *   5. P2P connection established; server only relays signaling
 */

import express from "express";
import { createServer } from "node:http";
import { WebSocketServer } from "ws";

const PORT = process.env.PORT || 3012;
const LICHESS_ORIGIN = process.env.LICHESS_ORIGIN || "http://localhost:8080";
const ALLOWED_ORIGINS = new Set([
  LICHESS_ORIGIN,
  "http://localhost:8080",
  "http://localhost:9663",
  "http://localhost:3000",
]);

const app = express();
const rooms = new Map();
const MAX_PER_ROOM = 2;

const RATE_LIMIT_WINDOW_MS = 1000;
const RATE_LIMIT_MAX_MESSAGES = 30;
const ROOM_IDLE_TIMEOUT_MS = 30 * 60 * 1000;
const GAME_ID_PATTERN = /^[a-zA-Z0-9]{8,12}$/;

const rateLimitMap = new Map();
const roomLastActivity = new Map();

function isRateLimited(clientId) {
  const now = Date.now();
  const record = rateLimitMap.get(clientId);
  
  if (!record || now - record.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(clientId, { windowStart: now, count: 1 });
    return false;
  }
  
  record.count++;
  return record.count > RATE_LIMIT_MAX_MESSAGES;
}

function isValidGameId(gameId) {
  return typeof gameId === "string" && GAME_ID_PATTERN.test(gameId);
}

function cleanupStaleRooms() {
  const now = Date.now();
  for (const [gameId, lastActivity] of roomLastActivity.entries()) {
    if (now - lastActivity > ROOM_IDLE_TIMEOUT_MS) {
      const peers = rooms.get(gameId) ?? [];
      peers.forEach((ws) => {
        ws.close(4008, "Room idle timeout");
      });
      rooms.delete(gameId);
      roomLastActivity.delete(gameId);
    }
  }
}

setInterval(cleanupStaleRooms, 60 * 1000);
setInterval(() => rateLimitMap.clear(), RATE_LIMIT_WINDOW_MS * 2);

app.get("/health", (_, res) =>
  res.json({ ok: true, rooms: rooms.size, connections: wss.clients.size, protocol: "ws-json" }),
);

const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer, path: "/lichess-rt" });

function send(ws, event, data) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify({ event, data }));
  }
}

function broadcastToRoom(gameId, sender, event, data) {
  const peers = rooms.get(gameId) ?? [];
  roomLastActivity.set(gameId, Date.now());
  for (const peer of peers) {
    if (peer !== sender && peer.readyState === peer.OPEN) {
      send(peer, event, data);
    }
  }
}

function removeFromRoom(ws) {
  const gameId = ws.gameId;
  if (!gameId) return;

  const peers = rooms.get(gameId) ?? [];
  const remaining = peers.filter((p) => p !== ws);
  if (remaining.length === 0) {
    rooms.delete(gameId);
    roomLastActivity.delete(gameId);
  } else {
    rooms.set(gameId, remaining);
    remaining.forEach((p) =>
      send(p, "peer-left", { fromId: ws.clientId }),
    );
  }
  ws.gameId = null;
  rateLimitMap.delete(ws.clientId);
}

wss.on("connection", (ws, req) => {
  const origin = req.headers.origin;
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    ws.close(4003, "Origin not allowed");
    return;
  }

  ws.clientId = crypto.randomUUID();
  ws.gameId = null;
  ws.isInitiator = false;

  ws.on("message", (raw) => {
    if (isRateLimited(ws.clientId)) {
      send(ws, "error", { message: "Rate limited" });
      return;
    }

    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }

    const { event, data } = msg;
    if (!event || typeof event !== "string") return;

    switch (event) {
      case "join-game": {
        const gid = data?.gameId;
        if (!gid) {
          send(ws, "error", { message: "gameId required" });
          return;
        }

        if (!isValidGameId(gid)) {
          send(ws, "error", { message: "Invalid gameId format" });
          return;
        }

        const existing = rooms.get(gid) ?? [];
        if (existing.length >= MAX_PER_ROOM) {
          send(ws, "error", { message: "Room full" });
          return;
        }

        ws.gameId = gid;
        ws.userId = data?.userId;
        existing.push(ws);
        rooms.set(gid, existing);
        roomLastActivity.set(gid, Date.now());

        if (existing.length === 1) {
          ws.isInitiator = true;
          send(ws, "role", { initiator: true });
        } else {
          ws.isInitiator = false;
          send(ws, "role", { initiator: false });
          send(existing[0], "peer-joined", { peerId: ws.clientId });
        }
        break;
      }

      case "offer":
        if (ws.gameId) {
          broadcastToRoom(ws.gameId, ws, "offer", {
            sdp: data?.sdp,
            fromId: ws.clientId,
          });
        }
        break;

      case "answer":
        if (ws.gameId) {
          broadcastToRoom(ws.gameId, ws, "answer", {
            sdp: data?.sdp,
            fromId: ws.clientId,
          });
        }
        break;

      case "ice-candidate":
        if (ws.gameId) {
          broadcastToRoom(ws.gameId, ws, "ice-candidate", {
            candidate: data?.candidate,
            fromId: ws.clientId,
          });
        }
        break;

      case "media-state":
        if (ws.gameId) {
          broadcastToRoom(ws.gameId, ws, "peer-media-state", {
            video: data?.video,
            audio: data?.audio,
            fromId: ws.clientId,
          });
        }
        break;

      default:
        break;
    }
  });

  ws.on("close", () => removeFromRoom(ws));
  ws.on("error", () => removeFromRoom(ws));
});

httpServer.listen(PORT, () => {
  console.log(`Chess signaling server on port ${PORT}`);
  console.log(`WebSocket path: /lichess-rt`);
  console.log(`Allowed origins: ${[...ALLOWED_ORIGINS].join(", ")}`);
});
