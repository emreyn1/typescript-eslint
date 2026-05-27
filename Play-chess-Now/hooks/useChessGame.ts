import { useState, useCallback, useRef, useEffect } from 'react';
import { Chess } from 'chess.js';
import { GameState, MoveData, GameStatus } from '@/types/game';

type PromotionPiece = 'q' | 'r' | 'b' | 'n';

export function useChessGame(isWhite: boolean) {
  const [gameState, setGameState] = useState<GameState>({
    game: null,
    isWhite,
    status: 'waiting',
    connectionStatus: 'disconnected',
    roomId: null,
    lastMove: null,
    error: null,
  });

  const gameRef = useRef<Chess | null>(null);

  const initializeGame = useCallback(() => {
    console.log('useChessGame: Initializing game...');
    const newGame = new Chess();
    gameRef.current = newGame;
    console.log('useChessGame: Game created, updating state...');
    setGameState(prev => {
      const newState = {
        ...prev,
        game: newGame,
        status: 'playing' as const,
        lastMove: null,
        error: null,
      };
      console.log('useChessGame: State updated, game:', !!newState.game);
      return newState;
    });
    return newGame;
  }, []);

  const makeMove = useCallback((move: { from: string; to: string; promotion?: PromotionPiece }) => {
    if (!gameRef.current) return null;

    try {
      const result = gameRef.current.move({
        from: move.from,
        to: move.to,
        promotion: move.promotion || 'q',
      });

      if (!result) return null;

      const moveData: MoveData = {
        from: move.from,
        to: move.to,
        promotion: move.promotion,
        timestamp: Date.now(),
      };

      // Check game status
      let status: GameStatus = 'playing';
      if (gameRef.current.isCheckmate()) {
        status = 'checkmate';
      } else if (gameRef.current.isStalemate()) {
        status = 'stalemate';
      } else if (gameRef.current.isDraw()) {
        status = 'draw';
      }

      setGameState(prev => ({
        ...prev,
        lastMove: moveData,
        status,
      }));

      return { move: result, moveData, status };
    } catch (error) {
      console.error('Invalid move:', error);
      return null;
    }
  }, []);

  const applyRemoteMove = useCallback((moveData: MoveData) => {
    if (!gameRef.current) return false;

    try {
      // Check if move already applied (prevent duplicates)
      const history = gameRef.current.history({ verbose: true });
      const lastMove = history[history.length - 1];
      
      if (lastMove && lastMove.from === moveData.from && lastMove.to === moveData.to) {
        return false; // Move already applied
      }

      const result = gameRef.current.move({
        from: moveData.from,
        to: moveData.to,
        promotion: moveData.promotion || 'q',
      });

      if (!result) return false;

      // Check game status
      let status: GameStatus = 'playing';
      if (gameRef.current.isCheckmate()) {
        status = 'checkmate';
      } else if (gameRef.current.isStalemate()) {
        status = 'stalemate';
      } else if (gameRef.current.isDraw()) {
        status = 'draw';
      }

      setGameState(prev => ({
        ...prev,
        lastMove: moveData,
        status,
      }));

      return true;
    } catch (error) {
      console.error('Error applying remote move:', error);
      return false;
    }
  }, []);

  const isValidMove = useCallback((from: string, to: string): boolean => {
    if (!gameRef.current) return false;
    
    try {
      const move = gameRef.current.move({
        from,
        to,
        promotion: 'q', // Default for validation
      });
      
      if (move) {
        gameRef.current.undo();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const canMove = useCallback((square: string): boolean => {
    if (!gameRef.current || gameState.status !== 'playing') return false;
    
    const piece = gameRef.current.get(square as any);
    if (!piece) return false;

    // Check if it's player's turn
    const isPlayerTurn = (gameRef.current.turn() === 'w' && gameState.isWhite) ||
                        (gameRef.current.turn() === 'b' && !gameState.isWhite);
    if (!isPlayerTurn) return false;

    // Check if piece belongs to player
    const isPlayerPiece = (gameState.isWhite && piece.color === 'w') ||
                         (!gameState.isWhite && piece.color === 'b');
    
    return isPlayerPiece;
  }, [gameState.isWhite, gameState.status]);

  const getGameStatusMessage = useCallback((): string => {
    if (!gameRef.current) return 'Hazır...';
    
    if (gameState.status === 'checkmate') {
      const winner = gameRef.current.turn() === 'w' ? 'Siyah' : 'Beyaz';
      return `${winner} kazandı!`;
    }
    
    if (gameState.status === 'stalemate') {
      return 'Pat! Berabere.';
    }
    
    if (gameState.status === 'draw') {
      return 'Berabere!';
    }
    
    if (gameState.status === 'playing') {
      const turn = gameRef.current.turn() === 'w' ? 'Beyaz' : 'Siyah';
      const isPlayerTurn = (gameRef.current.turn() === 'w' && gameState.isWhite) ||
                          (gameRef.current.turn() === 'b' && !gameState.isWhite);
      return isPlayerTurn ? `Sıra: ${turn} (Sen)` : `Sıra: ${turn}`;
    }
    
    return 'Hazır...';
  }, [gameState.status, gameState.isWhite]);

  const resetGame = useCallback(() => {
    initializeGame();
  }, [initializeGame]);

  useEffect(() => {
    setGameState(prev => ({ ...prev, isWhite }));
  }, [isWhite]);

  return {
    game: gameState.game,
    gameState,
    initializeGame,
    makeMove,
    applyRemoteMove,
    isValidMove,
    canMove,
    getGameStatusMessage,
    resetGame,
  };
}

