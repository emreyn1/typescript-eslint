/**
 * React hook for WebRTC video chat.
 * Extracted from Play-chess-Now, adapted for Lichess integration.
 *
 * For Lichess: replace the Firebase signaling with Lichess WebSocket messages.
 * The hook itself remains the same — it manages local/remote streams,
 * peer connection lifecycle, and data channels.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { getIceServers, createPeerConnection } from "./webrtc";

interface WebRTCState {
  peerConnection: RTCPeerConnection | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  iceConnectionState: RTCIceConnectionState;
}

export function useWebRTC() {
  const [state, setState] = useState<WebRTCState>({
    peerConnection: null,
    localStream: null,
    remoteStream: null,
    iceConnectionState: "new",
  });

  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  const cleanup = useCallback(() => {
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    setState({
      peerConnection: null,
      localStream: null,
      remoteStream: null,
      iceConnectionState: "new",
    });
  }, []);

  const startMedia = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localStreamRef.current = stream;
    setState((prev) => ({ ...prev, localStream: stream }));
    return stream;
  }, []);

  const initializeConnection = useCallback(async (isCaller: boolean) => {
    const iceServers = await getIceServers();
    const pc = createPeerConnection(iceServers);
    peerConnectionRef.current = pc;

    if (localStreamRef.current) {
      localStreamRef.current
        .getTracks()
        .forEach((track) => pc.addTrack(track, localStreamRef.current!));
    }

    pc.ontrack = (event) => {
      if (event.streams?.[0]) {
        setState((prev) => ({ ...prev, remoteStream: event.streams[0] }));
      } else if (event.track) {
        const newStream = new MediaStream([event.track]);
        setState((prev) => ({
          ...prev,
          remoteStream: prev.remoteStream || newStream,
        }));
      }
    };

    pc.oniceconnectionstatechange = () => {
      setState((prev) => ({
        ...prev,
        iceConnectionState: pc.iceConnectionState,
      }));
      if (pc.iceConnectionState === "failed") pc.restartIce();
    };

    setState((prev) => ({ ...prev, peerConnection: pc }));
    return pc;
  }, []);

  useEffect(() => cleanup, [cleanup]);

  return { ...state, startMedia, initializeConnection, cleanup };
}
