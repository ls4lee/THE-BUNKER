// ============================================================
// Week 6 Example 2 — Free Roam Top-Down with Boss Battle
// ============================================================
// The player moves freely around a world larger than the canvas.
// A smooth-follow camera keeps the player centred.
// Enemy waves are loaded from JSON and chase the player.
// A minimap in the bottom-right corner shows the player and
// enemy positions at all times.
// A giant orange blob boss spawns when the player enters the
// boss zone at the top of the world. Defeat it to win.
// Press B to skip straight to the boss for testing.
//
// Files:
//   sketch.js           — all game logic
//   data/enemies.json   — wave trigger positions, enemy data, boss data
//   data/obstacles.json — obstacle positions in world coordinates
// ============================================================




function updateCamera() {
 let targetX = player.x - width / 2;
 let targetY = player.y - height / 2;


 targetX = constrain(targetX, 0, WORLD_W - width);
 targetY = constrain(targetY, 0, WORLD_H - height);


 camX = lerp(camX, targetX, CAM_SMOOTHING);
 camY = lerp(camY, targetY, CAM_SMOOTHING);
}


// WORLD
// The world is larger than the canvas. The camera follows
// the player so only part of the world is visible at once.
// ------------------------------------------------------------
const WORLD_W = 1600; // total world width in pixels
const WORLD_H = 2000; // total world height in pixels


// ------------------------------------------------------------
// CAMERA
// camX and camY are the world coordinates at the top-left
// of the canvas. translate(-camX, -camY) shifts everything
// so the player appears centred on screen.
// ------------------------------------------------------------
let camX = 0;
let camY = 0;
const CAM_SMOOTHING = 0.1;


// ------------------------------------------------------------
// PLAYER CONFIGURATION
// ------------------------------------------------------------
const PLAYER_SPEED = 6;
const BULLET_SPEED = 10;
const SHOOT_COOLDOWN = 12;
const INVINCIBLE_FRAMES = 90;


const OFFSET_DOWN = { x: 30, y: 0 };
const OFFSET_UP = { x: 0, y: 0 };
const OFFSET_RIGHT = { x: 0, y: 0 };




// ------------------------------------------------------------
// PLAYER
// Position is in world coordinates.
// Starts near the bottom centre of the world.
// ------------------------------------------------------------
let player = {
 x: WORLD_W / 2,
 y: WORLD_H - 200,
 r: 22,
 blobT: 0,
 direction: { x: 0, y: -1 },
 shootTimer: 0,
 health: 5,
 maxHealth: 5,
 invincible: false,
 invincibleTimer: 0,
 bounceVX: 0,
 bounceVY: 0,
};


let bgImage;
let playerSheet;
let paperImage;
let denyStampImage;
let shootSound;


let music;
let bullets = [];


const FRAME_W = 150;
const FRAME_H = 200;
const PLAYER_SCALE = 0.25;


let currentFrame = 0;
let frameTimer = 0;
let animSpeed = 8;
let playerRow = 0;


// ------------------------------------------------------------
// BULLETS and ENEMIES
// Positions are in world coordinates.
// ------------------------------------------------------------
let enemies = [];
let level = 1;
let day = 7;
let maxLevel = 3;


const STATE_HOME = "home";
const STATE_BUNKER = "bunker";
const STATE_SCAVENGE = "scavenge";
const STATE_WIN = "win";
const STATE_OVER = "over";


let gameState = STATE_HOME;




let darknessLayer;
let eyeImage;
let copImage;
let timeLeft = 60;
let timerStarted = false;


let supplies = 0;
let evidence = 0;


let suppliesNeeded = 3;
let evidenceNeeded = 1;


// ------------------------------------------------------------
// OBSTACLES
// Loaded from data/obstacles.json in preload().
// Positioned in world coordinates — drawn and collided in
// world space. Player takes damage and bounces on contact.
// ------------------------------------------------------------
let obstacleData;
let obstacles = [];


// ------------------------------------------------------------
// WAVE SYSTEM
// Each wave has a triggerY — spawns when player.y < triggerY.
// nextWave tracks which wave to check next.
// ------------------------------------------------------------
let enemyData;
let nextWave = 0;


// ------------------------------------------------------------
// BOSS
// Spawns when player enters the boss zone (player.y < bossZoneY).
// ------------------------------------------------------------
let boss = null;
let bossData = null;
const BOSS_ZONE_Y = 300; // world Y — enter this zone to trigger boss


// ------------------------------------------------------------
// BACKGROUND SHAPES
// Scattered across the world — drawn in world coordinates.
// ------------------------------------------------------------
let bgShapes = [];
let ezicImage;
let dimitriImage;
let playerHitSound;
let pickupSound;
let bunkerEntrance = {
 x: WORLD_W / 2,
 y: WORLD_H - 120,
 r: 60
};
// ------------------------------------------------------------
// MINIMAP
// Drawn in screen coordinates after pop().
// Shows a scaled-down version of the world with dots for
// the player (teal) and enemies (orange).
// ------------------------------------------------------------
const MAP_W = 120; // minimap width in pixels
const MAP_H = 120; // minimap height in pixels
const MAP_X = 660;  // screen position — bottom left
const MAP_Y_OFFSET = 16; // offset from bottom of screen


const STATE_LOSE = "lose";


// ------------------------------------------------------------
// GAME STATE
// ------------------------------------------------------------
let homeImage;
let score = 0;


let evidencePhoto;
let ringImage;
let noteImage;
let flashDriveImage;
let bunkerImage;
let bunkerEnterImage;


let wire;
let water;
let watch;
let tape;
let survivorNote;
let radio;
let notes;
let medkit;
let lighter;
let food;




// ============================================================
// preload()
// ============================================================
function preload() {
 enemyData    = loadJSON("data/enemies.json");
 obstacleData = loadJSON("data/obstacles.json");
 playerSheet = loadImage("assets/images/paperspleasecharacterspritesheet.png");
 bgImage = loadImage("assets/images/paperspleasebackground.png");


 music = loadSound("assets/sounds/papersplease.mp3");
 playerHitSound = loadSound("assets/sounds/playerhit.wav");
 shootSound = loadSound("assets/sounds/shoot.wav");
 eyeImage = loadImage("assets/images/eye.png");
 copImage = loadImage("assets/images/cop.png");
 pickupSound = loadSound("assets/sounds/pickup.mp3");


 wire = loadImage("assets/images/wire.png");
 water = loadImage("assets/images/water.png");
 watch = loadImage("assets/images/watch.png");
 tape = loadImage("assets/images/tape.png");
 survivorNote = loadImage("assets/images/survivornote.png");
 radio = loadImage("assets/images/radio.png");
 notes = loadImage("assets/images/notes.png");
 medkit = loadImage("assets/images/medki.png");
 lighter = loadImage("assets/images/lighter.png");
 food = loadImage("assets/images/food.png");
 bunkerImage = loadImage("assets/images/bunkerimg.png");
 bunkerEnterImage = loadImage("assets/images/elana losing her crap.png");
 homeImage = loadImage("assets/images/home.png");
}


// Draw player in screen coordinates (used to render on top of overlays)
// drawPlayerScreen removed — restored original rendering flow


function setup() {
 createCanvas(windowWidth, windowHeight);
 darknessLayer = createGraphics(width, height);


 music.setVolume(2.0);
 pickupSound.setVolume(2.0);
 shootSound.setVolume(2.5);
 playerHitSound.setVolume(1.0);
 bossData = enemyData.boss;


 let itemImages = [
 wire,
 water,
 watch,
 tape,
 survivorNote,
 radio,
 notes,
 medkit,
 lighter,
 food
];


// Build obstacle objects from JSON
for (let i = 0; i < obstacleData.obstacles.length; i++) {
 let o = obstacleData.obstacles[i];


 obstacles.push({
   x: o.x,
   y: o.y,
   size: o.size,
   collected: false,


   image: random(itemImages),


   // 70% real, 30% hallucination
   real: random() > 0.3,


   type: random() < 0.3 ? "evidence" : "supply"
 });
}


for (let i = 0; i < 120; i++) {
 bgShapes.push({
   x: random(WORLD_W),
   y: random(WORLD_H),
   size: random(80, 140),
   rotation: random(-30, 30),
 });
}


function windowResized() {
 resizeCanvas(windowWidth, windowHeight);
 // recreate darkness layer to match new size
 darknessLayer = createGraphics(width, height);
}


 // Start camera so player is visible
 camX = player.x - width / 2;
 camY = player.y - height / 2;


}


function draw() {


 if (gameState === STATE_HOME) {
 drawHomeScreen();
 return;
}


 // ---------- BUNKER ----------
 if (gameState === STATE_BUNKER) {
   drawBunker();
   return;
 }


 // ---------- SCAVENGE ----------
 if (gameState === STATE_SCAVENGE) {


   background(20);


   updateCamera();


   push();
   translate(-camX, -camY);


   drawBackground();


   handleInput();
   updateTimer();


   checkWaveSpawns();   // this makes cops spawn
   updateEnemies();     // this makes cops chase you


   drawObstacles();
   drawEnemies();
   drawPlayer();
   checkBunkerEntrance();


checkEnemyPlayerCollision();


   pop();
   drawFlashlight();
   // redraw player on top of the flashlight overlay so the sprite is visible
   drawPlayerScreen();
   drawMinimap();
   drawHUD();


   return;
 }


 // ---------- WIN ----------
 if (gameState === STATE_WIN) {
   drawWinScreen();
   return;
 }


 // ---------- GAME OVER ----------
 if (gameState === STATE_OVER) {
   drawGameOver();
   return;
 }
}






// ------------------------------------------------------------
// updateCamera()
// Smoothly moves the camera toward the player each frame.
// Clamps so the camera never shows outside the world.
// ------------------------------------------------------------
function drawFlashlight() {
 // Draw darkness overlay and a translucent light (white/yellow) using additive blending
 let screenX = player.x - camX;
 let screenY = player.y - camY;


 push();
 noStroke();
 // darker darkness to make the light visible
 fill(0, 200);
 rect(0, 0, width, height);


 // use additive blending to brighten the path where we draw the light
 drawingContext.save();
 drawingContext.globalCompositeOperation = 'lighter';


 // bright core around player (white-yellow)
 fill(255, 245, 200, 200);
 ellipse(screenX, screenY, 120, 120);


 // softer cone ahead of player
 let dx = player.direction.x;
 let dy = player.direction.y;
 fill(255, 230, 150, 120);
 triangle(
   screenX,
   screenY,
   screenX + dx * 360 + dy * 100,
   screenY + dy * 360 - dx * 100,
   screenX + dx * 360 - dy * 100,
   screenY + dy * 360 + dx * 100
 );


 // outer glow
 fill(255, 230, 150, 50);
 ellipse(screenX, screenY, 260, 260);


 drawingContext.restore();
 pop();
}


// Draw player in screen coordinates (used to render on top of overlays)
function drawPlayerScreen() {


  if (
    player.invincible &&
    floor(player.invincibleTimer / 6) % 2 === 0
  ) {
    return;
  }


  let row;


  if (player.direction.y === 1) {
    row = 3;
  }
  else if (player.direction.y === -1) {
    row = 0;
  }
  else if (player.direction.x === 1) {
    row = 1;
  }
  else if (player.direction.x === -1) {
    row = 1;
  }
  else {
    row = playerRow;
  }


  let offsetX = 0;
  let offsetY = 0;


  if (row === 3) {
    offsetX = OFFSET_DOWN.x;
    offsetY = OFFSET_DOWN.y;
  }
  else if (row === 0) {
    offsetX = OFFSET_UP.x;
    offsetY = OFFSET_UP.y;
  }
  else if (row === 1) {
    offsetX = OFFSET_RIGHT.x;
    offsetY = OFFSET_RIGHT.y;
  }


  let flip =
    player.direction.x === -1;


  let appliedOffsetX =
    flip ? -offsetX : offsetX;


  let sx =
    player.x - camX + appliedOffsetX;


  let sy =
    player.y - camY + offsetY;


  push();
  imageMode(CENTER);


  if (flip) {


    translate(sx, sy);


    scale(-1, 1);


    image(
      playerSheet,
      0,
      0,
      FRAME_W * PLAYER_SCALE,
      FRAME_H * PLAYER_SCALE,
      currentFrame * FRAME_W,
      row * FRAME_H,
      FRAME_W,
      FRAME_H
    );
  }
  else {


    image(
      playerSheet,
      sx,
      sy,
      FRAME_W * PLAYER_SCALE,
      FRAME_H * PLAYER_SCALE,
      currentFrame * FRAME_W,
      row * FRAME_H,
      FRAME_W,
      FRAME_H
    );
  }


  pop();
}




// ------------------------------------------------------------
// drawObstacles()
// Draws obstacles in world coordinates (inside push/translate).
// Only draws items near the camera for performance.
// ------------------------------------------------------------
function drawObstacles() {
 for (let i = 0; i < obstacles.length; i++) {
   let o = obstacles[i];
   if (o.collected) continue;


   // cull items outside the camera view
   if (
     o.x < camX - o.size ||
     o.x > camX + width + o.size ||
     o.y < camY - o.size ||
     o.y > camY + height + o.size
   ) continue;


   let d = dist(player.x, player.y, o.x, o.y);
   let nearby = d < 120;


   push();
   imageMode(CENTER);


   if (nearby) {
     drawingContext.shadowBlur = 25;
     drawingContext.shadowColor = "yellow";
   }


   image(o.image, o.x, o.y, o.size, o.size);


   drawingContext.shadowBlur = 0;


   if (nearby) {
     fill(255);
     textAlign(CENTER);
     textSize(14);
     text("Press F to inspect", o.x, o.y - o.size);
   }


   pop();
 }
}




// ------------------------------------------------------------
// applyBounce()
// Applies and decays bounce velocity each frame.
// ------------------------------------------------------------
function applyBounce() {
 if (abs(player.bounceVX) > 0.1 || abs(player.bounceVY) > 0.1) {
   player.x += player.bounceVX;
   player.y += player.bounceVY;
   player.bounceVX *= 0.75;
   player.bounceVY *= 0.75;


   player.x = constrain(player.x, player.r, WORLD_W - player.r);
   player.y = constrain(player.y, player.r, WORLD_H - player.r);
 }
}


// ------------------------------------------------------------
// drawBackground()
// Draws background shapes in world coordinates.
// Only shapes near the camera are drawn for performance.
// ------------------------------------------------------------
function drawBackground() {
 imageMode(CORNER);
 image(bgImage, 0, 0, WORLD_W, WORLD_H);


 // Bunker entrance
 // Bunker entrance image
 push();
 imageMode(CENTER);
 // draw the bunker image centered on the entrance
 image(
   bunkerImage,
   bunkerEntrance.x,
   bunkerEntrance.y,
   bunkerEntrance.r * 4,
   bunkerEntrance.r * 4
 );
 pop();
 // Eyeballs scattered across the world
 for (let i = 0; i < bgShapes.length; i++) {
   let s = bgShapes[i];


   if (
     s.x < camX - s.size ||
     s.x > camX + width + s.size ||
     s.y < camY - s.size ||
     s.y > camY + height + s.size
   ) continue;


   drawEyeImage(s.x, s.y, s.size);
 }


 noFill();
 stroke(60, 50, 80);
 strokeWeight(4);
 rect(0, 0, WORLD_W, WORLD_H);
 noStroke();
}


// ------------------------------------------------------------
// drawBossZone()
// Shows a glowing zone at the top of the world where the
// boss will appear. Changes colour once the boss is active.
// ------------------------------------------------------------
function drawBossZone() {
 noStroke();
 if (gameState === STATE_BOSS) {
   fill(255, 80, 80, 30); // red when boss is active
 } else {
   fill(255, 150, 30, 20); // orange hint before boss
 }
 rect(0, 0, WORLD_W, BOSS_ZONE_Y);


 // Dashed boundary line
 stroke(gameState === STATE_BOSS ? color(255, 80, 80, 100) : color(255, 150, 30, 60));
 strokeWeight(2);
 drawingContext.setLineDash([10, 8]);
 line(0, BOSS_ZONE_Y, WORLD_W, BOSS_ZONE_Y);
 drawingContext.setLineDash([]);
 noStroke();
}


// ------------------------------------------------------------
// handleInput()
// WASD moves the player in world coordinates.
// Constrained to world boundaries.
// Spacebar fires in the current facing direction.
// ------------------------------------------------------------
function handleInput() {
 if (keyIsDown(87)) { player.y -= PLAYER_SPEED; player.direction = { x: 0,  y: -1 }; }
 if (keyIsDown(83)) { player.y += PLAYER_SPEED; player.direction = { x: 0,  y:  1 }; }
 if (keyIsDown(65)) { player.x -= PLAYER_SPEED; player.direction = { x: -1, y:  0 }; }
 if (keyIsDown(68)) { player.x += PLAYER_SPEED; player.direction = { x:  1, y:  0 }; }


 // Keep player inside world bounds
 player.x = constrain(player.x, player.r, WORLD_W - player.r);
 player.y = constrain(player.y, player.r, WORLD_H - player.r);


}




// ------------------------------------------------------------
// checkWaveSpawns()
// Each wave has a triggerY — spawns when player.y passes it.
// Enemies spawn at random positions near the top of the world.
// ------------------------------------------------------------
function checkWaveSpawns() {
 if (nextWave >= enemyData.waves.length) return;


 let wave = enemyData.waves[nextWave];
 if (player.y < wave.spawnAt) {
   for (let i = 0; i < wave.enemies.length; i++) {
     let data = wave.enemies[i];
     enemies.push({
       x:     random(100, WORLD_W - 100),
       y:     random(BOSS_ZONE_Y + 50, BOSS_ZONE_Y + 300),
       r:     20,
       speed: data.speed * 0.3,
       blobT: random(100),
     });
   }
   nextWave++;
 }
}


// ------------------------------------------------------------
// checkBossZone()
// Triggers the boss when the player enters the boss zone.
// ------------------------------------------------------------
function checkBossZone() {
 if (boss !== null) return;
 if (player.y > BOSS_ZONE_Y) return;


 spawnBoss();
}


// ------------------------------------------------------------
// spawnBoss()
// Builds the boss object from JSON data.
// Called when the player enters the boss zone or presses B.
// ------------------------------------------------------------
function spawnBoss() {
 boss = {
   x:           WORLD_W / 2,
   y:           bossData.retreatY,
   r:           120,
   health:      bossData.health,
   maxHealth:   bossData.health,
   blobT:       0,
   state:       "pausing",
   pauseTimer:  bossData.chargePause,
   chargeSpeed: bossData.chargeSpeed,
   retreatSpeed: bossData.retreatSpeed,
   retreatY:    bossData.retreatY,
   chargeVX:    0,
   chargeVY:    0,
 };


 enemies = [];
 gameState = STATE_BOSS;


 // music.stop();
 // bossMusic.loop();
}


// ------------------------------------------------------------
// updateEnemies()
// Enemies move toward the player in world coordinates.
// ------------------------------------------------------------
function updateEnemies() {
 for (let i = 0; i < enemies.length; i++) {
   let e  = enemies[i];
   let dx = player.x - e.x;
   let dy = player.y - e.y;
   let d  = dist(e.x, e.y, player.x, player.y);


   if (d > 0) {
     e.x += (dx / d) * e.speed;
     e.y += (dy / d) * e.speed;
   }
 }
}


// ------------------------------------------------------------
// updateBoss()
// Same charge/retreat/pause cycle as before.
// All positions are in world coordinates.
// ------------------------------------------------------------
function updateBoss() {
 if (!boss) return;


 if (boss.state === "pausing") {
   boss.pauseTimer--;
   if (boss.pauseTimer <= 0) {
     let dx = player.x - boss.x;
     let dy = player.y - boss.y;
     let d  = dist(boss.x, boss.y, player.x, player.y);
     boss.chargeVX = (dx / d) * boss.chargeSpeed;
     boss.chargeVY = (dy / d) * boss.chargeSpeed;
     boss.state    = "charging";
   }


 } else if (boss.state === "charging") {
   boss.x += boss.chargeVX;
   boss.y += boss.chargeVY;


   let pastPlayer = dist(boss.x, boss.y, player.x, player.y) > 200 &&
                    boss.y > player.y;
   let offWorld   = boss.x < 0 || boss.x > WORLD_W ||
                    boss.y < 0 || boss.y > WORLD_H;


   if (pastPlayer || offWorld) {
     boss.state = "retreating";
   }


 } else if (boss.state === "retreating") {
   let targetX = WORLD_W / 2;
   let targetY = boss.retreatY;
   let dx      = targetX - boss.x;
   let dy      = targetY - boss.y;
   let d       = dist(boss.x, boss.y, targetX, targetY);


   if (d < 8) {
     boss.x          = targetX;
     boss.y          = targetY;
     boss.state      = "pausing";
     boss.pauseTimer = bossData.chargePause;
   } else {
     boss.x += (dx / d) * boss.retreatSpeed;
     boss.y += (dy / d) * boss.retreatSpeed;
   }
 }
}




// ------------------------------------------------------------
// updateInvincibility()
// ------------------------------------------------------------
function updateInvincibility() {
 if (player.invincible) {
   player.invincibleTimer--;
   if (player.invincibleTimer <= 0) {
     player.invincible = false;
   }
 }
}


// ------------------------------------------------------------
// drawBoss()
// Drawn in world coordinates inside push/pop.
// ------------------------------------------------------------
function drawBoss() {
 if (!boss) return;


 push();


 imageMode(CENTER);


 let pulse = sin(frameCount * 0.08) * 10;


 image(
   dimitriImage,
   boss.x,
   boss.y,
   boss.r * 3 + pulse,
   boss.r * 3 + pulse
 );


 pop();
}


// ------------------------------------------------------------
// drawEnemies()
// Drawn in world coordinates.
// ------------------------------------------------------------
function drawEnemies() {
 for (let i = 0; i < enemies.length; i++) {
   let e = enemies[i];


   push();
   imageMode(CENTER);


   image(
     copImage,
     e.x,
     e.y,
     e.r * 4,
     e.r * 4
   );


   pop();
 }
}




// ------------------------------------------------------------
// drawPlayer()
// Drawn in world coordinates. Flickers while invincible.
// ------------------------------------------------------------
function drawPlayer() {


  if (player.invincible &&
      floor(player.invincibleTimer / 6) % 2 === 0) {
    return;
  }


  // Direction → sprite row
  if (player.direction.y === 1) {
    playerRow = 3; // down
  }
  else if (player.direction.y === -1) {
    playerRow = 0; // up
  }
  else if (player.direction.x === 1) {
    playerRow = 1; // right
  }
  else if (player.direction.x === -1) {
    playerRow = 1; // left (flipped)
  }


  // Animate while moving
  let moving =
    keyIsDown(87) ||
    keyIsDown(83) ||
    keyIsDown(65) ||
    keyIsDown(68);


  if (moving) {
    frameTimer++;


    if (frameTimer >= animSpeed) {
      currentFrame = (currentFrame + 1) % 4;
      frameTimer = 0;
    }
  }
  else {
    currentFrame = 0;
  }


  let offsetX = 0;
  let offsetY = 0;


  if (playerRow === 3) {
    offsetX = OFFSET_DOWN.x;
    offsetY = OFFSET_DOWN.y;
  }
  else if (playerRow === 0) {
    offsetX = OFFSET_UP.x;
    offsetY = OFFSET_UP.y;
  }
  else if (playerRow === 1) {
    offsetX = OFFSET_RIGHT.x;
    offsetY = OFFSET_RIGHT.y;
  }


  let flip = player.direction.x === -1;


  let appliedOffsetX =
    flip ? -offsetX : offsetX;


  push();
  imageMode(CENTER);


  if (flip) {


    translate(
      player.x + appliedOffsetX,
      player.y + offsetY
    );


    scale(-1, 1);


    image(
      playerSheet,
      0,
      0,
      FRAME_W * PLAYER_SCALE,
      FRAME_H * PLAYER_SCALE,
      currentFrame * FRAME_W,
      playerRow * FRAME_H,
      FRAME_W,
      FRAME_H
    );
  }
  else {


    image(
      playerSheet,
      player.x + appliedOffsetX,
      player.y + offsetY,
      FRAME_W * PLAYER_SCALE,
      FRAME_H * PLAYER_SCALE,
      currentFrame * FRAME_W,
      playerRow * FRAME_H,
      FRAME_W,
      FRAME_H
    );
  }


  pop();
}




// ------------------------------------------------------------
// drawMinimap()
// Drawn in screen coordinates after pop().
// Shows a scaled-down view of the world with:
//   Teal dot  — player position
//   Orange dots — enemy positions
//   Red dot   — boss position (when active)
//   Orange zone — boss zone indicator at top of minimap
// ------------------------------------------------------------
function drawMinimap() {
 let mapX = width - MAP_W - 16;
 let mapY = height - MAP_H - 16;


 // Background
 fill(0, 0, 0, 180);
 stroke(80, 60, 120);
 strokeWeight(1);
 rect(mapX, mapY, MAP_W, MAP_H, 4);
 noStroke();


 // Helper — converts world position to minimap screen position
 function worldToMap(wx, wy) {
   return {
     x: mapX + map(wx, 0, WORLD_W, 0, MAP_W),
     y: mapY + map(wy, 0, WORLD_H, 0, MAP_H),
   };
 }


if (floor(frameCount / 20) % 2 === 0) {
 fill(255, 0, 0);
} else {
 fill(0, 80, 255);
}


for (let i = 0; i < enemies.length; i++) {
 let p = worldToMap(enemies[i].x, enemies[i].y);
 ellipse(p.x, p.y, 6);
}


fill(0, 255, 0);


let bunkerPos = worldToMap(
 bunkerEntrance.x,
 bunkerEntrance.y
);


ellipse(
 bunkerPos.x,
 bunkerPos.y,
 8
);


 // Player dot — drawn last so it's always on top
 fill(0, 200, 180);
 let pp = worldToMap(player.x, player.y);
 ellipse(pp.x, pp.y, 7);




 // Label
 fill(120);
 textSize(9);
 textAlign(LEFT);
 textFont("monospace");
 text("MAP", mapX + 4, mapY + MAP_H - 4);
}


// ------------------------------------------------------------
// drawHUD()
// Drawn in screen coordinates.
// ------------------------------------------------------------
function drawHUD() {
 noStroke();
 textFont("monospace");


 fill(255);
 textSize(15);
 textAlign(LEFT);
 text("WASD: Move   F: Collect   Avoid cops", 16, 24);


 textSize(18);
 text("Time: " + ceil(timeLeft), 16, 52);
 text("Evidence: " + evidence + " / " + evidenceNeeded, 16, 78);
 text("Supplies: " + supplies + " / " + suppliesNeeded, 16, 104);


 if (timeLeft <= 10) {
   fill(255, 80, 80);
   textSize(18);
   textAlign(CENTER);
   text("SUNRISE IS COMING", width / 2, 34);
 }
}


// ------------------------------------------------------------
// drawWinScreen()
// ------------------------------------------------------------
function drawWinScreen() {
 fill(0, 0, 0, 190);
 rect(0, 0, width, height);


 fill(255);
 textAlign(CENTER);
 textFont("monospace");


 textSize(34);
 text("YOU SURVIVED THE NIGHT", width / 2, height / 2 - 70);


 textSize(18);
 text("You found enough supplies to return to the bunker.", width / 2, height / 2 - 25);
 text("The evidence points to someone else.", width / 2, height / 2 + 5);


 textSize(15);
 fill(180);
 text("Evidence: " + evidence + " / " + evidenceNeeded, width / 2, height / 2 + 45);
 text("Supplies: " + supplies + " / " + suppliesNeeded, width / 2, height / 2 + 70);
 text("Press R to try again", width / 2, height / 2 + 110);
}


// ------------------------------------------------------------
// drawGameOver()
// ------------------------------------------------------------
function drawGameOver() {
 fill(0, 0, 0, 190);
 rect(0, 0, width, height);


 fill(255);
 textAlign(CENTER);
 textFont("monospace");


 textSize(34);
 text("YOU WERE CAUGHT", width / 2, height / 2 - 70);


 textSize(18);
 text("The police found you before you could prove the truth.", width / 2, height / 2 - 25);
 text("Your wife’s murder remains unsolved.", width / 2, height / 2 + 5);


 textSize(15);
 fill(180);
 text("Evidence: " + evidence + " / " + evidenceNeeded, width / 2, height / 2 + 45);
 text("Supplies: " + supplies + " / " + suppliesNeeded, width / 2, height / 2 + 70);
 text("Press R to return to title", width / 2, height / 2 + 110);
}


// ------------------------------------------------------------
// keyPressed()
// R restarts. B skips to boss fight.
// ------------------------------------------------------------
function keyPressed() {

if (gameState === STATE_SCAVENGE &&
    (key === "f" || key === "F")) {
  checkItemPickup();
}

 if (gameState === STATE_HOME && keyCode === ENTER) {
 restartGame();
}


if (gameState === STATE_BUNKER && keyCode === ENTER) {
 timeLeft = 60;
 enemies = [];
 nextWave = 0;


 player.x = WORLD_W / 2;
 player.y = WORLD_H - 200;


 camX = player.x - width / 2;
 camY = player.y - height / 2;


 gameState = STATE_SCAVENGE;
}


 // R — restart
// R = return to title screen
if (
 (key === "r" || key === "R") &&
 (gameState === STATE_OVER || gameState === STATE_WIN)
) {
 gameState = STATE_HOME;
}
}


function mousePressed() {
 userStartAudio();


 if (!music.isPlaying()) {
   music.loop();
 }

 if (gameState === STATE_BUNKER) {
   checkBunkerClick();
 }
}


function drawFlashlight() {
 // Draw darkness overlay and a translucent light (white/yellow) using additive blending
 let screenX = player.x - camX;
 let screenY = player.y - camY;


 push();
 noStroke();
 // slightly lighter darkness so flashlight is more noticeable
 fill(0, 160);
 rect(0, 0, width, height);


 // use additive blending to brighten the path where we draw the light
 drawingContext.save();
 drawingContext.globalCompositeOperation = 'lighter';


 // bright core around player (white-yellow)
 fill(255, 230, 150, 50);
 ellipse(screenX, screenY, 120, 120);


 // softer cone ahead of player
 let dx = player.direction.x;
 let dy = player.direction.y;
 fill(255, 230, 150, 50);
 triangle(
   screenX,
   screenY,
   screenX + dx * 360 + dy * 100,
   screenY + dy * 360 - dx * 100,
   screenX + dx * 360 - dy * 100,
   screenY + dy * 360 + dx * 100
 );


 // outer glow
 fill(255, 230, 150, 0.12);
 ellipse(screenX, screenY, 260, 260);


 drawingContext.restore();
 pop();
}


function checkItemPickup() {
  for (let i = 0; i < obstacles.length; i++) {
    let o = obstacles[i];

    if (o.collected) continue;

    // Only require the player to be close
    if (dist(player.x, player.y, o.x, o.y) < 120) {

      if (pickupSound.isLoaded()) {
        pickupSound.stop();
        pickupSound.play();
      }

      o.collected = true;
      score++;

      if (o.real) {
        if (o.type === "evidence") {
          evidence++;
        }

        if (o.type === "supply") {
          supplies++;
        }
      }

      return; // Collect only one item per key press
    }
  }
}


function drawWatchingEye(x, y, size, lookX, lookY) {
 push();
 translate(x, y);


 let wobble = sin(frameCount * 0.03 + x + y) * 2;


 // Dark outer shadow
 noStroke();
 fill(0, 180);
 ellipse(0, 0, size * 1.15, size * 0.9);


 // Dirty eyeball base - not pure white
 fill(170, 160, 135, 230);
 stroke(60, 40, 35);
 strokeWeight(2);
 ellipse(0, 0, size * 0.9 + wobble, size * 0.65);


 // Veins
 stroke(90, 20, 20, 150);
 strokeWeight(1);
 line(-size * 0.25, -size * 0.05, -size * 0.05, 0);
 line(size * 0.25, size * 0.08, size * 0.05, 0);
 line(-size * 0.15, size * 0.12, 0, size * 0.03);


 // Direction toward player
 let angle = atan2(lookY, lookX);
 let pupilX = cos(angle) * size * 0.16;
 let pupilY = sin(angle) * size * 0.10;


 // Murky iris
 noStroke();
 fill(80, 70, 45);
 ellipse(pupilX, pupilY, size * 0.28);


 // Black pupil
 fill(5);
 ellipse(pupilX, pupilY, size * 0.14);


 // Tiny dull highlight
 fill(230, 220, 180, 120);
 ellipse(pupilX - size * 0.04, pupilY - size * 0.04, size * 0.04);


 pop();
}


function drawEyeImage(x, y, size) {
 let angle = atan2(player.y - y, player.x - x);


 push();
 translate(x, y);
 rotate(angle + PI);


 imageMode(CENTER);
 image(eyeImage, 0, 0, size, size);


 pop();
}


function checkEnemyPlayerCollision() {
 for (let i = 0; i < enemies.length; i++) {
   let d = dist(
     player.x,
     player.y,
     enemies[i].x,
     enemies[i].y
   );


   if (d < player.r + enemies[i].r) {
     if (playerHitSound.isLoaded()) {
       playerHitSound.play();
     }


     gameState = STATE_OVER;
     return;
   }
 }
}
function updateTimer() {
 if (gameState !== STATE_SCAVENGE) return;


 timeLeft -= deltaTime / 1000;


 if (timeLeft <= 0) {
   timeLeft = 0;
   gameState = STATE_OVER;
 }
}


function drawBunker() {
 background(5);


 imageMode(CORNER);

 image(bunkerEnterImage, 0, 0, width, height);
 noTint();


 fill(0, 0, 0, 20);
 rect(0, 0, width, height);


 fill(255);
 textFont("monospace");
 textAlign(LEFT);
 textSize(18);


 text("BUNKER - DAY " + day, 30, 40);
 text("Supplies: " + supplies, 30, 75);
 text("Evidence: " + evidence, 30, 105);


 // Center buttons at bottom of screen
 let buttonWidth = 150;
 let buttonHeight = 50;
 let buttonSpacing = 10;
 let totalButtonWidth = (buttonWidth + buttonSpacing) * 4 - buttonSpacing;
 let startX = (width - totalButtonWidth) / 2;
 let startY = height - 80;

 drawBunkerButton(startX, startY, buttonWidth, buttonHeight, "Eat Food");
 drawBunkerButton(startX + buttonWidth + buttonSpacing, startY, buttonWidth, buttonHeight, "Drink Water");
 drawBunkerButton(startX + (buttonWidth + buttonSpacing) * 2, startY, buttonWidth, buttonHeight, "Inspect Clues");
 drawBunkerButton(startX + (buttonWidth + buttonSpacing) * 3, startY, buttonWidth, buttonHeight, "Sleep");
}


function drawBunkerButton(x, y, w, h, label) {
 fill(40, 35, 30, 220);
 stroke(180);
 strokeWeight(2);
 rect(x, y, w, h, 8);


 fill(255);
 noStroke();
 textAlign(CENTER, CENTER);
 textSize(14);
 text(label, x + w / 2, y + h / 2);
}


function checkBunkerClick() {
 // Calculate button positions
 let buttonWidth = 150;
 let buttonHeight = 50;
 let buttonSpacing = 10;
 let totalButtonWidth = (buttonWidth + buttonSpacing) * 4 - buttonSpacing;
 let startX = (width - totalButtonWidth) / 2;
 let startY = height - 80;

 // Eat Food
 if (mouseX > startX && mouseX < startX + buttonWidth && mouseY > startY && mouseY < startY + buttonHeight) {
   if (supplies > 0) {
     supplies--;
     alert("He eats some food and feels steady enough to survive another night.");
   } else {
     alert("No food left.");
   }
 }


 // Drink Water
 if (mouseX > startX + buttonWidth + buttonSpacing && mouseX < startX + (buttonWidth + buttonSpacing) * 2 && mouseY > startY && mouseY < startY + buttonHeight) {
   if (supplies > 0) {
     supplies--;
     alert("He drinks water and catches his breath.");
   } else {
     alert("No water left.");
   }
 }


 // Inspect Clues
 if (mouseX > startX + (buttonWidth + buttonSpacing) * 2 && mouseX < startX + (buttonWidth + buttonSpacing) * 3 && mouseY > startY && mouseY < startY + buttonHeight) {
   alert("His wife's memory points him toward the evidence. Something about the police report feels wrong.");
 }


 // Sleep / next level
 if (mouseX > startX + (buttonWidth + buttonSpacing) * 3 && mouseX < startX + (buttonWidth + buttonSpacing) * 4 && mouseY > startY && mouseY < startY + buttonHeight) {
   startNextScavengeLevel();
 }
}


function checkBunkerEntrance() {
 let d = dist(player.x, player.y, bunkerEntrance.x, bunkerEntrance.y);


 if (d < bunkerEntrance.r) {
   fill(255);
   textAlign(CENTER);
   textSize(16);
   text("Press E to enter bunker", player.x, player.y - 50);


   if (keyIsDown(69)) { // E key
     finishScavengeLevel();
   }
 }
}


function finishScavengeLevel() {
 supplies -= 2;


 if (supplies < 0) {
   gameState = STATE_OVER;
   return;
 }


 level++;


 if (level === 2) {
   day = 14;
 } else if (level === 3) {
   day = 21;
 } else if (level > maxLevel) {
   gameState = STATE_WIN;
   return;
 }


 enemies = [];
 nextWave = 0;
 timeLeft = 60;


 for (let i = 0; i < obstacles.length; i++) {
   obstacles[i].collected = false;
 }


 gameState = STATE_BUNKER;
}


function startNextScavengeLevel() {
 timeLeft = 60;
 enemies = [];
 nextWave = 0;


 player.x = WORLD_W / 2;
 player.y = WORLD_H - 200;


 camX = player.x - width / 2;
 camY = player.y - height / 2;


 gameState = STATE_SCAVENGE;
}


function drawHomeScreen() {
 // keep the canvas transparent so the page splash background shows through
 clear();
imageMode(CENTER);


let imgW = homeImage.width * 1.2;
let imgH = homeImage.height * 0.6;


image(
 homeImage,
 width / 2,
 height / 2,
 imgW,
 imgH
);


 // dark overlay so text is readable, but allow page background to show
 fill(0, 0, 0, 100);
 rect(0, 0, width, height);


 textAlign(CENTER);
 textFont("monospace");


 // Make the prompt more visible: larger, white with black stroke
 textSize(22);
 stroke(0);
 strokeWeight(6);
 fill(255);
 text("Press ENTER to start", width / 2, 320);
 noStroke();
}


function restartGame() {
 gameState = STATE_SCAVENGE;


 level = 1;
 day = 7;


 score = 0;
 supplies = 0;
 evidence = 0;
 timeLeft = 60;


 enemies = [];
 nextWave = 0;
 boss = null;


 player.x = WORLD_W / 2;
 player.y = WORLD_H - 200;
 player.direction = { x: 0, y: -1 };


 camX = player.x - width / 2;
 camY = player.y - height / 2;


 for (let i = 0; i < obstacles.length; i++) {
   obstacles[i].collected = false;
 }
}



