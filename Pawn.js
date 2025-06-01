import Piece from './Piece.js';

export class Pawn extends Piece {
  validMoves(board) {
    const moves = [];
    const col = this.position.charCodeAt(0) - 'a'.charCodeAt(0);
    const row = 8 - parseInt(this.position[1]);
    const direction = this.color === 'white' ? -1 : 1;

    const forwardRow = row + direction;
    if (this.isInsideBoard(col, forwardRow) && !board[forwardRow][col]) {
      moves.push(String.fromCharCode('a'.charCodeAt(0) + col) + (8 - forwardRow));
      // Two steps if starting row
      const startRow = this.color === 'white' ? 6 : 1;
      if (row === startRow && !board[row + 2 * direction][col]) {
        moves.push(String.fromCharCode('a'.charCodeAt(0) + col) + (8 - (row + 2 * direction)));
      }
    }

    // Captures
    for (const dx of [-1, 1]) {
      const newCol = col + dx;
      if (this.isInsideBoard(newCol, forwardRow)) {
        const target = board[forwardRow][newCol];
        if (target && target.color !== this.color) {
          moves.push(String.fromCharCode('a'.charCodeAt(0) + newCol) + (8 - forwardRow));
        }
      }
    }

    return moves;
  }
}
