// ============================================
// FIXED VERSION - Difficulty Button Handler
// ============================================

function setupEventListeners() {
    // Bet buttons
    document.querySelectorAll('.bet-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (!gameState.gameActive) return;
            const bet = parseInt(this.dataset.bet);
            if (gameState.money >= bet) {
                gameState.currentBet = bet;
                updateBetButtons();
                updateUI();
                updateGameStatus();
            } else {
                setGameStatus(`Not enough money! You have ${gameState.money}`, 'error');
            }
        });
    });

    // Difficulty buttons - FIXED VERSION
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Check if already active
            if (this.classList.contains('active')) return;
            
            if (!gameState.gameActive && gameState.currentStep > 1) {
                setGameStatus('Cannot change difficulty during a round!', 'error');
                return;
            }
            
            // Remove active class from all diff buttons
            document.querySelectorAll('.diff-btn').forEach(b => {
                b.classList.remove('active');
            });
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update game state
            gameState.cardsCount = parseInt(this.dataset.cards);
            
            // Generate new cards
            try {
                generateCards();
                updateUI();
                updateGameStatus();
                
                // Update step if at beginning
                if (gameState.currentStep === 1) {
                    gameState.currentStep = 2;
                    updateStepIndicator();
                }
                
                setGameStatus(`Difficulty set to ${gameState.cardsCount} cards. Place your bet!`);
            } catch (error) {
                console.error('Error generating cards:', error);
                setGameStatus('Error changing difficulty. Please try again.', 'error');
            }
        });
    });

    // ... rest of the setupEventListeners function remains the same
}

// ============================================
// FIXED generateCards function
// ============================================

function generateCards() {
    try {
        // Clear container
        elements.cardsContainer.innerHTML = '';
        gameState.selectedCard = null;
        
        // Validate cardsCount
        if (!gameState.cardsCount || gameState.cardsCount < 3 || gameState.cardsCount > 7) {
            gameState.cardsCount = 3; // Default to easy
        }
        
        // Generate unique random numbers for cards
        const cardNumbers = [];
        const maxAttempts = 20;
        let attempts = 0;
        
        while (cardNumbers.length < gameState.cardsCount && attempts < maxAttempts) {
            const num = Math.floor(Math.random() * 6) + 1;
            if (!cardNumbers.includes(num)) {
                cardNumbers.push(num);
            }
            attempts++;
        }
        
        // If we couldn't get enough unique numbers, fill with random numbers
        while (cardNumbers.length < gameState.cardsCount) {
            cardNumbers.push(Math.floor(Math.random() * 6) + 1);
        }
        
        // Create card elements
        for (let i = 0; i < gameState.cardsCount; i++) {
            const card = document.createElement('div');
            const colorIndex = i % CARD_COLORS.length;
            const color = CARD_COLORS[colorIndex];
            
            // Add card classes
            card.className = `card ${color}`;
            card.dataset.number = cardNumbers[i];
            card.dataset.index = i;
            
            // Create front face
            const front = document.createElement('div');
            front.className = 'card-face card-front';
            
            // Create back face
            const back = document.createElement('div');
            back.className = 'card-face card-back';
            back.innerHTML = `
                <div class="card-number" style="color: ${getColorCode(color)}">
                    ${cardNumbers[i]}
                </div>
                <div class="card-symbol">
                    ${getDiceSymbol(cardNumbers[i])}
                </div>
            `;
            
            // Append faces to card
            card.appendChild(front);
            card.appendChild(back);
            
            // Add click event listener
            card.addEventListener('click', () => {
                selectCard(card);
            });
            
            // Add card to container
            elements.cardsContainer.appendChild(card);
        }
        
        // Update selected card info
        updateSelectedCardInfo();
        
        // Update cards count display
        elements.cardsCount.textContent = `${gameState.cardsCount} cards total`;
        
        return true;
    } catch (error) {
        console.error('Error in generateCards:', error);
        // Create a simple fallback
        elements.cardsContainer.innerHTML = '<div style="color: #ff6b6b; padding: 20px; text-align: center;">Error loading cards. Please try again.</div>';
        return false;
    }
}

// ============================================
// FIXED selectCard function
// ============================================

function selectCard(card) {
    try {
        // Check if we can select a card
        if (!gameState.gameActive) {
            setGameStatus('Game is not active!', 'error');
            return;
        }
        
        if (gameState.currentStep < 3) {
            setGameStatus('Complete betting and prediction first!', 'error');
            return;
        }
        
        // Remove selection from previous card
        if (gameState.selectedCard) {
            gameState.selectedCard.classList.remove('selected');
        }
        
        // Select new card
        gameState.selectedCard = card;
        card.classList.add('selected');
        
        // Update step
        if (gameState.currentStep === 3) {
            gameState.currentStep = 4;
            updateStepIndicator();
        }
        
        updateSelectedCardInfo();
        updateGameStatus();
        updateUI(); // Enable play button if everything is ready
        
        setGameStatus(`Card selected! Ready to roll dice!`);
        
    } catch (error) {
        console.error('Error selecting card:', error);
        setGameStatus('Error selecting card. Please try again.', 'error');
    }
}

// ============================================
// FIXED updateUI function
// ============================================

function updateUI() {
    try {
        // Update money display
        elements.money.textContent = gameState.money;
        elements.currentBet.textContent = gameState.currentBet;
        elements.currentPrediction.textContent = gameState.currentPrediction || '?';
        elements.currentRound.textContent = gameState.currentRound;
        elements.cardsCount.textContent = `${gameState.cardsCount} cards total`;
        
        // Update button states
        const canPlay = gameState.gameActive && 
                       gameState.currentPrediction && 
                       gameState.selectedCard && 
                       gameState.money >= gameState.currentBet &&
                       gameState.currentStep >= 3;
        
        elements.playBtn.disabled = !canPlay;
        elements.doubleBtn.disabled = !gameState.canDouble;
        elements.nextBtn.disabled = gameState.currentStep !== 5;
        
        // Update selected card info if needed
        if (gameState.selectedCard) {
            updateSelectedCardInfo();
        }
    } catch (error) {
        console.error('Error in updateUI:', error);
    }
}

// ============================================
// DEBUG HELPER - Add to initGame
// ============================================

function initGame() {
    try {
        createNumberButtons();
        setupEventListeners();
        generateCards();
        updateUI();
        updateGameStatus();
        updateStepIndicator();
        
        // Log initialization
        console.log('Game initialized successfully');
        console.log('Initial state:', { ...gameState });
        
    } catch (error) {
        console.error('Error initializing game:', error);
        setGameStatus('Error initializing game. Please refresh the page.', 'error');
    }
}

// ============================================
// ADD ERROR HANDLING STYLES
// ============================================

// Add this CSS to your style.css or in a <style> tag:
/*

*/