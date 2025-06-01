let timer;
let timerInterval;
let timerRunning = false;
let button;

function setup() {
    createCanvas(400, 400);
    timer = 0;
    button = createButton('Start/Stop Timer');
    button.position(10, 420);
    button.mousePressed(toggleTimer);
}

function draw() {
    background(220);
    textSize(32);
    textAlign(CENTER, CENTER);
    text('Timer: ' + timer, width / 2, height / 2);
}

function toggleTimer() {
    if (timerRunning) {
        stopTimer();
    } else {
        startTimer();
    }
    timerRunning = !timerRunning;
}

function startTimer() {
    timerInterval = setInterval(() => {
        timer++;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}
