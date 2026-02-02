// Configuration - Using Project Amber API
const API_BASE = 'https://api.ambr.top';
const API_VERSION = 'v2';
const LANGUAGE = 'en'; // en, chs, cht, jp, kr, fr, de, id, pt, ru, es, th, vi

// Material types for filtering
const MATERIAL_TYPES = {
    EXP_BOOK: 'exp_book',
    TALENT_BOOK: 'talent_book',
    WEAPON_ASCENSION: 'weapon_ascension',
    CHARACTER_ASCENSION: 'character_ascension',
    BOSS_MATERIAL: 'boss_material',
    WORLD_BOSS: 'world_boss',
    LOCAL_SPECIALTY: 'local_specialty',
    COMMON_ENEMY: 'common_enemy'
};

// Days mapping for domains
const DOMAIN_SCHEDULE = {
    monday: ['freedom', 'prosperity', 'transience', 'ballad', 'resistance', 'diligence', 'elegance', 'light', 'admonition', 'ingenuity'],
    tuesday: ['resistance', 'diligence', 'elegance', 'freedom', 'prosperity', 'transience', 'ballad', 'light', 'admonition', 'ingenuity'],
    wednesday: ['ballad', 'gold', 'light', 'resistance', 'diligence', 'elegance', 'freedom', 'prosperity', 'transience', 'admonition', 'ingenuity'],
    thursday: ['freedom', 'prosperity', 'transience', 'ballad', 'resistance', 'diligence', 'elegance', 'light', 'admonition', 'ingenuity'],
    friday: ['resistance', 'diligence', 'elegance', 'freedom', 'prosperity', 'transience', 'ballad', 'light', 'admonition', 'ingenuity'],
    saturday: ['ballad', 'gold', 'light', 'resistance', 'diligence', 'elegance', 'freedom', 'prosperity', 'transience', 'admonition', 'ingenuity'],
    sunday: ['all'] // All domains open
};

// State
let allCharacters = [];
let selectedCharacters = [];
let allMaterials = {};
let characterDetailsCache = {};
let isLoading = false;

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
    try {
        const saved = localStorage.getItem('genshinSelectedCharacters');
        if (saved) {
            selectedCharacters = JSON.parse(saved);
            updateSelectedCount();
        }
    } catch (e) {
        console.warn('Failed to load saved data:', e);
        selectedCharacters = [];
    }
}

// Initialize app with working API
async function initializeApp() {
    try {
        isLoading = true;
        loadingOverlay.style.display = 'flex';
        
        console.log('Fetching character data from Project Amber API...');
        
        // Fetch characters from Project Amber API
        const response = await fetch(`${API_BASE}/${API_VERSION}/${LANGUAGE}/avatar`, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'GenshinPlanner/1.0'
            }
        });
        
        if (!response.ok) {
            throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.data || !data.data.items) {
            throw new Error('Invalid API response format');
        }
        
        // Transform API data to our format
        allCharacters = Object.entries(data.data.items).map(([id, character]) => ({
            id: id,
            name: character.name || id.replace(/_/g, ' '),
            rarity: character.rank || 4,
            element: character.element || 'Unknown',
            weaponType: character.weapon || 'Unknown',
            icon: character.icon || null,
            selected: selectedCharacters.includes(id)
        }));
        
        console.log(`Loaded ${allCharacters.length} characters`);
        
        // Load materials data
        await loadMaterialsData();
        
        renderCharacters();
        
        if (selectedCharacters.length > 0) {
            await updateFarmingPlan();
        }
        
        // Setup event listeners
        setupEventListeners();
        
    } catch (error) {
        console.error('Failed to initialize app:', error);
        showError(`Failed to load data: ${error.message}. Using demo data instead.`);
        loadDemoData();
    } finally {
        isLoading = false;
        loadingOverlay.style.display = 'none';
    }
}

// Load materials data
async function loadMaterialsData() {
    try {
        // You could fetch materials from the API here
        // For simplicity, we'll use predefined data
        allMaterials = {
            // Talent Books
            'freedom': { name: "Teachings of Freedom", type: MATERIAL_TYPES.TALENT_BOOK, resinCost: 20, days: ['monday', 'thursday'] },
            'prosperity': { name: "Teachings of Prosperity", type: MATERIAL_TYPES.TALENT_BOOK, resinCost: 20, days: ['tuesday', 'friday'] },
            'transience': { name: "Teachings of Transience", type: MATERIAL_TYPES.TALENT_BOOK, resinCost: 20, days: ['wednesday', 'saturday'] },
            
            // EXP Materials
            'hero_wit': { name: "Hero's Wit", type: MATERIAL_TYPES.EXP_BOOK, resinCost: 20, days: ['all'] },
            'mora': { name: "Mora", type: MATERIAL_TYPES.EXP_BOOK, resinCost: 20, days: ['all'] },
            
            // Common Materials
            'slime': { name: "Slime Condensate", type: MATERIAL_TYPES.COMMON_ENEMY, resinCost: 0, days: ['all'] },
            
            // Local Specialties
            'cecilia': { name: "Cecilia", type: MATERIAL_TYPES.LOCAL_SPECIALTY, resinCost: 0, days: ['all'] },
            'windwheel_aster': { name: "Windwheel Aster", type: MATERIAL_TYPES.LOCAL_SPECIALTY, resinCost: 0, days: ['all'] },
            
            // Boss Materials
            'dvalin_plume': { name: "Dvalin's Plume", type: MATERIAL_TYPES.BOSS_MATERIAL, resinCost: 40, days: ['all'] }
        };
        
    } catch (error) {
        console.warn('Failed to load materials data:', error);
        // Use basic materials data
        allMaterials = getBasicMaterials();
    }
}

// Get basic materials for demo
function getBasicMaterials() {
    return {
        'exp_book': { name: "EXP Books", type: MATERIAL_TYPES.EXP_BOOK, resinCost: 20, days: ['all'] },
        'talent_book': { name: "Talent Books", type: MATERIAL_TYPES.TALENT_BOOK, resinCost: 20, days: ['monday', 'thursday'] },
        'boss_mat': { name: "Boss Materials", type: MATERIAL_TYPES.BOSS_MATERIAL, resinCost: 40, days: ['all'] },
        'local_mat': { name: "Local Specialties", type: MATERIAL_TYPES.LOCAL_SPECIALTY, resinCost: 0, days: ['all'] }
    };
}

// Load demo data if API fails
function loadDemoData() {
    console.log('Loading demo data...');
    
    // Demo character data
    allCharacters = [
        { id: 'ayaka', name: "Kamisato Ayaka", rarity: 5, element: "Cryo", weaponType: "Sword", selected: false },
        { id: 'zhongli', name: "Zhongli", rarity: 5, element: "Geo", weaponType: "Polearm", selected: false },
        { id: 'hutao', name: "Hu Tao", rarity: 5, element: "Pyro", weaponType: "Polearm", selected: false },
        { id: 'raiden', name: "Raiden Shogun", rarity: 5, element: "Electro", weaponType: "Polearm", selected: false },
        { id: 'nahida', name: "Nahida", rarity: 5, element: "Dendro", weaponType: "Catalyst", selected: false },
        { id: 'xingqiu', name: "Xingqiu", rarity: 4, element: "Hydro", weaponType: "Sword", selected: false },
        { id: 'xiangling', name: "Xiangling", rarity: 4, element: "Pyro", weaponType: "Polearm", selected: false },
        { id: 'bennett', name: "Bennett", rarity: 4, element: "Pyro", weaponType: "Sword", selected: false }
    ];
    
    allMaterials = getBasicMaterials();
    
    // Mark selected characters
    allCharacters.forEach(char => {
        if (selectedCharacters.includes(char.id)) {
            char.selected = true;
        }
    });
    
    renderCharacters();
    setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
    searchInput.addEventListener('input', (e) => {
        renderCharacters(e.target.value);
    });
    
    dayFilter.addEventListener('change', () => {
        updateFarmingPlan();
    });
    
    clearBtn.addEventListener('click', clearSelection);
    generateBtn.addEventListener('click', generatePlan);
    saveBtn.addEventListener('click', savePlan);
}

// Render characters to grid
function renderCharacters(filter = '') {
    const filtered = allCharacters.filter(char =>
        char.name.toLowerCase().includes(filter.toLowerCase()) ||
        char.element.toLowerCase().includes(filter.toLowerCase()) ||
        char.weaponType.toLowerCase().includes(filter.toLowerCase())
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
        
        const elementColor = elementColors[character.element] || '#95a5a6';
        
        card.innerHTML = `
            <div class="character-icon" style="background: ${elementColor}20; border: 2px solid ${elementColor}40; color: ${elementColor}">
                <i class="fas fa-${getWeaponIcon(character.weaponType)}"></i>
                <div class="element-badge" style="background: ${elementColor}">
                    ${getElementSymbol(character.element)}
                </div>
            </div>
            <div class="character-name">${character.name}</div>
            <div class="character-rarity">${'⭐'.repeat(character.rarity)}</div>
            <div style="font-size: 0.8rem; color: #95a5a6; margin-top: 3px;">
                ${character.weaponType}
            </div>
        `;
        
        characterGrid.appendChild(card);
    });
}

// Get weapon icon
function getWeaponIcon(weaponType) {
    const icons = {
        'Sword': 'sword',
        'Claymore': 'hammer',
        'Polearm': 'staff',
        'Catalyst': 'book',
        'Bow': 'crosshairs'
    };
    return icons[weaponType] || 'user';
}

// Get element symbol
function getElementSymbol(element) {
    const symbols = {
        'Pyro': '🔥',
        'Hydro': '💧',
        'Anemo': '🌪️',
        'Electro': '⚡',
        'Dendro': '🌿',
        'Cryo': '❄️',
        'Geo': '🪨'
    };
    return symbols[element] || element.charAt(0);
}

// Toggle character selection
function toggleCharacter(characterId) {
    if (isLoading) return;
    
    const character = allCharacters.find(c => c.id === characterId);
    if (!character) return;
    
    const index = selectedCharacters.indexOf(characterId);
    
    if (index === -1) {
        selectedCharacters.push(characterId);
        character.selected = true;
    } else {
        selectedCharacters.splice(index, 1);
        character.selected = false;
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
        const materials = await calculateMaterials();
        renderMaterials(materials);
        calculateResin(materials);
    } catch (error) {
        console.error('Failed to update plan:', error);
        showError('Failed to calculate materials');
    }
}

// Calculate materials needed
async function calculateMaterials() {
    const materials = {};
    
    for (const charId of selectedCharacters) {
        const charMaterials = getCharacterMaterials(charId);
        
        for (const [materialId, quantity] of Object.entries(charMaterials)) {
            if (allMaterials[materialId]) {
                if (!materials[materialId]) {
                    materials[materialId] = {
                        ...allMaterials[materialId],
                        quantity: 0,
                        total: 0
                    };
                }
                materials[materialId].quantity += quantity;
                materials[materialId].total += quantity;
            }
        }
    }
    
    return Object.values(materials);
}

// Get character materials (simulated based on character)
function getCharacterMaterials(characterId) {
    // This simulates material requirements
    // In a real app, you'd fetch this from the API
    
    const baseMaterials = {
        'hero_wit': 60,  // EXP books
        'mora': 2000000, // Mora
    };
    
    // Add element-specific local specialty
    const specialties = {
        'ayaka': { 'cecilia': 168 },
        'zhongli': { 'cor_lapis': 168 },
        'hutao': { 'silk_flower': 168 },
        'raiden': { 'amakumo_fruit': 168 },
        'nahida': { 'kalpalata_lotus': 168 },
        'xingqiu': { 'silk_flower': 168 },
        'xiangling': { 'jueyun_chili': 168 },
        'bennett': { 'windwheel_aster': 168 }
    };
    
    // Add talent books based on character
    const talentBooks = {
        'ayaka': { 'elegance': 9 },
        'zhongli': { 'gold': 9 },
        'hutao': { 'diligence': 9 },
        'raiden': { 'light': 9 },
        'nahida': { 'ingenuity': 9 },
        'xingqiu': { 'gold': 9 },
        'xiangling': { 'diligence': 9 },
        'bennett': { 'resistance': 9 }
    };
    
    const materials = { ...baseMaterials };
    
    if (specialties[characterId]) {
        Object.assign(materials, specialties[characterId]);
    }
    
    if (talentBooks[characterId]) {
        Object.assign(materials, talentBooks[characterId]);
    }
    
    // Add some common enemy drops
    materials['slime'] = 46;
    
    return materials;
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
                <p style="font-size: 0.9rem; margin-top: 10px;">Try selecting "All Materials"</p>
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
            : material.days.map(day => {
                const dayMap = {
                    'monday': 'Mon/Thu',
                    'tuesday': 'Tue/Fri',
                    'wednesday': 'Wed/Sat',
                    'thursday': 'Mon/Thu',
                    'friday': 'Tue/Fri',
                    'saturday': 'Wed/Sat',
                    'sunday': 'Sunday'
                };
                return dayMap[day] || day.charAt(0).toUpperCase() + day.slice(1);
            }).join(', ');
        
        // Get material type icon
        const typeIcons = {
            [MATERIAL_TYPES.EXP_BOOK]: 'fa-book',
            [MATERIAL_TYPES.TALENT_BOOK]: 'fa-scroll',
            [MATERIAL_TYPES.LOCAL_SPECIALTY]: 'fa-leaf',
            [MATERIAL_TYPES.BOSS_MATERIAL]: 'fa-gem',
            [MATERIAL_TYPES.COMMON_ENEMY]: 'fa-skull'
        };
        
        const iconClass = typeIcons[material.type] || 'fa-cube';
        
        item.innerHTML = `
            <div class="material-info">
                <div class="material-icon">
                    <i class="fas ${iconClass}"></i>
                </div>
                <div>
                    <div class="material-name">${material.name}</div>
                    <div class="material-source">${material.type.replace(/_/g, ' ').toUpperCase()}</div>
                </div>
            </div>
            <div class="material-details">
                <div class="material-quantity">${formatNumber(material.quantity || material.total)}</div>
                <div class="material-days">${availableDays}</div>
                ${material.resinCost > 0 ? 
                    `<div class="material-resin">${material.resinCost} resin</div>` : 
                    `<div class="material-resin">World</div>`
                }
            </div>
        `;
        
        materialsList.appendChild(item);
    });
}

// Format large numbers
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Calculate resin requirements
function calculateResin(materials) {
    let totalResinCost = 0;
    let todayResinCost = 0;
    
    const today = getTodayDayKey();
    
    materials.forEach(material => {
        if (material.resinCost > 0) {
            // Estimate runs needed (simplified)
            const runsNeeded = Math.ceil((material.quantity || material.total) / 10);
            const resinCost = runsNeeded * material.resinCost;
            
            totalResinCost += resinCost;
            
            // Add to today's cost if available today
            if (material.days.includes('all') || material.days.includes(today)) {
                todayResinCost += resinCost;
            }
        }
    });
    
    totalResin.textContent = totalResinCost;
    todayResin.textContent = todayResinCost;
    totalDays.textContent = Math.ceil(totalResinCost / 160); // 160 resin per day
}

// Get today's day key
function getTodayDayKey() {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
}

// Clear selection
function clearSelection() {
    if (isLoading) return;
    
    if (selectedCharacters.length === 0) {
        return;
    }
    
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
}

// Generate plan
function generatePlan() {
    if (selectedCharacters.length === 0) {
        alert('Please select at least one character first!');
        return;
    }
    
    const today = getTodayDayKey();
    const dayName = today.charAt(0).toUpperCase() + today.slice(1);
    
    const plan = `
🧾 Farming Plan for ${dayName}:
━━━━━━━━━━━━━━━━━━━━
🎯 Selected Characters: ${selectedCharacters.length}
⏱️ Estimated Resin: ${todayResin.textContent}
📅 Complete in: ${totalDays.textContent} days
━━━━━━━━━━━━━━━━━━━━
💡 Tip: Focus on materials available today to optimize resin usage!
    `;
    
    alert(plan);
}

// Save plan
function savePlan() {
    if (selectedCharacters.length === 0) {
        alert('No characters selected to save!');
        return;
    }
    
    const plan = {
        characters: selectedCharacters,
        date: new Date().toISOString(),
        resin: {
            total: totalResin.textContent,
            today: todayResin.textContent,
            days: totalDays.textContent
        },
        version: '1.0'
    };
    
    localStorage.setItem('genshinFarmingPlan', JSON.stringify(plan));
    
    // Create a download link
    const dataStr = JSON.stringify(plan, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `genshin-plan-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    alert('Plan saved and downloaded!');
}

// Save to localStorage
function saveToLocalStorage() {
    try {
        localStorage.setItem('genshinSelectedCharacters', JSON.stringify(selectedCharacters));
    } catch (e) {
        console.warn('Failed to save to localStorage:', e);
    }
}

// Show empty state
function showEmptyState() {
    materialsList.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-inbox"></i>
            <p>Select characters to see materials needed</p>
            <p style="font-size: 0.9rem; margin-top: 10px;">Click on character cards to select them</p>
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
            <i class="fas fa-exclamation-triangle" style="color: #e74c3c;"></i>
            <p>${message}</p>
            <p style="font-size: 0.9rem; margin-top: 10px;">Using demo data for now</p>
        </div>
    `;
}
