import { muteSound, playBackgroundMusic, playHitSound } from "./sounds.js";

let canvas;
let context;
let player;
let enemies;

window.onload = () => {
  player = {
    x: 100,
    y: 500,
    height: 100,
    width: 50,
    depth: 10,
    vx: 0,
    vy: 0,
    speed: 1,
    topSpeed: 5,
    directionsPressed: {
      UP: false,
      DOWN: false,
      LEFT: false,
      RIGHT: false,
    },
    facingDirection: "RIGHT",
    attacks: [],
    collided: false,
    images: {
      base: fighterImage,
      onHit: fighterOnHitImage,
      attack: fighterKickingImage,
    },
  };
  enemies = [
    {
      x: 500,
      y: 500,
      height: 100,
      width: 50,
      depth: 10,
      collided: false,
      facingDirection: "LEFT",
      attacks: [],
      images: {
        base: fighterImage,
        onHit: fighterOnHitImage,
        attack: fighterKickingImage,
      },
    },
    {
      x: 300,
      y: 200,
      height: 100,
      width: 50,
      depth: 10,
      collided: false,
      facingDirection: "LEFT",
      attacks: [],
      images: {
        base: fighterImage,
        onHit: fighterOnHitImage,
        attack: fighterKickingImage,
      },
    },
    {
      x: 600,
      y: 300,
      height: 100,
      width: 50,
      depth: 10,
      collided: false,
      facingDirection: "RIGHT",
      attacks: [],
      images: {
        base: fighterImage,
        onHit: fighterOnHitImage,
        attack: fighterKickingImage,
      },
    },
  ];
  canvas = document.getElementById("canvas");
  context = canvas.getContext("2d");
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  document.getElementById("muteButton").addEventListener("click", muteSound);
  playBackgroundMusic();

  setInterval(update, 1000 / 60);
  setInterval(moveEnemies, 1000 / 5);
};

function update() {
  context.fillStyle = "black";
  context.drawImage(streetBackground, 0, 0, canvas.width, canvas.height);

  // Player Movement only if not attacking
  if (player.attacks.length === 0) {
    if (player.directionsPressed.UP && player.vy > -player.topSpeed) {
      player.vy -= player.speed;
    }
    if (player.directionsPressed.DOWN && player.vy < player.topSpeed) {
      player.vy += player.speed;
    }
    if (player.directionsPressed.LEFT && player.vx > -player.topSpeed) {
      player.vx -= player.speed;
      player.facingDirection = "LEFT";
    }
    if (player.directionsPressed.RIGHT && player.vx < player.topSpeed) {
      player.vx += player.speed;
      player.facingDirection = "RIGHT";
    }

    if (!player.directionsPressed.UP && !player.directionsPressed.DOWN) {
      player.vy = 0;
    }
    if (!player.directionsPressed.LEFT && !player.directionsPressed.RIGHT) {
      player.vx = 0;
    }

    if (player.x + player.vx > 0 && player.x + player.vx < canvas.width) {
      player.x += player.vx;
    }
    if (player.y + player.vy > 0 && player.y + player.vy < canvas.height) {
      player.y += player.vy;
    }
  }

  // check for movement collision between boxes
  for (const enemy of enemies) {
    if (hasRunIntoEachOther(player, enemy)) {
      onCollision(player, enemy);
    }
    for (const enemyAttack of enemy.attacks) {
      if (hasRunIntoEachOther(enemyAttack, player)) {
        onCollision(enemyAttack, player);
      }
    }
    for (const attack of player.attacks) {
      if (hasRunIntoEachOther(attack, enemy)) {
        onCollision(attack, enemy);
      }
    }
  }

  // Draw the furthest in back first
  const allEntities = enemies.slice(0);
  allEntities.push(player);
  allEntities.sort(function(a, b) {
    return a.y + a.height - (b.y + b.height);
  });

  for (const entity of allEntities) {
    if (entity.attacks && entity.attacks.length > 0) {
      for (let i = entity.attacks.length - 1; i >= 0; i--) {
        const attack = entity.attacks[i];
        // drawDepthOutline(attack);
        if (entity.facingDirection === "RIGHT") {
          context.drawImage(entity.images.attack, attack.x, attack.y, attack.width, attack.height);
        } else {
          drawHorizontallyFlippedImage(entity.images.attack, attack.x, attack.y, attack.width, attack.height);
        }
        attack.currentFrame++;
        if (attack.currentFrame > attack.duration) {
          entity.attacks.splice(i, 1);
        }
      }
    } else {
      // drawDepthOutline(entity);
      const entityImage = entity.collided ? entity.images.onHit : entity.images.base;
      if (entity.facingDirection === "RIGHT") {
        context.drawImage(entityImage, entity.x, entity.y, entity.width, entity.height);
      } else {
        drawHorizontallyFlippedImage(entityImage, entity.x, entity.y, entity.width, entity.height);
      }
    }
    entity.collided = false;
  }
}

function moveEnemies() {
  for (const enemy of enemies) {
    const randomInt = getRandomInt(0, 6);
    switch (randomInt) {
      case 0:
        const originX = enemy.facingDirection === "RIGHT" ? enemy.x : enemy.x - enemy.width;
        enemy.attacks.push({
          x: originX,
          y: enemy.y,
          height: enemy.height,
          width: enemy.width * 2,
          depth: enemy.depth,
          currentFrame: 0,
          duration: 10,
        });
        break;
      case 3:
        enemy.x++;
        enemy.facingDirection = "RIGHT";
        break;
      case 4:
        enemy.x--;
        enemy.facingDirection = "LEFT";
        break;
      case 5:
        enemy.y++;
        break;
      case 6:
        enemy.y--;
        break;
    }
  }
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function onCollision(entityOne, entityTwo) {
  if (!entityOne.collided && !entityTwo.collided) {
    playHitSound();
  }
  entityOne.collided = true;
  entityTwo.collided = true;
}

function drawDepthOutline(entity) {
  context.fillStyle = "rgba(0,0,0,0.2)";
  context.fillRect(entity.x, entity.y - entity.depth, entity.width, entity.height);
  context.fillStyle = "rgba(50,50,50,0.2)";
  context.fillRect(entity.x, entity.y + entity.depth, entity.width, entity.height);
}

function drawHorizontallyFlippedImage(image, x, y, width, height) {
  context.translate(x + width, y);
  context.scale(-1, 1);
  context.drawImage(image, 0, 0, width, height);
  context.setTransform(1, 0, 0, 1, 0, 0);
}

// Detects if two entity's feet are aligned
function hasRunIntoEachOther(entityOne, entityTwo) {
  // overlap bottom right background with top left entityTwo
  if (
    entityOne.x + entityOne.width >= entityTwo.x &&
    entityOne.x + entityOne.width <= entityTwo.x + entityTwo.width &&
    entityOne.y + entityOne.height - entityOne.depth >= entityTwo.y + entityTwo.height - entityTwo.depth &&
    entityOne.y + entityOne.height - entityOne.depth <= entityTwo.y + entityTwo.height + entityTwo.depth
  ) {
    return true;
  }
  // overlap bottom right foreground with entityTwo
  if (
    entityOne.x + entityOne.width >= entityTwo.x &&
    entityOne.x + entityOne.width <= entityTwo.x + entityTwo.width &&
    entityOne.y + entityOne.height + entityOne.depth >= entityTwo.y + entityTwo.height - entityTwo.depth &&
    entityOne.y + entityOne.height + entityOne.depth <= entityTwo.y + entityTwo.height + entityTwo.depth
  ) {
    return true;
  }
  // overlap bottom left background with entityTwo
  if (
    entityOne.x >= entityTwo.x &&
    entityOne.x <= entityTwo.x + entityTwo.width &&
    entityOne.y + entityOne.height - entityOne.depth >= entityTwo.y + entityTwo.height - entityTwo.depth &&
    entityOne.y + entityOne.height - entityOne.depth <= entityTwo.y + entityTwo.height + entityTwo.depth
  ) {
    return true;
  }
  // overlap bottom left foreground with entityTwo
  if (
    entityOne.x >= entityTwo.x &&
    entityOne.x <= entityTwo.x + entityTwo.widthh &&
    entityOne.y + entityOne.height + entityOne.depth >= entityTwo.y + entityTwo.height - entityTwo.depth &&
    entityOne.y + entityOne.height + entityOne.depth <= entityTwo.y + entityTwo.height + entityTwo.depth
  ) {
    return true;
  }
  return false;
}

// function isOverlapping(entityOne, entityTwo) {
//   return (entityOne.x <= (entityTwo.x + entityTwo.width) && (entityOne.x + entityOne.width) >= entityTwo.x) &&
//     (entityOne.y <= (entityTwo.y + entityTwo.height) && (entityOne.y + entityOne.height) >= entityTwo.y) &&
//     (-entityOne.depth <= entityTwo.depth && entityOne.depth >= -entityTwo.depth);
// }

function onKeyDown(event) {
  switch (event.keyCode) {
    case 38: // up arrow
    case 87: // W
      player.directionsPressed.UP = true;
      break;
    case 37: // left arrow
    case 65: // A
      player.directionsPressed.LEFT = true;
      break;
    case 40: // down arrow
    case 83: // S
      player.directionsPressed.DOWN = true;
      break;
    case 39: // right arrow
    case 68: // D
      player.directionsPressed.RIGHT = true;
      break;
    case 32: // Space
      const originX = player.facingDirection === "RIGHT" ? player.x : player.x - player.width;
      player.attacks.push({
        x: originX,
        y: player.y,
        height: player.height,
        width: player.width * 2,
        depth: player.depth,
        currentFrame: 0,
        duration: 10,
      });
      break;
  }
}

function onKeyUp(event) {
  switch (event.keyCode) {
    case 38: // up arrow
    case 87: // W
      player.directionsPressed.UP = false;
      break;
    case 37: // left arrow
    case 65: // A
      player.directionsPressed.LEFT = false;
      break;
    case 40: // down arrow
    case 83: // S
      player.directionsPressed.DOWN = false;
      break;
    case 39: // right arrow
    case 68: // D
      player.directionsPressed.RIGHT = false;
      break;
  }
}
