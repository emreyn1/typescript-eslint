'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useChessGame } from '@/hooks/useChessGame';
import { useGameRoom } from '@/hooks/useGameRoom';
import ChessBoard from '@/components/ChessBoard';
import VideoStream from '@/components/VideoStream';
import ConnectionStatus from '@/components/ConnectionStatus';
import { ConnectionStatus as ConnStatus } from '@/types/game';

export default function Home() {
  const [connectionStatus, setConnectionStatus] = useState<ConnStatus>('disconnected');
  const [roomIdInput, setRoomIdInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isWhite, setIsWhite] = useState(false);
  const answerProcessedRef = useRef(false);
  const offerProcessedRef = useRef(false);

  const {
    localStream,
    remoteStream,
    peerConnection,
    dataChannel,
    iceConnectionState,
    startMedia,
    initializeConnection,
    sendMove,
    cleanup: cleanupWebRTC,
  } = useWebRTC();

  const {
    game,
    gameState,
    initializeGame,
    makeMove,
    applyRemoteMove,
    canMove,
    getGameStatusMessage,
  } = useChessGame(isWhite);
  
  // Debug: Log game state changes
  useEffect(() => {
    console.log('Game state changed:', { game: !!game, status: gameState.status, isWhite });
  }, [game, gameState.status, isWhite]);

  const {
    roomId,
    isCaller,
    createRoom,
    joinRoom,
    saveOffer,
    saveAnswer,
    addIceCandidate,
    saveMove,
    watchAnswer,
    watchOffer,
    watchIceCandidates,
    watchMoves,
    cleanup: cleanupRoom,
  } = useGameRoom();

  // Handle remote moves from Firestore
  useEffect(() => {
    if (!roomId) {
      console.log('No roomId, skipping Firestore moves watch');
      return;
    }

    console.log('Setting up Firestore moves watcher for room:', roomId);
    const unsubscribe = watchMoves((moveData) => {
      console.log('Move received from Firestore:', moveData);
      // Only apply if it's not our own move
      const isOurMove = gameState.lastMove?.from === moveData.from && 
                       gameState.lastMove?.to === moveData.to;
      if (!isOurMove) {
        console.log('Applying remote move from Firestore:', moveData);
        applyRemoteMove(moveData);
      } else {
        console.log('Skipping own move from Firestore');
      }
    });

    return () => {
      console.log('Cleaning up Firestore moves watcher');
      unsubscribe();
    };
  }, [roomId, watchMoves, applyRemoteMove, gameState.lastMove]);

  // Handle WebRTC data channel messages
  useEffect(() => {
    if (!dataChannel) {
      console.log('No data channel available');
      return;
    }

    console.log('Setting up data channel message handler, readyState:', dataChannel.readyState);

    const handleMessage = (event: MessageEvent) => {
      try {
        console.log('Data channel message received:', event.data);
        const moveData = JSON.parse(event.data);
        // Only apply if it's not our own move
        const isOurMove = gameState.lastMove?.from === moveData.from && 
                         gameState.lastMove?.to === moveData.to;
        if (!isOurMove) {
          console.log('Applying remote move:', moveData);
          applyRemoteMove(moveData);
        } else {
          console.log('Skipping own move');
        }
      } catch (error) {
        console.error('Error parsing data channel message:', error);
      }
    };

    // Wait for data channel to open
    if (dataChannel.readyState === 'open') {
      dataChannel.addEventListener('message', handleMessage);
    } else {
      dataChannel.onopen = () => {
        console.log('Data channel opened, setting up message handler');
        dataChannel.addEventListener('message', handleMessage);
      };
    }

    return () => {
      if (dataChannel) {
        dataChannel.removeEventListener('message', handleMessage);
      }
    };
  }, [dataChannel, applyRemoteMove, gameState.lastMove]);

  const handleCreateRoom = useCallback(async () => {
    try {
      setError(null);
      setConnectionStatus('connecting');
      setIsWhite(true);

      console.log('Starting room creation...');

      // Start media
      console.log('Requesting media access...');
      await startMedia();
      console.log('Media access granted');

      // Create room
      console.log('Creating room...');
      const newRoomId = await createRoom();
      console.log('Room created:', newRoomId);
      console.log('Current roomId state:', roomId); // Debug

      // Initialize connection
      console.log('Initializing WebRTC connection...');
      const { pc } = await initializeConnection(true);
      if (!pc) throw new Error('Failed to initialize connection');
      console.log('WebRTC connection initialized');

      // Setup ICE candidate handler
      const pendingCandidates: RTCIceCandidate[] = [];
      let remoteDescriptionSet = false;
      
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('ICE candidate generated (caller)');
          addIceCandidate(event.candidate, true);
        } else {
          console.log('ICE gathering complete (caller)');
        }
      };

      // Create and save offer
      console.log('Creating offer...');
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await saveOffer(offer);
      console.log('Offer saved');

      // Watch for answer (only process once)
      answerProcessedRef.current = false; // Reset for new connection
      watchAnswer(async (answer) => {
        if (answerProcessedRef.current || pc.currentRemoteDescription) {
          return; // Already processed
        }
        
        console.log('Answer received');
        answerProcessedRef.current = true;
        
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
          console.log('Remote description set (answer)');
          remoteDescriptionSet = true;
          
          // Add any pending ICE candidates
          pendingCandidates.forEach(candidate => {
            pc.addIceCandidate(candidate).catch(err => {
              console.warn('Error adding pending ICE candidate:', err);
            });
          });
          pendingCandidates.length = 0;
          
          setConnectionStatus('connected');
        } catch (error) {
          console.error('Error setting remote description (answer):', error);
          answerProcessedRef.current = false; // Retry on error
        }
      });

      // Watch for callee ICE candidates
      watchIceCandidates(true, (candidate) => {
        console.log('ICE candidate received from callee:', candidate);
        const iceCandidate = new RTCIceCandidate(candidate);
        
        // Only add if remote description is set
        if (remoteDescriptionSet) {
          pc.addIceCandidate(iceCandidate)
            .then(() => {
              console.log('ICE candidate added successfully (caller)');
            })
            .catch(err => {
              console.error('Error adding ICE candidate (caller):', err);
            });
        } else {
          // Store for later
          console.log('Storing ICE candidate for later (caller)');
          pendingCandidates.push(iceCandidate);
        }
      });

      // Initialize game - use setTimeout to ensure state updates
      console.log('Initializing game...');
      console.log('initializeGame function:', typeof initializeGame, initializeGame);
      const gameResult = initializeGame();
      console.log('Game initialized, result:', gameResult);
      
      // Force state update check after a brief delay
      setTimeout(() => {
        console.log('Game state after init (delayed check):', { game: !!game, status: gameState.status });
      }, 100);
      
      // Room is ready, waiting for peer to join
      console.log('Room ready, waiting for peer...');
      setConnectionStatus('waiting');
    } catch (err: any) {
      console.error('Error creating room:', err);
      console.error('Error details:', err);
      setError(err.message || 'Failed to create room. Please check Firebase connection.');
      setConnectionStatus('failed');
      cleanupWebRTC();
      cleanupRoom();
    }
  }, [
    startMedia,
    createRoom,
    initializeConnection,
    addIceCandidate,
    saveOffer,
    watchAnswer,
    watchIceCandidates,
    initializeGame,
    cleanupWebRTC,
    cleanupRoom,
  ]);

  const handleJoinRoom = useCallback(async () => {
    if (!roomIdInput.trim()) {
      setError('Please enter room ID');
      return;
    }

    try {
      setError(null);
      setConnectionStatus('connecting');
      setIsWhite(false);

      // Join room
      await joinRoom(roomIdInput.trim());

      // Start media
      await startMedia();

      // Initialize connection
      const { pc } = await initializeConnection(false);
      if (!pc) throw new Error('Failed to initialize connection');

      // Setup ICE candidate handler
      const pendingCandidates: RTCIceCandidate[] = [];
      let remoteDescriptionSet = false;
      
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('ICE candidate generated (callee)');
          addIceCandidate(event.candidate, false);
        } else {
          console.log('ICE gathering complete (callee)');
        }
      };

      // Watch for offer (only process once)
      offerProcessedRef.current = false; // Reset for new connection
      watchOffer(async (offer) => {
        if (offerProcessedRef.current || pc.currentRemoteDescription) {
          return; // Already processed
        }
        
        try {
          console.log('Offer received');
          offerProcessedRef.current = true;
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          console.log('Remote description set (offer)');
          remoteDescriptionSet = true;

          // Create and save answer
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          console.log('Local description set (answer)');
          await saveAnswer(answer);
          console.log('Answer saved');
          
          // Add any pending ICE candidates
          pendingCandidates.forEach(candidate => {
            pc.addIceCandidate(candidate).catch(err => {
              console.warn('Error adding pending ICE candidate:', err);
            });
          });
          pendingCandidates.length = 0;
          
          setConnectionStatus('connected');
        } catch (error) {
          console.error('Error processing offer:', error);
          setError('Failed to establish connection: ' + (error as Error).message);
          offerProcessedRef.current = false; // Retry on error
        }
      });

      // Watch for caller ICE candidates
      watchIceCandidates(false, (candidate) => {
        console.log('ICE candidate received from caller:', candidate);
        const iceCandidate = new RTCIceCandidate(candidate);
        
        // Only add if remote description is set
        if (remoteDescriptionSet) {
          pc.addIceCandidate(iceCandidate)
            .then(() => {
              console.log('ICE candidate added successfully (callee)');
            })
            .catch(err => {
              console.error('Error adding ICE candidate (callee):', err);
            });
        } else {
          // Store for later
          console.log('Storing ICE candidate for later (callee)');
          pendingCandidates.push(iceCandidate);
        }
      });

      // Initialize game
      console.log('Initializing game (callee)...');
      console.log('initializeGame function:', typeof initializeGame);
      const gameResult = initializeGame();
      console.log('Game initialized (callee), result:', gameResult);
      console.log('Current game state:', game);
      // Connection will be 'connected' when answer is sent (in watchOffer callback)
      setConnectionStatus('connecting');
    } catch (err: any) {
      setError(err.message || 'Failed to join room');
      setConnectionStatus('failed');
      cleanupWebRTC();
      cleanupRoom();
    }
  }, [
    roomIdInput,
    joinRoom,
    startMedia,
    initializeConnection,
    addIceCandidate,
    watchOffer,
    watchIceCandidates,
    saveAnswer,
    initializeGame,
    cleanupWebRTC,
    cleanupRoom,
  ]);

  const handleMove = useCallback(
    (from: string, to: string, promotion?: 'q' | 'r' | 'b' | 'n'): boolean => {
      if (!game || gameState.status !== 'playing') return false;

      const result = makeMove({ from, to, promotion });
      if (!result) return false;

      // Send move via WebRTC data channel (fast)
      const moveData = { from, to, promotion };
      console.log('Sending move:', moveData);
      sendMove(JSON.stringify(moveData));

      // Also save to Firestore (persistence)
      console.log('Saving move to Firestore:', moveData);
      saveMove({ from, to, promotion, timestamp: Date.now() });

      return true;
    },
    [game, gameState.status, makeMove, sendMove, saveMove]
  );

  const handleDisconnect = useCallback(() => {
    cleanupWebRTC();
    cleanupRoom();
    setConnectionStatus('disconnected');
    setRoomIdInput('');
    setError(null);
  }, [cleanupWebRTC, cleanupRoom, setConnectionStatus, setRoomIdInput, setError]);

  return (
    <main className="min-h-screen p-4 md:p-8 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">WebRTC Chess</h1>
          <p className="text-white/90 drop-shadow-md">Real-time video chess game</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Controls */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold mb-4">Game Controls</h2>

              {/* Show room ID immediately when created */}
              {roomId ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 shadow-lg">
                    <p className="text-sm font-semibold text-gray-700 mb-2 text-center">Room Code</p>
                    <p className="font-mono text-2xl font-bold tracking-widest text-center py-3 bg-white rounded-lg border-2 border-blue-300 shadow-inner mb-3 text-blue-700">
                      {roomId}
                    </p>
                    <p className="text-xs text-gray-600 text-center mb-3">
                      Share this code with your friend
                    </p>
                    <button
                      onClick={(e) => {
                        navigator.clipboard.writeText(roomId);
                        // Show feedback
                        const btn = e.currentTarget;
                        const originalText = btn.textContent;
                        btn.textContent = '✓ Copied!';
                        btn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
                        btn.classList.add('bg-green-600', 'hover:bg-green-700');
                        setTimeout(() => {
                          if (btn.textContent) btn.textContent = originalText;
                          btn.classList.remove('bg-green-600', 'hover:bg-green-700');
                          btn.classList.add('bg-blue-600', 'hover:bg-blue-700');
                        }, 2000);
                      }}
                      className="w-full py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-md hover:shadow-lg"
                    >
                      📋 Copy
                    </button>
                  </div>
                </div>
              ) : connectionStatus === 'disconnected' ? (
                <div className="space-y-4">
                  <button
                    onClick={handleCreateRoom}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg"
                  >
                    Create Room
                  </button>

                  <div className="space-y-2">
                    <input
                      type="text"
                      value={roomIdInput}
                      onChange={(e) => {
                        // Convert to uppercase and limit to 6 characters
                        const value = e.target.value.toUpperCase().replace(/[^A-Z2-9]/g, '').slice(0, 6);
                        setRoomIdInput(value);
                      }}
                      placeholder="Room ID (5-6 characters)"
                      maxLength={6}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center font-mono text-lg tracking-wider"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') handleJoinRoom();
                      }}
                    />
                    <button
                      onClick={handleJoinRoom}
                      className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      Join Room
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Show connection status and other info when connected */}
              {connectionStatus !== 'disconnected' && (
                <div className="space-y-4 mt-4">
                  <ConnectionStatus
                    status={connectionStatus}
                    iceConnectionState={iceConnectionState}
                  />
                  
                  {/* Debug info */}
                  <div className="p-3 bg-gray-100 rounded-lg text-xs">
                    <p>Local Stream: {localStream ? `${localStream.getTracks().length} tracks` : 'null'}</p>
                    <p>Remote Stream: {remoteStream ? `${remoteStream.getTracks().length} tracks` : 'null'}</p>
                    <p>ICE State: {iceConnectionState || 'unknown'}</p>
                  </div>

                  <div className="p-3 bg-gray-100 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Color:</p>
                    <p className="font-semibold">{isWhite ? 'White' : 'Black'}</p>
                  </div>

                  <button
                    onClick={handleDisconnect}
                    className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>

            {/* Video Streams */}
            <div className="space-y-4">
              <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-4 border border-white/20">
                <h3 className="text-sm font-semibold mb-2">You</h3>
                <VideoStream stream={localStream} muted label="You" />
              </div>

              <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-4 border border-white/20">
                <h3 className="text-sm font-semibold mb-2">Opponent</h3>
                <VideoStream stream={remoteStream} label="Opponent" />
              </div>
            </div>
          </div>

          {/* Right Column - Chess Board */}
          <div className="lg:col-span-2">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-6 border border-white/20">
              <div className="mb-4">
                <p className="text-lg font-semibold text-center">
                  {getGameStatusMessage()}
                </p>
              </div>

              {game ? (
                <ChessBoard
                  game={game}
                  isWhite={isWhite}
                  onMove={handleMove}
                  canMove={canMove}
                  status={gameState.status}
                />
              ) : (
                <div className="flex items-center justify-center w-full aspect-square bg-gray-100 rounded-lg">
                  <div className="text-center">
                    <p className="text-gray-500 mb-2">Game loading...</p>
                    <p className="text-xs text-gray-400 mb-4">
                      Game: {game ? 'Loaded' : 'null'} | Status: {gameState.status}
                    </p>
                    <button
                      onClick={() => {
                        console.log('Manually initializing game...');
                        console.log('initializeGame:', initializeGame);
                        const result = initializeGame();
                        console.log('Manual init result:', result);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Start Game
                    </button>
                  </div>
                </div>
              )}

              {gameState.status !== 'playing' && gameState.status !== 'waiting' && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => {
                      initializeGame();
                      setError(null);
                    }}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    New Game
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

