'use client';

import { useEffect, useRef, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { Square } from 'react-chessboard/dist/chessboard/types';
import { Chess } from 'chess.js';
type PromotionPiece = 'q' | 'r' | 'b' | 'n';

interface ChessBoardProps {
  game: Chess | null;
  isWhite: boolean;
  onMove: (from: string, to: string, promotion?: PromotionPiece) => boolean;
  canMove: (square: string) => boolean;
  status: string;
}

export default function ChessBoard({ game, isWhite, onMove, canMove, status }: ChessBoardProps) {
  const [promotionSquare, setPromotionSquare] = useState<{ from: string; to: string } | null>(null);
  const gameFen = game?.fen() || 'start';

  const onPieceDrop = (sourceSquare: Square, targetSquare: Square): boolean => {
    if (!game || status !== 'playing') return false;

    // Check if promotion is needed
    const piece = game.get(sourceSquare as any);
    if (piece?.type === 'p') {
      const isWhitePawn = piece.color === 'w';
      const isPromotionRank = isWhitePawn 
        ? targetSquare[1] === '8' 
        : targetSquare[1] === '1';
      
      if (isPromotionRank) {
        setPromotionSquare({ from: sourceSquare, to: targetSquare });
        return false; // Wait for promotion selection
      }
    }

    return onMove(sourceSquare, targetSquare);
  };

  const handlePromotion = (piece: PromotionPiece) => {
    if (!promotionSquare) return;
    
    onMove(promotionSquare.from, promotionSquare.to, piece);
    setPromotionSquare(null);
  };

  const onSquareClick = (square: Square) => {
    // Optional: Add square highlighting or move hints
  };

  // Debug: Log game state
  useEffect(() => {
    console.log('ChessBoard - game state:', { game: !!game, gameFen, status });
  }, [game, gameFen, status]);

  if (!game) {
    return (
      <div className="flex items-center justify-center w-full aspect-square bg-gray-100 rounded-lg">
        <p className="text-gray-500">Loading...</p>
        <p className="text-xs text-gray-400 mt-2">Game: {game ? 'Loaded' : 'Not initialized'}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-xl p-4">
        <Chessboard
          position={gameFen}
          boardOrientation={isWhite ? 'white' : 'black'}
          onPieceDrop={onPieceDrop}
          onSquareClick={onSquareClick}
          customBoardStyle={{
            borderRadius: '4px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          }}
          arePiecesDraggable={status === 'playing'}
        />
      </div>

      {/* Promotion Modal */}
      {promotionSquare && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-4 text-center">Select Promotion Piece</h3>
            <div className="grid grid-cols-4 gap-4">
              {(['q', 'r', 'b', 'n'] as const).map((piece) => (
                <button
                  key={piece}
                  onClick={() => handlePromotion(piece)}
                  className="w-16 h-16 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg text-2xl transition-colors"
                >
                  {piece === 'q' && '♕'}
                  {piece === 'r' && '♖'}
                  {piece === 'b' && '♗'}
                  {piece === 'n' && '♘'}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPromotionSquare(null)}
              className="mt-4 w-full py-2 bg-gray-300 hover:bg-gray-400 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

