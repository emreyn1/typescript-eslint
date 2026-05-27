import { Chess } from 'chess.js';

export type PieceColor = 'w' | 'b';
export type GameStatus = 'waiting' | 'playing' | 'checkmate' | 'stalemate' | 'draw' | 'resigned';
export type ConnectionStatus = 'disconnected' | 'connecting' | 'waiting' | 'connected' | 'failed';

export interface MoveData {
  from: string;
  to: string;
  promotion?: 'q' | 'r' | 'b' | 'n';
  timestamp?: number;
}

export interface GameState {
  game: Chess | null;
  isWhite: boolean;
  status: GameStatus;
  connectionStatus: ConnectionStatus;
  roomId: string | null;
  lastMove: MoveData | null;
  error: string | null;
}

export interface WebRTCState {
  peerConnection: RTCPeerConnection | null;
  dataChannel: RTCDataChannel | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  iceConnectionState: RTCIceConnectionState;
}

