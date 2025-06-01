let whiteTime = 600;
let blackTime = 600;
let timerRunning = true;

function setup() {
    createCanvas(cellSize * boardSize, cellSize * boardSize)
    initBoard();
    tileSize = boardSize / 8;
    setInterval(updateTimers, 1000);

    pauseButton = createButton("Pauza");
    pauseButton.mousePressed(() => timerRunning = !timerRunning);
    pauseButton.position(540, 640);
    pauseButton.style('padding', '10px');
    pauseButton.style('background-color', 'grey');
    pauseButton.style('color', 'white');
    pauseButton.style('border', 'none');
    pauseButton.style('border-radius', '8px');

    reloadButton = createButton("Restart joc");
    reloadButton.position(935, 640); // Poziționează butonul pe ecran
    reloadButton.style('padding', '10px');
    reloadButton.style('background-color', 'grey');
    reloadButton.style('color', 'white');
    reloadButton.style('border', 'none');
    reloadButton.style('border-radius', '8px');
    reloadButton.mousePressed(() => {
        location.reload(); // Reîncarcă pagina
    });
}

const boardSize = 8;
const cellSize = 80;
let board = [];

const piese = {
    pawn: "",
    rook: "",
    knight: "",
    bishop: "",
    queen: "",
    king: "",
}
function draw() {
    background(255);
    drawBoard();
    drawPieces();
    pieceMoves();
}
function initBoard() {
    board = Array(boardSize).fill().map(() => Array(boardSize).fill(null));

    const ordonateBackPieces = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"];

    //acuma vom initializa ordonarea pieselor negre
    for (let i = 0; i < boardSize; i++) {
        board[0][i] = { type: ordonateBackPieces[i], color: "black" }
        board[1][i] = { type: "pawn", color: "black" }
    }

    //ordonarea pieselor albe
    for (let i = 0; i < boardSize; i++) {
        board[7][i] = { type: ordonateBackPieces[i], color: "white" }
        board[6][i] = { type: "pawn", color: "white" }
    }
}