/**
 * Lichess Video Chat — Client Patch
 *
 * Bu dosya lila/ui/game/src/ altına kopyalanır ve game controller'dan çağrılır.
 *
 * Entegrasyon adımı:
 *   1. lila/ui/game/src/video-chat.ts olarak kopyala
 *   2. lila/ui/game/src/ctrl.ts içinde init() sonrasında çağır:
 *      ```ts
 *      import { initVideoChat } from './video-chat';
 *      initVideoChat(data.game.id, data.player.id);
 *      ```
 *   3. lila/ui/game/css/_video-chat.scss stil dosyasını ekle
 */

const SIGNAL_URL = (window as any).lichessRtUrl ?? "wss://rt.yourdomain.com"; 

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  // ExpressTurn.com free TURN (replace with your credentials)
  {
    urls: "turn:relay1.expressturn.com:3478",
    username: process.env["TURN_USER"] ?? "",
    credential: process.env["TURN_PASS"] ?? "",
  },
];

interface MediaState { video: boolean; audio: boolean; }

let pc: RTCPeerConnection | null = null;
let localStream: MediaStream | null = null;
let socket: WebSocket | null = null;
let gameId: string = "";
let isInitiator = false;
let mediaState: MediaState = { video: true, audio: true };

// ─── Socket.io-like WebSocket wrapper ─────────────────────────────────────────
function wsEmit(event: string, data: unknown) {
  if (!socket || socket.readyState !== WebSocket.OPEN) return;
  socket.send(JSON.stringify({ event, data }));
}

function buildSocket(url: string): WebSocket {
  const ws = new WebSocket(url);
  ws.onmessage = (ev) => {
    try {
      const { event, data } = JSON.parse(ev.data);
      handleSignal(event, data);
    } catch { /* ignore */ }
  };
  return ws;
}

// ─── Signaling ────────────────────────────────────────────────────────────────
async function handleSignal(event: string, data: any) {
  switch (event) {
    case "role":
      isInitiator = data.initiator;
      break;

    case "peer-joined":
      if (isInitiator) await createOffer();
      break;

    case "offer":
      await pc!.setRemoteDescription(new RTCSessionDescription(data.sdp));
      const answer = await pc!.createAnswer();
      await pc!.setLocalDescription(answer);
      wsEmit("answer", { sdp: answer });
      break;

    case "answer":
      await pc!.setRemoteDescription(new RTCSessionDescription(data.sdp));
      break;

    case "ice-candidate":
      if (data.candidate) await pc!.addIceCandidate(new RTCIceCandidate(data.candidate));
      break;

    case "peer-media-state":
      updatePeerIndicators(data as MediaState);
      break;

    case "peer-left":
      handlePeerLeft();
      break;
  }
}

async function createOffer() {
  if (!pc) return;
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  wsEmit("offer", { sdp: offer });
}

// ─── PeerConnection ───────────────────────────────────────────────────────────
function createPeerConnection(): RTCPeerConnection {
  const conn = new RTCPeerConnection({ iceServers: ICE_SERVERS });

  conn.onicecandidate = (ev) => {
    if (ev.candidate) wsEmit("ice-candidate", { candidate: ev.candidate });
  };

  conn.ontrack = (ev) => {
    const remoteVideo = document.getElementById("lrt-remote") as HTMLVideoElement | null;
    if (remoteVideo && ev.streams[0]) {
      remoteVideo.srcObject = ev.streams[0];
    }
  };

  conn.onconnectionstatechange = () => {
    updateStatus(conn.connectionState);
  };

  return conn;
}

// ─── UI ───────────────────────────────────────────────────────────────────────
function buildUI() {
  if (document.getElementById("lichess-rt-panel")) return;

  const panel = document.createElement("div");
  panel.id = "lichess-rt-panel";
  panel.innerHTML = `
    <div id="lrt-videos">
      <video id="lrt-local" autoplay muted playsinline></video>
      <video id="lrt-remote" autoplay playsinline></video>
    </div>
    <div id="lrt-controls">
      <button id="lrt-video-btn" title="Toggle camera">📷</button>
      <button id="lrt-audio-btn" title="Toggle mic">🎤</button>
      <button id="lrt-hangup-btn" title="End call">📵</button>
      <span id="lrt-status">connecting…</span>
    </div>
  `;

  // Inject into Lichess game page sidebar
  const sidebar = document.querySelector(".game__board")
    ?? document.querySelector(".round__app")
    ?? document.body;
  sidebar.appendChild(panel);

  document.getElementById("lrt-video-btn")!.addEventListener("click", toggleVideo);
  document.getElementById("lrt-audio-btn")!.addEventListener("click", toggleAudio);
  document.getElementById("lrt-hangup-btn")!.addEventListener("click", hangup);
}

function injectStyles() {
  if (document.getElementById("lrt-style")) return;
  const style = document.createElement("style");
  style.id = "lrt-style";
  style.textContent = `
    #lichess-rt-panel{position:fixed;bottom:16px;right:16px;background:#1e1e2e;border:1px solid #333;border-radius:12px;padding:8px;display:flex;flex-direction:column;gap:8px;z-index:9999;box-shadow:0 8px 32px rgba(0,0,0,.5)}
    #lrt-videos{display:flex;gap:6px}
    #lrt-local,#lrt-remote{width:140px;height:105px;background:#111;border-radius:8px;object-fit:cover}
    #lrt-remote{border:2px solid #3fb950}
    #lrt-controls{display:flex;align-items:center;gap:6px}
    #lrt-controls button{background:#2a2a3e;border:none;border-radius:6px;padding:6px 10px;color:#fff;cursor:pointer;font-size:16px}
    #lrt-controls button:hover{background:#3a3a4e}
    #lrt-status{font-size:11px;color:#8b949e;margin-left:auto}
    .lrt-muted{opacity:.4;text-decoration:line-through}
  `;
  document.head.appendChild(style);
}

function updateStatus(state: string) {
  const el = document.getElementById("lrt-status");
  if (!el) return;
  const labels: Record<string, string> = {
    connected: "🟢 live",
    connecting: "⏳ connecting…",
    disconnected: "🔴 disconnected",
    failed: "❌ failed",
    closed: "closed",
    new: "connecting…",
  };
  el.textContent = labels[state] ?? state;
}

function updatePeerIndicators(state: MediaState) {
  const remote = document.getElementById("lrt-remote") as HTMLVideoElement | null;
  if (remote) remote.style.opacity = state.video ? "1" : "0.3";
}

function handlePeerLeft() {
  updateStatus("disconnected");
  const remoteVideo = document.getElementById("lrt-remote") as HTMLVideoElement | null;
  if (remoteVideo) remoteVideo.srcObject = null;
}

// ─── Controls ────────────────────────────────────────────────────────────────
function toggleVideo() {
  if (!localStream) return;
  mediaState.video = !mediaState.video;
  localStream.getVideoTracks().forEach((t) => (t.enabled = mediaState.video));
  const btn = document.getElementById("lrt-video-btn");
  if (btn) btn.classList.toggle("lrt-muted", !mediaState.video);
  wsEmit("media-state", mediaState);
}

function toggleAudio() {
  if (!localStream) return;
  mediaState.audio = !mediaState.audio;
  localStream.getAudioTracks().forEach((t) => (t.enabled = mediaState.audio));
  const btn = document.getElementById("lrt-audio-btn");
  if (btn) btn.classList.toggle("lrt-muted", !mediaState.audio);
  wsEmit("media-state", mediaState);
}

function hangup() {
  pc?.close();
  pc = null;
  localStream?.getTracks().forEach((t) => t.stop());
  localStream = null;
  socket?.close();
  socket = null;
  document.getElementById("lichess-rt-panel")?.remove();
}

// ─── Entry Point ──────────────────────────────────────────────────────────────
export async function initVideoChat(gId: string, userId: string) {
  gameId = gId;

  injectStyles();
  buildUI();

  // Get local media
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    const localVideo = document.getElementById("lrt-local") as HTMLVideoElement;
    if (localVideo) localVideo.srcObject = localStream;
    updateStatus("connecting");
  } catch (err) {
    console.warn("[lichess-rt] Camera/mic access denied:", err);
    updateStatus("no camera");
    return;
  }

  // Create peer connection
  pc = createPeerConnection();
  localStream.getTracks().forEach((track) => pc!.addTrack(track, localStream!));

  // Connect to signaling server
  const wsUrl = `${SIGNAL_URL}?gameId=${gameId}&userId=${userId}`;
  socket = buildSocket(wsUrl);

  socket.onopen = () => {
    wsEmit("join-game", { gameId, userId });
  };

  socket.onerror = () => updateStatus("failed");
  socket.onclose = () => updateStatus("disconnected");
}
