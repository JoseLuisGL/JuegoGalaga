let player;
let playerImg;
let enemyImg;
let enemyStrongImg;
let bossgImg;

/// MUSICAA ///
let bossMusic;
let normalMusic;
let currentMusic = null;
let shootSound;
let enemySound;

let bullets = []; // Lista de balas
let enemies = []; // Lista de enemigos
let enemyBullets = []; // Lista de balas de enemigos

let gameOver = false;
let points = 0;
let pointsTextSize = 20;
let pointsColor; 

// --- NUEVAS VARIABLES PARA NIVELES ---
let level = 1;
let maxLevel = 3;
let levelTransition = false;
let transitionTimer = 0;
let win = false;

function preload() {
  playerImg = loadImage('nave.png');     // Sprite del jugador -- nave
  enemyImg = loadImage('enemy.png');   // Sprite del enemigo
  enemyStrongImg = loadImage('enemy_strong.png'); // Sprite del enemigo resistente
  bossgImg = loadImage('boss.png'); // Sprite del boss

  bossMusic = loadSound('boss_music.mp3');
  normalMusic = loadSound('galaga_music.mp3');
  shootSound = loadSound('shoot_sound.wav');
  enemySound = loadSound('enemy_sound.wav');
}

function setup() {
  createCanvas(600, 600);
  player = new Player();
  pointsColor = color(255, 255, 0); 

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

  // Mostrar vidas, nivel y puntuación
  fill(255);
  textSize(20);
  text("Vidas: " + player.lives, 50, 30);
  text("Nivel: " + level, width/2 - 30, 30);
  
  // Mostrar puntuación (derecha superior)
  fill(pointsColor);
  textSize(pointsTextSize);
  text("Puntos: " + points, width - 150, 30);

  // mostrar y actu bala
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].update();
    bullets[i].show();

    // Si bala sale
    if (bullets[i].offscreen()) {
      bullets.splice(i, 1);
    }
  }

  // mostrar y actu balas enemigas
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    enemyBullets[i].update();
    enemyBullets[i].show();

    // Si bala sale
    if (enemyBullets[i].offscreen()) {
      enemyBullets.splice(i, 1);
    } else if (enemyBullets[i].hitsPlayer(player)) {
      // Colisión con jugador
      player.lives--;
      enemyBullets.splice(i, 1);
      
      if (player.lives <= 0) {
        gameOver = true;
      }
    }
  }

  // mostrar y actu enemigos
  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].update();
    enemies[i].show();
    
    // Disparar proyectiles (según configuración de nivel)
    if (enemies[i].canShoot && frameCount % enemies[i].shootInterval === 0 && random() < 0.03) {
      enemyBullets.push(new EnemyBullet(enemies[i].x + enemies[i].size/2, enemies[i].y + enemies[i].size, player));
    }

    // colision bala-enemigo
    for (let j = bullets.length - 1; j >= 0; j--) {
      if (enemies[i].hitsBullet(bullets[j])) {
        // Reducir vida del enemigo o eliminarlo
        enemySound.setVolume(0.5);
        enemySound.play();
        points += 1;

        if (enemies[i].isStrong) {
          enemies[i].hitsTaken++;
          bullets.splice(j, 1);
          if (enemies[i].hitsTaken >= 3) {
            enemies.splice(i, 1);
            points += 3;
          }
        } 
        else if (enemies[i].isBoss) {
          enemies[i].hitsTaken++;
          bullets.splice(j, 1);
          if (enemies[i].hitsTaken >= enemies[i].maxHits) {
            enemies.splice(i, 1);
            points += 10;
          }
        } 
        else {
          enemies.splice(i, 1);
          bullets.splice(j, 1);
        }
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
    shootSound.setVolume(0.2);
    shootSound.play();
  }
  if (gameOver && keyCode === ENTER) {
    restartGame();
  }
  if (win && keyCode === ENTER) {
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

class EnemyBullet {
  constructor(x, y, target) {
    this.x = x;
    this.y = y;
    this.speed = 3;
    this.radius = 5;
    this.target = target;
    // Calcular dirección hacia el jugador
    let dx = target.x + target.width/2 - x;
    let dy = target.y - y;
    let distance = sqrt(dx*dx + dy*dy);
    this.vx = (dx/distance) * this.speed;
    this.vy = (dy/distance) * this.speed;
    
    // Aumentar velocidad en nivel 3
    if (level === 3) {
      this.vx *= 1.5;
      this.vy *= 1.5;
    }
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
  }

  show() {
    fill(255, 0, 0); // Balas enemigas rojas
    noStroke();
    ellipse(this.x, this.y, this.radius * 2);
  }

  offscreen() {
    return this.y > height || this.x < 0 || this.x > width;
  }
  
  hitsPlayer(player) {
    return (
      this.x > player.x &&
      this.x < player.x + player.width &&
      this.y > player.y &&
      this.y < player.y + player.height
    );
  }
}

class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 40;
    this.speed = 1;
    this.direction = random() > 0.5 ? 1 : -1; // Dirección inicial del zigzag
    this.zigzagSpeed = 2; // Velocidad horizontal del zigzag
    this.canShoot = false; // Por defecto no dispara
    this.isStrong = false; // Por defecto no es resistente
    this.isBoss = false; // Por defecto no es jefe
    this.hitsTaken = 0; // Contador de golpes recibidos
    this.shootInterval = 60; // Frecuencia de disparo
  }

  update() {
    // Movimiento diferente según el nivel
    if (level === 2) {
      // Movimiento en zigzag en nivel 2
      this.y += this.speed;
      this.x += this.direction * this.zigzagSpeed;
      
      // Cambiar dirección al llegar a los bordes
      if (this.x <= 0 || this.x + this.size >= width) {
        this.direction *= -1;
      }
    } 
    else if (level === 3) {
      // Movimiento más complejo en nivel 3
      this.y += this.speed * 1.5; // Mayor velocidad vertical
      this.x += sin(frameCount * 0.05 + this.y * 0.01) * this.zigzagSpeed * 1.5;
      
      // Cambiar dirección al llegar a los bordes
      if (this.x <= 0 || this.x + this.size >= width) {
        this.direction *= -1;
      }
    } 
    else {
      // Movimiento recto en nivel 1
      this.y += this.speed;
    }
  }

  show() {
    if (this.isStrong) {
      image(enemyStrongImg, this.x, this.y, this.size, this.size);
    } else if (this.isBoss) {
      image(bossgImg, this.x, this.y, this.size, this.size);
      // Barra de vida
      fill(255);
      rect(this.x, this.y - 10, this.size, 5);
      fill(0, 255, 0);
      rect(this.x, this.y - 10, this.size * (1 - this.hitsTaken/7), 5);
    } else {
      image(enemyImg, this.x, this.y, this.size, this.size);
    }
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
    this.direction = random() > 0.5 ? 1 : -1;
  }
}

class BossEnemy extends Enemy {
  constructor(x, y) {
    super(x, y);
    this.size = 60; // Más grande que un enemigo normal
    this.speed = 2; // Más rápido
    this.isBoss = true;
    this.hitsTaken = 0;
    this.maxHits = 7; // Requiere 7 golpes
    this.canShoot = true;
    this.shootInterval = 30; // Dispara más rápido
  }

  update() {
    // Movimiento más complejo para el jefe
    this.y += this.speed * 0.7;
    this.x += sin(frameCount * 0.05) * this.speed * 3;
    
    // Disparar más frecuentemente
    if (frameCount % this.shootInterval === 0) {
      enemyBullets.push(new EnemyBullet(this.x + this.size/2, this.y + this.size, player));
    }
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
  enemyBullets = [];

  // Detener la música del jefe si estaba sonando
  if (bossMusic) {
    bossMusic.stop();
  }
  
  // Reproducir música normal
  if (normalMusic) {
    normalMusic.loop();
    currentMusic = normalMusic;
  }

  points = 0;
  player = new Player();
  startLevel(level);
  loop();
}

// -- INICIAR UN NIVEL NUEVO --
function startLevel(n) {
  bullets = [];
  enemies = [];
  enemyBullets = [];

  if (currentMusic) {
    currentMusic.stop();
  }

  if (n === 3) {
    // Configuración especial para nivel 3
    let enemyCount = 15; // Cantidad fija para el nivel 3
   
    // Reproducir música de jefe
    bossMusic.loop();
    currentMusic = bossMusic;
    bossMusic.setVolume(0.7); // Ajustar volumen si es necesario
    
    // Crear grupos de enemigos
    for (let i = 0; i < enemyCount; i++) {
      let x, y;
      
      // Crear en grupos de 3
      if (i % 3 === 0) {
        x = random(0.2 * width, 0.4 * width);
      } else if (i % 3 === 1) {
        x = random(0.4 * width, 0.6 * width);
      } else {
        x = random(0.6 * width, 0.8 * width);
      }
      
      y = random(-800, -100);
      
      let enemy = new Enemy(x, y);
      enemy.speed = 1.5; // Mayor velocidad
      enemy.canShoot = true; // Todos disparan
      enemy.zigzagSpeed = 3; // Movimiento más marcado
      enemy.shootInterval = 45; // Disparan más rápido
      
      // Hacer 2 enemigos resistentes (posiciones 5 y 10)
      if (i === 5 || i === 10) {
        enemy.isStrong = true;
      }
      
      enemies.push(enemy);
    }
    
    // Añadir jefe final
    enemies.push(new BossEnemy(width/2 - 30, -100));
    return;
  }else {
    // Reproducir música normal para otros niveles
    if (normalMusic) {
      normalMusic.loop();
      currentMusic = normalMusic;
      normalMusic.setVolume(0.5);
    }
  }

  // Configuración para niveles 1 y 2
  let enemyCount = 10 + (n - 1) * 5; // 10, 15 enemigos por nivel
  let strongEnemyCreated = false;

  for (let i = 0; i < enemyCount; i++) {
    let x = random(0, width - 40);
    let y = random(-500, -40);
    let enemy = new Enemy(x, y);
    
    if (n === 2) {
      // Algunos enemigos disparan (20% de chance)
      if (random() < 0.3) {
        enemy.canShoot = true;
      }
      
      // Crear 1 enemigo resistente
      if (!strongEnemyCreated && i === Math.floor(enemyCount/2)) {
        enemy.isStrong = true;
        strongEnemyCreated = true;
      }
    }
    
    enemies.push(enemy);
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

  textSize(28);
  text("Puntuación final: " + points, width / 2, height / 2 + 60);

   // Detener toda la música al ganar
  if (bossMusic) bossMusic.stop();
  if (normalMusic) normalMusic.stop();
}