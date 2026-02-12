// ----------------------------------------------------
//  RANDOM GAME FETCHER — WORKS WITH CORS PROXY
//  No API keys required, works locally
// ----------------------------------------------------

// DOM elements
const genreSelect = document.getElementById('genre');
const yearInput = document.getElementById('year');
const fetchBtn = document.getElementById('fetchBtn');
const gameContainer = document.getElementById('gameContainer');

// Local fallback data (in case API fails)
const FALLBACK_GAMES = [
    {
        id: 540,
        title: "Overwatch 2",
        thumbnail: "https://www.freetogame.com/g/540/thumbnail.jpg",
        genre: "Shooter",
        platform: "PC",
        release_date: "2022-10-04",
        short_description: "A team-based action game set in an optimistic future.",
        game_url: "https://www.freetogame.com/open/overwatch-2"
    },
    {
        id: 516,
        title: "PUBG: BATTLEGROUNDS",
        thumbnail: "https://www.freetogame.com/g/516/thumbnail.jpg",
        genre: "Shooter",
        platform: "PC",
        release_date: "2022-01-12",
        short_description: "Land on strategic locations, loot weapons, and survive.",
        game_url: "https://www.freetogame.com/open/pubg"
    },
    {
        id: 455,
        title: "Genshin Impact",
        thumbnail: "https://www.freetogame.com/g/455/thumbnail.jpg",
        genre: "RPG",
        platform: "PC",
        release_date: "2020-09-28",
        short_description: "An open-world action RPG with elemental combat.",
        game_url: "https://www.freetogame.com/open/genshin-impact"
    },
    {
        id: 427,
        title: "Destiny 2",
        thumbnail: "https://www.freetogame.com/g/427/thumbnail.jpg",
        genre: "Shooter",
        platform: "PC",
        release_date: "2019-10-01",
        short_description: "A first-person shooter with MMO elements.",
        game_url: "https://www.freetogame.com/open/destiny-2"
    },
    {
        id: 523,
        title: "Lost Ark",
        thumbnail: "https://www.freetogame.com/g/523/thumbnail.jpg",
        genre: "MMORPG",
        platform: "PC",
        release_date: "2022-02-11",
        short_description: "A massive multiplayer action RPG.",
        game_url: "https://www.freetogame.com/open/lost-ark"
    },
    {
        id: 345,
        title: "Apex Legends",
        thumbnail: "https://www.freetogame.com/g/345/thumbnail.jpg",
        genre: "Shooter",
        platform: "PC",
        release_date: "2019-02-04",
        short_description: "A battle royale set in the Titanfall universe.",
        game_url: "https://www.freetogame.com/open/apex-legends"
    },
    {
        id: 557,
        title: "Warframe",
        thumbnail: "https://www.freetogame.com/g/557/thumbnail.jpg",
        genre: "Shooter",
        platform: "PC",
        release_date: "2013-03-25",
        short_description: "A cooperative third-person shooter.",
        game_url: "https://www.freetogame.com/open/warframe"
    },
    {
        id: 471,
        title: "Fortnite",
        thumbnail: "https://www.freetogame.com/g/471/thumbnail.jpg",
        genre: "Shooter",
        platform: "PC",
        release_date: "2017-07-25",
        short_description: "The battle royge phenomenon.",
        game_url: "https://www.freetogame.com/open/fortnite"
    },
    {
        id: 483,
        title: "World of Tanks",
        thumbnail: "https://www.freetogame.com/g/483/thumbnail.jpg",
        genre: "Shooter",
        platform: "PC",
        release_date: "2011-04-12",
        short_description: "Team-based tank combat.",
        game_url: "https://www.freetogame.com/open/world-of-tanks"
    },
    {
        id: 508,
        title: "Roblox",
        thumbnail: "https://www.freetogame.com/g/508/thumbnail.jpg",
        genre: "Arcade",
        platform: "PC",
        release_date: "2006-09-01",
        short_description: "A global platform for play and creation.",
        game_url: "https://www.freetogame.com/open/roblox"
    }
];

// Cache for all games
let allGamesCache = null;

// ---------- FETCH WITH CORS PROXY ----------
async function fetchWithProxy(url) {
    // Try multiple CORS proxies in order
    const proxies = [
        `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
        `https://corsproxy.io/?${encodeURIComponent(url)}`,
        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
    ];

    for (const proxyUrl of proxies) {
        try {
            const response = await fetch(proxyUrl);
            if (response.ok) {
                return await response.json();
            }
        } catch (e) {
            console.log('Proxy failed:', proxyUrl);
        }
    }
    throw new Error('All proxies failed');
}

// ---------- FETCH ALL GAMES WITH FALLBACK ----------
async function loadAllGames() {
    // Try API first
    try {
        gameContainer.innerHTML = `<div class="loading">loading games from API...</div>`;
        const data = await fetchWithProxy('https://www.freetogame.com/api/games');
        allGamesCache = data;
        return allGamesCache;
    } catch (error) {
        console.error('API fetch failed, using fallback data:', error);
        // Use fallback data
        allGamesCache = FALLBACK_GAMES;
        return allGamesCache;
    }
}

// ---------- GET RANDOM GAME WITH FILTERS ----------
function getRandomGameFiltered(genre, minYear) {
    if (!allGamesCache || allGamesCache.length === 0) return null;
    
    // filter by genre
    let filtered = allGamesCache;
    if (genre) {
        filtered = filtered.filter(game => 
            game.genre && game.genre.toLowerCase().includes(genre.toLowerCase())
        );
    }
    
    // filter by release year
    if (minYear) {
        filtered = filtered.filter(game => {
            if (!game.release_date) return false;
            const gameYear = new Date(game.release_date).getFullYear();
            return gameYear >= parseInt(minYear);
        });
    }
    
    if (filtered.length === 0) return null;
    
    // pick random game
    const randomIndex = Math.floor(Math.random() * filtered.length);
    return filtered[randomIndex];
}

// ---------- RENDER SINGLE GAME CARD ----------
function renderGame(game) {
    if (!game) {
        gameContainer.innerHTML = `<div class="empty">∅ no games match filters</div>`;
        return;
    }

    // format release year
    let releaseYear = 'TBA';
    if (game.release_date) {
        const date = new Date(game.release_date);
        if (!isNaN(date.getTime())) {
            releaseYear = date.getFullYear();
        }
    }

    // game thumbnail
    const thumbnail = game.thumbnail || '';

    const html = `
        <div class="game-card">
            <div class="game-image">
                ${thumbnail ? 
                    `<img src="${thumbnail}" alt="${game.title || 'game cover'}" loading="lazy" onerror="this.parentElement.innerHTML='<span class=placeholder>no cover</span>'">` : 
                    `<span class="placeholder">no cover</span>`
                }
            </div>
            <div class="game-details">
                <div class="game-title">${game.title || 'untitled'}</div>
                <div class="game-meta">
                    <span>${game.genre || 'genre unclassified'}</span>
                    <span>${game.platform || 'PC'}</span>
                    <span>${releaseYear}</span>
                </div>
                <div class="game-description">
                    ${game.short_description ? 
                        game.short_description.slice(0, 120) + (game.short_description.length > 120 ? '…' : '') : 
                        'No description available.'}
                </div>
                ${game.game_url ? 
                    `<a href="${game.game_url}" target="_blank" rel="noopener" class="game-link">view game →</a>` : 
                    ''
                }
            </div>
        </div>
    `;
    
    gameContainer.innerHTML = html;
}

// ---------- HANDLE RANDOM BUTTON ----------
async function handleRandomClick() {
    gameContainer.innerHTML = `<div class="loading">fetching random...</div>`;
    
    const genre = genreSelect.value;
    const year = yearInput.value;
    
    // ensure cache is loaded
    if (!allGamesCache) {
        await loadAllGames();
    }
    
    const randomGame = getRandomGameFiltered(genre, year);
    renderGame(randomGame);
}

// ---------- INITIAL LOAD ----------
async function init() {
    await loadAllGames();
    const initialGame = getRandomGameFiltered(genreSelect.value, yearInput.value);
    renderGame(initialGame);
    
    // event listener
    fetchBtn.addEventListener('click', handleRandomClick);
}

// start the app
init();