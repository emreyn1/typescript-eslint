import { useState, useCallback, useRef, useEffect } from 'react';
import { getIceServers, createPeerConnection } from '@/lib/webrtc';
import { WebRTCState } from '@/types/game';

export function useWebRTC() {
  const [state, setState] = useState<WebRTCState>({
    peerConnection: null,
    dataChannel: null,
    localStream: null,
    remoteStream: null,
    iceConnectionState: 'new',
  });

  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);

  const cleanup = useCallback(() => {
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    setState({
      peerConnection: null,
      dataChannel: null,
      localStream: null,
      remoteStream: null,
      iceConnectionState: 'new',
    });
  }, []);

  const startMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      
      localStreamRef.current = stream;
      setState(prev => ({ ...prev, localStream: stream }));
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw new Error('Failed to access camera/microphone. Please check permissions.');
    }
  }, []);

  const initializeConnection = useCallback(async (isCaller: boolean) => {
    try {
      const iceServers = await getIceServers();
      const pc = createPeerConnection(iceServers);
      peerConnectionRef.current = pc;

      // Add local stream tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          pc.addTrack(track, localStreamRef.current!);
        });
      }

      // Handle remote stream
      pc.ontrack = (event) => {
        console.log('Remote track received:', event.track.kind, event);
        console.log('Event streams:', event.streams);
        console.log('Event track:', event.track);
        
        // Handle both streams array and track
        if (event.streams && event.streams.length > 0) {
          console.log('Setting remote stream from streams array:', event.streams[0].id);
          setState(prev => ({ ...prev, remoteStream: event.streams[0] }));
        } else if (event.track) {
          // Fallback: create a new stream from the track
          console.log('Creating stream from track');
          const newStream = new MediaStream([event.track]);
          setState(prev => {
            // Merge with existing stream if any
            if (prev.remoteStream) {
              event.track && prev.remoteStream.addTrack(event.track);
              return prev;
            }
            return { ...prev, remoteStream: newStream };
          });
        }
      };

      // Handle connection state changes
      pc.oniceconnectionstatechange = () => {
        const connectionState = pc.iceConnectionState;
        console.log('ICE connection state changed:', connectionState);
        console.log('ICE gathering state:', pc.iceGatheringState);
        console.log('Signaling state:', pc.signalingState);
        setState(prev => ({ ...prev, iceConnectionState: connectionState }));
        
        if (connectionState === 'failed') {
          console.warn('ICE connection failed, restarting...');
          pc.restartIce();
        } else if (connectionState === 'connected') {
          console.log('✅ ICE connection established!');
        } else if (connectionState === 'disconnected') {
          console.warn('⚠️ ICE connection disconnected');
        } else if (connectionState === 'checking') {
          console.log('🔄 ICE connection checking...');
        }
      };
      
      // Handle signaling state changes
      pc.onsignalingstatechange = () => {
        console.log('Signaling state:', pc.signalingState);
      };
      
      // Handle ICE gathering state
      pc.onicegatheringstatechange = () => {
        console.log('ICE gathering state:', pc.iceGatheringState);
      };

      // Setup data channel
      let dataChannel: RTCDataChannel | null = null;
      if (isCaller) {
        dataChannel = pc.createDataChannel('moves');
        dataChannelRef.current = dataChannel;
        
        // Setup data channel event handlers
        dataChannel.onopen = () => {
          console.log('Data channel opened');
          setState(prev => ({ ...prev, dataChannel, peerConnection: pc }));
        };
        dataChannel.onerror = (error) => {
          console.error('Data channel error:', error);
        };
        
        setState(prev => ({ ...prev, dataChannel, peerConnection: pc }));
      } else {
        pc.ondatachannel = (event) => {
          console.log('Data channel received');
          dataChannelRef.current = event.channel;
          event.channel.onopen = () => {
            console.log('Data channel opened (callee)');
            setState(prev => ({ ...prev, dataChannel: event.channel, peerConnection: pc }));
          };
          setState(prev => ({ ...prev, dataChannel: event.channel, peerConnection: pc }));
        };
      }

      return { pc, dataChannel };
    } catch (error) {
      console.error('Error initializing connection:', error);
      throw error;
    }
  }, []);

  const sendMove = useCallback((moveData: string) => {
    if (dataChannelRef.current?.readyState === 'open') {
      dataChannelRef.current.send(moveData);
    }
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    ...state,
    startMedia,
    initializeConnection,
    sendMove,
    cleanup,
  };
}

