let timeSelect;//selectorul pentru alegerea timpului
let startButton;//buton de start
let boardSize = 480;//dimensiunea tablei
let tileSize;//dimensiunea unui patrat
let board = [];//matricea de 8x8 care tine de jucator
let selectedPiece = null;//piesa selectata de jucator
let whiteTime = 600;//timpul ramas pentru jucatorul alb
let blackTime = 600;//timpul raas pentru jucatorul negru
let timerRunning = true;//control daca ceasul merge sau e pus pe pauza
let currentPlayer = 'white';//jucatorul care are randul
let pauseButton;
let reloadButton;
let selectedTile = null;//coordonatele patratului
let gameMessage = "";
let enPassantTarget = null;//tinta pentru capturarea en pssant
let whiteCanCastleKingSide = true;
let whiteCanCastleQueenSide = true;
let blackCanCastleKingSide = true;
let blackCanCastleQueenSide = true;

function setup() {
  createCanvas(windowWidth, windowHeight);
  tileSize = boardSize / 8;//calcularea dimensiunii unui patrat
  initBoard();//initializarea pieselor pe tabla
  setInterval(updateTimers, 1000);//actualizeaza ceasului la fiecare 1 secunda

  //crearea butonului de pauza
  pauseButton = createButton("Pauză");
  pauseButton.mousePressed(() => timerRunning = !timerRunning);
  pauseButton.position(720, 750);
  styleButton(pauseButton);

  //crearea bbutonului de restart
  reloadButton = createButton("Restart joc");
  reloadButton.mousePressed(() => location.reload());
  reloadButton.position(1100, 750);
  styleButton(reloadButton);


  //selector pentru timp
  timeSelect = createSelect();
  timeSelect.option('10 minute', 600);
  timeSelect.option('5 minute', 300);
  timeSelect.option('3 minute', 180);
  timeSelect.position(860, 750);
  styleButton(timeSelect);

  // Buton start joc:atunci cand este apasat: 
  startButton = createButton("Start joc");
  startButton.position(1000, 750);
  styleButton(startButton);
  startButton.mousePressed(() => {
    let selected = parseInt(timeSelect.value());
    //seteaza timpul ales
    whiteTime = selected;
    blackTime = selected;
    //elimina selectorul si butonul
    timeSelect.remove();
    startButton.remove();
    //reinitalizarea tablei
    initBoard();
    setInterval(updateTimers, 1000);
    //porneste ceasul
    timerRunning = true;
  });


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
  clear();//curata ecranul
  drawTimers();//deseneaza cronometrele
  drawBoard();//deseneaza tabla
  drawPieces();//deseneaza piesele pe tabla
  //evidentiaza mutarile valide pentru piesa selectata daca exista gameMessage
  if (selectedPiece) {
    highlightValidMoves(selectedPiece);
  }
  if (gameMessage !== "") {
    fill(0);
    textSize(24);
    textAlign(LEFT, TOP);
    text(gameMessage, 10, 10);
    noLoop(); //opreste bucla de remiza daca jocul s a incheiat
  }
}

function drawBoard() {
  //aici se calculeaza cat spatiu trebuie lasat pe margini pentru a centra tabla pe ecran
  let offsetX = (width - boardSize) / 2;
  let offsetY = (height - boardSize) / 2;

  //aici se parcurge fiecare patrat din cele 64
  for (let i = 0; i < 8; i++) {//parcurge coloanele
    for (let j = 0; j < 8; j++) {//parcurge randurile
      //calculeaza pozitia fiecarui patrat
      //tileSize este dimensiunea unui patrat, se calculeaza coordonatele unde trebuie desenat fiecare patrat; x =  stanga sus al patratului pe axa orizonatala; y = sus jos al patratului pe axa verticala
      let x = offsetX + i * tileSize;
      let y = offsetY + j * tileSize;

      //deseneaza culoarea patratului
      //alterneaza culorile intre alb si negru: daca suma lui i+j e para atunci patratul e deschis si daca este impara atunci patratul este inchis
      fill((i + j) % 2 === 0 ? 240 : 100);
      noStroke();//inseamna fara contur
      rect(x, y, tileSize, tileSize);//deseneaza patatul la pozitia calculata, cu dimensiunea tileSize

      //verifica daca exista un patrat selectat, daca da, si daca acest patrat are coordonatele i,j, inseamna ca a fost selectat, deseneaza un patrat galben
      if (selectedTile && selectedTile.i === i && selectedTile.j === j) {
        fill(255, 255, 0, 100);
        rect(x, y, tileSize, tileSize);
      }
    }
  }
}

function drawPieces() {
  //calculeaza cat de departe de margine trebuie inceput desenul pentru a centra tabla
  let offsetX = (width - boardSize) / 2;
  let offsetY = (height - boardSize) / 2;
  textAlign(CENTER, CENTER);
  textSize(tileSize * 0.6);//dimensiunea textului

  //parcurge fiecare rand si piesa de pe tabla
  //fiecare 'piece' poate fi: un obiect cu informatii despre piesa;  null, daca patratul este gol
  for (let row of board) {
    for (let piece of row) {
      //daca exista o piesa, o deseneaza
      if (piece) {
        fill(piece.color === 'white' ? 'wheat' : 'black');//seteaza culoarea textului; alb daca e piesa alba
        text(piece.symbol, offsetX + piece.x * tileSize + tileSize / 2, offsetY + piece.y * tileSize + tileSize / 2);//deseneaza simbolul piesei in mijlocul patratului
      }
    }
  }
}

function mousePressed() {
  //calculeaza offset-ul pentru centrare, calculeaza cat trebuie mutata tabla pentru a fi centrata pe ecran
  let offsetX = (width - boardSize) / 2;
  let offsetY = (height - boardSize) / 2;

  //transforma pozitia mouse-ului in coordonate pe tabla
  //acestea sunt coordonatele clicck-ului pe ecran, se scade offset-ul ca sa obtinem pozitia 'relativa pe tabla, se imparte la tileSize ca sa stim in ce patrat s-a facut click-ul
  let x = floor((mouseX - offsetX) / tileSize);//floor rotunjeste in jos cel mai apropiat intreg - obtinem pozitia pe tabla
  let y = floor((mouseY - offsetY) / tileSize);
  if (x < 0 || x > 7 || y < 0 || y > 7) return;//daca ai facut un click in afara tablei, iesi din functie

  const piece = board[y][x];//aceasta ia piesa de pe pozitia (x,y) de pe tabla

  //verifica daca exista deja o piesa selectata si faci click de pe un alt patrat incearca sa o muti acolo cu functia tryMoveSelectedPieceTo()
  if (selectedPiece) {
    tryMoveSelectedPieceTo(x, y);
    //altfel, daca nu este o piesa selectata si ai facut click pe o piesa si culoarea corespunde cu jucatorul curent atunci selecteaza acea piesa
  } else if (piece && piece.color === currentPlayer) {
    selectedPiece = piece;
  }

  //salveaza patratul selectat
  selectedTile = { i: x, j: y };
}

function tryMoveSelectedPieceTo(x, y) {//aceasta functie implementeaza mutarile pieselor si reguli din sah
  //verifica daca mutarea este legala
  //severifica daca piesa poate sa se mute colo conform regulilor ei (canMive) si daca mutarea respecta si regulile de sah
  //daca nu e valida, se deselecteaza piesa si se iese din functie
  if (!selectedPiece.canMove(x, y, board) || !isLegalMove(selectedPiece, x, y)) {
    selectedPiece = null;
    return;
  }

  // salveaza pozitia initiala(pentru rocada)
  let prevX = selectedPiece.x;
  let prevY = selectedPiece.y;

  // verifica daca se face o rocada
  //daca piesa este un Rege si s-a deplasat cu exact 2 patratele, atunci este o mutare speciala: rocada
  //seapeleaza functia performCastling() pentru a muta regele si tura simultan
  if (selectedPiece instanceof King && Math.abs(x - selectedPiece.x) === 2) {
    performCastling(selectedPiece, x, y);
  } else {//atunci se face o mutare normala
    // captura en passant
    //daca piesa este pion, si a fost setata o tinta en passant si jucatorul muta pionl pe acea tinta se elimina pionul advers
    if (selectedPiece instanceof Pawn && enPassantTarget && x === enPassantTarget.x && y === enPassantTarget.y) {
      let dir = selectedPiece.color === 'white' ? 1 : -1; // Capture behind
      board[y + dir][x] = null;
    }

    // mutarea piesei pe tabla
    board[selectedPiece.y][selectedPiece.x] = null;//sterge piesa din pozitia veche
    board[y][x] = selectedPiece;//o muta in noua pozitie pe tabla
    //actualizeaza coordonatele interne ale piesei
    selectedPiece.x = x;
    selectedPiece.y = y;

    // seteaza tinta 'en passant' daca pionul a avansat 2 patratele
    //daca pionul a facut o mutare de 2 patratele de pe randul initial, seteaza enpassanttarget, altfel anuleaza orice tinta en passant activa
    if (selectedPiece instanceof Pawn && Math.abs(y - prevY) === 2) {
      enPassantTarget = { x, y: (prevY + y) / 2 };
    } else {
      enPassantTarget = null;
    }

    // actualizeaza drepturile de rocada
    //daca regele sau o tura s-a miscat, rocada pe aceas parte nu mai e permisa
    updateCastlingRights(selectedPiece, prevX, prevY);
  }

  // promovarea pionului
  //daca un pion ajunge pe ultima linie  este promovat automat in regina
  if (selectedPiece instanceof Pawn) {
    if ((selectedPiece.color === "white" && y === 0) || (selectedPiece.color === "black" && y === 7)) {
      board[y][x] = new Queen(x, y, selectedPiece.color);
    }
  }

  //finalizare mutare
  selectedPiece = null;//deselecteaza piesa dupa mutare
  currentPlayer = currentPlayer === 'white' ? 'black' : 'white';//schimba jucatorul curent

  //verifica daca jocul s-a terminat
  checkGameStatus();
}

function performCastling(king, newX, newY) {
  //mutarea regelui
  let y = king.y;//se retine linia regelui in variabila y
  board[y][king.x] = null;//se sterge regele de pe pozitia initiala
  board[y][newX] = king;//se plaseaza regele la noua coloana interna a regelui
  //se actualizeaza pozitia interna a regelui
  king.x = newX;
  king.y = y;

  //rocada pe partea regelui
  //daca regele a ajuns in coloana 6
  if (newX === 6) {
    let rook = board[y][7];//se ia tura la coltul dreapta(coloana 7)
    //se muta la coloana 5, langa rege
    board[y][7] = null;
    board[y][5] = rook;
    //se actualizeaza pozitia turei
    rook.x = 5;
    rook.y = y;
  }
  //rocada pe partea reginei
  else if (newX === 2) { //daca regele a ajuns la coloana 2
    let rook = board[y][0];//se ia tura din coltul stanga
    //se muta la coloana 3
    board[y][0] = null;
    board[y][3] = rook;
    //se actualizeaza pozitia turei
    rook.x = 3;
    rook.y = y;
  }

  //dezactivarea drepturilor de rocada
  //odata ce regele s-a mutat, nu mai poate roca deloc in viitor
  if (king.color === 'white') {
    whiteCanCastleKingSide = false;
    whiteCanCastleQueenSide = false;
  } else {
    blackCanCastleKingSide = false;
    blackCanCastleQueenSide = false;
  }
}

function updateCastlingRights(piece, prevX, prevY) {
  // actualizeaza drepturile de rocada in functie de ce piesa s-a mutat si de unde s-a mutat
  if (piece instanceof King) {//verifica daca piesa mutata este regele. cand rgele se muta, pierzi definitiv dreptul de rocada, atata pe parte regelui cat si pe parte reginei
    if (piece.color === 'white') {
      whiteCanCastleKingSide = false;
      whiteCanCastleQueenSide = false;
    } else {
      blackCanCastleKingSide = false;
      blackCanCastleQueenSide = false;
    }
  }
  //daca piesa este tura, atunci verificam din ce colt a plecat tura
  if (piece instanceof Rook) {
    if (piece.color === 'white') {
      if (prevX === 0 && prevY === 7) whiteCanCastleQueenSide = false;//(0,7) tura alba de pe partea stanga - quuen side
      if (prevX === 7 && prevY === 7) whiteCanCastleKingSide = false;//(7,7) tura alba de pe partea dreapta - king side
    } else {
      if (prevX === 0 && prevY === 0) blackCanCastleQueenSide = false;//(0,0) tura neagra de pa partea stanga - quuen side
      if (prevX === 7 && prevY === 0) blackCanCastleKingSide = false;//(7,0) tura neagra de pe partea dreapta - king side
    }
  }
}

function highlightValidMoves(piece) {
  //calculare offset pentru centrare
  //width si height sunt dimensiunile ferestrei
  //boardSize este dimensiunea totala a tablei
  let offsetX = (width - boardSize) / 2;//distanta de la margine pana unde incepe tabla pe axa x
  let offsetY = (height - boardSize) / 2;//istanta de la margine pana unde incepe tabla pe axa y

  //evidenierea mutarilor legale
  //parcurge toate patratele 8x8
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      if (piece.canMove(x, y, board) && isLegalMove(piece, x, y)) {//daca piesa are voie sa ajunga acolo dupa regulile ei de baza, daca mutarea nu lasa regele in sah
        fill(0, 255, 0, 100);//verde transparent
        rect(offsetX + x * tileSize, offsetY + y * tileSize, tileSize, tileSize);
      }
    }
  }

  //evidentiere pozitie curenta a piesei
  fill(255, 215, 0, 100);//coloreaza piesa selectata in galben auriu
  rect(offsetX + piece.x * tileSize, offsetY + piece.y * tileSize, tileSize, tileSize);
}

//aceasta va fi apelata pentru a desena timerele
function drawTimers() {
  fill("white");
  textSize(20);
  textAlign(CENTER);
  text("Player 2:  " + formatTime(blackTime), width / 2, height / 2 - boardSize / 2 - 40);//afiseaza timpul ramas pentru player2, X:width - centru orizontal; Y: height / 2 - boardSize / 2 - 40 - deasupra tablei
  text("Player 1:  " + formatTime(whiteTime), width / 2, height / 2 + boardSize / 2 + 20);//afiseaza timpul ramas pentru player1, pozitionat sub tabla de sah
}

//aceasta functie primeste un parametru seconds
function formatTime(seconds) {
  let m = floor(seconds / 60);//calculam numarul de minute din timpul total
  let s = seconds % 60;//calculam secundele ramase dupa ce am scos minutele
  return nf(m, 2) + ":" + nf(s, 2);//converteste 'val' intr-un string cu 2 cifre
}

function updateTimers() {
  if (!timerRunning || gameMessage !== "") return;//verifica daaca ceasul trebuie actualizat; !timerRunning: daca imerul nu ruleaza, nu face nimic; gameMessage !=="": daca jocul s-a terminat deja(mat, remiza, etc), nu mai are rost sa actualizeze timpul; daca una dintre aceste conditii e adevarata, functia se opreste cu return

  if (currentPlayer === 'white') {//verifica daca este randul albului
    whiteTime--;//scade o secunda din timpul jucatorului
    //verifica daca timpul a expirat: daca timpul albului a ajuns la 0 sau mai putin: seteaza mesajul ca negrul a castigat
    if (whiteTime <= 0) {
      gameMessage = "Timpul albilor a expirat. Negrul câștigă!";
      noLoop();//opreste complet actualizarea jocului in draw()
    }
    //Dacă nu e rândul albului, e rândul negrului
  } else {
    blackTime--;//Scade o secundă din timpul jucătorului negru.
    // Verifică dacă timpul negrului a expirat
    if (blackTime <= 0) {//Dacă timpul negrului a ajuns la 0 sau mai puțin
      gameMessage = "Timpul negrului a expirat. Albul câștigă!";
      noLoop();//opreste jocul
    }
  }
}

function isLegalMove(piece, x, y) {
  let backupBoard = board.map(row => row.slice());//creaza o copie a tablei de joc board, pentru a putea reseta starea dupa testare
  //seteaza pozitia initiala a piesei
  let startX = piece.x;
  let startY = piece.y;

  let captured = board[y][x];//salveaza piesa,daca exista, de la pozitia tinta(x,y) - poate fi capturata temporar in test
  board[startY][startX] = null;//muta piesa pe noua pozitie, temporar
  board[y][x] = piece;//goleste pozitia veche
  piece.x = x;//pune piesa in pozitia noua
  piece.y = y;//actualizeaza coordonatele piesei

  //verifica daca regele propriu e in sah
  let inCheck = isInCheck(piece.color);//Apelează funcția isInCheck(color) ca să vadă dacă mutarea duce la șah asupra propriului rege.

  //restabileste tabla la starea initiala
  //restaurează tabla la forma de dinainte de test
  //revine piesa la pozitia ei originala
  board = backupBoard;
  piece.x = startX;
  piece.y = startY;

  return !inCheck;//returneaza rezultatul
}

function isInCheck(color) {
  let kingPos = findKing(color);
  if (!kingPos) return false;//daca regele nu a fost gasit, presupune ca nu e in sah
  //parcurge toate piesele de pe tabla
  for (let row of board) {
    for (let p of row) {
      if (p && p.color !== color && p.canMove(kingPos.x, kingPos.y, board)) {
        return true;
      }
    }
  }
  return false;//daca niciuna dintre piesele adverse nu poate ajunge la rege, inseamna ca nu e sah
}

function findKing(color) {
  //parcurge fiecare celula a tablei de sah, tabloul board este o matrice 8x8 unde board[y][x] conține o piesă sau null
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      let p = board[y][x];//se extrage piesa de la coordonatele(x,y)
      if (p instanceof King && p.color === color) {//daca piesa este un King(instanceof este un operator care verifica daca un obiect este creat dintr-o anumita clasa sau constructor)
        return { x, y };
      }
    }
  }
  return null;
}

function checkGameStatus() {
  let hasLegalMove = false;

  for (let row of board) {
    for (let piece of row) {
      if (piece && piece.color === currentPlayer) {
        for (let y = 0; y < 8; y++) {
          for (let x = 0; x < 8; x++) {
            if (piece.canMove(x, y, board) && isLegalMove(piece, x, y)) {
              hasLegalMove = true;
              break;
            }
          }
          if (hasLegalMove) break;
        }
      }
      if (hasLegalMove) break;
    }
    if (hasLegalMove) break;
  }

  if (!hasLegalMove) {
    if (isInCheck(currentPlayer)) {
      gameMessage = `Șah mat! ${currentPlayer === 'white' ? 'Negrul' : 'Albul'} câștigă!`;
    } else {
      gameMessage = "Remiză! Nicio mutare legală disponibilă.";
    }
    noLoop();
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

      // capturarea en passant
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

    //miscare diagonala ca si un bishop
    if (dx === dy) {
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


    if (x === this.x || y === this.y) {
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
  return false;
}
