function setup() {
    createCanvas(cellSize * boardSize, cellSize * boardSize)
    initBoard();
}
let boardSize = 8;
let cellSize = 80;
let board = [];
let selectedPiece = null;
let turn = "white";
let enPassantTarget = null;
let gameMessage = "";

function draw() {
    background(255);
    drawBoard();
    if (selectedPiece) {
        highlightValidMoves(selectedPiece);
    }
    drawPieces();
    if(gameMessage !== ""){
        fill(0);
        textSize(24);
        textAlign(LEFT, TOP);
        text(gameMessage, 10, 10)
    }
}
function initBoard(){
    for(let y = 0; y < 8; y++){
        board[y] = new Array(boardSize).fill(null);
    }
    const backRow = [Rook, Knight, Bishop, Queen, King, Bishop, Knight, Rook];
    for(let i = 0; i < boardSize; i++){
        board[0][i] = new backRow[i](i, 0, "black")
        board[1][i] = new Pawn(i, 1, "black");
        board[6][i] = new Pawn(i, 6, "white")
        board[7][i] = new backRow[i](1,7, "white")
    }
}
function mousePressed() {
    const i = floor(mouseX / cellSize);
    const j = floor(mouseY / cellSize);

    if (i >= 0 && i < boardSize && j >= 0 && j < boardSize) {
        clickOnBoard(i, j);
    }
}
function clickOnBoard(x, y) {
    const piece = board[y][x];
    if (selectedPiece) {
        moveSelectedPiecteTo(x, y);
    }else if(piece && piece.color === turn){
        selectedPiece(piece);
    }
}
function selectPiece(piece){
    selectedPiece = piece;
}
function moveSelectedPiecteTo(x, y){
    if(!selectedPiece.canMove(x, y, board)){
        selectedPiece = null;
        return;
    }

    specialMove(x, y)

    board[selectedPiece.y][selectedPiece.x] = null;
    board[y][x] = selectedPiece;
    selectedPiece.x = x;
    selectedPiece.y = y;

    selectedPiece = null;
    switchTurn();

    if(!isKingAlive(board, turn)){
        noLoop();
        if(turn === "white"){
            gameMessage = "Black wins!";
        } else {
            gameMessage = "You win!"
        }
    }else if(checkDrawByInsufficientMaterial(board)){
        const pieces = [];
        for(let row of board)

    }
}
function specialMove(){
    if(){

    }
}

function isKingAlive(board, color){
    for(let row of board){
        for(let piece of row){
            if(piece && piece instanceof King && piece.color === color)
                return true;
        }
    }
    return false;
}
function checkDrawByInsufficientMaterial(){
    const pieces = [];
    for(let row of board){
        for(let piece of row){
            if(piece){
                pieces.push(piece);
            }
        }
    }
    if(pieces.length === 2){
        return true;
    }
    if(pieces.length === 3){
        const minor = pieces.find(p => !(p instanceof King));
        if(minor instanceof Bishop || minor instanceof Knight){
            return true;
        }
    }
    return false;
}
function drawPieces(){
    for(let row of board){
        for(let piece of row){
            if(piece) piece.draw()
        }
    }
}
class Piece{
    constructor(x, y, color){
        this.x = x;
        this.y = y;
        this.color = color;
    }
    draw(){
        textSize(40);
        textAlign(CENTER, CENTER)
       if(this.color === "white"){
        fill(255);
       }else {
        fill(0)
       }
    
    text(this.symbol, this.x * cellSize + cellSize / 2, this.y * cellSize + cellSize / 2)
    }
}

