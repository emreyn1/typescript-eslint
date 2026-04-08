// Wild Ones — Game Client
const socket = io();
let myId = null;
let gameState = null;
let myTurn = false;
let selectedWeapon = "cannon";
let animating = false;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const MAP_W = 1200;
const MAP_H = 500;

// Camera / scale
let scale = 1;
let camX = 0;

function resizeCanvas() {
  const wrap = document.getElementById("canvas-wrap");
  canvas.width = wrap.clientWidth;
  canvas.height = wrap.clientHeight;
  scale = canvas.width / MAP_W;
  render();
}
window.addEventListener("resize", resizeCanvas);

// ─── Lobby ────────────────────────────────────────────────────────────────────
document.getElementById("nameInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") joinGame();
});
document.getElementById("playBtn").addEventListener("click", joinGame);

function joinGame() {
  const name = document.getElementById("nameInput").value.trim() || "Player";
  socket.emit("join", { name });
}

// ─── Socket Events ────────────────────────────────────────────────────────────
socket.on("joined", ({ playerId, state }) => {
  myId = playerId;
  gameState = state;
  document.getElementById("lobby").style.display = "none";
  document.getElementById("game").style.display = "flex";
  resizeCanvas();
  render();
});

socket.on("state", (state) => {
  gameState = state;
  updateTopbar();
  render();
});

socket.on("start", (state) => {
  gameState = state;
  updateTopbar();
  render();
  addChat("System", "Game started! " + gameState.players.length + " players.", "#fbbf24");
});

socket.on("yourTurn", ({ playerId, timeLeft, weapons }) => {
  if (!gameState) return;
  gameState.turnPlayerId = playerId;
  myTurn = playerId === myId;
  updateTopbar();
  buildWeaponList(weapons);
  document.getElementById("fire-btn").disabled = !myTurn || animating;
  document.getElementById("turn-info").textContent =
    myTurn ? "⚔️ YOUR TURN" : `${getPlayer(playerId)?.name ?? "?"}'s turn`;
  if (myTurn) addChat("System", "Your turn! Aim and fire.", "#34d399");
});

socket.on("turnTimeout", () => {
  addChat("System", "Time's up!", "#f85149");
});

socket.on("shot", (data) => {
  animateShot(data);
});

socket.on("chat", ({ name, msg, color }) => {
  addChat(name, msg, color);
});

socket.on("gameOver", ({ winner }) => {
  const icon = document.getElementById("over-icon");
  const title = document.getElementById("over-title");
  const sub = document.getElementById("over-sub");
  if (!winner) {
    icon.textContent = "💥"; title.textContent = "Draw!"; sub.textContent = "Everyone's gone.";
  } else if (winner.id === myId) {
    icon.textContent = "🏆"; title.textContent = "Victory!"; sub.textContent = "You're the Wild One!";
  } else {
    icon.textContent = winner.animal || "🦊";
    title.textContent = `${winner.name} Wins!`;
    sub.textContent = "Better aim next time.";
  }
  document.getElementById("overlay").classList.add("show");
});

// ─── UI Helpers ───────────────────────────────────────────────────────────────
function getPlayer(id) {
  return gameState?.players?.find((p) => p.id === id);
}

function updateTopbar() {
  if (!gameState) return;
  const chips = document.getElementById("player-chips");
  chips.innerHTML = gameState.players.map((p) => `
    <div class="p-chip ${p.id === gameState.turnPlayerId ? "active" : ""} ${!p.alive ? "dead" : ""}">
      <span>${p.animal ?? "🐾"}</span>
      <span style="color:${p.color}">${p.name}</span>
      <div class="hp-bar"><div class="hp-fill" style="width:${p.hp}%;background:${hpColor(p.hp)}"></div></div>
      <span style="font-size:11px;color:#8b949e">${p.hp}hp</span>
    </div>
  `).join("");
}

function hpColor(hp) {
  if (hp > 60) return "#3fb950";
  if (hp > 30) return "#f0a500";
  return "#f85149";
}

function buildWeaponList(weapons) {
  const list = document.getElementById("weapon-list");
  list.innerHTML = (weapons || []).map((w) => `
    <button class="weapon-btn ${w.key === selectedWeapon ? "sel" : ""}"
      data-key="${w.key}" ${w.ammo === "0" ? "disabled" : ""}>
      ${w.name} <span class="ammo">${w.ammo}</span>
    </button>
  `).join("");
  list.querySelectorAll(".weapon-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedWeapon = btn.dataset.key;
      list.querySelectorAll(".weapon-btn").forEach((b) => b.classList.remove("sel"));
      btn.classList.add("sel");
    });
  });
}

// ─── Angle / Power ────────────────────────────────────────────────────────────
document.getElementById("angle-slider").addEventListener("input", function () {
  document.getElementById("angle-val").textContent = this.value + "°";
  render();
});
document.getElementById("power-slider").addEventListener("input", function () {
  document.getElementById("power-val").textContent = this.value + "%";
});

document.getElementById("fire-btn").addEventListener("click", fireShot);

function fireShot() {
  if (!myTurn || animating) return;
  const angleDeg = Number(document.getElementById("angle-slider").value);
  const power = Number(document.getElementById("power-slider").value) / 100;
  const me = getPlayer(myId);
  if (!me) return;

  const angleFacing = me.facing > 0 ? angleDeg : 180 - angleDeg;
  const angle = (angleFacing * Math.PI) / 180;

  socket.emit("fire", { angle: -angle, power, weapon: selectedWeapon });
  myTurn = false;
  document.getElementById("fire-btn").disabled = true;
  document.getElementById("turn-info").textContent = "Fired!";
}

// ─── Chat ──────────────────────────────────────────────────────────────────────
document.getElementById("chat-send").addEventListener("click", sendChat);
document.getElementById("chat-msg").addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendChat();
});

function sendChat() {
  const input = document.getElementById("chat-msg");
  const msg = input.value.trim();
  if (!msg) return;
  socket.emit("chat", { msg });
  input.value = "";
}

function addChat(name, msg, color) {
  const box = document.getElementById("chat-box");
  const line = document.createElement("div");
  line.innerHTML = `<span style="color:${color || "#8b949e"};font-weight:600">${name}:</span> ${msg}`;
  box.appendChild(line);
  box.scrollTop = box.scrollHeight;
}

// ─── Renderer ─────────────────────────────────────────────────────────────────
const SKY_TOP = "#0d1b2a";
const SKY_BOT = "#1a3a5c";
const GROUND = "#2d4a22";
const GROUND_EDGE = "#3d6a2a";

function render() {
  if (!gameState) return;
  const { players, terrain } = gameState;
  const W = canvas.width, H = canvas.height;
  const sc = W / MAP_W;
  const scH = H / MAP_H;

  ctx.clearRect(0, 0, W, H);

  // Sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, SKY_TOP);
  sky.addColorStop(1, SKY_BOT);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // Stars (static seed)
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  for (let i = 0; i < 40; i++) {
    const sx = ((i * 137.5) % MAP_W) * sc;
    const sy = ((i * 97.3) % (MAP_H * 0.5)) * scH;
    ctx.fillRect(sx, sy, 1.5, 1.5);
  }

  // Terrain fill
  if (terrain && terrain.length > 0) {
    ctx.beginPath();
    ctx.moveTo(terrain[0].x * sc, terrain[0].y * scH);
    for (const p of terrain) ctx.lineTo(p.x * sc, p.y * scH);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fillStyle = GROUND;
    ctx.fill();

    // Terrain top edge
    ctx.beginPath();
    ctx.moveTo(terrain[0].x * sc, terrain[0].y * scH);
    for (const p of terrain) ctx.lineTo(p.x * sc, p.y * scH);
    ctx.strokeStyle = GROUND_EDGE;
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  // Aim line (if my turn)
  if (myTurn && !animating) {
    const me = getPlayer(myId);
    if (me) {
      const angleDeg = Number(document.getElementById("angle-slider").value);
      const angleFacing = me.facing > 0 ? angleDeg : 180 - angleDeg;
      const rad = (-angleFacing * Math.PI) / 180;
      const ox = me.x * sc, oy = me.y * scH - 10 * scH;
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "rgba(240,165,0,0.5)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox + Math.cos(rad) * 80, oy + Math.sin(rad) * 80);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  // Players
  for (const p of (players || [])) {
    if (!p.alive) continue;
    const px = p.x * sc, py = p.y * scH;
    const r = 14 * sc;

    ctx.fillStyle = p.color + "44";
    ctx.beginPath();
    ctx.ellipse(px, py + r + 2, r * 0.8, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = p.id === myId ? "#fbbf24" : "rgba(255,255,255,0.3)";
    ctx.lineWidth = p.id === myId ? 2.5 : 1.5;
    ctx.stroke();

    // Animal emoji
    ctx.font = `${Math.round(14 * sc)}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(p.animal || "🐾", px, py);

    // Name + HP
    ctx.font = `bold ${Math.round(9 * sc)}px system-ui`;
    ctx.fillStyle = "#e6edf3";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(p.name, px, py - r - 4);

    // HP bar above
    const barW = 30 * sc, barH = 3 * scH;
    ctx.fillStyle = "#111";
    ctx.fillRect(px - barW / 2, py - r - 10, barW, barH);
    ctx.fillStyle = hpColor(p.hp);
    ctx.fillRect(px - barW / 2, py - r - 10, barW * p.hp / 100, barH);
  }
}

// ─── Shot Animation ───────────────────────────────────────────────────────────
function animateShot(data) {
  animating = true;
  document.getElementById("fire-btn").disabled = true;
  const { steps, impact, blastRadius, hits } = data;
  const W = canvas.width, H = canvas.height;
  const sc = W / MAP_W;
  const scH = H / MAP_H;

  let i = 0;
  const interval = setInterval(() => {
    render();
    // Draw projectile
    if (i < steps.length) {
      const s = steps[i];
      ctx.fillStyle = "#fcd34d";
      ctx.beginPath();
      ctx.arc(s.x * sc, s.y * scH, 5, 0, Math.PI * 2);
      ctx.fill();
      i += 3;
    } else {
      clearInterval(interval);
      // Explosion
      showExplosion(impact.x * sc, impact.y * scH, blastRadius * sc);

      // Apply hits to local state
      if (gameState && hits) {
        for (const hit of hits) {
          const p = gameState.players.find((p) => p.id === hit.id);
          if (p) { p.hp = hit.hp; p.alive = hit.alive; }
        }
        if (data.terrain) gameState.terrain = data.terrain;
      }
      updateTopbar();

      setTimeout(() => {
        animating = false;
        render();
      }, 800);
    }
  }, 16);
}

function showExplosion(x, y, r) {
  let frame = 0;
  const interval = setInterval(() => {
    render();
    const alpha = 1 - frame / 20;
    const er = r * (0.5 + frame * 0.08);
    ctx.globalAlpha = alpha;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, er);
    grad.addColorStop(0, "#fcd34d");
    grad.addColorStop(0.4, "#f97316");
    grad.addColorStop(1, "rgba(249,115,22,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, er, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    frame++;
    if (frame > 20) clearInterval(interval);
  }, 35);
}
