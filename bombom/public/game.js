// BomBom — Game Client
const CELL_SIZE = 40;
const GRID = 13;
const CELL = { EMPTY: 0, WALL: 1, BOX: 2, POWER_BOMB: 3, POWER_RANGE: 4, POWER_SPEED: 5 };

const COLORS = {
  bg: "#0f0f1a",
  wall: "#1e293b",
  wallEdge: "#0f172a",
  box: "#92400e",
  boxEdge: "#78350f",
  empty: "#1f2937",
  emptyEdge: "#111827",
  explosion: "#f97316",
  explosionInner: "#fcd34d",
  powerBomb: "#7c3aed",
  powerRange: "#0ea5e9",
  powerSpeed: "#10b981",
};

const socket = io();
let myId = null;
let gameState = null;
let myName = "";

// ─── Canvas Setup ─────────────────────────────────────────────────────────────
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = GRID * CELL_SIZE;
canvas.height = GRID * CELL_SIZE;

// ─── Lobby ────────────────────────────────────────────────────────────────────
document.getElementById("nameInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") joinGame();
});
document.getElementById("playBtn").addEventListener("click", joinGame);

function joinGame() {
  myName = document.getElementById("nameInput").value.trim() || "Player";
  socket.emit("join", { name: myName });
}

// ─── Socket Events ────────────────────────────────────────────────────────────
socket.on("joined", ({ playerId, grid }) => {
  myId = playerId;
  gameState = { grid, players: [], bombs: [], explosions: [] };
  document.getElementById("lobby").style.display = "none";
  document.getElementById("game").style.display = "flex";
  render();
});

socket.on("playerJoined", ({ players }) => {
  if (gameState) gameState.players = players;
  updateHud();
});

socket.on("start", (state) => {
  gameState = state;
  updateHud();
  render();
});

socket.on("state", (state) => {
  gameState = state;
  updateHud();
  render();
});

socket.on("playerMoved", ({ id, x, y }) => {
  if (!gameState) return;
  const p = gameState.players.find((p) => p.id === id);
  if (p) { p.x = x; p.y = y; }
  render();
});

socket.on("bombPlaced", (bomb) => {
  if (!gameState) return;
  gameState.bombs = [...(gameState.bombs || []), bomb];
  render();
});

socket.on("playerLeft", ({ id }) => {
  if (!gameState) return;
  gameState.players = gameState.players.filter((p) => p.id !== id);
  updateHud();
});

socket.on("gameOver", ({ winner }) => {
  const trophy = document.getElementById("trophy");
  const title = document.getElementById("overlay-title");
  const sub = document.getElementById("overlay-sub");
  if (!winner) {
    trophy.textContent = "💥";
    title.textContent = "Draw!";
    sub.textContent = "Everyone exploded.";
  } else if (winner.id === myId) {
    trophy.textContent = "🏆";
    title.textContent = "You Win!";
    sub.textContent = "You're the last one standing.";
  } else {
    trophy.textContent = "💀";
    title.textContent = `${winner.name} Wins!`;
    sub.textContent = "Better luck next time.";
  }
  document.getElementById("overlay").classList.add("show");
});

// ─── HUD ─────────────────────────────────────────────────────────────────────
function updateHud() {
  if (!gameState) return;
  const hud = document.getElementById("hud");
  hud.innerHTML = gameState.players.map((p) => `
    <div class="player-card ${p.id === myId ? "me" : ""} ${p.alive === false ? "dead" : ""}">
      <div class="dot" style="background:${p.color}"></div>
      <span>${p.name}${p.id === myId ? " (you)" : ""}</span>
      <span class="lives">${"❤️".repeat(Math.max(0, p.lives))}</span>
      <span class="stats">💣×${p.bombCount} 🔥${p.bombRange} ⚡${p.speed}</span>
    </div>
  `).join("");
}

// ─── Renderer ─────────────────────────────────────────────────────────────────
function drawRoundRect(x, y, w, h, r, fill, stroke) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
}

function render() {
  if (!gameState) return;
  const { grid, players, bombs, explosions } = gameState;
  const now = Date.now();
  const P = CELL_SIZE;
  const PAD = 3;

  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Grid
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      const cell = grid[y][x];
      const cx = x * P, cy = y * P;
      const inExplosion = (explosions || []).some((e) => e.x === x && e.y === y);

      if (inExplosion) {
        const pulse = 0.6 + 0.4 * Math.sin(now / 50);
        ctx.fillStyle = COLORS.explosion;
        ctx.fillRect(cx, cy, P, P);
        ctx.fillStyle = `rgba(252,211,77,${pulse})`;
        ctx.fillRect(cx + PAD, cy + PAD, P - PAD * 2, P - PAD * 2);
        continue;
      }

      if (cell === CELL.WALL) {
        drawRoundRect(cx + 1, cy + 1, P - 2, P - 2, 3, COLORS.wall, COLORS.wallEdge);
      } else if (cell === CELL.BOX) {
        drawRoundRect(cx + PAD, cy + PAD, P - PAD * 2, P - PAD * 2, 4, COLORS.box, COLORS.boxEdge);
        ctx.fillStyle = "rgba(255,255,255,0.08)";
        ctx.fillRect(cx + PAD + 2, cy + PAD + 2, P - PAD * 2 - 4, 4);
      } else {
        ctx.fillStyle = COLORS.empty;
        ctx.fillRect(cx, cy, P, P);
        if (cell === CELL.POWER_BOMB) drawPowerUp(cx, cy, "💣", COLORS.powerBomb);
        if (cell === CELL.POWER_RANGE) drawPowerUp(cx, cy, "🔥", COLORS.powerRange);
        if (cell === CELL.POWER_SPEED) drawPowerUp(cx, cy, "⚡", COLORS.powerSpeed);
      }
    }
  }

  // Bombs
  for (const bomb of (bombs || [])) {
    const cx = bomb.x * P + P / 2;
    const cy = bomb.y * P + P / 2;
    const timeLeft = bomb.timer - now;
    const pulse = timeLeft < 1000 ? 0.5 + 0.5 * Math.sin(now / 80) : 1;
    ctx.font = `${Math.round(P * 0.6 * pulse)}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("💣", cx, cy);
  }

  // Players
  for (const p of (players || [])) {
    if (!p.alive) continue;
    const cx = p.x * P + P / 2;
    const cy = p.y * P + P / 2;
    const r = P * 0.36;

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.ellipse(cx, cy + r + 2, r * 0.8, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Outline
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Name tag
    if (p.id === myId) {
      ctx.fillStyle = "rgba(251,191,36,0.9)";
      ctx.beginPath();
      ctx.arc(cx, cy - r - 6, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawPowerUp(cx, cy, emoji, color) {
  const P = CELL_SIZE, PAD = 6;
  ctx.fillStyle = color + "33";
  drawRoundRect(cx + PAD, cy + PAD, P - PAD * 2, P - PAD * 2, 6, color + "22");
  ctx.font = `${P * 0.45}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(emoji, cx + P / 2, cy + P / 2);
}

// ─── Input ────────────────────────────────────────────────────────────────────
const KEYS = {
  ArrowUp: "up", KeyW: "up", ArrowDown: "down", KeyS: "down",
  ArrowLeft: "left", KeyA: "left", ArrowRight: "right", KeyD: "right",
  Space: "bomb", KeyX: "bomb", KeyZ: "bomb",
};

const held = new Set();
let moveInterval = null;

document.addEventListener("keydown", (e) => {
  const action = KEYS[e.code];
  if (!action) return;
  e.preventDefault();
  if (held.has(action)) return;
  held.add(action);

  if (action === "bomb") { socket.emit("bomb"); return; }
  socket.emit("move", { dir: action });

  if (!moveInterval) {
    moveInterval = setInterval(() => {
      for (const a of held) {
        if (a !== "bomb") socket.emit("move", { dir: a });
      }
    }, 130);
  }
});

document.addEventListener("keyup", (e) => {
  const action = KEYS[e.code];
  if (action) held.delete(action);
  if (held.size === 0 || [...held].every((a) => a === "bomb")) {
    clearInterval(moveInterval);
    moveInterval = null;
  }
});

// Mobile D-pad
document.querySelectorAll("#dpad button[data-dir]").forEach((btn) => {
  const dir = btn.dataset.dir;
  let interval = null;
  btn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    socket.emit("move", { dir });
    interval = setInterval(() => socket.emit("move", { dir }), 130);
  });
  btn.addEventListener("touchend", () => { clearInterval(interval); interval = null; });
});

document.getElementById("bomb-btn").addEventListener("touchstart", (e) => {
  e.preventDefault();
  socket.emit("bomb");
});
document.getElementById("bomb-btn").addEventListener("click", () => socket.emit("bomb"));

// ─── Animation Loop ───────────────────────────────────────────────────────────
function loop() {
  render();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
