const genreSelect = document.getElementById("genreSelect");
const yearInput = document.getElementById("yearInput");
const randomBtn = document.getElementById("randomBtn");

const gameTitle = document.getElementById("gameTitle");
const thumbnail = document.getElementById("thumbnail");
const screenshotImage = document.getElementById("screenshotImage");

let screenshots = [];
let currentIndex = 0;

/* ---------------------------
   Fetch Games List
--------------------------- */

async function fetchGames() {
  let url = "https://www.freetogame.com/api/games";

  if (genreSelect.value) {
    url += `?category=${genreSelect.value}`;
  }

  const response = await fetch(url);
  let games = await response.json();

  // Filter by year manually (API doesn't support year filtering)
  if (yearInput.value) {
    games = games.filter(game => {
      return game.release_date.startsWith(yearInput.value);
    });
  }

  return games;
}

/* ---------------------------
   Fetch Random Game Details
--------------------------- */

async function fetchRandomGame() {

  const games = await fetchGames();

  if (!games.length) {
    gameTitle.textContent = "No games found.";
    thumbnail.src = "";
    screenshotImage.src = "";
    return;
  }

  const randomGame = games[Math.floor(Math.random() * games.length)];

  // Fetch detailed info (to get screenshots)
  const detailResponse = await fetch(
    `https://www.freetogame.com/api/game?id=${randomGame.id}`
  );

  const gameDetails = await detailResponse.json();

  displayGame(gameDetails);
}

/* ---------------------------
   Display Game
--------------------------- */

function displayGame(game) {

  gameTitle.textContent = game.title;
  thumbnail.src = game.thumbnail;

  screenshots = game.screenshots || [];
  currentIndex = 0;

  updateScreenshot();
}

function updateScreenshot() {
  if (!screenshots.length) {
    screenshotImage.src = "";
    return;
  }

  screenshotImage.src = screenshots[currentIndex].image;
}

/* ---------------------------
   Slider Controls
--------------------------- */

document.getElementById("prevBtn").addEventListener("click", () => {
  if (!screenshots.length) return;
  currentIndex = (currentIndex - 1 + screenshots.length) % screenshots.length;
  updateScreenshot();
});

document.getElementById("nextBtn").addEventListener("click", () => {
  if (!screenshots.length) return;
  currentIndex = (currentIndex + 1) % screenshots.length;
  updateScreenshot();
});

randomBtn.addEventListener("click", fetchRandomGame);
