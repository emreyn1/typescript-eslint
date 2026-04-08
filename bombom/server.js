import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3010;

// ─── Grid Constants ──────────────────────────────────────────────────────────
const GRID = 13;
const TICK = 100; // ms per game tick
const BOMB_TIMER = 3000; // ms
const MOVE_COOLDOWN = 150; // ms between moves

const CELL = { EMPTY: 0, WALL: 1, BOX: 2, POWER_BOMB: 3, POWER_RANGE: 4, POWER_SPEED: 5 };

const SPAWNS = [
  { x: 1, y: 1 }, { x: 11, y: 1 },
  { x: 1, y: 11 }, { x: 11, y: 11 },
];

const SAFE_CELLS = new Set(
  SPAWNS.flatMap(({ x, y }) => [
    `${x},${y}`, `${x + 1},${y}`, `${x},${y + 1}`,
    `${x - 1},${y}`, `${x},${y - 1}`,
  ])
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function makeGrid() {
  const g = Array.from({ length: GRID }, (_, y) =>
    Array.from({ length: GRID }, (_, x) => {
      if (x === 0 || y === 0 || x === GRID - 1 || y === GRID - 1) return CELL.WALL;
      if (x % 2 === 0 && y % 2 === 0) return CELL.WALL;
      if (SAFE_CELLS.has(`${x},${y}`)) return CELL.EMPTY;
      return Math.random() < 0.65 ? CELL.BOX : CELL.EMPTY;
    })
  );
  return g;
}

function inBounds(x, y) {
  return x >= 0 && y >= 0 && x < GRID && y < GRID;
}

// ─── Room ─────────────────────────────────────────────────────────────────────
class Room {
  constructor(id) {
    this.id = id;
    this.players = new Map(); // socketId → player
    this.grid = makeGrid();
    this.bombs = [];         // { id, x, y, owner, range, timer, exploding }
    this.explosions = [];    // { x, y, expires }
    this.started = false;
    this.tickInterval = null;
    this.bombId = 0;
  }

  addPlayer(socket, name, color) {
    const idx = this.players.size;
    if (idx >= 4) return false;
    const spawn = SPAWNS[idx];
    this.players.set(socket.id, {
      id: socket.id,
      name: name.slice(0, 16),
      color,
      x: spawn.x,
      y: spawn.y,
      bombCount: 1,
      bombRange: 2,
      speed: 1,
      lives: 3,
      alive: true,
      lastMove: 0,
      activeBombs: 0,
    });
    return true;
  }

  removePlayer(socketId) {
    this.players.delete(socketId);
    if (this.players.size === 0 && this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  start() {
    this.started = true;
    this.tickInterval = setInterval(() => this.tick(), TICK);
  }

  tick() {
    const now = Date.now();
    const detonated = new Set();

    // Age bombs
    for (const bomb of this.bombs) {
      if (!bomb.exploding && now >= bomb.timer) {
        this.explodeBomb(bomb, detonated);
      }
    }

    // Clean expired explosions
    this.explosions = this.explosions.filter((e) => now < e.expires);

    // Clean detonated bombs
    this.bombs = this.bombs.filter((b) => !detonated.has(b.id));
  }

  placeBomb(socketId) {
    const p = this.players.get(socketId);
    if (!p || !p.alive) return null;
    if (p.activeBombs >= p.bombCount) return null;
    if (this.bombs.some((b) => b.x === p.x && b.y === p.y)) return null;

    const bomb = {
      id: ++this.bombId,
      x: p.x, y: p.y,
      owner: socketId,
      range: p.bombRange,
      timer: Date.now() + BOMB_TIMER,
      exploding: false,
    };
    this.bombs.push(bomb);
    p.activeBombs++;
    return bomb;
  }

  explodeBomb(bomb, detonated) {
    if (detonated.has(bomb.id)) return;
    detonated.add(bomb.id);
    bomb.exploding = true;

    const owner = this.players.get(bomb.owner);
    if (owner) owner.activeBombs = Math.max(0, owner.activeBombs - 1);

    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    const affectedCells = [{ x: bomb.x, y: bomb.y }];
    const now = Date.now();
    const EXPIRE = now + 600;

    for (const [dx, dy] of dirs) {
      for (let i = 1; i <= bomb.range; i++) {
        const nx = bomb.x + dx * i;
        const ny = bomb.y + dy * i;
        if (!inBounds(nx, ny)) break;
        const cell = this.grid[ny][nx];
        if (cell === CELL.WALL) break;

        affectedCells.push({ x: nx, y: ny });
        this.explosions.push({ x: nx, y: ny, expires: EXPIRE });

        if (cell === CELL.BOX) {
          const roll = Math.random();
          this.grid[ny][nx] = roll < 0.25
            ? CELL.POWER_BOMB : roll < 0.45
            ? CELL.POWER_RANGE : roll < 0.55
            ? CELL.POWER_SPEED : CELL.EMPTY;
          break;
        }

        // Chain detonate other bombs
        const chainBomb = this.bombs.find((b) => b.x === nx && b.y === ny && !b.exploding);
        if (chainBomb) this.explodeBomb(chainBomb, detonated);
      }
    }

    this.explosions.push({ x: bomb.x, y: bomb.y, expires: EXPIRE });

    // Damage players in blast
    for (const { x, y } of affectedCells) {
      for (const p of this.players.values()) {
        if (p.alive && p.x === x && p.y === y) {
          p.lives--;
          if (p.lives <= 0) p.alive = false;
        }
      }
    }

    return affectedCells;
  }

  movePlayer(socketId, dir) {
    const p = this.players.get(socketId);
    if (!p || !p.alive) return false;
    const now = Date.now();
    const cooldown = MOVE_COOLDOWN - (p.speed - 1) * 30;
    if (now - p.lastMove < cooldown) return false;

    const moves = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
    const [dx, dy] = moves[dir] || [0, 0];
    const nx = p.x + dx;
    const ny = p.y + dy;

    if (!inBounds(nx, ny)) return false;
    const cell = this.grid[ny][nx];
    if (cell === CELL.WALL || cell === CELL.BOX) return false;
    if (this.bombs.some((b) => b.x === nx && b.y === ny)) return false;

    p.x = nx;
    p.y = ny;
    p.lastMove = now;

    // Pick up power-ups
    if (cell === CELL.POWER_BOMB) { p.bombCount = Math.min(8, p.bombCount + 1); this.grid[ny][nx] = CELL.EMPTY; }
    if (cell === CELL.POWER_RANGE) { p.bombRange = Math.min(8, p.bombRange + 1); this.grid[ny][nx] = CELL.EMPTY; }
    if (cell === CELL.POWER_SPEED) { p.speed = Math.min(3, p.speed + 1); this.grid[ny][nx] = CELL.EMPTY; }

    return true;
  }

  getState() {
    return {
      grid: this.grid,
      players: [...this.players.values()],
      bombs: this.bombs.map((b) => ({ id: b.id, x: b.x, y: b.y, owner: b.owner, timer: b.timer })),
      explosions: this.explosions,
    };
  }

  winner() {
    const alive = [...this.players.values()].filter((p) => p.alive);
    if (alive.length === 1) return alive[0];
    if (alive.length === 0) return null;
    return undefined; // game still going
  }
}

// ─── Server ───────────────────────────────────────────────────────────────────
const app = express();
app.use(express.static(join(__dirname, "public")));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
  pingTimeout: 10000,
});

const rooms = new Map();

function getOrCreateRoom() {
  // Find a room with space
  for (const room of rooms.values()) {
    if (!room.started && room.players.size < 4) return room;
  }
  const id = Math.random().toString(36).slice(2, 8).toUpperCase();
  const room = new Room(id);
  rooms.set(id, room);
  return room;
}

const COLORS = ["#f87171", "#60a5fa", "#34d399", "#fbbf24"];

io.on("connection", (socket) => {
  let currentRoom = null;

  socket.on("join", ({ name }) => {
    const room = getOrCreateRoom();
    const colorIdx = room.players.size;
    const ok = room.addPlayer(socket, name || "Player", COLORS[colorIdx]);
    if (!ok) { socket.emit("error", "Room full"); return; }

    currentRoom = room;
    socket.join(room.id);
    socket.emit("joined", { roomId: room.id, playerId: socket.id, grid: room.grid });

    io.to(room.id).emit("playerJoined", {
      players: [...room.players.values()],
    });

    if (room.players.size >= 2) {
      setTimeout(() => {
        if (!room.started && room.players.size >= 2) {
          room.start();
          io.to(room.id).emit("start", room.getState());

          // Broadcast state periodically
          const broadcast = setInterval(() => {
            if (!rooms.has(room.id)) { clearInterval(broadcast); return; }
            io.to(room.id).emit("state", room.getState());
            const w = room.winner();
            if (w !== undefined) {
              io.to(room.id).emit("gameOver", { winner: w });
              clearInterval(broadcast);
              clearInterval(room.tickInterval);
              rooms.delete(room.id);
            }
          }, TICK);
        }
      }, 3000);
    }
  });

  socket.on("move", ({ dir }) => {
    if (!currentRoom) return;
    const moved = currentRoom.movePlayer(socket.id, dir);
    if (moved) {
      io.to(currentRoom.id).emit("playerMoved", {
        id: socket.id,
        x: currentRoom.players.get(socket.id)?.x,
        y: currentRoom.players.get(socket.id)?.y,
      });
    }
  });

  socket.on("bomb", () => {
    if (!currentRoom) return;
    const bomb = currentRoom.placeBomb(socket.id);
    if (bomb) {
      io.to(currentRoom.id).emit("bombPlaced", {
        id: bomb.id, x: bomb.x, y: bomb.y, owner: bomb.owner, timer: bomb.timer,
      });
    }
  });

  socket.on("disconnect", () => {
    if (!currentRoom) return;
    currentRoom.removePlayer(socket.id);
    io.to(currentRoom.id).emit("playerLeft", { id: socket.id });
    if (currentRoom.players.size === 0) rooms.delete(currentRoom.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`BomBom server running on port ${PORT}`);
});
