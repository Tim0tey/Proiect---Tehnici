import Piece from './Piece.js';

export class Bishop extends Piece {
  validMoves(board) {
    const moves = [];
    const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
    const col = this.position.charCodeAt(0) - 'a'.charCodeAt(0);
    const row = 8 - parseInt(this.position[1]);

    for (const [dx, dy] of directions) {
      let newCol = col + dx;
      let newRow = row + dy;
      while (this.isInsideBoard(newCol, newRow)) {
        const target = board[newRow][newCol];
        if (!target) {
          moves.push(String.fromCharCode('a'.charCodeAt(0) + newCol) + (8 - newRow));
        } else {
          if (target.color !== this.color) {
            moves.push(String.fromCharCode('a'.charCodeAt(0) + newCol) + (8 - newRow));
          }
          break;
        }
        newCol += dx;
        newRow += dy;
      }
    }
    return moves;
  }
}
