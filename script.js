let timeSelect;
let startButton;
let boardSize = 480;
let tileSize;
let board = [];
let selectedPiece = null;
let whiteTime = 600;
let blackTime = 600;
let timerRunning = true;
let currentPlayer = 'white';
let pauseButton;
let reloadButton;
let selectedTile = null;
let gameMessage = "";
let enPassantTarget = null;
let whiteCanCastleKingSide = true;
let whiteCanCastleQueenSide = true;
let blackCanCastleKingSide = true;
let blackCanCastleQueenSide = true;

function setup() {
  createCanvas(windowWidth, windowHeight);
  tileSize = boardSize / 8;
  initBoard();
  setInterval(updateTimers, 1000);

  pauseButton = createButton("Pauză");
  pauseButton.mousePressed(() => timerRunning = !timerRunning);
  pauseButton.position(540, 640);
  styleButton(pauseButton);

  reloadButton = createButton("Restart joc");
  reloadButton.position(935, 640);
  styleButton(reloadButton);
  reloadButton.mousePressed(() => location.reload());

    timeSelect = createSelect();
  timeSelect.option('10 minute', 600);
  timeSelect.option('5 minute', 300);
  timeSelect.option('3 minute', 180);
  timeSelect.position(660, 640);
  styleButton(timeSelect);

  // Buton start joc
  startButton = createButton("Start joc");
  startButton.position(820, 640);
  styleButton(startButton);
  startButton.mousePressed(() => {
    let selected = parseInt(timeSelect.value());
    whiteTime = selected;
    blackTime = selected;
    timeSelect.remove();
    startButton.remove();
    initBoard();
    setInterval(updateTimers, 1000);
    timerRunning = true;
  });

  // Butoane existente
  pauseButton = createButton("Pauză");
  pauseButton.mousePressed(() => timerRunning = !timerRunning);
  pauseButton.position(540, 640);
  styleButton(pauseButton);

  reloadButton = createButton("Restart joc");
  reloadButton.position(935, 640);
  styleButton(reloadButton);
  reloadButton.mousePressed(() => location.reload());
}

function styleButton(button) {
  button.style('padding', '10px');
  button.style('background-color', 'grey');
  button.style('color', 'white');
  button.style('border', 'none');
  button.style('border-radius', '8px');
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (pauseButton) pauseButton.position(540, 640);
  if (reloadButton) reloadButton.position(935, 640);
  if (timeSelect) timeSelect.position(540, 580);
  if (startButton) startButton.position(720, 580);

}

function draw() {
  clear();
  drawTimers();
  drawBoard();
  drawPieces();
  if (selectedPiece) {
    highlightValidMoves(selectedPiece);
  }
  if (gameMessage !== "") {
    fill(0);
    textSize(24);
    textAlign(LEFT, TOP);
    text(gameMessage, 10, 10);
    noLoop(); // Stop the draw loop if game ended
  }
}

function drawBoard() {
  let offsetX = (width - boardSize) / 2;
  let offsetY = (height - boardSize) / 2;

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      let x = offsetX + i * tileSize;
      let y = offsetY + j * tileSize;

      fill((i + j) % 2 === 0 ? 240 : 100);
      noStroke();
      rect(x, y, tileSize, tileSize);

      if (selectedTile && selectedTile.i === i && selectedTile.j === j) {
        fill(255, 255, 0, 100);
        rect(x, y, tileSize, tileSize);
      }
    }
  }
}

function drawPieces() {
  let offsetX = (width - boardSize) / 2;
  let offsetY = (height - boardSize) / 2;
  textAlign(CENTER, CENTER);
  textSize(tileSize * 0.6);

  for (let row of board) {
    for (let piece of row) {
      if (piece) {
        fill(piece.color === 'white' ? 'white' : 'black');
        text(piece.symbol, offsetX + piece.x * tileSize + tileSize / 2, offsetY + piece.y * tileSize + tileSize / 2);
      }
    }
  }
}

function mousePressed() {
  let offsetX = (width - boardSize) / 2;
  let offsetY = (height - boardSize) / 2;
  let x = floor((mouseX - offsetX) / tileSize);
  let y = floor((mouseY - offsetY) / tileSize);
  if (x < 0 || x > 7 || y < 0 || y > 7) return;

  const piece = board[y][x];

  if (selectedPiece) {
    tryMoveSelectedPieceTo(x, y);
  } else if (piece && piece.color === currentPlayer) {
    selectedPiece = piece;
  }

  selectedTile = { i: x, j: y };
}

function tryMoveSelectedPieceTo(x, y) {
  if (!selectedPiece.canMove(x, y, board) || !isLegalMove(selectedPiece, x, y)) {
    selectedPiece = null;
    return;
  }

  // Save previous rook position for castling rights update
  let prevX = selectedPiece.x;
  let prevY = selectedPiece.y;

  // Handle castling
  if (selectedPiece instanceof King && Math.abs(x - selectedPiece.x) === 2) {
    performCastling(selectedPiece, x, y);
  } else {
    // Handle en passant capture
    if (selectedPiece instanceof Pawn && enPassantTarget && x === enPassantTarget.x && y === enPassantTarget.y) {
      let dir = selectedPiece.color === 'white' ? 1 : -1; // Capture behind
      board[y + dir][x] = null;
    }

    // Move piece
    board[selectedPiece.y][selectedPiece.x] = null;
    board[y][x] = selectedPiece;
    selectedPiece.x = x;
    selectedPiece.y = y;

    // Set en passant target if pawn moved two squares from start row
    if (selectedPiece instanceof Pawn && Math.abs(y - prevY) === 2) {
      enPassantTarget = { x, y: (prevY + y) / 2 };
    } else {
      enPassantTarget = null;
    }

    // Update castling rights if King or Rook moved
    updateCastlingRights(selectedPiece, prevX, prevY);
  }

  // Pawn promotion
  if (selectedPiece instanceof Pawn) {
    if ((selectedPiece.color === "white" && y === 0) || (selectedPiece.color === "black" && y === 7)) {
      board[y][x] = new Queen(x, y, selectedPiece.color);
    }
  }

  selectedPiece = null;
  currentPlayer = currentPlayer === 'white' ? 'black' : 'white';

  checkGameStatus();
}

function performCastling(king, newX, newY) {
  let y = king.y;
  board[y][king.x] = null;
  board[y][newX] = king;
  king.x = newX;
  king.y = y;

  if (newX === 6) { // King side
    let rook = board[y][7];
    board[y][7] = null;
    board[y][5] = rook;
    rook.x = 5;
    rook.y = y;
  } else if (newX === 2) { // Queen side
    let rook = board[y][0];
    board[y][0] = null;
    board[y][3] = rook;
    rook.x = 3;
    rook.y = y;
  }

  if (king.color === 'white') {
    whiteCanCastleKingSide = false;
    whiteCanCastleQueenSide = false;
  } else {
    blackCanCastleKingSide = false;
    blackCanCastleQueenSide = false;
  }

  enPassantTarget = null;
}

function updateCastlingRights(piece, prevX, prevY) {
  // Update castling rights based on piece type and previous position
  if (piece instanceof King) {
    if (piece.color === 'white') {
      whiteCanCastleKingSide = false;
      whiteCanCastleQueenSide = false;
    } else {
      blackCanCastleKingSide = false;
      blackCanCastleQueenSide = false;
    }
  }
  if (piece instanceof Rook) {
    if (piece.color === 'white') {
      if (prevX === 0 && prevY === 7) whiteCanCastleQueenSide = false;
      if (prevX === 7 && prevY === 7) whiteCanCastleKingSide = false;
    } else {
      if (prevX === 0 && prevY === 0) blackCanCastleQueenSide = false;
      if (prevX === 7 && prevY === 0) blackCanCastleKingSide = false;
    }
  }
}

function highlightValidMoves(piece) {
  let offsetX = (width - boardSize) / 2;
  let offsetY = (height - boardSize) / 2;

  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      if (piece.canMove(x, y, board) && isLegalMove(piece, x, y)) {
        fill(0, 255, 0, 100);
        rect(offsetX + x * tileSize, offsetY + y * tileSize, tileSize, tileSize);
      }
    }
  }

  fill(255, 215, 0, 100);
  rect(offsetX + piece.x * tileSize, offsetY + piece.y * tileSize, tileSize, tileSize);
}

function drawTimers() {
  fill("white");
  textSize(20);
  textAlign(CENTER);
  text("Negru: " + formatTime(blackTime), width / 2, height / 2 - boardSize / 2 - 40);
  text("Alb: " + formatTime(whiteTime), width / 2, height / 2 + boardSize / 2 + 20);
}

function formatTime(seconds) {
  let m = floor(seconds / 60);
  let s = seconds % 60;
  return nf(m, 2) + ":" + nf(s, 2);
}

function updateTimers() {
  if (!timerRunning || gameMessage !== "") return;

  if (currentPlayer === 'white') {
    whiteTime--;
    if (whiteTime <= 0) {
      gameMessage = "Timpul albilor a expirat. Negrul câștigă!";
      noLoop();
    }
  } else {
    blackTime--;
    if (blackTime <= 0) {
      gameMessage = "Timpul negrului a expirat. Albul câștigă!";
      noLoop();
    }
  }
}

function isLegalMove(piece, x, y) {
  // Check if move does not leave own king in check
  let backupBoard = board.map(row => row.slice());
  let startX = piece.x;
  let startY = piece.y;

  let captured = board[y][x];
  board[startY][startX] = null;
  board[y][x] = piece;
  piece.x = x;
  piece.y = y;

  let inCheck = isInCheck(piece.color);

  board = backupBoard;
  piece.x = startX;
  piece.y = startY;

  return !inCheck;
}

function isInCheck(color) {
  let kingPos = findKing(color);
  if (!kingPos) return false;

  for (let row of board) {
    for (let p of row) {
      if (p && p.color !== color && p.canMove(kingPos.x, kingPos.y, board)) {
        return true;
      }
    }
  }
  return false;
}

function findKing(color) {
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      let p = board[y][x];
      if (p instanceof King && p.color === color) {
        return { x, y };
      }
    }
  }
  return null;
}

function checkGameStatus() {
  if (isInCheck(currentPlayer)) {
    if (!hasAnyLegalMove(currentPlayer)) {
      gameMessage = currentPlayer === 'white' ? "Șah-mat! Negrul câștigă!" : "Șah-mat! Albul câștigă!";
    } else {
      gameMessage = currentPlayer === 'white' ? "Alb în șah!" : "Negru în șah!";
    }
  } else if (!hasAnyLegalMove(currentPlayer)) {
    gameMessage = "Remiză!";
  }
}

function hasAnyLegalMove(color) {
  for (let row of board) {
    for (let piece of row) {
      if (piece && piece.color === color) {
        for (let y = 0; y < 8; y++) {
          for (let x = 0; x < 8; x++) {
            if (piece.canMove(x, y, board) && isLegalMove(piece, x, y)) {
              return true;
            }
          }
        }
      }
    }
  }
  return false;
}

function initBoard() {
  // Initialize empty board
  for (let y = 0; y < 8; y++) {
    board[y] = new Array(8).fill(null);
  }

  // Pawns
  for (let x = 0; x < 8; x++) {
    board[1][x] = new Pawn(x, 1, 'black');
    board[6][x] = new Pawn(x, 6, 'white');
  }

  // Rooks
  board[0][0] = new Rook(0, 0, 'black');
  board[0][7] = new Rook(7, 0, 'black');
  board[7][0] = new Rook(0, 7, 'white');
  board[7][7] = new Rook(7, 7, 'white');

  // Knights
  board[0][1] = new Knight(1, 0, 'black');
  board[0][6] = new Knight(6, 0, 'black');
  board[7][1] = new Knight(1, 7, 'white');
  board[7][6] = new Knight(6, 7, 'white');

  // Bishops
  board[0][2] = new Bishop(2, 0, 'black');
  board[0][5] = new Bishop(5, 0, 'black');
  board[7][2] = new Bishop(2, 7, 'white');
  board[7][5] = new Bishop(5, 7, 'white');

  // Queens
  board[0][3] = new Queen(3, 0, 'black');
  board[7][3] = new Queen(3, 7, 'white');

  // Kings
  board[0][4] = new King(4, 0, 'black');
  board[7][4] = new King(4, 7, 'white');
}

// Classes for pieces
class Piece {
  constructor(x, y, color, symbol) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.symbol = symbol;
  }
  canMove(x, y, board) {
    return false;
  }
  isOpponentPiece(board, x, y) {
    let target = board[y]?.[x];
    return target && target.color !== this.color;
  }
  isEmpty(board, x, y) {
    return board[y]?.[x] === null;
  }
}

class Pawn extends Piece {
  constructor(x, y, color) {
    super(x, y, color, color === 'white' ? '♙' : '♟');
  }

  canMove(x, y, board) {
    let dir = this.color === 'white' ? -1 : 1;
    let startRow = this.color === 'white' ? 6 : 1;

    // Normal move 1 square
    if (x === this.x && y === this.y + dir && this.isEmpty(board, x, y)) {
      return true;
    }

    // Normal move 2 squares from start
    if (x === this.x && y === this.y + 2 * dir && this.y === startRow && this.isEmpty(board, x, y) && this.isEmpty(board, x, y - dir)) {
      return true;
    }

    // Capture
    if (Math.abs(x - this.x) === 1 && y === this.y + dir) {
      if (this.isOpponentPiece(board, x, y)) {
        return true;
      }

      // En passant capture
      if (enPassantTarget && enPassantTarget.x === x && enPassantTarget.y === y) {
        return true;
      }
    }
    return false;
  }
}

class Rook extends Piece {
  constructor(x, y, color) {
    super(x, y, color, color === 'white' ? '♖' : '♜');
  }

  canMove(x, y, board) {
    if (x !== this.x && y !== this.y) return false;

    let stepX = x === this.x ? 0 : (x > this.x ? 1 : -1);
    let stepY = y === this.y ? 0 : (y > this.y ? 1 : -1);

    let cx = this.x + stepX;
    let cy = this.y + stepY;

    while (cx !== x || cy !== y) {
      if (!this.isEmpty(board, cx, cy)) return false;
      cx += stepX;
      cy += stepY;
    }

    return !board[y][x] || this.isOpponentPiece(board, x, y);
  }
}

class Knight extends Piece {
  constructor(x, y, color) {
    super(x, y, color, color === 'white' ? '♘' : '♞');
  }

  canMove(x, y, board) {
    let dx = Math.abs(x - this.x);
    let dy = Math.abs(y - this.y);
    if (!((dx === 1 && dy === 2) || (dx === 2 && dy === 1))) return false;
    return !board[y][x] || this.isOpponentPiece(board, x, y);
  }
}

class Bishop extends Piece {
  constructor(x, y, color) {
    super(x, y, color, color === 'white' ? '♗' : '♝');
  }

  canMove(x, y, board) {
    if (Math.abs(x - this.x) !== Math.abs(y - this.y)) return false;

    let stepX = x > this.x ? 1 : -1;
    let stepY = y > this.y ? 1 : -1;

    let cx = this.x + stepX;
    let cy = this.y + stepY;

    while (cx !== x && cy !== y) {
      if (!this.isEmpty(board, cx, cy)) return false;
      cx += stepX;
      cy += stepY;
    }

    return !board[y][x] || this.isOpponentPiece(board, x, y);
  }
}

class Queen extends Piece {
  constructor(x, y, color) {
    super(x, y, color, color === 'white' ? '♕' : '♛');
  }

  canMove(x, y, board) {
    let dx = Math.abs(x - this.x);
    let dy = Math.abs(y - this.y);

    if (x === this.x || y === this.y) {
      // Rook-like move
      let stepX = x === this.x ? 0 : (x > this.x ? 1 : -1);
      let stepY = y === this.y ? 0 : (y > this.y ? 1 : -1);
      let cx = this.x + stepX;
      let cy = this.y + stepY;

      while (cx !== x || cy !== y) {
        if (!this.isEmpty(board, cx, cy)) return false;
        cx += stepX;
        cy += stepY;
      }
      return !board[y][x] || this.isOpponentPiece(board, x, y);
    } else if (dx === dy) {
      // Bishop-like move
      let stepX = x > this.x ? 1 : -1;
      let stepY = y > this.y ? 1 : -1;
      let cx = this.x + stepX;
      let cy = this.y + stepY;

      while (cx !== x && cy !== y) {
        if (!this.isEmpty(board, cx, cy)) return false;
        cx += stepX;
        cy += stepY;
      }
      return !board[y][x] || this.isOpponentPiece(board, x, y);
    }
    return false;
  }
}
class King extends Piece {
  constructor(x, y, color) {
    super(x, y, color, color === 'white' ? '♔' : '♚');
  }

  canMove(x, y, board) {
    let dx = Math.abs(x - this.x);
    let dy = Math.abs(y - this.y);

    // Normal king move (one square in any direction)
    if ((dx <= 1 && dy <= 1) && (dx + dy !== 0)) {
      return !board[y][x] || this.isOpponentPiece(board, x, y);
    }

    // Castling
    if (dy === 0 && dx === 2) {
      if (this.color === 'white') {
        if (x === 6 && whiteCanCastleKingSide && board[7][5] === null && board[7][6] === null) {
          return board[7][7] instanceof Rook && board[7][7].color === 'white';
        } else if (x === 2 && whiteCanCastleQueenSide && board[7][1] === null && board[7][2] === null && board[7][3] === null) {
          return board[7][0] instanceof Rook && board[7][0].color === 'white';
        }
      } else {
        if (x === 6 && blackCanCastleKingSide && board[0][5] === null && board[0][6] === null) {
          return board[0][7] instanceof Rook && board[0][7].color === 'black';
        } else if (x === 2 && blackCanCastleQueenSide && board[0][1] === null && board[0][2] === null && board[0][3] === null) {
          return board[0][0] instanceof Rook && board[0][0].color === 'black';
        }
      }
    }

    return false;
  }
}


function isSquareAttacked(x, y, byColor) {
  for (let row of board) {
    for (let p of row) {
      if (p && p.color === byColor && p.canMove(x, y, board)) {
        return true;
      }
    }
  }
  return false;
}
