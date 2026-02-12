// ----------------------------------------------------
//  GAME ROULETTE · RANDOM GAME PICKER
//  FreeToGame API with CORS proxy + fallback
//  FULLY FUNCTIONAL - ALL INTERACTIVE ELEMENTS FIXED
// ----------------------------------------------------

// DOM elements
const genreSelect = document.getElementById('genre');
const yearInput = document.getElementById('year');
const fetchBtn = document.getElementById('fetchBtn');
const gameContainer = document.getElementById('gameContainer');

// Local fallback data
const FALLBACK_GAMES = [
    {
        id: 540,
        title: "Overwatch 2",
        thumbnail: "https://www.freetogame.com/g/540/thumbnail.jpg",
        genre: "Shooter",
        platform: "PC",
        release_date: "2022-10-04",
        short_description: "A team-based action game set in an optimistic future. Choose your hero and fight in fast-paced 5v5 battles.",
        game_url: "https://www.freetogame.com/open/overwatch-2"
    },
    {
        id: 516,
        title: "PUBG: Battlegrounds",
        thumbnail: "https://www.freetogame.com/g/516/thumbnail.jpg",
        genre: "Shooter",
        platform: "PC",
        release_date: "2022-01-12",
        short_description: "Land on strategic locations, loot weapons and supplies, and survive to become the last team standing.",
        game_url: "https://www.freetogame.com/open/pubg"
    },
    {
        id: 455,
        title: "Genshin Impact",
        thumbnail: "https://www.freetogame.com/g/455/thumbnail.jpg",
        genre: "RPG",
        platform: "PC",
        release_date: "2020-09-28",
        short_description: "An open-world action RPG with elemental combat. Explore Teyvat, solve mysteries, and meet unforgettable characters.",
        game_url: "https://www.freetogame.com/open/genshin-impact"
    },
    {
        id: 427,
        title: "Destiny 2",
        thumbnail: "https://www.freetogame.com/g/427/thumbnail.jpg",
        genre: "Shooter",
        platform: "PC",
        release_date: "2019-10-01",
        short_description: "A first-person shooter with MMO elements. Guardian, the light calls. Defend humanity and reclaim our lost worlds.",
        game_url: "https://www.freetogame.com/open/destiny-2"
    },
    {
        id: 523,
        title: "Lost Ark",
        thumbnail: "https://www.freetogame.com/g/523/thumbnail.jpg",
        genre: "MMORPG",
        platform: "PC",
        release_date: "2022-02-11",
        short_description: "A massive multiplayer action RPG. Embark on an epic adventure to find the Lost Ark and save Arkesia.",
        game_url: "https://www.freetogame.com/open/lost-ark"
    },
    {
        id: 345,
        title: "Apex Legends",
        thumbnail: "https://www.freetogame.com/g/345/thumbnail.jpg",
        genre: "Shooter",
        platform: "PC",
        release_date: "2019-02-04",
        short_description: "A battle royale set in the Titanfall universe. Master unique legends and fight for glory on the frontier.",
        game_url: "https://www.freetogame.com/open/apex-legends"
    },
    {
        id: 557,
        title: "Warframe",
        thumbnail: "https://www.freetogame.com/g/557/thumbnail.jpg",
        genre: "Shooter",
        platform: "PC",
        release_date: "2013-03-25",
        short_description: "A cooperative third-person shooter. Become a Tenno and unleash your Warframe's power.",
        game_url: "https://www.freetogame.com/open/warframe"
    },
    {
        id: 471,
        title: "Fortnite",
        thumbnail: "https://www.freetogame.com/g/471/thumbnail.jpg",
        genre: "Shooter",
        platform: "PC",
        release_date: "2017-07-25",
        short_description: "The battle royale phenomenon. Drop in, loot up, and be the last one standing.",
        game_url: "https://www.freetogame.com/open/fortnite"
    }
];

let allGamesCache = null;
let isLoading = false;

// ---------- FETCH WITH CORS PROXY ----------
async function fetchWithProxy(url) {
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
            console.log('Proxy failed, trying next...');
        }
    }
    throw new Error('All proxies failed');
}

// ---------- LOAD GAMES ----------
async function loadAllGames() {
    // First try to load from API
    try {
        const data = await fetchWithProxy('https://www.freetogame.com/api/games');
        if (data && data.length > 0) {
            allGamesCache = data;
            updateGameCount(data.length, false);
            return allGamesCache;
        }
    } catch (error) {
        console.error('API failed, using fallback:', error);
    }
    
    // Fallback to local data
    allGamesCache = FALLBACK_GAMES;
    updateGameCount(FALLBACK_GAMES.length, true);
    return allGamesCache;
}

// ---------- UPDATE GAME COUNT IN FOOTER ----------
function updateGameCount(count, isFallback = false) {
    const countEl = document.getElementById('gameCount');
    if (countEl) {
        countEl.textContent = isFallback 
            ? `🎮 ${count} Games Loaded (Offline Mode)` 
            : `🎮 Powered by FreeToGame.com · ${count}+ Games`;
    }
}

// ---------- FILTER AND RANDOMIZE ----------
function getRandomGameFiltered(genre, minYear) {
    if (!allGamesCache || allGamesCache.length === 0) return null;
    
    let filtered = [...allGamesCache];
    
    // Filter by genre
    if (genre && genre !== '') {
        filtered = filtered.filter(game => 
            game.genre && game.genre.toLowerCase().includes(genre.toLowerCase())
        );
    }
    
    // Filter by year
    if (minYear && minYear !== '') {
        const yearNum = parseInt(minYear);
        if (!isNaN(yearNum)) {
            filtered = filtered.filter(game => {
                if (!game.release_date) return false;
                const gameYear = new Date(game.release_date).getFullYear();
                return !isNaN(gameYear) && gameYear >= yearNum;
            });
        }
    }
    
    if (filtered.length === 0) return null;
    
    // Pick random game
    const randomIndex = Math.floor(Math.random() * filtered.length);
    return filtered[randomIndex];
}

// ---------- RENDER GAME WITH IMPROVED HTML STRUCTURE ----------
function renderGame(game) {
    if (!game) {
        gameContainer.innerHTML = `
            <div class="empty-state">
                <span class="state-icon">🎲</span>
                <h3 style="margin-bottom: 0.5rem; color: var(--blue-deep);">No Games Found</h3>
                <p style="color: var(--gray-soft);">Try different filters or spin again</p>
            </div>
        `;
        return;
    }

    let releaseYear = 'TBA';
    if (game.release_date) {
        const date = new Date(game.release_date);
        if (!isNaN(date.getTime())) {
            releaseYear = date.getFullYear();
        }
    }

    const thumbnail = game.thumbnail || '';
    const platform = game.platform || 'PC';
    const genre = game.genre || 'Unclassified';
    const title = game.title || 'Untitled Game';
    const description = game.short_description || 'No description available.';
    const gameUrl = game.game_url || '#';

    const html = `
        <div class="game-card">
            <div class="game-image-wrapper">
                ${thumbnail ? 
                    `<img src="${thumbnail}" alt="${title}" class="game-image" loading="lazy" 
                        onerror="this.onerror=null; this.parentElement.innerHTML='<div class=game-image-placeholder><span>🎮 No Cover</span></div>';">` : 
                    `<div class="game-image-placeholder"><span>🎮 No Cover</span></div>`
                }
                <span class="game-badge">${platform}</span>
            </div>
            <div class="game-details">
                <h2 class="game-title">${title}</h2>
                <div class="game-meta">
                    <span class="meta-item">
                        <span class="meta-icon">🏷️</span>
                        <span class="meta-text"><strong>${genre}</strong></span>
                    </span>
                    <span class="meta-item">
                        <span class="meta-icon">📅</span>
                        <span class="meta-text">Released <strong>${releaseYear}</strong></span>
                    </span>
                    <span class="meta-item">
                        <span class="meta-icon">💻</span>
                        <span class="meta-text"><strong>${platform}</strong></span>
                    </span>
                </div>
                <p class="game-description">${description}</p>
                ${gameUrl !== '#' ? 
                    `<a href="${gameUrl}" target="_blank" rel="noopener" class="game-link">
                        Play Game 
                        <span class="link-icon">→</span>
                    </a>` : 
                    ''
                }
            </div>
        </div>
    `;
    
    gameContainer.innerHTML = html;
}

// ---------- HANDLE SPIN BUTTON ----------
async function handleSpinClick(e) {
    e.preventDefault();
    
    // Prevent multiple clicks while loading
    if (isLoading) return;
    isLoading = true;
    
    // Disable button and show loading state
    fetchBtn.disabled = true;
    fetchBtn.style.opacity = '0.8';
    fetchBtn.style.cursor = 'wait';
    
    gameContainer.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p style="color: var(--blue-deep); font-weight: 500;">Spinning the wheel...</p>
        </div>
    `;
    
    const genre = genreSelect.value;
    const year = yearInput.value;
    
    // Ensure cache is loaded
    if (!allGamesCache) {
        await loadAllGames();
    }
    
    // Add slight delay for better UX
    setTimeout(() => {
        const randomGame = getRandomGameFiltered(genre, year);
        renderGame(randomGame);
        
        // Re-enable button
        fetchBtn.disabled = false;
        fetchBtn.style.opacity = '1';
        fetchBtn.style.cursor = 'pointer';
        isLoading = false;
    }, 600);
}

// ---------- INITIALIZE ----------
async function init() {
    // Show loading state
    gameContainer.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p style="color: var(--blue-deep); font-weight: 500;">Loading games...</p>
        </div>
    `;
    
    await loadAllGames();
    const initialGame = getRandomGameFiltered(genreSelect.value, yearInput.value);
    renderGame(initialGame);
    
    // Add event listener to button
    if (fetchBtn) {
        fetchBtn.addEventListener('click', handleSpinClick);
    }
    
    // Add keyboard support (Enter key on button)
    fetchBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSpinClick(e);
        }
    });
}

// Start the app when DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);