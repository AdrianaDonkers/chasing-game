const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const progressBar = document.querySelector("progress");

const nemoURL =
  "https://vignette.wikia.nocookie.net/minecraftpocketedition/images/c/ca/Clownfish.png/revision/latest?cb=20140826095943";
const sharkURL =
  "http://31.media.tumblr.com/70ec52596d1533f6f31137f6fa57432b/tumblr_mqqy4nxDvf1qe1uqko1_500.gif";
const wormURL = "http://piq.codeus.net/static/media/userpics/piq_56496.png";
const backgroundURL = "https://i.ytimg.com/vi/8EnTQADFz48/maxresdefault.jpg";
const sharkRadius = 15;

function getRandomLocation(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Sprite {
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
  }
}

class NemoPlayer extends Sprite {
  constructor(x, y, radius, speed) {
    super();
    this.image = new Image();
    this.image.src = nemoURL;
    Object.assign(this, { x, y, radius, speed });
  }
  draw() {
    ctx.drawImage(this.image, this.x, this.y, 40, 40);
  }
}
let player = new NemoPlayer(
  getRandomLocation(0, canvas.width),
  getRandomLocation(0, canvas.height),
  15,
  0.07
);

class SharkEnemy extends Sprite {
  constructor(x, y, radius, speed) {
    super();
    this.image = new Image();
    this.image.src = sharkURL;
    Object.assign(this, { x, y, radius, speed });
  }
  draw() {
    ctx.drawImage(this.image, this.x, this.y, 60, 30);
  }
}
let enemies = [];
setInterval(function() {
  if (progressBar.Value !== 0) {
    enemies.push(
      new SharkEnemy(
        getRandomLocation(0, canvas.width),
        getRandomLocation(0, canvas.height),
        sharkRadius,
        Number((Math.random() * (0.03 - 0.001) + 0.0001).toFixed(4))
      )
    );
  }
}, 7000);

class Worm extends Sprite {
  constructor(x, y, radius) {
    super();
    this.image = new Image();
    this.image.src = wormURL;
    Object.assign(this, { x, y, radius });
  }
  draw() {
    ctx.drawImage(this.image, this.x, this.y, 30, 30);
  }
}
let worms = [];
setInterval(function() {
  if (progressBar.Value !== 0) {
    worms.push(
      new Worm(
        getRandomLocation(0, canvas.width),
        getRandomLocation(0, canvas.height),
        15
      )
    );
  }
}, 3000);

let mouse = { x: 0, y: 0 };
document.body.addEventListener("mousemove", updateMouse);
function updateMouse(event) {
  const { left, top } = canvas.getBoundingClientRect();
  mouse.x = event.clientX - left;
  mouse.y = event.clientY - top;
}
function moveToward(leader, follower, speed) {
  follower.x += (leader.x - follower.x) * speed;
  follower.y += (leader.y - follower.y) * speed;
}
function distanceBetween(sprite1, sprite2) {
  return Math.hypot(sprite1.x - sprite2.x, sprite1.y - sprite2.y);
}
function haveCollided(sprite1, sprite2) {
  return distanceBetween(sprite1, sprite2) < sprite1.radius + sprite2.radius;
}
function pushOff(c1, c2) {
  let [dx, dy] = [c2.x - c1.x, c2.y - c1.y];
  const L = Math.hypot(dx, dy);
  let distToMove = c1.radius + c2.radius - L;
  if (distToMove > 0) {
    dx /= L;
    dy /= L;
    c1.x -= dx * distToMove / 2;
    c1.y -= dy * distToMove / 2;
    c2.x += dx * distToMove / 2;
    c2.y += dy * distToMove / 2;
  }
}

function clearBackground() {
  let background = new Image();
  background.src = backgroundURL;
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
}

function startGame() {
  if (progressBar.value === 0) {
    progressBar.value = 100;
    Object.assign(player, { x: canvas.width / 2, y: canvas.height / 2 });
    player.draw();
    enemies.length = 0;
    worms.length = 0;
    requestAnimationFrame(drawScene);
  }
}

function updateScene() {
  moveToward(mouse, player, player.speed);
  enemies.forEach(enemy => moveToward(player, enemy, enemy.speed));
  for (let i = 0; i < enemies.length; i++) {
    for (let j = i + 1; j < enemies.length; j++) {
      pushOff(enemies[i], enemies[j]);
    }
  }
  enemies.forEach(enemy => {
    if (haveCollided(enemy, player)) {
      progressBar.value -= 2;
    }
  });
  worms.forEach(worm => {
    if (haveCollided(worm, player)) {
      progressBar.value += 10;
      worms.splice(worms.indexOf(worm), 1);
    }
  });
  document.getElementById("health").innerHTML = progressBar.value;
}

function drawGameOver() {
  ctx.fillStyle = "White";
  ctx.font = "44px 'Special Elite'";
  ctx.textAlign = "center";
  ctx.fillText("Fish are friends,", canvas.width / 2, canvas.height / 3);
  ctx.fillText("not food!!!", canvas.width / 2, canvas.height / 2);
  ctx.font = "22px 'Special Elite'";
  ctx.fillText("Click To Play Again", canvas.width / 2, canvas.height / 1.5);
}

function drawScene() {
  clearBackground();
  player.draw();
  enemies.forEach(enemy => enemy.draw());
  worms.forEach(worm => worm.draw());
  updateScene();
  if (progressBar.value > 0) {
    requestAnimationFrame(drawScene);
  } else {
    requestAnimationFrame(drawGameOver);
  }
}

canvas.addEventListener("click", startGame);
requestAnimationFrame(drawScene);
