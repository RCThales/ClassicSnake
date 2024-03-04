class Apple {
  color;
  appleXPosition;
  appleYPosition;

  constructor(color, appleXPosition, appleYPosition) {
    this.color = color;
    this.appleXPosition = appleXPosition;
    this.appleYPosition = appleYPosition;
  }
}
class Snake {
  speed;
  headXPosition;
  headYPosition;
  tailLength;
  headColor;
  bodyColor;
  snakeParts = [];

  constructor(
    headColor,
    bodyColor,
    speed,
    headXPosition,
    headYPosition,
    tailLength
  ) {
    this.headColor = headColor;
    this.bodyColor = bodyColor;
    this.speed = speed;
    this.headXPosition = headXPosition;
    this.headYPosition = headYPosition;
    this.tailLength = tailLength;
  }

  raiseSpeed = (ratio) => {
    this.speed += ratio;
  };
}

class SnakePart {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class GameInput {
  xVelocity = 0;
  yVelocity = 0;
  inputsxVelocity = 0;
  inputsyVelocity = 0;
}
class GameState {
  width = 300;
  height = 300;
  score = 0;
  tileCount = 20;
  tileSize;
  gameInput;

  constructor() {
    this.gameInput = new GameInput();
    this.tileSize = this.width / this.tileCount;
  }

  addOnePoint = () => {
    this.score++;
  };
}

const audios = {
  gameMainAudio: new Audio("./audio/themesong.wav"),
  deathAudio: new Audio("./audio/error.wav"),
  gulpSound: new Audio("./audio/gulp.mp3"),
};

const gameState = new GameState();
const snake = new Snake("orange", "green", 5, 10, 10, 1);
const apple = new Apple("red", 0, 5);

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const gameId = "1fd78042-fd6b-4f87-8dc0-94a2f1ef74dd";

canvas.width = gameState.width;
canvas.height = gameState.height;

window.addEventListener("load", () => {
  audios.gameMainAudio.loop = true;
  audios.gameMainAudio.volume = 0.4;
  audios.gameMainAudio.play();
});

window.addEventListener("message", (event) => {
  if (event.origin !== "https://thalesboycolor.netlify.app") {
    return;
  }

  const keydownEvent = new KeyboardEvent("keydown", {
    key: event.data.keycode,
    bubbles: true,
    cancelable: true,
  });

  window.dispatchEvent(keydownEvent);
});

window.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "w" || event.key === "ArrowUp") {
    if (gameState.gameInput.inputsyVelocity === 1) return;
    gameState.gameInput.inputsyVelocity = -1;
    gameState.gameInput.inputsxVelocity = 0;
  }

  if (event.key.toLowerCase() === "s" || event.key === "ArrowDown") {
    if (gameState.gameInput.inputsyVelocity === -1) return;
    gameState.gameInput.inputsyVelocity = 1;
    gameState.gameInput.inputsxVelocity = 0;
  }

  if (event.key.toLowerCase() === "a" || event.key === "ArrowLeft") {
    if (gameState.gameInput.inputsxVelocity === 1) return;
    gameState.gameInput.inputsyVelocity = 0;
    gameState.gameInput.inputsxVelocity = -1;
  }

  if (event.key.toLowerCase() === "d" || event.key === "ArrowRight") {
    if (gameState.gameInput.inputsxVelocity === -1) return;
    gameState.gameInput.inputsyVelocity = 0;
    gameState.gameInput.inputsxVelocity = 1;
  }

  if (event.key.toLowerCase() === "k" || event.key === "Enter") {
    if (!isGameOver()) return;
    resetGame();
  }

  if (event.key.toLowerCase() === "l" || event.key === "Esc") {
    if (!isGameOver()) return;
    goBackToMenu();
  }
});

const startGameLoop = () => {
  moveSnake();
  if (isGameOver()) {
    setGameOver();
    return;
  }
  drawLevel();
  drawApple();
  drawSnake();
  checkAppleCollision();
  updateScoreHud();

  setTimeout(startGameLoop, 1000 / snake.speed);
};

const drawResetOption = () => {
  const restartText = document.createElement("p");
  restartText.innerHTML = "A to Restart";
  restartText.style.position = "absolute";
  restartText.style.left = `${canvas.offsetLeft + canvas.width / 2 - 80}px`;
  restartText.style.top = `${canvas.offsetTop + canvas.height / 2 + 15}px`;
  restartText.style.zIndex = 10;
  restartText.style.fontSize = "30px";
  restartText.style.fontFamily = "VT323";
  restartText.style.color = "white";
  restartText.style.textAlign = "center";
  restartText.style.cursor = "pointer";
  restartText.onclick = resetGame;
  document.body.appendChild(restartText);
};

const drawExitOption = () => {
  const exitText = document.createElement("p");
  exitText.innerHTML = "B to Exit";

  exitText.style.position = "absolute";
  exitText.style.left = `${canvas.offsetLeft + canvas.width / 2 - 60}px`;
  exitText.style.top = `${canvas.offsetTop + canvas.height / 2 + 45}px`;
  exitText.style.zIndex = 10;
  exitText.style.fontSize = "30px";
  exitText.style.fontFamily = "VT323";
  exitText.style.color = "white";
  exitText.style.textAlign = "center";
  exitText.style.cursor = "pointer";
  exitText.onclick = goBackToMenu;
  document.body.appendChild(exitText);
};

const resetGame = () => {
  location.reload();
};
const goBackToMenu = () => {
  history.back();
};

const getHighScore = () => {
  const savedScore = localStorage.getItem(gameId + "highScore");
  return savedScore ? parseInt(savedScore) : 0;
};

const setHighScore = () => {
  const highScore = getHighScore();
  if (gameState.score > highScore) {
    localStorage.setItem(gameId + "highScore", gameState.score.toString());
  }
};

const isGameOver = () => {
  if (isGameOnInitialStateOfPause()) {
    return false;
  }
  if (snakeAteItself()) {
    return true;
  }
  if (snakeHitAWall()) {
    return true;
  }
};

const snakeAteItself = () => {
  return snake.snakeParts.some((part) => {
    return part.x === snake.headXPosition && part.y === snake.headYPosition;
  });
};

const snakeHitAWall = () => {
  if (
    snake.headXPosition < 0 ||
    snake.headXPosition === gameState.tileCount ||
    snake.headYPosition < 0 ||
    snake.headYPosition === gameState.tileCount
  ) {
    return true;
  }

  return false;
};

const isGameOnInitialStateOfPause = () => {
  if (
    gameState.gameInput.yVelocity === 0 &&
    gameState.gameInput.xVelocity === 0
  ) {
    return true;
  }

  return false;
};

const setGameOver = () => {
  playGameOverAudio();
  clearScreen();
  setHighScore();
  drawScore();
  drawHighscore();
  drawSeparationLine();
  drawResetOption();
  drawExitOption();
};

const playGameOverAudio = () => {
  resetMainGameAudio();
  audios.gameMainAudio.pause();
  audios.deathAudio.play();
};

const resetMainGameAudio = () => {
  audios.gameMainAudio.currentTime = 0;
};

const updateScoreHud = () => {
  ctx.fillStyle = "white";
  ctx.font = "35px VT323";
  ctx.fillText(gameState.score, canvas.width - 295, 25);
};

const drawScore = () => {
  ctx.fillStyle = "white";
  ctx.font = "35px VT323";
  ctx.fillText(
    `Score: ${gameState.score}`,
    canvas.width / 3,
    canvas.height / 5
  );
};

const drawHighscore = () => {
  ctx.fillStyle = "white";
  ctx.font = "35px VT323";
  ctx.fillText(
    `High Score: ${getHighScore()}`,
    canvas.width / 5.3,
    canvas.height / 3
  );
};

const drawSeparationLine = () => {
  ctx.fillStyle = "white";
  ctx.font = "35px VT323";
  ctx.fillText(`---------------`, canvas.width / 7, canvas.height / 1.8);
};

const clearScreen = () => {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
};

const drawLevel = () => {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
};

const drawSnake = () => {
  drawSnakeBody();
  drawSnakeHead();
  addSnakeBodyTiles();
  cleanOverflowingSnakeTilesToMatchTailSize();
};

const drawSnakeBody = () => {
  ctx.fillStyle = snake.bodyColor;
  snake.snakeParts.forEach((part) => {
    ctx.fillRect(
      part.x * gameState.tileSize,
      part.y * gameState.tileSize,
      gameState.tileSize,
      gameState.tileSize
    );
  });
};
const drawSnakeHead = () => {
  ctx.fillStyle = snake.headColor;
  ctx.fillRect(
    snake.headXPosition * gameState.tileSize,
    snake.headYPosition * gameState.tileSize,
    gameState.tileSize,
    gameState.tileSize
  );
};
const addSnakeBodyTiles = () => {
  snake.snakeParts.push(
    new SnakePart(snake.headXPosition, snake.headYPosition)
  );
};

const cleanOverflowingSnakeTilesToMatchTailSize = () => {
  if (snake.snakeParts.length > snake.tailLength) {
    snake.snakeParts.shift();
  }
};

const moveSnake = () => {
  gameState.gameInput.xVelocity = gameState.gameInput.inputsxVelocity;
  gameState.gameInput.yVelocity = gameState.gameInput.inputsyVelocity;
  snake.headXPosition += gameState.gameInput.xVelocity;
  snake.headYPosition += gameState.gameInput.yVelocity;
};

const drawApple = () => {
  ctx.fillStyle = apple.color;
  ctx.fillRect(
    apple.appleXPosition * gameState.tileSize,
    apple.appleYPosition * gameState.tileSize,
    gameState.tileSize,
    gameState.tileSize
  );
};

const checkAppleCollision = () => {
  if (
    apple.appleXPosition === snake.headXPosition &&
    apple.appleYPosition === snake.headYPosition
  ) {
    const newRandomPosition = Math.floor(Math.random() * gameState.tileSize);
    apple.appleXPosition = newRandomPosition;
    apple.appleYPosition = newRandomPosition;
    growTailByOneTile();
    gameState.addOnePoint();
    audios.gulpSound.play();
    snake.raiseSpeed(0.8);
    audios.gameMainAudio.playbackRate += 0.01;
  }
};

const growTailByOneTile = () => {
  snake.tailLength++;
};

startGameLoop();
