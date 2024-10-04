import React from 'react';

interface PieceProps {
  type: 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
  color: 'white' | 'black';
}

const Piece: React.FC<PieceProps> = ({ type, color }) => {
  // You can replace these with actual chess piece Unicode characters or images
  const pieceSymbols = {
    pawn: '♟',
    rook: '♜',
    knight: '♞',
    bishop: '♝',
    queen: '♛',
    king: '♚',
  };

  return (
    <div className={`piece ${color}`}>
      {pieceSymbols[type]}
    </div>
  );
};

export default Piece;