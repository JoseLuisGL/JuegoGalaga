let player;
let playerImg;
let enemyImg;

let bullets = []; //Lista de balas
let enemies = []; //Lista de enemigos

let gameOver = false;

// --- NUEVAS VARIABLES PARA NIVELES ---
let level = 1;
let maxLevel = 3;
let levelTransition = false;
let transitionTimer = 0;
let win = false;

function preload() {
  playerImg = loadImage('nave.png');     // Sprite del jugador -- nave
  enemyImg = loadImage('enemy.png');   // Sprite del enemigo
}

function setup() {
  createCanvas(600, 600);
  player = new Player();

  // Crear enemigos del primer nivel
  startLevel(level);
}

function draw() {
  // Mensaje de victoria
  if (win) {
    showWinMessage();
    return;
  }

  // Transición entre niveles
  if (levelTransition) {
    drawTransition();
    return;
  }

  background(0); // negro

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

  // Mostrar vidas y nivel
  fill(255);
  textSize(16);
  text("Vidas: " + player.lives, 50, 30);
  text("Nivel: " + level, 520, 30);

  // mostrar y actu bala
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].update();
    bullets[i].show();

    // Si bala sale
    if (bullets[i].offscreen()) {
      bullets.splice(i, 1);
    }
  }

  // mostrar y actu enemigos
  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].update();
    enemies[i].show();

    // colision bala-enemigo
    for (let j = bullets.length - 1; j >= 0; j--) {
      if (enemies[i].hitsBullet(bullets[j])) {
        enemies.splice(i, 1); // eliminar enemigo
        bullets.splice(j, 1); // eliminar bala
        break;
      }
    }

    // chequeo para evitar errores después de eliminar
    if (i < enemies.length) {
      // colision jugador-enemigo
      if (enemies[i].hitsPlayer(player)) {
        player.lives--;
        enemies[i].reset();

        if (player.lives <= 0) {
          gameOver = true;
        }
      }

      // si enemigo llega al final de la pantalla
      if (enemies[i].y + enemies[i].size >= height) {
        player.lives--;
        enemies[i].reset();

        if (player.lives <= 0) {
          gameOver = true;
        }
      }
    }
  }

  // --- CAMBIO DE NIVEL SI TODOS LOS ENEMIGOS FUERON ELIMINADOS ---
  if (enemies.length === 0 && !levelTransition && !gameOver) {
    if (level < maxLevel) {
      level++;
      levelTransition = true;
      transitionTimer = millis();
    } else {
      win = true;
    }
  }
}

function keyPressed() {
  if (key === ' ') {// boton bala
    // Crear bala bien desde la punta de la nave
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
  win = false;
  level = 1;
  bullets = [];
  enemies = [];

  player = new Player();
  startLevel(level);
  loop();
}

// -- INICIAR UN NIVEL NUEVO --
function startLevel(n) {
  bullets = [];
  enemies = [];

  let enemyCount = 10 + (n - 1) * 5; // 10, 15, 20 enemigos por nivel

  for (let i = 0; i < enemyCount; i++) {
    let x = random(0, width - 40);
    let y = random(-500, -40);
    enemies.push(new Enemy(x, y));
  }
}

// -- MOSTRAR TRANSICIÓN DE NIVEL --
function drawTransition() {
  let elapsed = millis() - transitionTimer;
  background(0);
  fill(255);
  textSize(32);
  textAlign(CENTER, CENTER);
  text("Nivel " + level, width / 2, height / 2);

  if (elapsed > 1500) {
    startLevel(level);
    levelTransition = false;
  }
}

// -- MOSTRAR MENSAJE DE VICTORIA --
function showWinMessage() {
  background(0, 150, 0);
  fill(255);
  textSize(32);
  textAlign(CENTER, CENTER);
  text("¡Ganaste el juego!", width / 2, height / 2);
}
