const choices = document.querySelectorAll(".choice");
const playerChoiceText = document.getElementById("playerChoice");
const computerChoiceText = document.getElementById("computerChoice");
const resultText = document.getElementById("resultText");
const playerScoreText = document.getElementById("playerScore");
const computerScoreText = document.getElementById("computerScore");

let playerScore = 0;
let computerScore = 0;

const options = ["rock", "paper", "scissors"];

choices.forEach(button => {
  button.addEventListener("click", () => {
    const playerChoice = button.dataset.choice;
    const computerChoice = options[Math.floor(Math.random() * options.length)];

    playerChoiceText.textContent = playerChoice;
    computerChoiceText.textContent = computerChoice;

    const result = getResult(playerChoice, computerChoice);
    resultText.textContent = result;

    if (result === "YOU WIN!") {
      playerScore++;
    } else if (result === "YOU LOSE!") {
      computerScore++;
    }

    playerScoreText.textContent = playerScore;
    computerScoreText.textContent = computerScore;
  });
});

function getResult(player, computer) {
  if (player === computer) return "IT'S A TIE!";

  if (
    (player === "rock" && computer === "scissors") ||
    (player === "paper" && computer === "rock") ||
    (player === "scissors" && computer === "paper")
  ) {
    return "YOU WIN!";
  }

  return "YOU LOSE!";
}
