// DOM Elements
const genreSelect = document.getElementById('genre');
const yearInput = document.getElementById('year');
const platformSelect = document.getElementById('platform');
const fetchBtn = document.getElementById('fetchBtn');
const heroSpinBtn = document.getElementById('heroSpinBtn');
const browseBtn = document.getElementById('browseBtn');
const gameContainer = document.getElementById('gameContainer');
const navbar = document.getElementById('navbar');
const gameCountEl = document.getElementById('gameCount');

// State
let allGames = [];
let filteredGames = [];
let isLoading = false;

// Fallback games data (expanded)
const FALLBACK_GAMES = [
    {
        id: 540,
        title: "Overwatch 2",
        thumbnail: "https://www.freetogame.com/g/540/thumbnail.jpg",
        genre: "Shooter",
        platform: "PC (Windows)",
        release_date: "2022-10-04",
        short_description: "A team-based action game set in an optimistic future. Choose your hero and fight in fast-paced 5v5 battles.",
        game_url: "https://www.freetogame.com/open/overwatch-2",
        publisher: "Blizzard Entertainment",
        developer: "Blizzard Entertainment",
        platform_type: "pc"
    },
    {
        id: 516,
        title: "PUBG: Battlegrounds",
        thumbnail: "https://www.freetogame.com/g/516/thumbnail.jpg",
        genre: "Shooter",
        platform: "PC (Windows)",
        release_date: "2022-01-12",
        short_description: "Land on strategic locations, loot weapons and supplies, and survive to become the last team standing.",
        game_url: "https://www.freetogame.com/open/pubg",
        publisher: "KRAFTON",
        developer: "PUBG Corporation",
        platform_type: "pc"
    },
    {
        id: 455,
        title: "Genshin Impact",
        thumbnail: "https://www.freetogame.com/g/455/thumbnail.jpg",
        genre: "RPG",
        platform: "PC (Windows)",
        release_date: "2020-09-28",
        short_description: "An open-world action RPG with elemental combat. Explore Teyvat, solve mysteries, and meet unforgettable characters.",
        game_url: "https://www.freetogame.com/open/genshin-impact",
        publisher: "HoYoverse",
        developer: "HoYoverse",
        platform_type: "pc"
    },
    {
        id: 427,
        title: "Destiny 2",
        thumbnail: "https://www.freetogame.com/g/427/thumbnail.jpg",
        genre: "Shooter",
        platform: "PC (Windows)",
        release_date: "2019-10-01",
        short_description: "A first-person shooter with MMO elements. Guardian, the light calls. Defend humanity and reclaim our lost worlds.",
        game_url: "https://www.freetogame.com/open/destiny-2",
        publisher: "Bungie",
        developer: "Bungie",
        platform_type: "pc"
    },
    {
        id: 523,
        title: "Lost Ark",
        thumbnail: "https://www.freetogame.com/g/523/thumbnail.jpg",
        genre: "MMORPG",
        platform: "PC (Windows)",
        release_date: "2022-02-11",
        short_description: "A massive multiplayer action RPG. Embark on an epic adventure to find the Lost Ark and save Arkesia.",
        game_url: "https://www.freetogame.com/open/lost-ark",
        publisher: "Amazon Games",
        developer: "Smilegate RPG",
        platform_type: "pc"
    },
    {
        id: 345,
        title: "Apex Legends",
        thumbnail: "https://www.freetogame.com/g/345/thumbnail.jpg",
        genre: "Shooter",
        platform: "PC (Windows)",
        release_date: "2019-02-04",
        short_description: "A battle royale set in the Titanfall universe. Master unique legends and fight for glory on the frontier.",
        game_url: "https://www.freetogame.com/open/apex-legends",
        publisher: "Electronic Arts",
        developer: "Respawn Entertainment",
        platform_type: "pc"
    },
    {
        id: 557,
        title: "Warframe",
        thumbnail: "https://www.freetogame.com/g/557/thumbnail.jpg",
        genre: "Shooter",
        platform: "PC (Windows)",
        release_date: "2013-03-25",
        short_description: "A cooperative third-person shooter. Become a Tenno and unleash your Warframe's power.",
        game_url: "https://www.freetogame.com/open/warframe",
        publisher: "Digital Extremes",
        developer: "Digital Extremes",
        platform_type: "pc"
    },
    {
        id: 471,
        title: "Fortnite",
        thumbnail: "https://www.freetogame.com/g/471/thumbnail.jpg",
        genre: "Shooter",
        platform: "PC (Windows)",
        release_date: "2017-07-25",
        short_description: "The battle royale phenomenon. Drop in, loot up, and be the last one standing.",
        game_url: "https://www.freetogame.com/open/fortnite",
        publisher: "Epic Games",
        developer: "Epic Games",
        platform_type: "pc"
    },
    {
        id: 508,
        title: "Enlisted",
        thumbnail: "https://www.freetogame.com/g/508/thumbnail.jpg",
        genre: "Shooter",
        platform: "PC (Windows)",
        release_date: "2021-04-08",
        short_description: "A squad-based MMO shooter set in World War II. Command your squad and fight in large-scale battles.",
        game_url: "https://www.freetogame.com/open/enlisted",
        publisher: "Gaijin Entertainment",
        developer: "Darkflow Software",
        platform_type: "pc"
    },
    {
        id: 212,
        title: "Dota 2",
        thumbnail: "https://www.freetogame.com/g/212/thumbnail.jpg",
        genre: "MOBA",
        platform: "PC (Windows)",
        release_date: "2013-07-09",
        short_description: "The most played MOBA. Two teams of five battle to destroy the enemy's Ancient.",
        game_url: "https://www.freetogame.com/open/dota-2",
        publisher: "Valve",
        developer: "Valve",
        platform_type: "pc"
    },
    {
        id: 1,
        title: "World of Tanks",
        thumbnail: "https://www.freetogame.com/g/1/thumbnail.jpg",
        genre: "Shooter",
        platform: "PC (Windows)",
        release_date: "2011-04-12",
        short_description: "A tank-based MMO shooter. Command armored vehicles and battle in 15v15 team battles.",
        game_url: "https://www.freetogame.com/open/world-of-tanks",
        publisher: "Wargaming",
        developer: "Wargaming",
        platform_type: "pc"
    }
];

// Navbar scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Fetch games from API with multiple fallback options
async function fetchGames() {
    const API_URL = 'https://www.freetogame.com/api/games';
    const PROXY_URLS = [
        'https://api.allorigins.win/raw?url=',
        'https://corsproxy.io/?',
        'https://api.codetabs.com/v1/proxy?quest='
    ];

    for (const proxy of PROXY_URLS) {
        try {
            const response = await fetch(proxy + encodeURIComponent(API_URL));
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data) && data.length > 0) {
                    return data;
                }
            }
        } catch (error) {
            console.log(`Proxy ${proxy} failed:`, error);
        }
    }
    
    // If all proxies fail, return null
    return null;
}

// Initialize games
async function initializeGames() {
    try {
        showLoading('Loading games from database...');
        
        // Try to fetch from API
        const apiGames = await fetchGames();
        
        if (apiGames && apiGames.length > 0) {
            allGames = apiGames;
            updateGameCount(allGames.length, false);
            console.log('Loaded games from API:', allGames.length);
        } else {
            // Use fallback data
            allGames = FALLBACK_GAMES;
            updateGameCount(allGames.length, true);
            console.log('Using fallback games:', allGames.length);
        }
        
        // Set filtered games to all games initially
        filteredGames = [...allGames];
        
        // Show initial random game
        const randomGame = getRandomGame();
        renderGame(randomGame);
        
    } catch (error) {
        console.error('Error initializing games:', error);
        // Ultimate fallback
        allGames = FALLBACK_GAMES;
        filteredGames = [...allGames];
        updateGameCount(allGames.length, true);
        const randomGame = getRandomGame();
        renderGame(randomGame);
    }
}

// Update game count display
function updateGameCount(count, isFallback = false) {
    if (gameCountEl) {
        const mode = isFallback ? ' (Offline Mode)' : '';
        gameCountEl.textContent = `📊 ${count} games available${mode}`;
    }
}

// Filter games based on selected criteria
function filterGames() {
    const genre = genreSelect.value;
    const year = yearInput.value ? parseInt(yearInput.value) : null;
    const platform = platformSelect.value;
    
    filteredGames = allGames.filter(game => {
        // Genre filter
        if (genre && game.genre) {
            const gameGenre = game.genre.toLowerCase();
            if (!gameGenre.includes(genre.toLowerCase())) {
                return false;
            }
        }
        
        // Year filter
        if (year && game.release_date) {
            const gameYear = new Date(game.release_date).getFullYear();
            if (isNaN(gameYear) || gameYear < year) {
                return false;
            }
        }
        
        // Platform filter
        if (platform) {
            const gamePlatform = game.platform ? game.platform.toLowerCase() : '';
            if (platform === 'pc' && !gamePlatform.includes('pc')) {
                return false;
            } else if (platform === 'browser' && !gamePlatform.includes('browser')) {
                return false;
            }
        }
        
        return true;
    });
    
    return filteredGames;
}

// Get random game from filtered list
function getRandomGame() {
    filterGames();
    
    if (filteredGames.length === 0) {
        return null;
    }
    
    const randomIndex = Math.floor(Math.random() * filteredGames.length);
    return filteredGames[randomIndex];
}

// Show loading state
function showLoading(message = 'Spinning the wheel...') {
    gameContainer.innerHTML = `
        <div class="loading-state">
            <div class="netflix-spinner"></div>
            <p style="color: #e5e5e5;">${message}</p>
        </div>
    `;
}

// Render game in Netflix style
function renderGame(game) {
    if (!game) {
        gameContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">😕</div>
                <h3>No Games Found</h3>
                <p>Try adjusting your filters and spin again</p>
            </div>
        `;
        return;
    }

    // Format release year
    let releaseYear = 'TBA';
    if (game.release_date) {
        const date = new Date(game.release_date);
        if (!isNaN(date.getTime())) {
            releaseYear = date.getFullYear();
        }
    }

    // Generate random match score (70-99%)
    const matchScore = Math.floor(Math.random() * 30) + 70;
    
    // Format platform display
    const platform = game.platform || 'PC (Windows)';
    
    // Get publisher/developer
    const publisher = game.publisher || game.developer || 'Various';

    const html = `
        <div class="game-card">
            <div class="game-poster">
                ${game.thumbnail ? 
                    `<img src="${game.thumbnail}" alt="${game.title}" 
                        onerror="this.onerror=null; this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22350%22 height=%22500%22 viewBox=%220 0 350 500%22 fill=%22%23333%22><rect width=%22350%22 height=%22500%22 fill=%22%23222%22/><text x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23666%22 font-size=%2224%22>🎮 No Image</text></svg>';">` : 
                    `<div style="width: 100%; height: 100%; background: #222; display: flex; align-items: center; justify-content: center; font-size: 3rem;">🎮</div>`
                }
                <div class="game-poster-badge">🔥 TOP PICK</div>
                <div class="game-poster-overlay">
                    <div class="match-score">
                        <span>${matchScore}% Match</span>
                        <span>⭐ NEW</span>
                    </div>
                </div>
            </div>
            <div class="game-info">
                <div class="game-header">
                    <h2 class="game-title">${game.title}</h2>
                    <span class="game-maturity">${releaseYear}</span>
                </div>
                
                <div class="game-metadata">
                    <span class="game-metadata-item">
                        <span>🎯</span>
                        Genre: <strong>${game.genre || 'Unknown'}</strong>
                    </span>
                    <span class="game-metadata-item">
                        <span>💻</span>
                        Platform: <strong>${platform}</strong>
                    </span>
                    <span class="game-metadata-item">
                        <span>👥</span>
                        Publisher: <strong>${publisher}</strong>
                    </span>
                </div>
                
                <p class="game-description">
                    ${game.short_description || 'No description available.'}
                </p>
                
                <div class="game-actions">
                    <a href="${game.game_url || '#'}" target="_blank" rel="noopener noreferrer" class="game-btn game-btn-primary">
                        <span>▶</span>
                        PLAY NOW
                    </a>
                    <button class="game-btn game-btn-secondary" onclick="alert('Added to your list! (Demo feature)')">
                        <span>➕</span>
                        MY LIST
                    </button>
                    <button class="game-btn game-btn-secondary" onclick="alert('Thanks for rating! (Demo feature)')">
                        <span>👍</span>
                        RATE
                    </button>
                </div>
            </div>
        </div>
    `;
    
    gameContainer.innerHTML = html;
}

// Handle spin button click
async function handleSpin(e) {
    e.preventDefault();
    
    if (isLoading) return;
    
    isLoading = true;
    fetchBtn.disabled = true;
    heroSpinBtn.disabled = true;
    
    showLoading('🎲 Spinning the wheel...');
    
    // Simulate spinning delay for better UX
    setTimeout(() => {
        const randomGame = getRandomGame();
        renderGame(randomGame);
        
        isLoading = false;
        fetchBtn.disabled = false;
        heroSpinBtn.disabled = false;
    }, 800);
}

// Handle browse button click
function handleBrowse() {
    genreSelect.value = '';
    yearInput.value = '2018';
    platformSelect.value = '';
    handleSpin(new Event('click'));
}

// Event listeners
fetchBtn.addEventListener('click', handleSpin);
heroSpinBtn.addEventListener('click', handleSpin);
browseBtn.addEventListener('click', handleBrowse);

// Keyboard support
document.addEventListener('keydown', (e) => {
    if (e.key === ' ' && document.activeElement === fetchBtn) {
        e.preventDefault();
        handleSpin(e);
    }
});

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    initializeGames();
});