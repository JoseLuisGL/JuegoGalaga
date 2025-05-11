let player;
let playerImg;
let bullets = []; // Lista de balas

function preload() {
  playerImg = loadImage('nave.png'); // Sprite de jugador -- nave
}

function setup() {
  createCanvas(600, 600);
  player = new Player();
}

function draw() {
  background(0); // negro

  player.update();
  player.show();

  // mostrar y actu bala
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].update();
    bullets[i].show();

    // Si bala sale
    if (bullets[i].offscreen()) {
      bullets.splice(i, 1);
    }
  }
}

function keyPressed() {
  if (key === ' ') { // boton bala
    // Crear bala bien desde la punta de la nave
    bullets.push(new Bullet(player.x + player.width / 2, player.y));
  }
}

class Player {
  constructor() {
    this.width = 40;
    this.height = 40;
    this.x = width / 2 - this.width / 2;
    this.y = height - this.height - 10;
    this.speed = 5;
  }

  update() {
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

class Bullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 2;
    this.radius = 5;
  }

  update() {
    this.y -= this.speed;
  }

  show() {
    fill(255);
    noStroke();
    ellipse(this.x, this.y, this.radius * 2);
  }

  offscreen() {
    return this.y < 0;
  }
}
