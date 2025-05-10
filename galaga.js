let player;
let playerImg;

function preload() {
  playerImg = loadImage('nave.png'); // Sprite de jugador -- nave
}

function setup() {
  createCanvas(600, 600);
  player = new Player();
}

function draw() {
  background(0); //negro
  player.update();
  player.show();
}

class Player { //propiedades del player
  constructor() {
    this.width = 40;
    this.height = 40;
    this.x = width / 2 - this.width / 2;
    this.y = height - this.height - 10;
    this.speed = 5;
  }

  update() { //movimiento
    if (keyIsDown(LEFT_ARROW)) {
      this.x -= this.speed;
    }
    if (keyIsDown(RIGHT_ARROW)) {
      this.x += this.speed;
    }

    this.x = constrain(this.x, 0, width - this.width);
  }

  show() {
    image(playerImg, this.x, this.y, this.width, this.height);
  }
}
