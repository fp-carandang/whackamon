let timerInterval;
let moleInterval;
const timerBaseInterval = 1000;
let moleBaseInterval = 1000;
let lastBox = -1;
let score = 0;
let initialTime = 50;
let remainingTime = 50;
let gameRunning = false;
let level = 1;
let startButton;
let scoreRequirement = 25;
let requiredScoreShown = false;
let isMusicPlaying = true;
const musicButtonMainScreen = document.getElementById('toggle-music-button-main-screen');
const musicButtonMainGame = document.getElementById('toggle-music-button-main-game');
const imgElementMainScreen = musicButtonMainScreen.querySelector('img');
const imgElementMainGame = musicButtonMainGame.querySelector('img');
const mainScreen = document.getElementById('main-screen');
const mainGame = document.getElementById('main-game');
const mainBackgroundMusic = new Audio('audio/main-screen-theme.wav');
const gameBackgroundMusic = new Audio('audio/main-game-theme.wav');

document.addEventListener("DOMContentLoaded", function() {
  const soundDialog = document.getElementById('sound-dialog');
  const mainScreen = document.getElementById('main-screen');
  soundDialog.classList.remove('hidden');
  mainScreen.classList.add('hidden');
});

function startGameWithMusic() {
  const soundDialog = document.getElementById('sound-dialog');
  const mainScreen = document.getElementById('main-screen');
  soundDialog.classList.add('hidden');
  mainBackgroundMusic.play();
  mainScreen.classList.remove('hidden');
}

function startGame() {
  const mainScreen = document.getElementById('main-screen');
  const mainGame = document.getElementById('main-game');
  const messageScreen = document.getElementById('message-screen');
  mainScreen.classList.add('hidden');
  mainGame.classList.remove('hidden');
  messageScreen.classList.add('hidden');
  mainBackgroundMusic.pause();
  gameBackgroundMusic.currentTime = 0;
  gameBackgroundMusic.play();
  startButton = document.getElementById('start-button');
  startButton.innerText = 'Start';
  startButton.onclick = startGameHandler;
  displayLevelMessage();
  messageDisplayed = false;
}

function createGameGrid() {
  const gameGridElement = document.getElementById('game-grid');
  gameGridElement.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const box = document.createElement('div');
    box.classList.add('box');
    box.setAttribute('id', `box_${i}`);
    box.innerText = ' ';
    box.addEventListener('click', boxClickHandler);
    gameGridElement.appendChild(box);
  }
}

function startGameHandler() {
  if (!gameRunning) {
    createGameGrid();
    updateGameUI();
    startMoles();
    startButton.innerText = 'Reset';
    startButton.onclick = resetGame;
    gameRunning = true;
  }
}

function startTimer() {
  const timerElement = document.getElementById('timer');
  remainingTime = initialTime;
  timerInterval = setInterval(() => {
    if (gameRunning) {
      remainingTime--;
      timerElement.innerText = `Time: ${remainingTime}`;
      if (remainingTime <= 0) {
        clearInterval(timerInterval);
        gameRunning = false;
        checkScore();
      }
    }
  }, timerBaseInterval);
}

function checkScore() {
  if (score >= getScoreRequirement()) {
    if (!requiredScoreShown) {
      const dialogBox = createDialogBox();
      const message = createDialogMessage(
        'Congratulations! You qualify for the next level. Do you wish to proceed?'
      );
      const congratsSound = new Audio('audio/level-advancement.wav');
      gameBackgroundMusic.pause();
      congratsSound.currentTime = 0
      congratsSound.play();
      const yesButton = createDialogButton('Yes', () => {
        setupNextLevel();
        congratsSound.pause();
        gameBackgroundMusic.currentTime = 0
        gameBackgroundMusic.play();
        document.body.removeChild(dialogBox);
      });
      const noButton = createDialogButton('No', () => {
        document.body.removeChild(dialogBox);
        const gameOverDialogBox = createDialogBox();
        const gameOverMessage = createDialogMessage('Game Over', 'game-over-msg');
        const gameOverSound = new Audio('audio/game-over-music.wav');
        congratsSound.pause();
        gameOverSound.currentTime = 0
        gameOverSound.play();
        const returnButton = createDialogButton('', () => {
          document.body.removeChild(gameOverDialogBox);
          returnToMainScreen();
          gameOverSound.pause();
        }, 'images/return-to-ms-btn.png', 'return-button');
        appendToDialogBox(gameOverDialogBox, gameOverMessage, returnButton);
      });
      appendToDialogBox(dialogBox, message, yesButton, noButton);
      requiredScoreShown = true;
    }
  } else {
    const dialogBox = createDialogBox();
    const message = createDialogMessage('Sorry, your score is not enough to proceed to the next level.');
    gameBackgroundMusic.pause();
    instructionsMusic.currentTime = 0
    instructionsMusic.play();
    const okButton = createDialogButton('OK', () => {
      document.body.removeChild(dialogBox);
      const gameOverDialogBox = createDialogBox();
      const gameOverMessage = createDialogMessage('Game Over', 'game-over-msg');
      const gameOverSound = new Audio('audio/game-over-music.wav');
      instructionsMusic.pause();
      gameOverSound.currentTime = 0
      gameOverSound.play();
      const returnButton = createDialogButton('', () => {
        document.body.removeChild(gameOverDialogBox);
        returnToMainScreen();
        gameOverSound.pause();
      }, 'images/return-to-ms-btn.png', 'return-button');
      appendToDialogBox(gameOverDialogBox, gameOverMessage, returnButton);
    });
    const tryAgainButton = createDialogButton('Try Again', () => {
      resetGame();
      instructionsMusic.pause();
      gameBackgroundMusic.currentTime = 0
      gameBackgroundMusic.play();
      document.body.removeChild(dialogBox);
    });
    appendToDialogBox(dialogBox, message, okButton, tryAgainButton);
  }
}

function setupNextLevel() {
  gameRunning = false;
  score = 0;
  level++;
  requiredScoreShown = false;
  scoreRequirement = getScoreRequirement();
  initialTime = Math.max(10, 50 - (level - 1) * 10);
  remainingTime = initialTime;
  createGameGrid();
  updateGameUI();
  startButton.innerText = 'Start';
  startButton.onclick = startGameHandler;
  clearInterval(moleInterval);
  clearInterval(timerInterval);
  displayLevelMessage();
}

function startMoles() {
  if (!gameRunning) {
    gameRunning = true;
    remainingTime = initialTime;
    startTimer();
    moleInterval = setInterval(() => {
      if (gameRunning) {
        let randomBox;
        do {
          randomBox = Math.floor(Math.random() * 9);
        } while (randomBox === lastBox);

        const box = document.getElementById(`box_${randomBox}`);
        if (box.innerText.trim() === '') {
          box.style.backgroundImage = "url('images/diglett.png')";
          box.innerText = ' ';
          setTimeout(() => {
            if (box.style.backgroundImage.includes('images/diglett.png')) {
              box.style.backgroundImage = 'none';
              box.innerText = ' ';
            }
          }, moleBaseInterval - (level - 1) * 100);
        }
        lastBox = randomBox;
      }
    }, moleBaseInterval - (level - 1) * 100);
  }
}

function resetGame() {
  clearInterval(timerInterval);
  clearInterval(moleInterval);
  gameRunning = false;
  remainingTime = 50;
  score = 0;
  level = 1;
  scoreRequirement = 25;
  initialTime = 50;
  moleBaseInterval = 1000;
  createGameGrid();
  updateGameUI();
  startButton.innerText = 'Start';
  startButton.onclick = startGameHandler;
  gameBackgroundMusic.currentTime = 0;
}

function getScoreRequirement() {
  if (level <= 5) {
    return 25 - (level - 1) * 5;
  } else {
    return 5;
  }
}

function createDialogBox() {
  const dialogBox = document.createElement('div');
  dialogBox.classList.add('dialog-box');
  return dialogBox;
}

function createDialogMessage(text, id) {
  const message = document.createElement('p');
  message.textContent = text;
  if (id) {
    message.id = id;
  }
  return message;
}

function createDialogButton(text, onclick, imgSrc, id) {
  const button = document.createElement('button');
  button.onclick = onclick;
  if (text) {
    button.innerText = text;
  }
  if (imgSrc) {
    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = text;
    button.appendChild(img);
  }
  if (id) {
    button.id = id;
  }
  return button;
}

function appendToDialogBox(dialogBox, ...elements) {
  elements.forEach(element => {
    dialogBox.appendChild(element);
  });
  document.body.appendChild(dialogBox);
}

function boxClickHandler(event) {
  const box = event.target;
  if (box.style.backgroundImage.includes("images/diglett.png")) {
    box.style.backgroundImage = "none";
    score++;
    document.getElementById('score').innerText = `Score: ${score}`;
    const hitSound = new Audio('audio/diglett-sfx.wav');
    hitSound.play();
    if (score >= scoreRequirement) {
      checkScore();
    }
  }
}

function updateGameUI() {
  const timerElement = document.getElementById('timer');
  const scoreElement = document.getElementById('score');
  const levelElement = document.getElementById('level');
  if (timerElement && scoreElement && levelElement) {
    timerElement.innerText = `Time: ${remainingTime}`;
    scoreElement.innerText = `Score: ${score}`;
    levelElement.innerText = `Level: ${level}`;
    }
}

function returnToMainScreen() {
  const mainScreen = document.getElementById('main-screen');
  const mainGame = document.getElementById('main-game');
  const instructionsScreen = document.getElementById('instructions-screen');
  const startButton = document.getElementById('start-button');
  const messageScreen = document.getElementById('message-screen');

  if (!messageScreen.classList.contains('hidden')) {
    messageScreen.classList.add('hidden');
  }

  mainScreen.classList.remove('hidden');
  mainGame.classList.add('hidden');
  instructionsScreen.classList.add('hidden');
  mainBackgroundMusic.currentTime = 0;
  mainBackgroundMusic.play();
  instructionsMusic.pause();
  gameBackgroundMusic.pause();
  currentPage = 0;
  updateInstructions();
  clearInterval(moleInterval);
  clearInterval(timerInterval);
  gameRunning = false;
  score = 0;
  remainingTime = 50;
  initialTime = 50;
  level = 1;
  scoreRequirement = 25;
  startButton.innerText = 'Start';
  startButton.onclick = startGameHandler;
  updateGameUI();
}

function showInstructions() {
  const mainScreen = document.getElementById('main-screen');
  const instructionsScreen = document.getElementById('instructions-screen');
  mainScreen.classList.add('hidden');
  instructionsScreen.classList.remove('hidden');
  mainBackgroundMusic.pause();
  instructionsMusic.currentTime = 0;
  instructionsMusic.play()
  updateButtons();
}

let currentPage = 0;

const instructionPages = [
    {
      imgSrc: 'images/instruction-img-1.png',
      text: 'Whack as many Diglets as you can within the time limit. Each successful hit earns you a point! *Hint* Aim for the nose!'
    },{
      imgSrc: 'images/instruction-img-2.png',
      text: 'Remember to aim carefully to maximize your score. Reach the required score and you can move to the next level!'
    },{
      imgSrc: 'images/instruction-img-3.png',
      text: 'In every succeeding level, Digletts will appear and disappear faster than the previous level. Time limit becames shorter too!'
    },{
      imgSrc: 'images/instruction-img-4.png',
      text: 'Failure to meet the required score to advance will be game over.'
    },
  ];

function swivelLeft() {
  if (currentPage > 0) {
    currentPage--;
    updateInstructions();
  }
}
    
function swivelRight() {
  if (currentPage < instructionPages.length - 1) {
    currentPage++;
    updateInstructions();
  }
}

function updateButtons() {
  const leftButton = document.getElementById('left-button');
  const rightButton = document.getElementById('right-button');
  
  if (currentPage === 0) {
    const img = leftButton.querySelector('img');
    img.setAttribute('src', 'images/left-disabled-btn.png');
  } else {
    const img = leftButton.querySelector('img');
    img.setAttribute('src', 'images/left-btn.png');
  }
  
  if (currentPage === instructionPages.length - 1) {
    const img = rightButton.querySelector('img');
    img.setAttribute('src', 'images/right-disabled-btn.png');
  } else {
    const img = rightButton.querySelector('img');
    img.setAttribute('src', 'images/right-btn.png');
  }
}  
    
function updateInstructions() {
  const instructionsScreen = document.getElementById('instructions-screen');
  const instructionImg = document.getElementById('instruction-img');
  const instructionsText = document.querySelector('#instructions-screen p');
  instructionImg.src = instructionPages[currentPage].imgSrc;
  instructionsText.textContent = instructionPages[currentPage].text;
  updateButtons();
}

let messageDisplayed = false;

function displayLevelMessage() {
  const messageScreen = document.getElementById('message-screen');
  const message = document.getElementById('message');
  const currentLevel = level;
  const currentScoreRequirement = getScoreRequirement();
  const currentSpeed = (1000 - (currentLevel - 1) * 100) / 1000;
  const currentTime = remainingTime;

  message.innerText = `Level ${currentLevel} \nScore Requirement: ${currentScoreRequirement} \nMole Speed: ${currentSpeed}s \nTime: ${currentTime}s`;

  const existingOkButton = document.getElementById('ok-button');
  if (existingOkButton) {
    existingOkButton.parentNode.removeChild(existingOkButton);
  }

  const okButton = createDialogButton('OK', () => {
    messageScreen.classList.add('hidden');
    startGameHandler();
  }, null, 'ok-button');

  appendToDialogBox(messageScreen, okButton);
  messageScreen.classList.remove('hidden');
}
  
function closeMessageScreen() {
  const messageScreen = document.getElementById('message-screen');
  messageScreen.classList.add('hidden');
}

function toggleMusicMainScreen() {
  if (isMusicPlaying) {
    pauseAllMusic();
    updateMusicButton(imgElementMainScreen, 'images/music-off-btn.png');
  } else {
    playActiveMusicMainScreen(imgElementMainScreen);
    updateMusicButton(imgElementMainScreen, 'images/music-on-btn.png');
  }
  isMusicPlaying = !isMusicPlaying;
}  

function toggleMusicMainGame() {
  if (isMusicPlaying) {
    pauseAllMusic();
    updateMusicButton(imgElementMainGame, 'images/music-off-btn.png');
  } else {
    playActiveMusicMainGame(imgElementMainGame);
    updateMusicButton(imgElementMainGame, 'images/music-on-btn.png');
  }
  isMusicPlaying = !isMusicPlaying;
}

function pauseAllMusic() {
  mainBackgroundMusic.pause();
  gameBackgroundMusic.pause();
}

function playActiveMusicMainScreen(imgElement) {
  if (mainScreen && !mainScreen.classList.contains('hidden')) {
    if (mainBackgroundMusic.paused) {
      mainBackgroundMusic.play();
      updateMusicButton(imgElement, 'images/music-on-btn.png');
    } else {
      mainBackgroundMusic.pause();
      updateMusicButton(imgElement, 'images/music-off-btn.png');
    }
  }
}

function playActiveMusicMainGame(imgElement) {
  if (mainGame && !mainGame.classList.contains('hidden')) {
    if (gameBackgroundMusic.paused) {
      gameBackgroundMusic.play();
      updateMusicButton(imgElement, 'images/music-on-btn.png');
    } else {
      gameBackgroundMusic.pause();
      updateMusicButton(imgElement, 'images/music-off-btn.png');
    }
  }
}

function updateMusicButton(imgElement, src) {
  if (imgElement) {
    imgElement.src = src;
    imgElement.alt = 'music-button';
  } else {
    const img = new Image();
    img.src = src;
    img.alt = 'music-button';
    musicButton.appendChild(img);
  }
}