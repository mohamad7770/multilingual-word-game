let table;
let wordPairs = [];
let currentWordIndex = 0;
let score = 0;
let timeLeft = 60;
let timerInterval;
let gameActive = false;
let currentDirection = "en-ru";

// عناصر DOM
let timerElement, scoreElement, wordDisplayElement, optionsContainerElement;
let startButton, leaderboardButton, leaderboardBody;
let clearLeaderboardButton, backToGameButton, playerNameInput;

function preload() {
  table = loadTable('words.csv', 'csv', 'header');
}

function setup() {
  noCanvas();

  if (!table || table.getRowCount() === 0) {
    alert('خطأ: ملف words.csv غير موجود أو فارغ!');
    return;
  }

  // تحويل البيانات إلى أزواج
  for (let r of table.getRows()) {
    if (!r || typeof r.getString !== 'function') continue;

    const src = r.getString('source_lang')?.trim();
    const tgt = r.getString('target_lang')?.trim();
    const srcTxt = r.getString('source_text')?.trim();
    const tgtTxt = r.getString('target_text')?.trim();

    if (!src || !tgt || !srcTxt || !tgtTxt) continue;

    if (
      (src === 'английский' && tgt === 'русский') ||
      (src === 'русский' && tgt === 'английский')
    ) {
      wordPairs.push({
        english: src === 'английский' ? srcTxt : tgtTxt,
        russian: src === 'русский' ? srcTxt : tgtTxt
      });
    }
  }

  if (wordPairs.length === 0) {
    alert('لا توجد كلمات إنجليزية-روسية في الملف!');
    return;
  }

  console.log(`تم تحميل ${wordPairs.length} زوجًا من الكلمات.`);

  initializeGame();
}

function initializeGame() {
  timerElement = select('#timer');
  scoreElement = select('#score');
  wordDisplayElement = select('#word-display');
  optionsContainerElement = select('#options-container');
  startButton = select('#start-btn');
  leaderboardButton = select('#leaderboard-btn');
  leaderboardBody = select('#leaderboard-body');
  clearLeaderboardButton = select('#clear-leaderboard-btn');
  backToGameButton = select('#back-to-game-btn');
  playerNameInput = select('#player-name');

  wordDisplayElement.html('Click "Start Game" to begin');

  startButton.mousePressed(() => {
    const playerName = playerNameInput.value().trim();
    if (!playerName) {
      alert("Please enter your name to start!");
      return;
    }
    initGame();
  });

  leaderboardButton.mousePressed(() => showLeaderboard(leaderboardBody));
  clearLeaderboardButton.mousePressed(clearLeaderboard);
  backToGameButton.mousePressed(backToGame);
}

function initGame() {
  score = 0;
  timeLeft = 60;
  currentWordIndex = 0;
  gameActive = true;

  scoreElement.html(`Score: ${score}`);
  timerElement.html(timeLeft);
  startButton.html("Restart Game");
  select('#name-input').style('display', 'none');
  select('#game-screen').removeClass('hidden');

  showNextWord();
  startTimer();
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    timerElement.html(timeLeft);
    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function showNextWord() {
  if (currentWordIndex >= wordPairs.length) {
    shuffleArray(wordPairs);
    currentWordIndex = 0;
  }

  const currentPair = wordPairs[currentWordIndex];
  currentDirection = random() > 0.5 ? "en-ru" : "ru-en";

  wordDisplayElement.html(
    currentDirection === "en-ru" ? currentPair.english : currentPair.russian
  );

  createOptions(currentPair);
}

function createOptions(correctPair) {
  optionsContainerElement.html('');

  const wrongOptions = [];
  while (wrongOptions.length < 3) {
    const randIdx = floor(random(wordPairs.length));
    if (randIdx !== currentWordIndex && !wrongOptions.includes(wordPairs[randIdx])) {
      wrongOptions.push(wordPairs[randIdx]);
    }
  }

  const allOptions = [correctPair, ...wrongOptions];
  shuffleArray(allOptions);

  allOptions.forEach(option => {
    const btn = createButton(
      currentDirection === "en-ru" ? option.russian : option.english
    );
    btn.parent(optionsContainerElement);
    btn.class('option');
    btn.mousePressed(() => checkAnswer(option === correctPair, btn));
  });
}

function checkAnswer(isCorrect, clickedBtn) {
  if (!gameActive) return;

  const buttons = selectAll('.option');
  const correctText = currentDirection === "en-ru"
    ? wordPairs[currentWordIndex].russian
    : wordPairs[currentWordIndex].english;

  buttons.forEach(btn => {
    if (btn.elt.textContent === correctText) {
      btn.addClass('correct');
    } else if (btn === clickedBtn && !isCorrect) {
      btn.addClass('incorrect');
    }
    btn.attribute('disabled', true);
  });

  if (isCorrect) {
    score += 10;
    scoreElement.html(`Score: ${score}`);
    setTimeout(() => {
      currentWordIndex++;
      showNextWord();
    }, 1500);
  } else {
    setTimeout(endGame, 1500);
  }
}

function endGame() {
  gameActive = false;
  clearInterval(timerInterval);
  saveScore();
  wordDisplayElement.html(`Game Over! Final Score: ${score}`);
  optionsContainerElement.html('');
  createButton('View Leaderboard')
    .parent(optionsContainerElement)
    .mousePressed(() => showLeaderboard(select('#leaderboard-body')));
  select('#name-input').style('display', 'block');
  select('#game-screen').addClass('hidden');
}

function saveScore() {
  const playerName = playerNameInput.value().trim() || 'Player';
  let leaderboard = getLeaderboard();
  leaderboard.push({ name: playerName, score, date: new Date().toLocaleDateString() });
  leaderboard.sort((a, b) => b.score - a.score);
  if (leaderboard.length > 10) leaderboard.pop();
  localStorage.setItem('wordGameLeaderboard', JSON.stringify(leaderboard));
}

function getLeaderboard() {
  const data = localStorage.getItem('wordGameLeaderboard');
  return data ? JSON.parse(data) : [];
}

function showLeaderboard(leaderboardBody) {
  select('#game-screen').addClass('hidden');
  select('#leaderboard-screen').removeClass('hidden');
  leaderboardBody.html('');

  const leaderboard = getLeaderboard();
  if (leaderboard.length === 0) {
    const row = createElement('tr');
    row.child(createElement('td', 'No scores yet').attribute('colspan', '4'));
    leaderboardBody.child(row);
  } else {
    leaderboard.forEach((entry, i) => {
      const row = createElement('tr');
      row.child(createElement('td', (i + 1).toString()));
      row.child(createElement('td', entry.name));
      row.child(createElement('td', entry.score.toString()));
      row.child(createElement('td', entry.date));
      leaderboardBody.child(row);
    });
  }
}

function clearLeaderboard() {
  if (confirm('Are you sure you want to clear the leaderboard?')) {
    localStorage.removeItem('wordGameLeaderboard');
    showLeaderboard(select('#leaderboard-body'));
  }
}

function backToGame() {
  select('#leaderboard-screen').addClass('hidden');
  select('#game-screen').removeClass('hidden');
  select('#name-input').style('display', 'block');
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = floor(random(i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}