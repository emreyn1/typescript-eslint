/**
 * WebRTC ICE / PeerConnection helpers for Lichess fork.
 * Browser config via window.lichessRtConfig (injected from Scala template).
 */

export interface IceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}

export interface LichessRtConfig {
  turnUser?: string;
  turnPass?: string;
  turnServer?: string;
  signalUrl?: string;
}

declare global {
  interface Window {
    lichessRtConfig?: LichessRtConfig;
    lichessRtUrl?: string;
  }
}

function readRtConfig(): LichessRtConfig {
  return window.lichessRtConfig ?? {};
}

export async function getIceServers(): Promise<IceServer[]> {
  const cfg = readRtConfig();
  const username = cfg.turnUser ?? "";
  const password = cfg.turnPass ?? "";
  const server = cfg.turnServer ?? "free.expressturn.com";

  const stun: IceServer = {
    urls: [
      "stun:stun.l.google.com:19302",
      "stun:stun1.l.google.com:19302",
    ],
  };

  // Open Relay fallback — no credentials needed, 20 GB/mo free
  const openRelay: IceServer = {
    urls: [
      "turn:openrelay.metered.ca:80",
      "turn:openrelay.metered.ca:443",
      "turns:openrelay.metered.ca:443?transport=tcp",
    ],
    username: "openrelayproject",
    credential: "openrelayproject",
  };

  if (username && password) {
    return [
      stun,
      {
        urls: [
          `turn:${server}:3478`,
          `turns:${server}:5349`,
        ],
        username,
        credential: password,
      },
      openRelay,
    ];
  }

  return [stun, openRelay];
}

export function createPeerConnection(
  iceServers: IceServer[],
): RTCPeerConnection {
  return new RTCPeerConnection({
    iceServers,
    iceCandidatePoolSize: 10,
  });
}

export function getSignalUrl(): string {
  const cfg = readRtConfig();
  if (cfg.signalUrl) return cfg.signalUrl;
  if (window.lichessRtUrl) return window.lichessRtUrl;

  const proto = location.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${location.hostname}:3012/lichess-rt`;
}
