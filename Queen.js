import Piece from './Piece.js';

export class Queen extends Piece {
  validMoves(board) {
    const rook = new (require('./Rook.js').Rook)(this.color, this.position);
    const bishop = new (require('./Bishop.js').Bishop)(this.color, this.position);
    return [...rook.validMoves(board), ...bishop.validMoves(board)];
  }
}

// Knight.js
import Piece from './Piece.js';

export class Knight extends Piece {
  validMoves(board) {
    const moves = [];
    const deltas = [
      [1, 2], [2, 1], [-1, 2], [-2, 1],
      [1, -2], [2, -1], [-1, -2], [-2, -1]
    ];
    const col = this.position.charCodeAt(0) - 'a'.charCodeAt(0);
    const row = 8 - parseInt(this.position[1]);

    for (const [dx, dy] of deltas) {
      const newCol = col + dx;
      const newRow = row + dy;
      if (this.isInsideBoard(newCol, newRow)) {
        const target = board[newRow][newCol];
        if (!target || target.color !== this.color) {
          moves.push(String.fromCharCode('a'.charCodeAt(0) + newCol) + (8 - newRow));
        }
      }
    }
    return moves;
  }
}