function setup(){
    createCanvas(cellSize * boardSize, cellSize * boardSize)
    initBoard();
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
function draw(){
    background(255);
    drawBoard();
    drawPieces();
    pieceMoves();
}
function initBoard(){
    board = Array(boardSize).fill().map(() => Array(boardSize).fill(null));

    const ordonateBackPieces = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"];

    //acuma vom initializa ordonarea pieselor negre
    for(let i = 0; i < boardSize; i++){
        board[0][i] = { type: ordonateBackPieces[i], color: "black"}
        board[1][i] = { type: "pawn", color: "black"}
    }

    //ordonarea pieselor albe
    for(let i = 0; i < boardSize; i++){
        board[7][i] = { type: ordonateBackPieces[i], color: "white"}
        board[6][i] = { type : "pawn", color: "white"}
    }
}