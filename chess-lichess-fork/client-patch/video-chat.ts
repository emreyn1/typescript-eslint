/**
 * Lichess Video Chat — Client Patch
 *
 * Copy to: lila/ui/game/src/video-chat.ts
 * Wire in: lila/ui/game/src/ctrl.ts after init
 *
 * Uses raw WebSocket + JSON { event, data } — matches signaling-server/index.js
 */

import { getIceServers, getSignalUrl } from "./webrtc";
import { VideoChatCtrl } from  ;

interface MediaState {
  video: boolean;
  audio: boolean;
}

const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 16000];
const MAX_RECONNECT_ATTEMPTS = 5;

let pc: RTCPeerConnection | null = null;
let localStream: MediaStream | null = null;
let socket: WebSocket | null = null;
let gameId = "";
let currentUserId = "";
let isInitiator = false;
let mediaState: MediaState = { video: true, audio: true };
let reconnectAttempts = 0;
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
let isIntentionalClose = false;
const videoCtrl = new VideoChatCtrl();

function wsEmit(event: string, data: unknown) {
  if (!socket || socket.readyState !== WebSocket.OPEN) return;
  socket.send(JSON.stringify({ event, data }));
}

function scheduleReconnect() {
  if (isIntentionalClose || reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    updateStatus("disconnected");
    return;
  }

  const delay = RECONNECT_DELAYS[Math.min(reconnectAttempts, RECONNECT_DELAYS.length - 1)];
  reconnectAttempts++;
  updateStatus(`reconnecting (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);

  reconnectTimeout = setTimeout(() => {
    if (!isIntentionalClose) {
      connectSocket();
    }
  }, delay);
}

function connectSocket() {
  const wsUrl = getSignalUrl();
  socket = buildSocket(wsUrl);

  socket.onopen = () => {
    reconnectAttempts = 0;
    wsEmit("join-game", { gameId, userId: currentUserId });
    updateStatus("connecting");
  };

  socket.onerror = () => updateStatus("connection error");
  socket.onclose = () => {
    if (!isIntentionalClose) {
      scheduleReconnect();
    }
  };
}

function buildSocket(url: string): WebSocket {
  const ws = new WebSocket(url);
  ws.onmessage = (ev) => {
    try {
      const { event, data } = JSON.parse(ev.data as string);
      void handleSignal(event, data);
    } catch {
      /* ignore malformed frames */
    }
  };
  return ws;
}

async function handleSignal(event: string, data: Record<string, unknown>) {
  switch (event) {
    case "role":
      isInitiator = Boolean(data.initiator);
      break;

    case "peer-joined":
      if (isInitiator) await createOffer();
      break;

    case "offer":
      if (!pc) return;
      await pc.setRemoteDescription(
        new RTCSessionDescription(data.sdp as RTCSessionDescriptionInit),
      );
      {
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        wsEmit("answer", { sdp: answer });
      }
      break;

    case "answer":
      if (!pc) return;
      await pc.setRemoteDescription(
        new RTCSessionDescription(data.sdp as RTCSessionDescriptionInit),
      );
      break;

    case "ice-candidate":
      if (!pc || !data.candidate) return;
      await pc.addIceCandidate(
        new RTCIceCandidate(data.candidate as RTCIceCandidateInit),
      );
      break;

    case "peer-media-state":
      updatePeerIndicators(data as unknown as MediaState);
      break;

    case "peer-left":
      handlePeerLeft();
      break;

    case "error":
      updateStatus(String(data ?? "error"));
      break;
  }
}

async function createOffer() {
  if (!pc) return;
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  wsEmit("offer", { sdp: offer });
}

async function createPeerConnection(): Promise<RTCPeerConnection> {
  const iceServers = await getIceServers();
  const conn = new RTCPeerConnection({ iceServers });

  conn.onicecandidate = (ev) => {
    if (ev.candidate) wsEmit("ice-candidate", { candidate: ev.candidate });
  };

  conn.ontrack = (ev) => {
    const remoteVideo = document.getElementById(
      "lrt-remote",
    ) as HTMLVideoElement | null;
    if (remoteVideo && ev.streams[0]) {
      remoteVideo.srcObject = ev.streams[0];
    }
  };

  conn.onconnectionstatechange = () => {
    updateStatus(conn.connectionState);
  };

  return conn;
}

function buildUI() {
  if (document.getElementById("lichess-rt-panel")) return;

  const panel = document.createElement("div");
  panel.id = "lichess-rt-panel";
  panel.setAttribute("role", "region");
  panel.setAttribute("aria-label", "Video chat panel");
  panel.innerHTML = `
    <div id="lrt-videos">
      <div class="lrt-video-container">
        <video id="lrt-local" autoplay muted playsinline aria-label="Your camera"></video>
        <span class="lrt-video-label">You</span>
      </div>
      <div class="lrt-video-container">
        <video id="lrt-remote" autoplay playsinline aria-label="Opponent camera"></video>
        <span class="lrt-video-label">Opponent</span>
      </div>
    </div>
    <div id="lrt-controls">
      <button type="button" id="lrt-video-btn" aria-label="Toggle camera" title="Toggle camera">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
      </button>
      <button type="button" id="lrt-audio-btn" aria-label="Toggle microphone" title="Toggle microphone">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/></svg>
      </button>
      <button type="button" id="lrt-hangup-btn" aria-label="End call" title="End call" class="lrt-hangup">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/></svg>
      </button>
      <span id="lrt-status" aria-live="polite">initializing...</span>
    </div>
  `;

  const sidebar =
    document.querySelector(".game__board") ??
    document.querySelector(".round__app") ??
    document.body;
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
    #lichess-rt-panel {
      position: fixed;
      bottom: 16px;
      right: 16px;
      background: #1e1e2e;
      border: 1px solid #333;
      border-radius: 12px;
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: 9999;
      box-shadow: 0 8px 32px rgba(0,0,0,.5);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    #lrt-videos {
      display: flex;
      gap: 8px;
    }
    .lrt-video-container {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    #lrt-local, #lrt-remote {
      width: 140px;
      height: 105px;
      background: #111;
      border-radius: 8px;
      object-fit: cover;
    }
    #lrt-remote {
      border: 2px solid #3fb950;
    }
    .lrt-video-label {
      font-size: 10px;
      color: #8b949e;
      margin-top: 4px;
    }
    #lrt-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    #lrt-controls button {
      background: #2a2a3e;
      border: none;
      border-radius: 8px;
      padding: 8px 12px;
      color: #fff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s, opacity 0.2s;
    }
    #lrt-controls button:hover {
      background: #3a3a4e;
    }
    #lrt-controls button:focus-visible {
      outline: 2px solid #58a6ff;
      outline-offset: 2px;
    }
    #lrt-controls button.lrt-hangup {
      background: #da3633;
    }
    #lrt-controls button.lrt-hangup:hover {
      background: #f85149;
    }
    #lrt-status {
      font-size: 11px;
      color: #8b949e;
      margin-left: auto;
    }
    .lrt-muted {
      opacity: 0.4;
    }
    .lrt-muted svg {
      opacity: 0.5;
    }
    @media (max-width: 600px) {
      #lichess-rt-panel {
        bottom: 8px;
        right: 8px;
        padding: 8px;
      }
      #lrt-local, #lrt-remote {
        width: 100px;
        height: 75px;
      }
    }
  `;
  document.head.appendChild(style);
}

function updateStatus(state: string) {
  const el = document.getElementById("lrt-status");
  if (!el) return;
  const labels: Record<string, string> = {
    connected: "live",
    connecting: "connecting…",
    disconnected: "disconnected",
    failed: "failed",
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

function toggleVideo() {
  if (!localStream) return;
  mediaState.video = !mediaState.video;
  localStream.getVideoTracks().forEach((t) => (t.enabled = mediaState.video));
  document.getElementById("lrt-video-btn")?.classList.toggle("lrt-muted", !mediaState.video);
  wsEmit("media-state", mediaState);
}

function toggleAudio() {
  if (!localStream) return;
  mediaState.audio = !mediaState.audio;
  localStream.getAudioTracks().forEach((t) => (t.enabled = mediaState.audio));
  document.getElementById("lrt-audio-btn")?.classList.toggle("lrt-muted", !mediaState.audio);
  wsEmit("media-state", mediaState);
}

function hangup() {
  isIntentionalClose = true;
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
  pc?.close();
  pc = null;
  localStream?.getTracks().forEach((t) => t.stop());
  localStream = null;
  socket?.close();
  socket = null;
  videoCtrl.cleanup();
  document.getElementById("lichess-rt-panel")?.remove();
  reconnectAttempts = 0;
}

/** Start video chat when both players are in a live game */
export async function initVideoChat(gId: string, userId: string) {
  gameId = gId;
  currentUserId = userId;
  isIntentionalClose = false;
  reconnectAttempts = 0;

  injectStyles();
  buildUI();
  updateStatus("requesting camera...");

  try {
    localStream = await videoCtrl.startMedia();
    const localVideo = document.getElementById("lrt-local") as HTMLVideoElement;
    if (localVideo) localVideo.srcObject = localStream;
  } catch (err) {
    console.warn("[lichess-rt] Camera/mic access denied:", err);
    updateStatus("camera denied");
    showError("Camera access denied. Please allow camera/mic permissions.");
    return;
  }

  pc = await createPeerConnection();
  videoCtrl.attachLocalTracks(pc);

  connectSocket();
}

function showError(message: string) {
  const status = document.getElementById("lrt-status");
  if (status) {
    status.textContent = message;
    status.style.color = "#f85149";
  }
}
