// Define global variables
const playerSpeed = 4;
const gameWidth = 800;
const gameHeight = 600;
const enemySpeed = 1;

// collision buffers
const cxBuffer = 30;
const cyBuffer = 15;

// Define a score variable at the top of your file
let score = 0;

// Alive variable
let alive = true;

// Set up the game engine
const game = new Phaser.Game({
  width: gameWidth,
  height: gameHeight,
  type: Phaser.AUTO,
  scene: {
    preload: preload,
    create: create,
    update: update
  }
});

// Load game assets
function preload() {
  this.load.spritesheet('player', 'assets/player.png', {
    frameWidth: 47,
    frameHeight: 62.5
  });
  this.load.spritesheet('tiles', 'assets/tiles.png', {
    frameWidth: 32,
    frameHeight: 32
  });
  this.load.spritesheet('enemy', 'assets/enemy.png', {
    frameWidth: 36,
    frameHeight: 35
  });
  this.load.image('cookie', 'assets/cookie.png');
  this.load.audio('music', 'assets/Frost-Waltz.mp3');
}

// Create a function to spawn enemies
function spawnEnemy() {
  // Generate random coordinates for the enemy sprite
  const x = Phaser.Math.Between(0, gameWidth);
  const y = Phaser.Math.Between(0, gameHeight);

  // Create the enemy sprite and add it to the enemies group
  const enemy = enemies.create(x, y, 'enemy');

  // Add an update function to the enemy sprite
  enemy.update = function() {
    // Move the enemy sprite randomly
    const direction = Phaser.Math.Between(0, 3);
    if (direction === 0) {
      this.x -= enemySpeed;
    } else if (direction === 1) {
      this.x += enemySpeed;
    } else if (direction === 2) {
      this.y -= enemySpeed;
    } else if (direction === 3) {
      this.y += enemySpeed;
    }
  };
}

// Create a function to spawn cookies
function spawnCookie() {
  // Generate random coordinates for the cookie sprite
  const x = Phaser.Math.Between(0, gameWidth);
  const y = Phaser.Math.Between(0, gameHeight);

  // Create the cookie sprite and add it to the cookies group
  const cookie = cookies.create(x, y, 'cookie');
  cookie.setScale(0.5);
}

function checkCookieCollisions(x, y, width, height) {
  // Check for collisions between the player and cookies
  cookies.getChildren().forEach(function(cookie) {
    const cookieX = cookie.x;
    const cookieY = cookie.y;
    const cookieWidth = cookie.width;
    const cookieHeight = cookie.height;

    if (x + cxBuffer < cookieX + cookieWidth &&
        x + width > cookieX + cxBuffer &&
        y + cyBuffer < cookieY + cookieHeight &&
        y + height > cookieY + cyBuffer) {
      // Destroy the cookie sprite
      cookie.destroy();
      if (alive) {
        // Increase the score
        score += 1;
        // Update the score text
        scoreText.setText('Score: ' + score);
      }
    }
  });
}

function checkEnemiesCollisions(x, y, width, height) {
  // Check for collisions between the player and enemies
  enemies.getChildren().forEach(function(enemy) {
    const enemyX = enemy.x;
    const enemyY = enemy.y;
    const enemyWidth = enemy.width;
    const enemyHeight = enemy.height;

    if (x + 20 < enemyX + enemyWidth &&
        x + width > enemyX + 25 &&
        y + 10 < enemyY + enemyHeight &&
        y + height > enemyY + 25) {

      restartText.visible = true;
      alive = false;
    }
  });
}

// Create game objects
function create() {
  // Create background
  const tilesWide = Math.ceil(gameWidth / 32);
  const tilesHigh = Math.ceil(gameHeight / 32);
  const mapData = [];
  for (let y = 0; y < tilesHigh; y++) {
    const row = [];
    for (let x = 0; x < tilesWide; x++) {
      row.push(Math.floor(Math.random() * 3));
    }
    mapData.push(row);
  }

  // Create tilemap
  const map = this.make.tilemap({ data: mapData, tileWidth: 32, tileHeight: 32 });
  const tileset = map.addTilesetImage('tiles');
  const layer = map.createLayer(0, tileset, 0, 0);

  // Create player character
  this.player = this.add.sprite(100, 100, 'player');

  // Create enemies group
  enemies = this.add.group();

  // Create cookies group
  cookies = this.add.group();

  // Add animations
  this.anims.create({
    key: 'walk_up',
    frames: this.anims.generateFrameNumbers('player', { start: 0, end: 2 }),
    frameRate: 3,
    repeat: -1
  });
  this.anims.create({
    key: 'walk_right',
    frames: this.anims.generateFrameNumbers('player', { start: 3, end: 5 }),
    frameRate: 3,
    repeat: -1
  });
  this.anims.create({
    key: 'walk_down',
    frames: this.anims.generateFrameNumbers('player', { start: 6, end: 8 }),
    frameRate: 3,
    repeat: -1
  });
  this.anims.create({
    key: 'walk_left',
    frames: this.anims.generateFrameNumbers('player', { start: 9, end: 11 }),
    frameRate: 3,
    repeat: -1
  });
  this.anims.create({
    key: 'enemy_walk',
    frames: this.anims.generateFrameNumbers('enemy', { start: 0, end: 4 }),
    frameRate: 5,
    repeat: -1
  });

  // Add music
  const music = this.sound.add('music', { loop: true });
  music.play();

  // Add a score text object to the upper left of the screen
  scoreText = this.add.text(10, 10, 'Score: ' + score, { fontSize: '32px', fill: '#fff' });
  scoreText.setDepth(1);

  // Create a restart button
  restartText = this.add.text(gameWidth / 2 - 175, gameHeight / 2 - 50, 'Game Over! Restart?', { fontSize: '30px', fill: '#ffffff'});
  restartText.setDepth(1);
  restartText.setInteractive();
  restartText.on('pointerdown', () => {
    // Get the user's highscore
    const username = window.prompt('Your score was ' + score + '. Enter your name to submit your highscore!');

    // Send the highscore to the server
    fetch('https://readme-roulette.onrender.com/boom', {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: username, score: score })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log('Highscore submitted:', data);
    })
    .catch(error => {
      console.error('Error submitting highscore:', error);
    });

    // Restart the game
    this.scene.restart();
    alive = true;
    score = 0;
  });
  // Hide the restart button
  restartText.visible = false;
}

// Update game state
function update() {
  // Get the player's current position
  const { x, y } = this.player;
  const { width, height } = this.player;

  // Check if the player is outside the game window's boundaries
  if (x < 0) {
    this.player.x = 0;
  } else if (x > gameWidth) {
    this.player.x = gameWidth;
  }
  if (y < 0) {
    this.player.y = 0;
  } else if (y > gameHeight) {
    this.player.y = gameHeight;
  }

  // Spawn enemies randomly
  if (Phaser.Math.Between(0, 1000) < 10) {
    spawnEnemy();
    spawnCookie();
  }

  // Call the update function for each enemy sprite
  enemies.getChildren().forEach(function(enemy) {
    enemy.update();
  });

  // Handle player input
  const cursors = this.input.keyboard.createCursorKeys();
  if (cursors.left.isDown) {
    this.player.x -= playerSpeed;
    this.player.anims.play('walk_left', true);
  } else if (cursors.right.isDown) {
    this.player.x += playerSpeed;
    this.player.anims.play('walk_right', true);
  } else if (cursors.up.isDown) {
    this.player.y -= playerSpeed;
    this.player.anims.play('walk_up', true);
  } else if (cursors.down.isDown) {
    this.player.y += playerSpeed;
    this.player.anims.play('walk_down', true);
  } else {
    this.player.anims.stop();
  }

  // Check for collisions between the player and cookies
  checkCookieCollisions(x, y, width, height);

  // Check for collisions between the player and enemies
  checkEnemiesCollisions(x, y, width, height);

  // Update the score text
  scoreText.setText('Score: ' + score);
}
