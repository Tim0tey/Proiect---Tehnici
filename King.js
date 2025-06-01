import Pawn from './Pawn.js';

export default class King extends Pawn {
  constructor(color, position) {
    super(color, position);
  }

  validMoves(board) {
    // board este matricea 8x8 sau orice structură care conține piesele
    // returnăm o listă de poziții valide la care regele se poate muta

    const moves = [];
    const directions = [
      [1, 0],    // dreapta
      [-1, 0],   // stânga
      [0, 1],    // sus
      [0, -1],   // jos
      [1, 1],    // diagonal dreapta sus
      [1, -1],   // diagonal dreapta jos
      [-1, 1],   // diagonal stânga sus
      [-1, -1],  // diagonal stânga jos
    ];

    // Transformăm poziția curentă în coordonate matrice (ex: "e4" -> col=4, row=3)
    const col = this.position.charCodeAt(0) - 'a'.charCodeAt(0);
    const row = 8 - parseInt(this.position[1]);

    for (const [dx, dy] of directions) {
      const newCol = col + dx;
      const newRow = row + dy;

      // Verificăm dacă poziția e validă în tablă
      if (newCol >= 0 && newCol < 8 && newRow >= 0 && newRow < 8) {
        const targetPiece = board[newRow][newCol];
        // Dacă ținta este liberă sau are piesă adversă, e mutare validă
        if (!targetPiece || targetPiece.color !== this.color) {
          // Convertim în notație algebraică (ex: col=4,row=3 -> e5)
          const pos = String.fromCharCode('a'.charCodeAt(0) + newCol) + (8 - newRow);
          moves.push(pos);
        }
      }
    }

    return moves;
  }
}
