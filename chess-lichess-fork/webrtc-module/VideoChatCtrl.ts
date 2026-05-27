/**
 * Plain TypeScript WebRTC controller for Lichess (Mithril/vanilla UI).
 * Replaces React useWebRTC hook — no React dependency.
 */

import { getIceServers, createPeerConnection, type IceServer } from "./webrtc";

export type IceConnectionState = RTCIceConnectionState;

export interface VideoChatCtrlState {
  peerConnection: RTCPeerConnection | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  iceConnectionState: IceConnectionState;
}

export type VideoChatCtrlListener = (state: VideoChatCtrlState) => void;

export class VideoChatCtrl {
  private state: VideoChatCtrlState = {
    peerConnection: null,
    localStream: null,
    remoteStream: null,
    iceConnectionState: "new",
  };

  private listeners = new Set<VideoChatCtrlListener>();

  subscribe(listener: VideoChatCtrlListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  getState(): VideoChatCtrlState {
    return { ...this.state };
  }

  private emit() {
    const snapshot = this.getState();
    this.listeners.forEach((fn) => fn(snapshot));
  }

  private setState(partial: Partial<VideoChatCtrlState>) {
    this.state = { ...this.state, ...partial };
    this.emit();
  }

  async startMedia(constraints?: MediaStreamConstraints): Promise<MediaStream> {
    const stream = await navigator.mediaDevices.getUserMedia(
      constraints ?? { video: true, audio: true },
    );
    this.setState({ localStream: stream });
    return stream;
  }

  async initializeConnection(
    iceServers?: IceServer[],
  ): Promise<RTCPeerConnection> {
    const servers = iceServers ?? (await getIceServers());
    const pc = createPeerConnection(servers);

    if (this.state.localStream) {
      this.state.localStream
        .getTracks()
        .forEach((track) => pc.addTrack(track, this.state.localStream!));
    }

    pc.ontrack = (event) => {
      if (event.streams?.[0]) {
        this.setState({ remoteStream: event.streams[0] });
      } else if (event.track) {
        const newStream = new MediaStream([event.track]);
        this.setState({
          remoteStream: this.state.remoteStream ?? newStream,
        });
      }
    };

    pc.oniceconnectionstatechange = () => {
      this.setState({ iceConnectionState: pc.iceConnectionState });
      if (pc.iceConnectionState === "failed") {
        pc.restartIce();
      }
    };

    this.setState({ peerConnection: pc });
    return pc;
  }

  attachLocalTracks(pc: RTCPeerConnection) {
    if (!this.state.localStream) return;
    this.state.localStream
      .getTracks()
      .forEach((track) => pc.addTrack(track, this.state.localStream!));
  }

  cleanup() {
    this.state.peerConnection?.close();
    this.state.localStream?.getTracks().forEach((t) => t.stop());
    this.setState({
      peerConnection: null,
      localStream: null,
      remoteStream: null,
      iceConnectionState: "new",
    });
  }
}
