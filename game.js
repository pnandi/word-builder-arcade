// Word Builder Arcade - Main Game Logic

// ===== Game Configuration =====
const CONFIG = {
    difficulties: {
        beginner: { fallSpeed: 0.3, spawnRate: 2500, gameTime: 180 },
        normal: { fallSpeed: 0.6, spawnRate: 1800, gameTime: 150 },
        advanced: { fallSpeed: 1.0, spawnRate: 1200, gameTime: 120 }
    },
    scoring: {
        3: 10,
        4: 25,
        5: 50,
        6: 100
    },
    letterColors: ['letter-red', 'letter-blue', 'letter-green', 'letter-purple', 
                   'letter-orange', 'letter-pink', 'letter-teal'],
    // Weighted letter distribution (vowels appear more frequently)
    letters: 'AAAAAAEEEEEEIIIIOOOOUUUBCCDDDFFGGHHJKLLMMNNPPQRRRSSSTTTTVWXYZ'
};

// ===== Game State =====
let gameState = {
    isPlaying: false,
    isPaused: false,
    score: 0,
    highScore: parseInt(localStorage.getItem('wordBuilderHighScore')) || 0,
    combo: 1,
    bestCombo: 1,
    timeRemaining: 150,
    wordsFound: 0,
    longestWord: '',
    difficulty: 'normal',
    currentWord: [],
    fallingLetters: [],
    letterIdCounter: 0
};

// ===== DOM Elements =====
const elements = {
    startScreen: document.getElementById('start-screen'),
    gameScreen: document.getElementById('game-screen'),
    gameoverScreen: document.getElementById('gameover-screen'),
    startBtn: document.getElementById('start-btn'),
    startHighScore: document.getElementById('start-high-score'),
    lettersContainer: document.getElementById('letters-container'),
    currentWord: document.getElementById('current-word'),
    submitBtn: document.getElementById('submit-btn'),
    clearBtn: document.getElementById('clear-btn'),
    pauseBtn: document.getElementById('pause-btn'),
    pauseIcon: document.getElementById('pause-icon'),
    quitBtn: document.getElementById('quit-btn'),
    pauseOverlay: document.getElementById('pause-overlay'),
    resumeBtn: document.getElementById('resume-btn'),
    scoreDisplay: document.getElementById('score'),
    timerDisplay: document.getElementById('timer'),
    comboDisplay: document.getElementById('combo'),
    feedback: document.getElementById('feedback'),
    finalScore: document.getElementById('final-score'),
    wordsFoundDisplay: document.getElementById('words-found'),
    bestComboDisplay: document.getElementById('best-combo'),
    longestWordDisplay: document.getElementById('longest-word'),
    newHighScore: document.getElementById('new-high-score'),
    playAgainBtn: document.getElementById('play-again-btn'),
    homeBtn: document.getElementById('home-btn'),
    confetti: document.getElementById('confetti'),
    difficultyBtns: document.querySelectorAll('.difficulty-btn')
};

// ===== Audio Context for Sound Effects =====
let audioContext = null;

function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playSound(type) {
    if (!audioContext) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        const now = audioContext.currentTime;
        
        switch(type) {
            case 'click':
                oscillator.frequency.value = 600;
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.1, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                oscillator.start(now);
                oscillator.stop(now + 0.1);
                break;
            case 'success':
                oscillator.frequency.value = 523.25; // C5
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.2, now);
                oscillator.frequency.setValueAtTime(659.25, now + 0.1); // E5
                oscillator.frequency.setValueAtTime(783.99, now + 0.2); // G5
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
                oscillator.start(now);
                oscillator.stop(now + 0.4);
                break;
            case 'error':
                oscillator.frequency.value = 200;
                oscillator.type = 'sawtooth';
                gainNode.gain.setValueAtTime(0.1, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                oscillator.start(now);
                oscillator.stop(now + 0.2);
                break;
            case 'combo':
                oscillator.frequency.value = 800;
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.15, now);
                oscillator.frequency.setValueAtTime(1000, now + 0.1);
                oscillator.frequency.setValueAtTime(1200, now + 0.2);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                oscillator.start(now);
                oscillator.stop(now + 0.3);
                break;
        }
    } catch (e) {
        // Audio failed, continue silently
        console.log('Audio error:', e);
    }
}

// ===== Utility Functions =====
function getRandomLetter() {
    return CONFIG.letters[Math.floor(Math.random() * CONFIG.letters.length)];
}

function getRandomColor() {
    return CONFIG.letterColors[Math.floor(Math.random() * CONFIG.letterColors.length)];
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function getWordScore(wordLength) {
    if (wordLength >= 6) return CONFIG.scoring[6];
    return CONFIG.scoring[wordLength] || 0;
}

// ===== Screen Management =====
function showScreen(screenId) {
    [elements.startScreen, elements.gameScreen, elements.gameoverScreen].forEach(screen => {
        if (screen) screen.classList.add('hidden');
    });
    
    if (screenId === 'start' && elements.startScreen) elements.startScreen.classList.remove('hidden');
    else if (screenId === 'game' && elements.gameScreen) elements.gameScreen.classList.remove('hidden');
    else if (screenId === 'gameover' && elements.gameoverScreen) elements.gameoverScreen.classList.remove('hidden');
}

// ===== Letter Management =====
function createFallingLetter() {
    if (!elements.lettersContainer) return;
    
    const letter = getRandomLetter();
    const color = getRandomColor();
    const id = gameState.letterIdCounter++;
    
    const gameArea = elements.lettersContainer.getBoundingClientRect();
    const letterSize = window.innerWidth < 480 ? 44 : (window.innerWidth < 768 ? 50 : 60);
    const availableWidth = Math.max(gameArea.width - letterSize, 100);
    const x = Math.random() * availableWidth;
    
    const letterData = {
        id,
        letter,
        color,
        x,
        y: -letterSize,
        selected: false
    };
    
    gameState.fallingLetters.push(letterData);
    
    const letterEl = document.createElement('div');
    letterEl.className = `falling-letter ${color}`;
    letterEl.textContent = letter;
    letterEl.dataset.id = id;
    letterEl.style.left = `${x}px`;
    letterEl.style.top = `${letterData.y}px`;
    
    letterEl.addEventListener('click', () => selectLetter(id));
    letterEl.addEventListener('touchstart', (e) => {
        e.preventDefault();
        selectLetter(id);
    }, { passive: false });
    
    elements.lettersContainer.appendChild(letterEl);
}

function selectLetter(id) {
    const letterData = gameState.fallingLetters.find(l => l.id === id);
    if (!letterData || letterData.selected) return;
    
    initAudio();
    playSound('click');
    
    letterData.selected = true;
    gameState.currentWord.push(letterData);
    
    const letterEl = elements.lettersContainer.querySelector(`[data-id="${id}"]`);
    if (letterEl) {
        letterEl.classList.add('selected');
    }
    
    updateCurrentWordDisplay();
    updateSubmitButton();
}

function updateCurrentWordDisplay() {
    if (gameState.currentWord.length === 0) {
        elements.currentWord.innerHTML = '<span class="placeholder-text">Click letters to build a word!</span>';
    } else {
        elements.currentWord.innerHTML = gameState.currentWord.map(l => 
            `<span class="word-letter ${l.color}">${l.letter}</span>`
        ).join('');
    }
}

function updateSubmitButton() {
    elements.submitBtn.disabled = gameState.currentWord.length < 3;
}

function clearCurrentWord() {
    gameState.currentWord.forEach(letterData => {
        letterData.selected = false;
        const letterEl = elements.lettersContainer.querySelector(`[data-id="${letterData.id}"]`);
        if (letterEl) {
            letterEl.classList.remove('selected');
        }
    });
    
    gameState.currentWord = [];
    updateCurrentWordDisplay();
    updateSubmitButton();
}

function removeSelectedLetters() {
    gameState.currentWord.forEach(letterData => {
        const letterEl = elements.lettersContainer.querySelector(`[data-id="${letterData.id}"]`);
        if (letterEl) {
            letterEl.classList.add('removing');
            setTimeout(() => letterEl.remove(), 400);
        }
        
        const index = gameState.fallingLetters.findIndex(l => l.id === letterData.id);
        if (index > -1) {
            gameState.fallingLetters.splice(index, 1);
        }
    });
    
    gameState.currentWord = [];
    updateCurrentWordDisplay();
    updateSubmitButton();
}

// ===== Word Submission =====
function submitWord() {
    const word = gameState.currentWord.map(l => l.letter).join('').toLowerCase();
    
    if (word.length < 3) {
        showFeedback('Word must be at least 3 letters!', 'error');
        return;
    }
    
    if (isValidWord(word)) {
        // Valid word!
        const baseScore = getWordScore(word.length);
        const finalScore = baseScore * gameState.combo;
        
        gameState.score += finalScore;
        gameState.wordsFound++;
        gameState.combo++;
        
        if (gameState.combo > gameState.bestCombo) {
            gameState.bestCombo = gameState.combo;
        }
        
        if (word.length > gameState.longestWord.length) {
            gameState.longestWord = word.toUpperCase();
        }
        
        updateScoreDisplay();
        updateComboDisplay();
        
        playSound('success');
        if (gameState.combo > 2) {
            playSound('combo');
        }
        
        showFeedback(`+${finalScore} points! ${word.toUpperCase()} ✓`, 'success');
        createCelebration();
        showScorePopup(finalScore);
        
        removeSelectedLetters();
    } else {
        // Invalid word
        gameState.combo = 1;
        updateComboDisplay();
        
        playSound('error');
        showFeedback(`"${word.toUpperCase()}" is not a valid word!`, 'error');
        clearCurrentWord();
    }
}

function showFeedback(message, type) {
    elements.feedback.textContent = message;
    elements.feedback.className = `feedback ${type}`;
    
    setTimeout(() => {
        elements.feedback.textContent = '';
        elements.feedback.className = 'feedback';
    }, 2000);
}

// ===== Visual Effects =====
function createCelebration() {
    const emojis = ['🎉', '⭐', '✨', '🌟', '💫', '🎊'];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    
    const celebration = document.createElement('div');
    celebration.className = 'celebration';
    celebration.textContent = emoji;
    celebration.style.left = `${Math.random() * 60 + 20}%`;
    celebration.style.top = `${Math.random() * 30 + 40}%`;
    
    document.body.appendChild(celebration);
    
    setTimeout(() => celebration.remove(), 1000);
}

function showScorePopup(score) {
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.textContent = `+${score}`;
    popup.style.left = `${Math.random() * 40 + 30}%`;
    popup.style.top = '60%';
    
    document.body.appendChild(popup);
    
    setTimeout(() => popup.remove(), 1000);
}

function createConfetti() {
    const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A855F7', '#3B82F6', '#EC4899', '#22C55E'];
    
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = `${Math.random() * 2}s`;
        confetti.style.animationDuration = `${2 + Math.random() * 2}s`;
        
        elements.confetti.appendChild(confetti);
    }
    
    setTimeout(() => {
        elements.confetti.innerHTML = '';
    }, 4000);
}

// ===== UI Updates =====
function updateScoreDisplay() {
    elements.scoreDisplay.textContent = gameState.score;
}

function updateTimerDisplay() {
    elements.timerDisplay.textContent = formatTime(gameState.timeRemaining);
    
    const timerContainer = elements.timerDisplay.closest('.timer-display');
    if (gameState.timeRemaining <= 30) {
        timerContainer.classList.add('warning');
    } else {
        timerContainer.classList.remove('warning');
    }
}

function updateComboDisplay() {
    elements.comboDisplay.textContent = `x${gameState.combo}`;
}

// ===== Game Loop =====
let gameLoopId = null;
let spawnIntervalId = null;
let timerIntervalId = null;
let lastTime = 0;

function gameLoop(timestamp) {
    if (!gameState.isPlaying || gameState.isPaused) {
        gameLoopId = requestAnimationFrame(gameLoop);
        return;
    }
    
    if (!elements.lettersContainer) {
        gameLoopId = requestAnimationFrame(gameLoop);
        return;
    }
    
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
    const settings = CONFIG.difficulties[gameState.difficulty];
    const gameArea = elements.lettersContainer.getBoundingClientRect();
    
    // Update falling letters
    gameState.fallingLetters.forEach(letterData => {
        if (!letterData.selected) {
            letterData.y += settings.fallSpeed * (deltaTime / 16);
            
            const letterEl = elements.lettersContainer.querySelector(`[data-id="${letterData.id}"]`);
            if (letterEl) {
                letterEl.style.top = `${letterData.y}px`;
            }
            
            // Remove letters that have fallen off screen
            if (letterData.y > gameArea.height) {
                if (letterEl) letterEl.remove();
                const index = gameState.fallingLetters.findIndex(l => l.id === letterData.id);
                if (index > -1) {
                    gameState.fallingLetters.splice(index, 1);
                }
            }
        }
    });
    
    gameLoopId = requestAnimationFrame(gameLoop);
}

function startGame() {
    console.log('Starting game...');
    initAudio();
    
    // Reset game state
    const settings = CONFIG.difficulties[gameState.difficulty];
    if (!settings) {
        console.error('Invalid difficulty:', gameState.difficulty);
        return;
    }
    
    gameState.isPlaying = true;
    gameState.isPaused = false;
    gameState.score = 0;
    gameState.combo = 1;
    gameState.bestCombo = 1;
    gameState.timeRemaining = settings.gameTime;
    gameState.wordsFound = 0;
    gameState.longestWord = '';
    gameState.currentWord = [];
    gameState.fallingLetters = [];
    gameState.letterIdCounter = 0;
    
    // Clear UI
    if (elements.lettersContainer) elements.lettersContainer.innerHTML = '';
    updateScoreDisplay();
    updateTimerDisplay();
    updateComboDisplay();
    updateCurrentWordDisplay();
    updateSubmitButton();
    if (elements.feedback) elements.feedback.textContent = '';
    
    // Show game screen
    showScreen('game');
    console.log('Game screen shown');
    
    // Start game loop
    lastTime = performance.now();
    gameLoopId = requestAnimationFrame(gameLoop);
    
    // Start spawning letters immediately and then on interval
    setTimeout(() => {
        createFallingLetter();
        console.log('First letter created');
    }, 100);
    
    spawnIntervalId = setInterval(() => {
        if (!gameState.isPaused && gameState.isPlaying) {
            createFallingLetter();
        }
    }, settings.spawnRate);
    
    // Start timer
    timerIntervalId = setInterval(() => {
        if (!gameState.isPaused && gameState.isPlaying) {
            gameState.timeRemaining--;
            updateTimerDisplay();
            
            if (gameState.timeRemaining <= 0) {
                endGame();
            }
        }
    }, 1000);
    
    console.log('Game started successfully');
}

function endGame() {
    gameState.isPlaying = false;
    
    // Stop all intervals
    if (gameLoopId) cancelAnimationFrame(gameLoopId);
    if (spawnIntervalId) clearInterval(spawnIntervalId);
    if (timerIntervalId) clearInterval(timerIntervalId);
    
    // Check for high score
    const isNewHighScore = gameState.score > gameState.highScore;
    if (isNewHighScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('wordBuilderHighScore', gameState.score);
    }
    
    // Update game over screen
    elements.finalScore.textContent = gameState.score;
    elements.wordsFoundDisplay.textContent = gameState.wordsFound;
    elements.bestComboDisplay.textContent = `x${gameState.bestCombo}`;
    elements.longestWordDisplay.textContent = gameState.longestWord || '-';
    
    if (isNewHighScore) {
        elements.newHighScore.classList.remove('hidden');
        createConfetti();
    } else {
        elements.newHighScore.classList.add('hidden');
    }
    
    // Show game over screen
    showScreen('gameover');
}

function togglePause() {
    gameState.isPaused = !gameState.isPaused;
    
    if (gameState.isPaused) {
        elements.pauseOverlay.classList.remove('hidden');
        elements.pauseIcon.textContent = '▶️';
    } else {
        elements.pauseOverlay.classList.add('hidden');
        elements.pauseIcon.textContent = '⏸️';
        lastTime = performance.now();
    }
}

function goHome() {
    gameState.isPlaying = false;
    
    if (gameLoopId) cancelAnimationFrame(gameLoopId);
    if (spawnIntervalId) clearInterval(spawnIntervalId);
    if (timerIntervalId) clearInterval(timerIntervalId);
    
    if (elements.startHighScore) {
        elements.startHighScore.textContent = gameState.highScore;
    }
    showScreen('start');
}

function quitGame() {
    // Confirm before quitting
    if (gameState.score > 0) {
        const confirmed = confirm('Are you sure you want to quit? Your progress will be lost!');
        if (!confirmed) return;
    }
    
    goHome();
}

// ===== Event Listeners =====
function initEventListeners() {
    console.log('Setting up event listeners...');
    
    // Difficulty selection
    if (elements.difficultyBtns) {
        elements.difficultyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                elements.difficultyBtns.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                gameState.difficulty = btn.dataset.difficulty;
                console.log('Difficulty set to:', gameState.difficulty);
            });
        });
    }
    
    // Start button
    if (elements.startBtn) {
        elements.startBtn.addEventListener('click', () => {
            console.log('Start button clicked!');
            startGame();
        });
    }
    
    // Submit button
    if (elements.submitBtn) {
        elements.submitBtn.addEventListener('click', submitWord);
    }
    
    // Clear button
    if (elements.clearBtn) {
        elements.clearBtn.addEventListener('click', clearCurrentWord);
    }
    
    // Pause button
    if (elements.pauseBtn) {
        elements.pauseBtn.addEventListener('click', togglePause);
    }
    
    // Quit button
    if (elements.quitBtn) {
        elements.quitBtn.addEventListener('click', quitGame);
    }
    
    // Resume button
    if (elements.resumeBtn) {
        elements.resumeBtn.addEventListener('click', togglePause);
    }
    
    // Play again button
    if (elements.playAgainBtn) {
        elements.playAgainBtn.addEventListener('click', startGame);
    }
    
    // Home button
    if (elements.homeBtn) {
        elements.homeBtn.addEventListener('click', goHome);
    }
    
    console.log('Event listeners ready');
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (gameState.isPlaying && !gameState.isPaused) {
            if (e.key === 'Enter') {
                submitWord();
            } else if (e.key === 'Escape' || e.key === 'Backspace') {
                clearCurrentWord();
            } else if (e.key === ' ') {
                e.preventDefault();
                togglePause();
            }
        } else if (gameState.isPlaying && gameState.isPaused) {
            if (e.key === ' ' || e.key === 'Escape') {
                e.preventDefault();
                togglePause();
            }
        }
    });
}

// ===== Initialize =====
function init() {
    console.log('Initializing Word Builder Arcade...');
    
    // Verify critical elements exist
    if (!elements.startBtn) {
        console.error('Start button not found!');
        return;
    }
    if (!elements.lettersContainer) {
        console.error('Letters container not found!');
        return;
    }
    
    if (elements.startHighScore) {
        elements.startHighScore.textContent = gameState.highScore;
    }
    
    initEventListeners();
    showScreen('start');
    console.log('Initialization complete');
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
