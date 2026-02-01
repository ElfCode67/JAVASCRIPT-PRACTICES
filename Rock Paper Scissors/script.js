const choices = document.querySelectorAll(".choice");
const playerChoiceText = document.getElementById("playerChoice");
const computerChoiceText = document.getElementById("computerChoice");
const resultText = document.getElementById("resultText");
const playerScoreText = document.getElementById("playerScore");
const computerScoreText = document.getElementById("computerScore");

let playerScore = 0;
let computerScore = 0;

// Track player behavior
const playerHistory = {
  rock: 0,
  paper: 0,
  scissors: 0,
  lizard: 0,
  spock: 0
};

const rules = {
  rock: ["scissors", "lizard"],
  paper: ["rock", "spock"],
  scissors: ["paper", "lizard"],
  lizard: ["spock", "paper"],
  spock: ["scissors", "rock"]
};

const options = Object.keys(rules);

choices.forEach(btn => {
  btn.addEventListener("click", () => {
    const playerChoice = btn.dataset.choice;
    playerHistory[playerChoice]++;

    const computerChoice = getLearningAIChoice();

    playerChoiceText.textContent = playerChoice;
    computerChoiceText.textContent = computerChoice;

    const result = determineWinner(playerChoice, computerChoice);
    resultText.textContent = result;

    if (result === "YOU WIN!") playerScore++;
    if (result === "YOU LOSE!") computerScore++;

    playerScoreText.textContent = playerScore;
    computerScoreText.textContent = computerScore;
  });
});

function determineWinner(player, computer) {
  if (player === computer) return "IT'S A TIE!";
  if (rules[player].includes(computer)) return "YOU WIN!";
  return "YOU LOSE!";
}

// 🧠 Learning AI
function getLearningAIChoice() {
  const totalMoves = Object.values(playerHistory).reduce((a, b) => a + b, 0);

  // Early game = random
  if (totalMoves < 5) {
    return randomChoice();
  }

  // Find most used player move
  const mostUsed = Object.keys(playerHistory)
    .reduce((a, b) => playerHistory[a] > playerHistory[b] ? a : b);

  // Find counters
  const counters = Object.keys(rules)
    .filter(choice => rules[choice].includes(mostUsed));

  // 65% chance to counter, 35% random
  return Math.random() < 0.65
    ? counters[Math.floor(Math.random() * counters.length)]
    : randomChoice();
}

function randomChoice() {
  return options[Math.floor(Math.random() * options.length)];
}
