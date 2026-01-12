// ============================================
// DICE MATCH GAMBLER - UPDATED WIN CONDITIONS
// ============================================

console.log("Starting Dice Match Gambler game...");

// ============================================
// GAME STATE
// ============================================

const gameState = {
    money: 1000,
    currentBet: 10,
    currentPrediction: null,
    selectedCard: null,
    diceResult: null,
    currentRound: 1,
    totalRounds: 3,
    cardsCount: 3,
    gameActive: true,
    canDouble: false,
    roundHistory: [],
    cardColors: ['red', 'blue', 'green', 'yellow']
};

// ============================================
// DOM ELEMENTS
// ============================================

const elements = {
    // Money & Round
    moneyDisplay: document.getElementById('moneyDisplay'),
    currentRound: document.getElementById('currentRound'),
    
    // Controls
    currentBet: document.getElementById('currentBet'),
    currentPrediction: document.getElementById('currentPrediction'),
    predictionButtons: document.getElementById('predictionButtons'),
    
    // Game Area
    dice: document.getElementById('dice'),
    diceResult: document.getElementById('diceResult'),
    gameStatus: document.getElementById('gameStatus'),
    resultDisplay: document.getElementById('resultDisplay'),
    cardsContainer: document.getElementById('cardsContainer'),
    cardsCount: document.getElementById('cardsCount'),
    selectedCardDisplay: document.getElementById('selectedCardDisplay'),
    historyList: document.getElementById('historyList'),
    
    // Buttons
    playButton: document.getElementById('playButton'),
    doubleButton: document.getElementById('doubleButton'),
    nextButton: document.getElementById('nextButton'),
    resetButton: document.getElementById('resetButton'),
    
    // Modal
    gameOverModal: document.getElementById('gameOverModal'),
    finalScore: document.getElementById('finalScore'),
    gameStats: document.getElementById('gameStats'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    
    // Rules
    rulesToggle: document.getElementById('rulesToggle'),
    rulesContent: document.getElementById('rulesContent')
};

console.log("DOM elements loaded:", Object.keys(elements).length);

// ============================================
// INITIALIZATION
// ============================================

function initGame() {
    console.log("Initializing game...");
    
    try {
        // Create prediction buttons (1-6)
        createPredictionButtons();
        
        // Generate initial cards
        generateCards();
        
        // Setup event listeners
        setupEventListeners();
        
        // Update UI
        updateUI();
        
        // Update game status
        updateGameStatus('Choose difficulty and place your bet!');
        
        console.log("Game initialized successfully!");
        
    } catch (error) {
        console.error("Error initializing game:", error);
        updateGameStatus('Error loading game. Please refresh.');
    }
}

// ============================================
// PREDICTION BUTTONS
// ============================================

function createPredictionButtons() {
    console.log("Creating prediction buttons...");
    
    elements.predictionButtons.innerHTML = '';
    
    for (let i = 1; i <= 6; i++) {
        const button = document.createElement('button');
        button.className = 'prediction-btn';
        button.textContent = i;
        button.dataset.number = i;
        
        button.addEventListener('click', () => {
            selectPrediction(i);
        });
        
        elements.predictionButtons.appendChild(button);
    }
    
    console.log("Prediction buttons created:", elements.predictionButtons.children.length);
}

// ============================================
// CARD GENERATION
// ============================================

function generateCards() {
    console.log(`Generating ${gameState.cardsCount} cards...`);
    
    // Clear container
    elements.cardsContainer.innerHTML = '';
    gameState.selectedCard = null;
    
    // Generate numbers for cards (1-6, can repeat)
    const cardNumbers = [];
    
    for (let i = 0; i < gameState.cardsCount; i++) {
        cardNumbers.push(Math.floor(Math.random() * 6) + 1);
    }
    
    console.log("Card numbers generated:", cardNumbers);
    
    // Create card elements
    for (let i = 0; i < gameState.cardsCount; i++) {
        const card = document.createElement('div');
        const color = gameState.cardColors[i % gameState.cardColors.length];
        const number = cardNumbers[i];
        
        card.className = `card ${color}`;
        card.dataset.number = number;
        card.dataset.index = i;
        
        // Front face (question mark)
        const front = document.createElement('div');
        front.className = 'card-front';
        front.innerHTML = '<i class="fas fa-question"></i>';
        
        // Back face (BIG NUMBER and dice symbol)
        const back = document.createElement('div');
        back.className = 'card-back';
        back.innerHTML = `
            <div class="card-number">${number}</div>
            <div class="card-symbol">${getDiceSymbol(number)}</div>
        `;
        
        card.appendChild(front);
        card.appendChild(back);
        
        // Click event
        card.addEventListener('click', () => {
            selectCard(card);
        });
        
        elements.cardsContainer.appendChild(card);
    }
    
    // Update cards count display
    elements.cardsCount.textContent = gameState.cardsCount;
    
    // Update selected card display
    updateSelectedCardDisplay();
    
    console.log("Cards generated successfully");
}

function getDiceSymbol(number) {
    // Dice face symbols
    const symbols = {
        1: '⚀',
        2: '⚁',
        3: '⚂',
        4: '⚃',
        5: '⚄',
        6: '⚅'
    };
    return symbols[number] || '•';
}

// ============================================
// GAME ACTIONS
// ============================================

function selectPrediction(number) {
    if (!gameState.gameActive) return;
    
    console.log(`Prediction selected: ${number}`);
    
    gameState.currentPrediction = number;
    
    // Update button states
    document.querySelectorAll('.prediction-btn').forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.dataset.number) === number) {
            btn.classList.add('active');
        }
    });
    
    updateUI();
    updateGameStatus(`Predicted ${number}! Now select a card.`);
}

function selectCard(cardElement) {
    if (!gameState.gameActive) return;
    if (!gameState.currentPrediction) {
        updateGameStatus('Please predict a number first!');
        return;
    }
    
    console.log(`Card selected (number hidden)`);
    
    // Remove selection from previous card
    if (gameState.selectedCard) {
        gameState.selectedCard.classList.remove('selected');
    }
    
    // Select new card (but DON'T show the number yet)
    gameState.selectedCard = cardElement;
    cardElement.classList.add('selected');
    
    // Update display to show "?" instead of the actual number
    updateSelectedCardDisplay();
    updateUI();
    updateGameStatus('Card selected! Ready to roll dice!');
}


function updateSelectedCardDisplay() {
    const preview = elements.selectedCardDisplay.querySelector('.card-preview');
    const info = elements.selectedCardDisplay.querySelector('.card-info');
    
    if (gameState.selectedCard) {
        // Show question mark before dice roll, actual number after
        const cardElement = gameState.selectedCard;
        const isFlipped = cardElement.classList.contains('flipped');
        
        if (isFlipped && gameState.diceResult !== null) {
            // After dice roll - show actual number
            const number = cardElement.dataset.number;
            preview.textContent = number;
            preview.style.backgroundColor = getCardColor(cardElement);
            preview.style.color = getCardColor(cardElement);
            info.innerHTML = `
                <p>Card #${parseInt(cardElement.dataset.index) + 1}</p>
                <p>Number: <strong>${number}</strong></p>
                <p class="hint">Card flipped after dice roll</p>
            `;
        } else {
            // Before dice roll - show question mark
            preview.textContent = '?';
            preview.style.backgroundColor = '#2d4263';
            preview.style.color = '#4cc9f0';
            info.innerHTML = `
                <p>Card #${parseInt(cardElement.dataset.index) + 1} selected</p>
                <p>Number: <strong>?</strong> (hidden)</p>
                <p class="hint">Will be revealed after dice roll</p>
            `;
        }
    } else {
        // No card selected
        preview.textContent = '?';
        preview.style.backgroundColor = '#2d4263';
        preview.style.color = '#4cc9f0';
        info.innerHTML = `
            <p>No card selected</p>
            <p class="hint">Click a card to select it</p>
        `;
    }
}


function getCardColor(cardElement) {
    const colorClasses = ['red', 'blue', 'green', 'yellow'];
    for (const color of colorClasses) {
        if (cardElement.classList.contains(color)) {
            return getColorCode(color);
        }
    }
    return '#2d4263';
}

function getColorCode(color) {
    const colors = {
        'red': '#ff6b6b',
        'blue': '#4cc9f0',
        'green': '#00b894',
        'yellow': '#fdcb6e'
    };
    return colors[color] || '#2d4263';
}

// ============================================
// DICE ROLL
// ============================================

function rollDice() {
    console.log("Rolling dice...");
    
    // Validation
    if (!gameState.gameActive) {
        updateGameStatus('Game is not active!');
        return;
    }
    
    if (!gameState.currentPrediction) {
        updateGameStatus('Please predict a number first!');
        return;
    }
    
    if (!gameState.selectedCard) {
        updateGameStatus('Please select a card first!');
        return;
    }
    
    if (gameState.money < gameState.currentBet) {
        updateGameStatus('Not enough money!');
        return;
    }
    
    // Deduct bet
    gameState.money -= gameState.currentBet;
    
    // Disable controls during roll
    gameState.gameActive = false;
    elements.playButton.disabled = true;
    
    // Animate dice
    animateDice();
    
    // Generate result after animation
    setTimeout(() => {
        // Random dice result 1-6
        gameState.diceResult = Math.floor(Math.random() * 6) + 1;
        
        // Stop animation and show result
        elements.dice.classList.remove('rolling');
        drawDiceFace(gameState.diceResult);
        elements.diceResult.textContent = gameState.diceResult;
        
        // FLIP THE CARD - this is when it reveals
        if (gameState.selectedCard) {
            gameState.selectedCard.classList.add('flipped');
        }
        
        // Calculate win with NEW rules
        setTimeout(calculateWin, 500);
        
    }, 1500);
}


function animateDice() {
    console.log("Animating dice...");
    
    elements.dice.classList.add('rolling');
    updateGameStatus('Rolling dice...');
}

function drawDiceFace(number) {
    console.log(`Drawing dice face for number: ${number}`);
    
    // Clear dice
    elements.dice.innerHTML = '';
    
    // Create dice face container
    const face = document.createElement('div');
    face.className = 'dice-face';
    
    // Dice dot patterns (positions in 3x3 grid)
    const patterns = {
        1: ['center'],
        2: ['top-left', 'bottom-right'],
        3: ['top-left', 'center', 'bottom-right'],
        4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
        5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
        6: ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right']
    };
    
    const positions = patterns[number] || [];
    
    // Create dots
    for (let i = 0; i < 9; i++) {
        const dot = document.createElement('div');
        dot.className = 'dice-dot';
        
        // Position the dot
        const gridPositions = [
            'top-left', 'top-center', 'top-right',
            'middle-left', 'center', 'middle-right',
            'bottom-left', 'bottom-center', 'bottom-right'
        ];
        
        dot.classList.add(gridPositions[i]);
        
        // Show dot if in positions array
        if (positions.includes(gridPositions[i])) {
            dot.style.opacity = '1';
        } else {
            dot.style.opacity = '0';
        }
        
        face.appendChild(dot);
    }
    
    elements.dice.appendChild(face);
}

// ============================================
// WIN CALCULATION - NEW RULES
// ============================================

function calculateWin() {
    console.log("Calculating win with NEW rules...");
    
    const cardNumber = parseInt(gameState.selectedCard.dataset.number);
    const bet = gameState.currentBet;
    let winAmount = 0;
    let winType = '';
    let message = '';
    
    console.log(`Card: ${cardNumber}, Dice: ${gameState.diceResult}, Prediction: ${gameState.currentPrediction}`);
    
    // NEW WIN CONDITIONS:
    const predictionMatchesDice = gameState.currentPrediction === gameState.diceResult;
    const predictionMatchesCard = gameState.currentPrediction === cardNumber;
    
    if (predictionMatchesDice && predictionMatchesCard) {
        // ×4 JACKPOT: Prediction matches BOTH card and dice
        winAmount = bet * 4;
        winType = 'quadruple';
        message = `🎰 JACKPOT! Prediction matched BOTH card and dice! ${bet} × 4 = ${winAmount}!`;
    } else if (predictionMatchesDice) {
        // ×2 WIN: Prediction matches dice
        winAmount = bet * 2;
        winType = 'double';
        message = `🎉 WIN! Prediction matched dice! ${bet} × 2 = ${winAmount}`;
    } else if (predictionMatchesCard) {
        // ×2 WIN: Prediction matches card
        winAmount = bet * 2;
        winType = 'double';
        message = `🎉 WIN! Prediction matched card! ${bet} × 2 = ${winAmount}`;
    } else {
        // LOSE: No matches
        winAmount = 0;
        winType = 'lose';
        message = `💸 Lost ${bet}! No matches.`;
    }
    
    // Update money
    gameState.money += winAmount;
    
    // Record round
    const roundRecord = {
        round: gameState.currentRound,
        bet: bet,
        prediction: gameState.currentPrediction,
        card: cardNumber,
        dice: gameState.diceResult,
        win: winAmount,
        type: winType,
        matches: {
            dice: predictionMatchesDice,
            card: predictionMatchesCard
        }
    };
    
    gameState.roundHistory.push(roundRecord);
    
    // Enable double or nothing if won
    if (winAmount > 0) {
        gameState.canDouble = true;
        elements.doubleButton.disabled = false;
        
        // Animate winning card
        gameState.selectedCard.classList.add('winning');
    }
    
    // UPDATE: Now update the selected card display to show the actual number
    updateSelectedCardDisplay();
    
    // Show result
    showResult(roundRecord);
    updateHistory();
    updateUI();
    updateGameStatus(message);
    
    // Enable next round button
    elements.nextButton.disabled = false;
    
    console.log(`Win calculation complete: ${winType}, Amount: ${winAmount}`);
}


function showResult(record) {
    let matchesText = '';
    if (record.type === 'quadruple') {
        matchesText = 'Matched BOTH card and dice!';
    } else if (record.type === 'double') {
        if (record.matches.dice) {
            matchesText = 'Matched dice!';
        } else {
            matchesText = 'Matched card!';
        }
    } else {
        matchesText = 'No matches';
    }
    
    let resultHTML = `
        <div class="result-details">
            <p><strong>Round ${record.round}</strong></p>
            <p>Bet: ${record.bet}</p>
            <p>Your Prediction: ${record.prediction}</p>
            <p>Card Number: ${record.card}</p>
            <p>Dice Roll: ${record.dice}</p>
            <p>${matchesText}</p>
            <p class="result-${record.type}">
                ${record.type.toUpperCase()}: ${record.win > 0 ? '+' : ''}${record.win}
            </p>
        </div>
    `;
    
    elements.resultDisplay.innerHTML = resultHTML;
}

function updateHistory() {
    if (gameState.roundHistory.length === 0) {
        elements.historyList.innerHTML = 'No rounds played yet';
        return;
    }
    
    let historyHTML = '';
    gameState.roundHistory.forEach(record => {
        let matchInfo = '';
        if (record.type === 'quadruple') {
            matchInfo = ' (BOTH)';
        } else if (record.type === 'double') {
            matchInfo = record.matches.dice ? ' (Dice)' : ' (Card)';
        }
        
        historyHTML += `
            <div class="history-item">
                Round ${record.round}: 
                Bet ${record.bet} → 
                Pred:${record.prediction} | 
                Card:${record.card} | 
                Dice:${record.dice}
                <span class="history-result ${record.type}">
                    ${record.win > 0 ? '+' : ''}${record.win}${matchInfo}
                </span>
            </div>
        `;
    });
    
    elements.historyList.innerHTML = historyHTML;
}

// ============================================
// DOUBLE OR NOTHING
// ============================================

function doubleOrNothing() {
    if (!gameState.canDouble || gameState.money <= 0) return;
    
    console.log("Double or nothing!");
    
    // 50/50 chance
    const win = Math.random() > 0.5;
    
    if (win) {
        gameState.money *= 2;
        updateGameStatus(`DOUBLE WIN! 🎉 Money doubled to ${gameState.money}!`);
    } else {
        gameState.money = 0;
        updateGameStatus(`NOTHING! 💥 Lost all money!`);
    }
    
    gameState.canDouble = false;
    elements.doubleButton.disabled = true;
    updateUI();
    
    if (gameState.money <= 0) {
        endGame();
    }
}

// ============================================
// NEXT ROUND
// ============================================

function nextRound() {
    console.log("Moving to next round...");
    
    // Update round
    gameState.currentRound++;
    
    // Check if game over
    if (gameState.currentRound > gameState.totalRounds || gameState.money <= 0) {
        endGame();
        return;
    }
    
    // Reset for next round
    gameState.currentPrediction = null;
    gameState.selectedCard = null;
    gameState.diceResult = null;
    gameState.canDouble = false;
    gameState.gameActive = true;
    
    // Reset prediction buttons
    document.querySelectorAll('.prediction-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Generate new cards
    generateCards();
    
    // Reset dice
    elements.diceResult.textContent = '-';
    elements.dice.innerHTML = '';
    
    // Reset result display
    elements.resultDisplay.textContent = 'Roll dice to see results';
    
    // Reset card display to show "?" again
    updateSelectedCardDisplay();
    
    // Update buttons
    elements.playButton.disabled = false;
    elements.doubleButton.disabled = true;
    elements.nextButton.disabled = true;
    
    // Update UI
    updateUI();
    updateGameStatus(`Round ${gameState.currentRound}/${gameState.totalRounds}! Place your bet.`);
    
    console.log(`Next round: ${gameState.currentRound}`);
}

// ============================================
// GAME END
// ============================================

function endGame() {
    console.log("Game over!");
    
    gameState.gameActive = false;
    elements.playButton.disabled = true;
    elements.doubleButton.disabled = true;
    elements.nextButton.disabled = true;
    
    // Calculate stats
    const totalBet = gameState.roundHistory.reduce((sum, round) => sum + round.bet, 0);
    const totalWon = gameState.roundHistory.reduce((sum, round) => sum + round.win, 0);
    const wins = gameState.roundHistory.filter(round => round.win > 0).length;
    const doubleWins = gameState.roundHistory.filter(round => round.type === 'double').length;
    const quadrupleWins = gameState.roundHistory.filter(round => round.type === 'quadruple').length;
    
    // Update final score
    elements.finalScore.textContent = gameState.money;
    
    // Update stats
    elements.gameStats.innerHTML = `
        <p>Rounds Played: ${gameState.roundHistory.length}</p>
        <p>Total Bet: ${totalBet}</p>
        <p>Total Won: ${totalWon}</p>
        <p>Winning Rounds: ${wins}</p>
        <p>×2 Wins: ${doubleWins}</p>
        <p>×4 Jackpots: ${quadrupleWins}</p>
        <p>Final Balance: <strong>${gameState.money}</strong></p>
    `;
    
    // Show modal
    elements.gameOverModal.style.display = 'flex';
    
    // Update status
    if (gameState.money <= 0) {
        updateGameStatus('GAME OVER! You lost all your money! 💸');
    } else if (gameState.money > 1000) {
        updateGameStatus(`CONGRATULATIONS! You won ${gameState.money - 1000} coins! 🏆`);
    } else {
        updateGameStatus(`Game over! Final bankroll: ${gameState.money}`);
    }
}

// ============================================
// RESET GAME
// ============================================

function resetGame() {
    console.log("Resetting game...");
    
    // Reset game state
    gameState.money = 1000;
    gameState.currentBet = 10;
    gameState.currentPrediction = null;
    gameState.selectedCard = null;
    gameState.diceResult = null;
    gameState.currentRound = 1;
    gameState.cardsCount = 3;
    gameState.gameActive = true;
    gameState.canDouble = false;
    gameState.roundHistory = [];
    
    // Reset bet buttons
    document.querySelectorAll('.bet-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.bet === '10') {
            btn.classList.add('active');
        }
    });
    
    // Reset difficulty buttons
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.cards === '3') {
            btn.classList.add('active');
        }
    });
    
    // Reset prediction buttons
    document.querySelectorAll('.prediction-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Generate new cards
    generateCards();
    
    // Reset dice
    elements.diceResult.textContent = '-';
    elements.dice.innerHTML = '';
    
    // Reset result display
    elements.resultDisplay.textContent = 'Roll dice to see results';
    
    // Reset history
    elements.historyList.textContent = 'No rounds played yet';
    
    // Reset buttons
    elements.playButton.disabled = false;
    elements.doubleButton.disabled = true;
    elements.nextButton.disabled = true;
    
    // Hide modal
    elements.gameOverModal.style.display = 'none';
    
    // Update UI
    updateUI();
    updateGameStatus('New game! Choose difficulty and place your bet.');
    
    console.log("Game reset complete");
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
    console.log("Setting up event listeners...");
    
    // Bet buttons
    document.querySelectorAll('.bet-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (!gameState.gameActive) return;
            
            const bet = parseInt(this.dataset.bet);
            if (gameState.money >= bet) {
                // Update active button
                document.querySelectorAll('.bet-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Update game state
                gameState.currentBet = bet;
                updateUI();
                updateGameStatus(`Bet set to ${bet}`);
            } else {
                updateGameStatus(`Not enough money! You have ${gameState.money}`);
            }
        });
    });
    
    // Difficulty buttons
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (!gameState.gameActive && gameState.currentRound > 1) {
                updateGameStatus('Cannot change difficulty during game!');
                return;
            }
            
            // Update active button
            document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Update game state
            gameState.cardsCount = parseInt(this.dataset.cards);
            
            // Generate new cards
            generateCards();
            updateUI();
            updateGameStatus(`Difficulty: ${this.textContent}`);
        });
    });
    
    // Game control buttons
    elements.playButton.addEventListener('click', rollDice);
    elements.doubleButton.addEventListener('click', doubleOrNothing);
    elements.nextButton.addEventListener('click', nextRound);
    elements.resetButton.addEventListener('click', resetGame);
    
    // Rules toggle
    // Update the rules toggle function in setupEventListeners()
if (elements.rulesToggle && elements.rulesContent) {
    elements.rulesToggle.addEventListener('click', () => {
        elements.rulesContent.classList.toggle('collapsed');
        const icon = elements.rulesToggle.querySelector('i');
        if (elements.rulesContent.classList.contains('collapsed')) {
            icon.className = 'fas fa-chevron-down';
            icon.style.transform = 'rotate(0deg)';
        } else {
            icon.className = 'fas fa-chevron-up';
            icon.style.transform = 'rotate(180deg)';
        }
    });
}
    
    // Modal close buttons
    document.querySelector('.close-modal')?.addEventListener('click', () => {
        elements.gameOverModal.style.display = 'none';
    });
    
    elements.playAgainBtn.addEventListener('click', resetGame);
    
    // Close modal when clicking outside
    elements.gameOverModal.addEventListener('click', (e) => {
        if (e.target === elements.gameOverModal) {
            elements.gameOverModal.style.display = 'none';
        }
    });
    
    console.log("Event listeners setup complete");
}

// ============================================
// UI UPDATES
// ============================================

function updateUI() {
    // Update money and round
    elements.moneyDisplay.textContent = gameState.money;
    elements.currentRound.textContent = gameState.currentRound;
    
    // Update current bet and prediction
    elements.currentBet.textContent = gameState.currentBet;
    elements.currentPrediction.textContent = gameState.currentPrediction || '?';
    
    // Update play button state
    const canPlay = gameState.gameActive && 
                   gameState.currentPrediction && 
                   gameState.selectedCard && 
                   gameState.money >= gameState.currentBet;
    
    elements.playButton.disabled = !canPlay;
    elements.doubleButton.disabled = !gameState.canDouble;
    
    // Update selected card display
    updateSelectedCardDisplay();
}

function updateGameStatus(message) {
    console.log(`Game status: ${message}`);
    if (elements.gameStatus) {
        elements.gameStatus.textContent = message;
    }
}

// ============================================
// START THE GAME
// ============================================

// Wait for DOM to load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}

// Export for debugging
window.gameState = gameState;
window.elements = elements;
console.log("Game script loaded and ready!");