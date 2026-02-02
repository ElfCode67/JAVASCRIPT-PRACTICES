// Configuration
const API_BASE = 'https://api.genshin.dev';
const RESIN_PER_ITEM = 20; // 20 resin per domain run
const MAX_DAILY_RESIN = 180; // Natural resin per day

// State
let allCharacters = [];
let selectedCharacters = [];
let materialsData = {};
let domainsSchedule = {};

// DOM Elements
const characterGrid = document.getElementById('characterGrid');
const selectedCount = document.getElementById('selectedCount');
const materialsList = document.getElementById('materialsList');
const totalResin = document.getElementById('totalResin');
const todayResin = document.getElementById('todayResin');
const totalDays = document.getElementById('totalDays');
const searchInput = document.getElementById('searchInput');
const dayFilter = document.getElementById('dayFilter');
const clearBtn = document.getElementById('clearBtn');
const generateBtn = document.getElementById('generateBtn');
const saveBtn = document.getElementById('saveBtn');
const currentDay = document.getElementById('currentDay');
const loadingOverlay = document.getElementById('loadingOverlay');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setCurrentDay();
    loadSavedData();
    initializeApp();
});

// Set current day of week
function setCurrentDay() {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date().getDay();
    currentDay.textContent = days[today];
}

// Load data from localStorage
function loadSavedData() {
    const saved = localStorage.getItem('genshinSelectedCharacters');
    if (saved) {
        selectedCharacters = JSON.parse(saved);
        updateSelectedCount();
    }
}

// Initialize app
async function initializeApp() {
    try {
        loadingOverlay.style.display = 'flex';
        
        // Fetch characters
        const characters = await fetch(`${API_BASE}/characters`).then(res => res.json());
        
        // Create character list with details
        allCharacters = await Promise.all(
            characters.map(async (character) => {
                try {
                    const details = await fetch(`${API_BASE}/characters/${character}`).then(res => res.json());
                    return {
                        id: character,
                        name: details.name || character,
                        rarity: details.rarity || 4,
                        vision: details.vision || 'Unknown',
                        weapon: details.weapon || 'Unknown',
                        region: details.region || 'Unknown',
                        selected: selectedCharacters.includes(character)
                    };
                } catch (error) {
                    console.warn(`Failed to load details for ${character}:`, error);
                    return {
                        id: character,
                        name: character,
                        rarity: 4,
                        vision: 'Unknown',
                        weapon: 'Unknown',
                        region: 'Unknown',
                        selected: selectedCharacters.includes(character)
                    };
                }
            })
        );
        
        // Initialize domains schedule
        domainsSchedule = {
            monday: ['freedom', 'prosperity', 'transience'],
            tuesday: ['resistance', 'diligence', 'elegance'],
            wednesday: ['ballad', 'gold', 'light'],
            thursday: ['freedom', 'prosperity', 'transience'],
            friday: ['resistance', 'diligence', 'elegance'],
            saturday: ['ballad', 'gold', 'light'],
            sunday: ['all'] // All domains open on Sunday
        };
        
        renderCharacters();
        if (selectedCharacters.length > 0) {
            await updateFarmingPlan();
        }
        
    } catch (error) {
        console.error('Failed to initialize:', error);
        showError('Failed to load data. Please check your connection.');
    } finally {
        loadingOverlay.style.display = 'none';
    }
}

// Render characters to grid
function renderCharacters(filter = '') {
    const filtered = allCharacters.filter(char =>
        char.name.toLowerCase().includes(filter.toLowerCase()) ||
        char.vision.toLowerCase().includes(filter.toLowerCase()) ||
        char.weapon.toLowerCase().includes(filter.toLowerCase())
    );
    
    characterGrid.innerHTML = '';
    
    if (filtered.length === 0) {
        characterGrid.innerHTML = '<div class="loading">No characters found</div>';
        return;
    }
    
    filtered.forEach(character => {
        const card = document.createElement('div');
        card.className = `character-card ${character.selected ? 'selected' : ''}`;
        card.dataset.id = character.id;
        card.onclick = () => toggleCharacter(character.id);
        
        // Element color mapping
        const elementColors = {
            'Pyro': '#ff9999',
            'Hydro': '#80c0ff',
            'Anemo': '#80ffd4',
            'Electro': '#ff99ff',
            'Dendro': '#b3ff99',
            'Cryo': '#99ffff',
            'Geo': '#ffcc80'
        };
        
        const elementColor = elementColors[character.vision] || '#95a5a6';
        
        card.innerHTML = `
            <div class="character-icon" style="background: ${elementColor}20; color: ${elementColor}">
                <i class="fas fa-user"></i>
            </div>
            <div class="character-name">${character.name}</div>
            <div class="character-rarity">${'⭐'.repeat(character.rarity)}</div>
            <div style="font-size: 0.8rem; color: ${elementColor}; margin-top: 5px;">
                ${character.vision}
            </div>
        `;
        
        characterGrid.appendChild(card);
    });
}

// Toggle character selection
function toggleCharacter(characterId) {
    const index = selectedCharacters.indexOf(characterId);
    
    if (index === -1) {
        selectedCharacters.push(characterId);
    } else {
        selectedCharacters.splice(index, 1);
    }
    
    // Update character state
    const character = allCharacters.find(c => c.id === characterId);
    if (character) {
        character.selected = !character.selected;
    }
    
    updateSelectedCount();
    renderCharacters(searchInput.value);
    updateFarmingPlan();
    saveToLocalStorage();
}

// Update selected count
function updateSelectedCount() {
    selectedCount.textContent = selectedCharacters.length;
}

// Update farming plan
async function updateFarmingPlan() {
    if (selectedCharacters.length === 0) {
        showEmptyState();
        return;
    }
    
    try {
        // Simulate fetching material data for selected characters
        const materials = await calculateMaterials();
        renderMaterials(materials);
        calculateResin(materials);
        
    } catch (error) {
        console.error('Failed to update plan:', error);
        showError('Failed to calculate materials');
    }
}

// Calculate materials needed (simplified version)
async function calculateMaterials() {
    const materials = {};
    
    for (const charId of selectedCharacters) {
        try {
            // In a real app, you'd fetch character ascension data
            // For now, we'll use simulated data
            const charMaterials = getSimulatedMaterials(charId);
            
            for (const material of charMaterials) {
                if (!materials[material.id]) {
                    materials[material.id] = { ...material, total: 0 };
                }
                materials[material.id].total += material.quantity;
            }
        } catch (error) {
            console.warn(`Failed to get materials for ${charId}:`, error);
        }
    }
    
    return Object.values(materials);
}

// Get simulated materials (for demo purposes)
function getSimulatedMaterials(characterId) {
    // This is simulated data - in real app, fetch from API
    const commonMaterials = [
        { id: 'hero_wit', name: "Hero's Wit", type: 'exp_book', quantity: 60, domain: 'exp_domain', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] },
        { id: 'mora', name: "Mora", type: 'currency', quantity: 2000000, domain: 'ley_line', days: ['all'] },
        { id: 'local_specialty', name: "Local Specialty", type: 'local', quantity: 168, domain: 'world', days: ['all'] }
    ];
    
    // Add some talent books based on character
    const talentBooks = [
        { id: 'freedom', name: "Teachings of Freedom", type: 'talent_book', quantity: 9, domain: 'freedom_domain', days: ['monday', 'thursday'] },
        { id: 'prosperity', name: "Teachings of Prosperity", type: 'talent_book', quantity: 9, domain: 'prosperity_domain', days: ['tuesday', 'friday'] },
        { id: 'transience', name: "Teachings of Transience", type: 'talent_book', quantity: 9, domain: 'transience_domain', days: ['wednesday', 'saturday'] }
    ];
    
    // Randomly assign talent books for demo
    const randomBook = talentBooks[Math.floor(Math.random() * talentBooks.length)];
    
    return [...commonMaterials, randomBook];
}

// Render materials list
function renderMaterials(materials) {
    const dayFilterValue = dayFilter.value;
    const today = getTodayDayKey();
    
    const filteredMaterials = materials.filter(material => {
        if (dayFilterValue === 'all') return true;
        if (dayFilterValue === 'today') {
            return material.days.includes('all') || material.days.includes(today);
        }
        if (dayFilterValue === 'sunday') return material.days.includes('all');
        return material.days.includes(dayFilterValue);
    });
    
    if (filteredMaterials.length === 0) {
        materialsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-filter"></i>
                <p>No materials available for selected day filter</p>
            </div>
        `;
        return;
    }
    
    materialsList.innerHTML = '';
    
    filteredMaterials.forEach(material => {
        const item = document.createElement('div');
        item.className = 'material-item';
        
        // Get days as readable string
        const availableDays = material.days.includes('all') 
            ? 'Every day' 
            : material.days.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join('/');
        
        item.innerHTML = `
            <div class="material-info">
                <div class="material-icon">
                    <i class="fas fa-cube"></i>
                </div>
                <div>
                    <div class="material-name">${material.name}</div>
                    <div class="material-source">${material.type.replace('_', ' ').toUpperCase()}</div>
                </div>
            </div>
            <div class="material-details">
                <div class="material-quantity">${material.total || material.quantity}</div>
                <div class="material-days">${availableDays}</div>
            </div>
        `;
        
        materialsList.appendChild(item);
    });
}

// Calculate resin requirements
function calculateResin(materials) {
    // Simplified calculation
    let totalResinCost = 0;
    let todayResinCost = 0;
    
    const today = getTodayDayKey();
    
    materials.forEach(material => {
        // Assume each material "run" costs 20 resin
        const runsNeeded = Math.ceil((material.total || material.quantity) / 10); // Simplified
        const resinCost = runsNeeded * RESIN_PER_ITEM;
        
        totalResinCost += resinCost;
        
        // Add to today's cost if available today
        if (material.days.includes('all') || material.days.includes(today)) {
            todayResinCost += resinCost;
        }
    });
    
    totalResin.textContent = totalResinCost;
    todayResin.textContent = todayResinCost;
    totalDays.textContent = Math.ceil(totalResinCost / MAX_DAILY_RESIN);
}

// Get today's day key
function getTodayDayKey() {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
}

// Show empty state
function showEmptyState() {
    materialsList.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-inbox"></i>
            <p>Select characters to see materials needed</p>
        </div>
    `;
    totalResin.textContent = '0';
    todayResin.textContent = '0';
    totalDays.textContent = '0';
}

// Show error
function showError(message) {
    materialsList.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-exclamation-triangle"></i>
            <p>${message}</p>
        </div>
    `;
}

// Save to localStorage
function saveToLocalStorage() {
    localStorage.setItem('genshinSelectedCharacters', JSON.stringify(selectedCharacters));
}

// Event Listeners
searchInput.addEventListener('input', (e) => {
    renderCharacters(e.target.value);
});

dayFilter.addEventListener('change', () => {
    updateFarmingPlan();
});

clearBtn.addEventListener('click', () => {
    if (confirm('Clear all selected characters?')) {
        selectedCharacters.forEach(charId => {
            const character = allCharacters.find(c => c.id === charId);
            if (character) character.selected = false;
        });
        selectedCharacters = [];
        updateSelectedCount();
        renderCharacters(searchInput.value);
        showEmptyState();
        saveToLocalStorage();
    }
});

generateBtn.addEventListener('click', () => {
    // In a full version, this would generate an optimized plan
    alert('In a full version, this would generate an optimized farming route!');
});

saveBtn.addEventListener('click', () => {
    const plan = {
        characters: selectedCharacters,
        date: new Date().toISOString(),
        totalResin: totalResin.textContent
    };
    localStorage.setItem('genshinFarmingPlan', JSON.stringify(plan));
    alert('Plan saved to browser!');
});

// Add keyboard shortcut
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        searchInput.value = '';
        renderCharacters('');
    }
});