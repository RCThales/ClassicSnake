class Apple {
  color;
  appleXPosition;
  appleYPosition;

  constructor(color) {
    this.color = color;
  }

  randomizePositionInCanvas = () => {
    this.appleXPosition = Math.floor(Math.random() * gameState.tileSize);
    this.appleYPosition = Math.floor(Math.random() * gameState.tileSize);
  };
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

  resetSnake = () => {
    this.headXPosition = 10;
    this.headYPosition = 10;
    this.tailLength = 1;
    this.speed = 5;
    this.snakeParts = [];
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
  isGameStarted = false;
  isGameOver = false;

  constructor() {
    this.gameInput = new GameInput();
    this.tileSize = this.width / this.tileCount;
  }

  addOnePoint = () => {
    this.score++;
  };

  resetGameState = () => {
    this.score = 0;
    this.isGameStarted = true;
    this.gameInput.xVelocity = 0;
    this.gameInput.yVelocity = 0;
    this.gameInput.inputsxVelocity = 0;
    this.gameInput.inputsyVelocity = 0;
  };
}

const audios = {
  gameMainAudio: new Audio("./audio/themesong.wav"),
  deathAudio: new Audio("./audio/error.wav"),
  gulpSound: new Audio("./audio/gulp.mp3"),
};

const gameState = new GameState();
const snake = new Snake("orange", "green", 5, 10, 10, 1);
const apple = new Apple("red");

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const gameId = "1fd78042-fd6b-4f87-8dc0-94a2f1ef74dd";

canvas.width = gameState.width;
canvas.height = gameState.height;

window.addEventListener("load", () => {
  drawHighscoreOnMenu();
  audios.gameMainAudio.loop = true;
  audios.gameMainAudio.volume = 0.4;

  apple.randomizePositionInCanvas();
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
    if (!gameState.isGameStarted) {
      goToGame();
      gameState.isGameStarted = true;
    }

    if (gameState.isGameOver) {
      resetGame();
    } else {
      return;
    }
  }

  if (event.key.toLowerCase() === "l" || event.key === "Esc") {
    if (!gameState.isGameStarted) {
      goBackToMenu();
    }
    if (gameState.isGameOver) {
      goBackToMenu();
    }
  }
});

const hideGameMenu = () => {
  const gameMenu = document.querySelector(".startgame_menu");
  gameMenu.style.display = "none";
};

const goToGame = () => {
  hideGameMenu();
  audios.gameMainAudio.play();
};
const drawHighscoreOnMenu = () => {
  const highscoreTextElement = document.querySelector(".highscore");
  highscoreTextElement.innerHTML = getHighScore();
};

const startGameLoop = () => {
  moveSnake();
  checkIfGameOver();
  if (gameState.isGameOver) {
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
  const resetText = document.querySelector(".restartText");
  resetText.style.display = "flex";
};

const drawExitOption = () => {
  const exitText = document.querySelector(".exitText");
  exitText.style.display = "flex";
};

const resetGame = () => {
  gameState.isGameOver = false;
  cleanRestartText();
  cleanExitText();
  snake.resetSnake();
  gameState.resetGameState();
  resetMainAudioPlaybackRate();
  audios.gameMainAudio.play();
  clearScreen();
  startGameLoop();
};

const cleanExitText = () => {
  const exitText = document.querySelector(".exitText");
  exitText.style.display = "none";
};

const cleanRestartText = () => {
  const restartText = document.querySelector(".restartText");
  restartText.style.display = "none";
};

const resetMainAudioPlaybackRate = () => {
  audios.gameMainAudio.playbackRate = 1;
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

const checkIfGameOver = () => {
  if (isGameOnInitialStateOfPause()) {
    return false;
  }
  if (snakeAteItself()) {
    setGameOver();
  }
  if (snakeHitAWall()) {
    setGameOver();
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
  gameState.isGameOver = true;
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

const resetCanvas = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
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
    apple.randomizePositionInCanvas();
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
