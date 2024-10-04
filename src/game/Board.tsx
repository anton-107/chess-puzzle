import React, { useState, useEffect, useCallback } from 'react';
import './Board.css';
import Piece from './Piece';

const Board: React.FC = () => {
  const rows = 8;
  const cols = 8;
  const [selectedPiece, setSelectedPiece] = useState<{ row: number; col: number } | null>(null);
  const [board, setBoard] = useState<(React.ReactElement | null)[][]>(
    Array(rows).fill(null).map(() => Array(cols).fill(null))
  );
  const [currentTurn, setCurrentTurn] = useState<'white' | 'black'>('white');
  const [lastMove, setLastMove] = useState<{ from: [number, number]; to: [number, number] } | null>(null);
  const [moveHistory, setMoveHistory] = useState<{
    board: (React.ReactElement | null)[][];
    currentTurn: 'white' | 'black';
    lastMove: { from: [number, number]; to: [number, number] } | null;
  }[]>([]);

  // Initialize the board
  useEffect(() => {
    const initialBoard = Array(rows).fill(null).map(() => Array(cols).fill(null));
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        initialBoard[row][col] = getInitialPiece(row, col);
      }
    }
    setBoard(initialBoard);
  }, []);

  const getInitialPiece = (row: number, col: number): React.ReactElement | null => {
    const color = row < 2 ? 'black' : row > 5 ? 'white' : null;
    if (!color) return null;

    if (row === 1 || row === 6) {
      return <Piece type="pawn" color={color} />;
    }

    if (row === 0 || row === 7) {
      switch (col) {
        case 0:
        case 7:
          return <Piece type="rook" color={color} />;
        case 1:
        case 6:
          return <Piece type="knight" color={color} />;
        case 2:
        case 5:
          return <Piece type="bishop" color={color} />;
        case 3:
          return <Piece type="queen" color={color} />;
        case 4:
          return <Piece type="king" color={color} />;
        default:
          return null;
      }
    }

    return null;
  };

  // Update getPiece function to use the board state
  const getPiece = (row: number, col: number) => {
    return board[row][col];
  };

  // Add this function before getPossibleMoves
  const isUnderAttack = (row: number, col: number, kingColor: string): boolean => {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = getPiece(r, c);
        if (piece && piece.props.color !== kingColor) {
          const moves = getPossibleMoves(r, c, true);
          if (moves.some(([moveRow, moveCol]) => moveRow === row && moveCol === col)) {
            return true;
          }
        }
      }
    }
    return false;
  };

  // Function to get possible moves for a piece (simplified example)
  const getPossibleMoves = (row: number, col: number, ignoreKingSafety: boolean = false) => {
    const piece = getPiece(row, col);
    if (!piece) return [];

    const moves: [number, number][] = [];

    switch (piece.props.type) {
      case 'pawn':
        const direction = piece.props.color === 'white' ? -1 : 1;
        const initialRow = piece.props.color === 'white' ? 6 : 1;
        
        // Single move forward
        if (!getPiece(row + direction, col)) {
          moves.push([row + direction, col]);
          
          // Double move forward if on initial row
          if (row === initialRow && !getPiece(row + 2 * direction, col)) {
            moves.push([row + 2 * direction, col]);
          }
        }
        
        // Capture moves (diagonally)
        [[row + direction, col - 1], [row + direction, col + 1]].forEach(([r, c]) => {
          if (r >= 0 && r < 8 && c >= 0 && c < 8) {
            const targetPiece = getPiece(r, c);
            if (targetPiece && targetPiece.props.color !== piece.props.color) {
              moves.push([r, c]);
            }
          }
        });
        break;
      
      case 'knight':
        const knightMoves = [
          [-2, -1], [-2, 1], [-1, -2], [-1, 2],
          [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        knightMoves.forEach(([dRow, dCol]) => {
          const newRow = row + dRow;
          const newCol = col + dCol;
          if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            moves.push([newRow, newCol]);
          }
        });
        break;
      
      case 'bishop':
        const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        directions.forEach(([dRow, dCol]) => {
          let newRow = row + dRow;
          let newCol = col + dCol;
          while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            moves.push([newRow, newCol]);
            if (getPiece(newRow, newCol)) break; // Stop if we hit a piece
            newRow += dRow;
            newCol += dCol;
          }
        });
        break;
    
      case 'king':
        const kingMoves = [
          [-1, -1], [-1, 0], [-1, 1],
          [0, -1],           [0, 1],
          [1, -1],  [1, 0],  [1, 1]
        ];
        kingMoves.forEach(([dRow, dCol]) => {
          const newRow = row + dRow;
          const newCol = col + dCol;
          if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            if (ignoreKingSafety || !isUnderAttack(newRow, newCol, piece.props.color)) {
              moves.push([newRow, newCol]);
            }
          }
        });
        break;

      case 'queen':
        const queenDirections = [
          [-1, -1], [-1, 0], [-1, 1],
          [0, -1],           [0, 1],
          [1, -1],  [1, 0],  [1, 1]
        ];
        queenDirections.forEach(([dRow, dCol]) => {
          let newRow = row + dRow;
          let newCol = col + dCol;
          while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            moves.push([newRow, newCol]);
            if (getPiece(newRow, newCol)) break; // Stop if we hit a piece
            newRow += dRow;
            newCol += dCol;
          }
        });
        break;

      case 'rook':
        const rookDirections = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        rookDirections.forEach(([dRow, dCol]) => {
          let newRow = row + dRow;
          let newCol = col + dCol;
          while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            moves.push([newRow, newCol]);
            if (getPiece(newRow, newCol)) break; // Stop if we hit a piece
            newRow += dRow;
            newCol += dCol;
          }
        });
        break;

      // Add logic for other piece types here
    }

    // Filter out moves that would capture pieces of the same color
    let validMoves = moves.filter(([r, c]) => {
      const targetPiece = getPiece(r, c);
      return !targetPiece || targetPiece.props.color !== piece.props.color;
    });

    // If ignoreKingSafety is true, return the moves without further checks
    if (ignoreKingSafety) return validMoves;

    // Find the king's position
    const kingPosition = findKingPosition(piece.props.color);
    if (!kingPosition) return [];

    // Check if the king is currently under attack
    const isKingUnderAttack = isUnderAttack(kingPosition[0], kingPosition[1], piece.props.color);

    if (isKingUnderAttack) {
      // If the king is under attack, only allow moves that protect the king
      validMoves = validMoves.filter(([r, c]) => {
        // Simulate the move
        const newBoard = simulateMove(row, col, r, c);
        // Check if the king is still under attack after the move
        return !isKingUnderAttackAfterMove(newBoard, piece.props.color);
      });
    } else {
      // If the king is not under attack, ensure no move puts the king in check
      validMoves = validMoves.filter(([r, c]) => {
        // Simulate the move
        const newBoard = simulateMove(row, col, r, c);
        // Check if the king would be under attack after the move
        return !isKingUnderAttackAfterMove(newBoard, piece.props.color);
      });
    }

    return validMoves;
  };

  const handleCellClick = (row: number, col: number) => {
    const clickedPiece = getPiece(row, col);

    if (selectedPiece) {
      if (selectedPiece.row === row && selectedPiece.col === col) {
        setSelectedPiece(null);
      } else if (isHighlighted(row, col)) {
        // Store the current state in history before making the move
        setMoveHistory(prev => [...prev, {
          board: board.map(row => row.map(cell => cell ? React.cloneElement(cell) : null)),
          currentTurn,
          lastMove
        }]);

        // Move the piece
        const newBoard = board.map(row => [...row]);
        newBoard[row][col] = React.cloneElement(board[selectedPiece.row][selectedPiece.col]);
        newBoard[selectedPiece.row][selectedPiece.col] = null;
        setBoard(newBoard);
        // Set the last move
        setLastMove({
          from: [selectedPiece.row, selectedPiece.col],
          to: [row, col]
        });
        setSelectedPiece(null);
        // Switch turns after a successful move
        setCurrentTurn(currentTurn === 'white' ? 'black' : 'white');
      } else {
        setSelectedPiece(null);
      }
    } else if (clickedPiece && clickedPiece.props.color === currentTurn) {
      setSelectedPiece({ row, col });
    }
  };

  const handleUndo = useCallback(() => {
    if (moveHistory.length > 0) {
      const lastState = moveHistory[moveHistory.length - 1];
      setBoard(prevBoard => {
        // Create a deep copy of the last board state, including the piece elements
        return lastState.board.map(row => 
          row.map(cell => 
            cell ? React.cloneElement(cell) : null
          )
        );
      });
      setCurrentTurn(lastState.currentTurn);
      setLastMove(lastState.lastMove);
      setMoveHistory(prev => prev.slice(0, -1));
      setSelectedPiece(null); // Clear any selected piece
    }
  }, [moveHistory]);

  const isHighlighted = (row: number, col: number) => {
    if (!selectedPiece) return false;
    return getPossibleMoves(selectedPiece.row, selectedPiece.col).some(
      ([r, c]) => r === row && c === col
    );
  };

  const isLastMove = (row: number, col: number) => {
    return lastMove &&
      ((row === lastMove.from[0] && col === lastMove.from[1]) ||
       (row === lastMove.to[0] && col === lastMove.to[1]));
  };

  // Helper functions (to be added)

  const findKingPosition = (color: string): [number, number] | null => {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = getPiece(r, c);
        if (piece && piece.props.type === 'king' && piece.props.color === color) {
          return [r, c];
        }
      }
    }
    return null;
  };

  const simulateMove = (fromRow: number, fromCol: number, toRow: number, toCol: number) => {
    const newBoard = board.map(row => [...row]);
    newBoard[toRow][toCol] = newBoard[fromRow][fromCol];
    newBoard[fromRow][fromCol] = null;
    return newBoard;
  };

  const isKingUnderAttackAfterMove = (simulatedBoard: (React.ReactElement | null)[][], kingColor: string): boolean => {
    const kingPosition = findKingPositionOnBoard(simulatedBoard, kingColor);
    if (!kingPosition) return false;

    return isUnderAttackOnBoard(simulatedBoard, kingPosition[0], kingPosition[1], kingColor);
  };

  const findKingPositionOnBoard = (board: (React.ReactElement | null)[][], color: string): [number, number] | null => {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.props.type === 'king' && piece.props.color === color) {
          return [r, c];
        }
      }
    }
    return null;
  };

  const isUnderAttackOnBoard = (board: (React.ReactElement | null)[][], row: number, col: number, kingColor: string): boolean => {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.props.color !== kingColor) {
          const moves = getPossibleMovesOnBoard(board, r, c, true);
          if (Array.isArray(moves) && moves.some(([moveRow, moveCol]) => moveRow === row && moveCol === col)) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const getPossibleMovesOnBoard = (board: (React.ReactElement | null)[][], row: number, col: number, ignoreKingSafety: boolean = false) => {
    // This function should be similar to getPossibleMoves, but work with the provided board instead of the global state
    // Implement the logic for each piece type as in the original getPossibleMoves function
  };

  return (
    <div>
    <div className="board">
      <div className="turn-indicator">Current turn: {currentTurn}</div>
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="board-row">
          {row.map((piece, colIndex) => (
            <div
              key={colIndex}
              className={`board-cell ${(rowIndex + colIndex) % 2 === 0 ? 'light' : 'dark'}
                ${isHighlighted(rowIndex, colIndex) ? 'highlighted' : ''}
                ${selectedPiece?.row === rowIndex && selectedPiece?.col === colIndex ? 'selected' : ''}
                ${isLastMove(rowIndex, colIndex) ? 'last-move' : ''}`}
              onClick={() => handleCellClick(rowIndex, colIndex)}
            >
              {piece}
            </div>
          ))}
        </div>
      ))}
    </div>
    <div className="board-controls">

      <button onClick={handleUndo} disabled={moveHistory.length === 0}>
        Undo
      </button>
    </div>
    </div>
  );
};

export default Board;