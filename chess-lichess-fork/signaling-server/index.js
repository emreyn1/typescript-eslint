/**
 * WebRTC Signaling Server for Lichess Fork
 *
 * Lichess oyunlarına video/ses ekler.
 * Lichess → game URL → /lichess-rt?gameId=XXXX endpoint'ine bağlanır.
 *
 * Signaling flow:
 *   1. İki oyuncu aynı gameId ile bağlanır
 *   2. İlk gelen: initiator (offer gönderir)
 *   3. İkinci gelen: answerer (answer gönderir)
 *   4. ICE candidate'lar karşılıklı iletilir
 *   5. P2P bağlantı kurulur, bu sunucu devre dışı kalır
 */

import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";

const PORT = process.env.PORT || 3012;
const LICHESS_ORIGIN = process.env.LICHESS_ORIGIN || "http://localhost:9663";

const app = express();
app.get("/health", (_, res) => res.json({ ok: true, rooms: rooms.size }));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [LICHESS_ORIGIN, "http://localhost:3000"],
    methods: ["GET", "POST"],
  },
  path: "/lichess-rt",
  transports: ["websocket"],
});

// ─── Room Map: gameId → [socket1, socket2] ───────────────────────────────────
const rooms = new Map();
const MAX_PER_ROOM = 2;

io.on("connection", (socket) => {
  let gameId = null;
  let isInitiator = false;

  socket.on("join-game", ({ gameId: gid, userId }) => {
    if (!gid) { socket.emit("error", "gameId required"); return; }
    gameId = gid;
    socket.data.userId = userId;

    const existing = rooms.get(gameId) ?? [];
    if (existing.length >= MAX_PER_ROOM) {
      socket.emit("error", "Room full");
      return;
    }

    existing.push(socket);
    rooms.set(gameId, existing);
    socket.join(gameId);

    if (existing.length === 1) {
      // First to join → initiator
      isInitiator = true;
      socket.emit("role", { initiator: true });
    } else {
      // Second player → answerer; tell initiator to create offer
      isInitiator = false;
      socket.emit("role", { initiator: false });
      existing[0].emit("peer-joined", { peerId: socket.id });
    }
  });

  // Relay offer from initiator to answerer
  socket.on("offer", ({ sdp }) => {
    if (!gameId) return;
    socket.to(gameId).emit("offer", { sdp, fromId: socket.id });
  });

  // Relay answer back to initiator
  socket.on("answer", ({ sdp }) => {
    if (!gameId) return;
    socket.to(gameId).emit("answer", { sdp, fromId: socket.id });
  });

  // Relay ICE candidates
  socket.on("ice-candidate", ({ candidate }) => {
    if (!gameId) return;
    socket.to(gameId).emit("ice-candidate", { candidate, fromId: socket.id });
  });

  // Mute/unmute signal
  socket.on("media-state", ({ video, audio }) => {
    if (!gameId) return;
    socket.to(gameId).emit("peer-media-state", { video, audio, fromId: socket.id });
  });

  socket.on("disconnect", () => {
    if (!gameId) return;
    const peers = rooms.get(gameId) ?? [];
    const remaining = peers.filter((s) => s.id !== socket.id);
    if (remaining.length === 0) {
      rooms.delete(gameId);
    } else {
      rooms.set(gameId, remaining);
      remaining.forEach((s) => s.emit("peer-left", { fromId: socket.id }));
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Chess signaling server on port ${PORT}`);
  console.log(`Lichess origin: ${LICHESS_ORIGIN}`);
});
