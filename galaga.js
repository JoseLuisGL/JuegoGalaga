let player;
let playerImg;
let enemyImg;

let bullets = []; // Lista de balas
let enemies = []; // Lista de enemigos

let gameOver = false;

function preload() {
  playerImg = loadImage('nave.png');     // Sprite del jugador
  enemyImg = loadImage('enemy.png');   // Sprite del enemigo
}

function setup() {
  createCanvas(600, 600);
  player = new Player();

  // Crear 10 enemigos
  for (let i = 0; i < 10; i++) {
    let x = random(0, width - 40);
    let y = random(-500, -40);
    enemies.push(new Enemy(x, y));
  }
}

function draw() {
  background(0);

  if (gameOver) {
    textAlign(CENTER, CENTER);
    fill(255, 0, 0);
    textSize(32);
    text("Game Over", width / 2, height / 2);
    noLoop();
    return;
  }

  player.update();
  player.show();

  // Mostrar vidas
  fill(255);
  textSize(16);
  text("Vidas: " + player.lives, 50, 30);

  // Actualizar y mostrar balas
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].update();
    bullets[i].show();

    // Si bala sale
    if (bullets[i].offscreen()) {
      bullets.splice(i, 1);
    }
  }

  // Actualizar y mostrar enemigos
  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].update();
    enemies[i].show();

    // Colisión con balas
    for (let j = bullets.length - 1; j >= 0; j--) {
      if (enemies[i].hitsBullet(bullets[j])) {
        enemies.splice(i, 1); // Eliminar enemigo
        bullets.splice(j, 1); // Eliminar bala
        break; // Salir del loop de balas para evitar errores
      }
    }

    // Importante: verificar que aún existe después de colisión
    if (i < enemies.length) {
      if (enemies[i].hitsPlayer(player)) {
        player.lives--;
        enemies[i].reset();

        if (player.lives <= 0) {
          gameOver = true;
        }
      }

      if (enemies[i].y + enemies[i].size >= height) {
        player.lives--;
        enemies[i].reset();

        if (player.lives <= 0) {
          gameOver = true;
        }
      }
    }
  }
}

function keyPressed() {
  if (key === ' ') {
    bullets.push(new Bullet(player.x + player.width / 2, player.y));
  }

  if (gameOver && keyCode === ENTER) {
    restartGame();
  }
}

// ------------------ CLASES ------------------

class Player {
  constructor() {
    this.width = 40;
    this.height = 40;
    this.x = width / 2 - this.width / 2;
    this.y = height - this.height - 10;
    this.speed = 5;
    this.lives = 3;
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
    this.speed = 5;
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

class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 40;
    this.speed = 1;
  }

  update() {
    this.y += this.speed;
  }

  show() {
    image(enemyImg, this.x, this.y, this.size, this.size);
  }

  hitsPlayer(player) {
    return (
      this.x < player.x + player.width &&
      this.x + this.size > player.x &&
      this.y < player.y + player.height &&
      this.y + this.size > player.y
    );
  }

  hitsBullet(bullet) {
    return (
      this.x < bullet.x + bullet.radius &&
      this.x + this.size > bullet.x - bullet.radius &&
      this.y < bullet.y + bullet.radius &&
      this.y + this.size > bullet.y - bullet.radius
    );
  }

  reset() {
    this.y = random(-100, -40);
    this.x = random(0, width - this.size);
  }
}

// -- REINICIAR JUEGO SI MORISTE --
function restartGame() {

  // Reiniciar variables
  gameOver = false;
  bullets = [];
  enemies = [];

  player = new Player();

  for (let i = 0; i < 10; i++) {
    let x = random(0, width - 40);
    let y = random(-500, -40);
    enemies.push(new Enemy(x, y));
  }

  loop();
}
