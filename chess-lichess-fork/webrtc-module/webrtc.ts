/**
 * WebRTC module extracted from Play-chess-Now.
 * Portable code for integrating video chat into the Lichess fork.
 *
 * Integration strategy:
 * - Lichess uses WebSocket for game signaling. The WebRTC signaling (SDP offer/answer,
 *   ICE candidates) should be piped through this same WebSocket channel rather than
 *   Firebase Firestore (which was the original approach).
 * - The video chat is OPTIONAL per game — only activated when both players consent.
 * - This module handles ICE server resolution, peer connection lifecycle, and media streams.
 */

const EXPRESSTURN_USERNAME = process.env.NEXT_PUBLIC_EXPRESSTURN_USERNAME || "";
const EXPRESSTURN_PASSWORD = process.env.NEXT_PUBLIC_EXPRESSTURN_PASSWORD || "";
const EXPRESSTURN_SERVER =
  process.env.NEXT_PUBLIC_EXPRESSTURN_SERVER || "free.expressturn.com";

export interface IceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}

export async function getIceServers(): Promise<IceServer[]> {
  if (EXPRESSTURN_USERNAME && EXPRESSTURN_PASSWORD) {
    return [
      {
        urls: [
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
        ],
      },
      {
        urls: [
          `turn:${EXPRESSTURN_SERVER}:3478`,
          `turns:${EXPRESSTURN_SERVER}:5349`,
        ],
        username: EXPRESSTURN_USERNAME,
        credential: EXPRESSTURN_PASSWORD,
      },
    ];
  }

  return [
    {
      urls: [
        "stun:stun1.l.google.com:19302",
        "stun:stun2.l.google.com:19302",
      ],
    },
  ];
}

export function createPeerConnection(
  iceServers: IceServer[],
): RTCPeerConnection {
  return new RTCPeerConnection({
    iceServers,
    iceCandidatePoolSize: 10,
  });
}
