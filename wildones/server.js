import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3011;

// ─── Game Constants ───────────────────────────────────────────────────────────
const MAP_W = 1200;
const MAP_H = 500;
const GRAVITY = 0.4;
const MAX_PLAYERS = 4;
const TURN_TIME = 20000; // 20s per turn
const ROUND_DELAY = 2000;

const WEAPONS = {
  cannon: { name: "Cannon Ball", damage: 30, blastRadius: 40, ammo: Infinity, speed: 14 },
  grenade: { name: "Grenade", damage: 50, blastRadius: 65, ammo: 3, speed: 10 },
  missile: { name: "Missile", damage: 75, blastRadius: 80, ammo: 1, speed: 18 },
  shotgun: { name: "Shotgun", damage: 20, blastRadius: 25, ammo: Infinity, speed: 16 },
};

const ANIMALS = ["🐻", "🦊", "🐺", "🐯", "🦁", "🐸", "🐱", "🐶"];
const SPAWNS = [
  { x: 150, y: 300 }, { x: 1050, y: 300 },
  { x: 400, y: 200 }, { x: 800, y: 200 },
];

// ─── Terrain ──────────────────────────────────────────────────────────────────
function generateTerrain() {
  // Simple heightmap — smooth hills
  const points = [];
  let h = MAP_H * 0.55;
  for (let x = 0; x <= MAP_W; x += 10) {
    h += (Math.random() - 0.5) * 18;
    h = Math.max(MAP_H * 0.35, Math.min(MAP_H * 0.78, h));
    points.push({ x, y: Math.round(h) });
  }
  return points;
}

function getTerrainY(terrain, x) {
  const idx = Math.floor(x / 10);
  if (idx < 0) return terrain[0]?.y ?? MAP_H * 0.6;
  if (idx >= terrain.length - 1) return terrain[terrain.length - 1]?.y ?? MAP_H * 0.6;
  const t = (x / 10) - idx;
  return terrain[idx].y * (1 - t) + terrain[idx + 1].y * t;
}

// ─── Physics ──────────────────────────────────────────────────────────────────
function simulateProjectile(terrain, ox, oy, vx, vy, weapon) {
  const steps = [];
  let x = ox, y = oy;
  let dvx = vx, dvy = vy;

  for (let i = 0; i < 500; i++) {
    x += dvx;
    y += dvy;
    dvy += GRAVITY;
    steps.push({ x: Math.round(x), y: Math.round(y) });

    const ty = getTerrainY(terrain, x);
    if (y >= ty || x < 0 || x > MAP_W) {
      return { steps, impact: { x: Math.round(x), y: Math.round(ty) } };
    }
  }
  return { steps, impact: { x: Math.round(x), y: Math.round(y) } };
}

function deformTerrain(terrain, ix, iy, radius) {
  return terrain.map((p) => {
    const dx = p.x - ix;
    const dist = Math.abs(dx);
    if (dist < radius) {
      const depth = Math.sqrt(radius * radius - dx * dx);
      const newY = Math.max(p.y, iy + depth * 0.7);
      return { ...p, y: Math.round(newY) };
    }
    return p;
  });
}

// ─── Room ─────────────────────────────────────────────────────────────────────
class WildRoom {
  constructor(id) {
    this.id = id;
    this.players = new Map();
    this.terrain = generateTerrain();
    this.turnOrder = [];
    this.turnIdx = 0;
    this.started = false;
    this.turnTimer = null;
    this.projectileId = 0;
    this.chatLog = [];
  }

  addPlayer(socket, name, animal) {
    if (this.players.size >= MAX_PLAYERS) return false;
    const idx = this.players.size;
    const spawn = SPAWNS[idx];
    const terrainY = getTerrainY(this.terrain, spawn.x);
    this.players.set(socket.id, {
      id: socket.id,
      name: name.slice(0, 16),
      animal: ANIMALS[Math.floor(Math.random() * ANIMALS.length)],
      color: ["#f87171", "#60a5fa", "#34d399", "#fbbf24"][idx],
      x: spawn.x,
      y: terrainY - 20,
      hp: 100,
      facing: idx < 2 ? 1 : -1,
      ammo: { cannon: Infinity, grenade: 3, missile: 1, shotgun: Infinity },
      alive: true,
    });
    return true;
  }

  start() {
    this.started = true;
    this.turnOrder = [...this.players.keys()];
    this.startTurn();
  }

  currentPlayer() {
    return this.players.get(this.turnOrder[this.turnIdx]);
  }

  startTurn() {
    clearTimeout(this.turnTimer);
    const cp = this.currentPlayer();
    if (!cp) return;

    const roomId = this.id;
    this.turnTimer = setTimeout(() => {
      io.to(roomId).emit("turnTimeout");
      this.nextTurn();
    }, TURN_TIME);

    io.to(this.id).emit("yourTurn", {
      playerId: cp.id,
      timeLeft: TURN_TIME,
      weapons: Object.entries(WEAPONS).map(([key, w]) => ({
        key, name: w.name,
        ammo: cp.ammo[key] === Infinity ? "∞" : cp.ammo[key],
      })),
    });
  }

  nextTurn() {
    clearTimeout(this.turnTimer);
    // Skip dead players
    let attempts = 0;
    do {
      this.turnIdx = (this.turnIdx + 1) % this.turnOrder.length;
      attempts++;
      if (attempts > this.turnOrder.length) break;
    } while (!this.players.get(this.turnOrder[this.turnIdx])?.alive);

    setTimeout(() => this.startTurn(), ROUND_DELAY);
  }

  fire(socketId, angle, power, weaponKey) {
    const cp = this.currentPlayer();
    if (!cp || cp.id !== socketId) return null;
    if (!cp.alive) return null;

    const weapon = WEAPONS[weaponKey] || WEAPONS.cannon;
    if (cp.ammo[weaponKey] !== Infinity) {
      if (cp.ammo[weaponKey] <= 0) return null;
      cp.ammo[weaponKey]--;
    }

    cp.facing = Math.cos(angle) > 0 ? 1 : -1;

    const speed = weapon.speed * (0.5 + power * 0.5);
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    const { steps, impact } = simulateProjectile(this.terrain, cp.x, cp.y - 10, vx, vy, weapon);

    // Deform terrain
    this.terrain = deformTerrain(this.terrain, impact.x, impact.y, weapon.blastRadius);

    // Damage players in blast radius
    const hits = [];
    for (const p of this.players.values()) {
      if (!p.alive) continue;
      const dx = p.x - impact.x;
      const dy = p.y - impact.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < weapon.blastRadius + 20) {
        const dmg = Math.round(weapon.damage * (1 - dist / (weapon.blastRadius + 20)));
        p.hp = Math.max(0, p.hp - dmg);
        if (p.hp === 0) p.alive = false;

        // Knock player up
        p.y = Math.min(getTerrainY(this.terrain, p.x) - 20, p.y - 30);

        hits.push({ id: p.id, dmg, hp: p.hp, alive: p.alive });
      }
    }

    const result = {
      id: ++this.projectileId,
      steps: steps.slice(0, 200), // limit payload
      impact,
      weapon: weaponKey,
      blastRadius: weapon.blastRadius,
      hits,
      terrain: this.terrain,
    };

    return result;
  }

  checkWin() {
    const alive = [...this.players.values()].filter((p) => p.alive);
    if (alive.length <= 1) return alive[0] ?? null;
    return undefined;
  }

  getState() {
    return {
      players: [...this.players.values()],
      terrain: this.terrain,
      turnPlayerId: this.currentPlayer()?.id,
    };
  }
}

// ─── Server ───────────────────────────────────────────────────────────────────
const app = express();
app.use(express.static(join(__dirname, "public")));
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

const rooms = new Map();

function getOrCreateRoom() {
  for (const r of rooms.values()) {
    if (!r.started && r.players.size < MAX_PLAYERS) return r;
  }
  const id = Math.random().toString(36).slice(2, 8).toUpperCase();
  const room = new WildRoom(id);
  rooms.set(id, room);
  return room;
}

io.on("connection", (socket) => {
  let currentRoom = null;

  socket.on("join", ({ name }) => {
    const room = getOrCreateRoom();
    const ok = room.addPlayer(socket, name || "Player");
    if (!ok) { socket.emit("error", "Room full"); return; }

    currentRoom = room;
    socket.join(room.id);
    socket.emit("joined", { roomId: room.id, playerId: socket.id, state: room.getState() });
    io.to(room.id).emit("state", room.getState());

    if (room.players.size >= 2) {
      setTimeout(() => {
        if (!room.started && room.players.size >= 2) {
          room.start();
          io.to(room.id).emit("start", room.getState());
        }
      }, 3000);
    }
  });

  socket.on("fire", ({ angle, power, weapon }) => {
    if (!currentRoom) return;
    const result = currentRoom.fire(socket.id, angle, power, weapon);
    if (!result) return;

    io.to(currentRoom.id).emit("shot", result);

    setTimeout(() => {
      const win = currentRoom.checkWin();
      if (win !== undefined) {
        io.to(currentRoom.id).emit("gameOver", { winner: win });
        rooms.delete(currentRoom.id);
      } else {
        currentRoom.nextTurn();
      }
    }, 2500);
  });

  socket.on("chat", ({ msg }) => {
    if (!currentRoom || !msg) return;
    const p = currentRoom.players.get(socket.id);
    if (!p) return;
    io.to(currentRoom.id).emit("chat", { name: p.name, msg: msg.slice(0, 80), color: p.color });
  });

  socket.on("disconnect", () => {
    if (!currentRoom) return;
    currentRoom.players.delete(socket.id);
    io.to(currentRoom.id).emit("state", currentRoom.getState());
    if (currentRoom.players.size === 0) rooms.delete(currentRoom.id);
  });
});

httpServer.listen(PORT, () => console.log(`Wild Ones server on port ${PORT}`));
