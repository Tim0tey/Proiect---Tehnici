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

    if(!isKingAlive(turn)){
        noLoop();
        if(turn === "white"){
            gameMessage = "Black wins!";
        } else {
            gameMessage = "You win!"
        }
    }else if(checkDrawByInsufficientMaterial(board)){
        noLoop();
        gameMessage = "Remiza!"
    }
}
function specialMove(x, y){
    if(selectedPiece instanceof Pawn){
        if(enPassantTarget && x === enPassantTarget.x && y === enPassantTarget.y){
            let dir;
            if(selectedPiece.color === "white"){
                dir = 1;
            }else{
                dir -1;
            }
            board[y + dir][x] = null
        }
        if(Math.abs(y - selectedPiece.y) === 2){
            let middleY;
            if(y > selectedPiece.y){
                middleY = selectedPiece.y + 1;
            }else{
                middleY = selectedPiece.y - 1;
            }
            enPassantTarget = {x: x, y: middleY}
        }else{
            enPassantTarget = null;
        }

        //Promovarea unei noi regine
        if(selectedPiece.color === "white" &&  y === 0){
            board[selectedPiece.y][selectedPiece.x] = null;
            board[y][x] = new Queen(x, y, "white");
            selectedPiece = null
        }
        if(selectedPiece && selectedPiece.color === "black" && y === 7){
            board[selectedPiece.y][selectedPiece.x] = null;
            board[y][x] = new Queen(x, y, "black");
            selectedPiece = null;
        }
    }else{
        enPassantTarget = null;
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
function drawBoard(){
    for(let y =0; y < boardSize; y++){
        for(let x = 0; x < boardSize; x++){
            if((x + y) % 2 == 0){
                fill(240)
            }else {
                fill(150)
            }
            rect(x * cellSize, y * cellSize, cellSize, cellSize)
        }
    }
}
function validMoves(piece){
    for(let y = 0; y< boardSize; y++){
        for(let x = 0; x < boardSize; x++){
            if(piece.canMove(x, y, board)){
                fill(0, 255, 0, 100);
                rect(x * cellSize, y * cellSize, cellSize, cellSize)
            }
        }
    }
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

