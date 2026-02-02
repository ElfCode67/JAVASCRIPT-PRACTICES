// Genshin Ascension Planner - Simple Version
// Using Project Amber API (https://api.ambr.top)

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const characterList = document.getElementById('characterList');
    const searchInput = document.getElementById('searchInput');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const selectedCharacter = document.getElementById('selectedCharacter');
    const materialsGrid = document.getElementById('materialsGrid');
    const levelSelect = document.getElementById('levelSelect');
    const totalMaterials = document.getElementById('totalMaterials');
    const totalResin = document.getElementById('totalResin');
    const totalMora = document.getElementById('totalMora');
    const trackMaterialsBtn = document.getElementById('trackMaterialsBtn');
    const resetBtn = document.getElementById('resetBtn');
    const saveBtn = document.getElementById('saveBtn');
    const trackingModal = document.getElementById('trackingModal');
    const closeModal = document.querySelector('.close-modal');
    const cancelTracking = document.getElementById('cancelTracking');
    const saveTracking = document.getElementById('saveTracking');
    const trackingContent = document.getElementById('trackingContent');

    // State
    let characters = [];
    let selectedChar = null;
    let currentMaterials = [];
    let ownedMaterials = JSON.parse(localStorage.getItem('genshinOwnedMaterials')) || {};

    // API Configuration
    const API_BASE = 'https://api.ambr.top/v2';
    const LANGUAGE = 'en';

    // Initialize the app
    async function init() {
        try {
            // Load demo data first for faster UI
            loadDemoCharacters();
            
            // Then try to fetch from API
            await fetchCharacters();
        } catch (error) {
            console.warn('Using demo data due to API error:', error);
            // Demo data already loaded
        }
        
        setupEventListeners();
        loadSavedCharacter();
    }

    // Load demo character data
    function loadDemoCharacters() {
        characters = [
            {
                id: 'ayaka',
                name: 'Kamisato Ayaka',
                element: 'Cryo',
                weapon: 'Sword',
                rarity: 5,
                icon: '❄️'
            },
            {
                id: 'hutao',
                name: 'Hu Tao',
                element: 'Pyro',
                weapon: 'Polearm',
                rarity: 5,
                icon: '🔥'
            },
            {
                id: 'zhongli',
                name: 'Zhongli',
                element: 'Geo',
                weapon: 'Polearm',
                rarity: 5,
                icon: '🪨'
            },
            {
                id: 'raiden',
                name: 'Raiden Shogun',
                element: 'Electro',
                weapon: 'Polearm',
                rarity: 5,
                icon: '⚡'
            },
            {
                id: 'nahida',
                name: 'Nahida',
                element: 'Dendro',
                weapon: 'Catalyst',
                rarity: 5,
                icon: '🌿'
            },
            {
                id: 'xingqiu',
                name: 'Xingqiu',
                element: 'Hydro',
                weapon: 'Sword',
                rarity: 4,
                icon: '💧'
            },
            {
                id: 'xiangling',
                name: 'Xiangling',
                element: 'Pyro',
                weapon: 'Polearm',
                rarity: 4,
                icon: '🔥'
            },
            {
                id: 'bennett',
                name: 'Bennett',
                element: 'Pyro',
                weapon: 'Sword',
                rarity: 4,
                icon: '🔥'
            },
            {
                id: 'fischl',
                name: 'Fischl',
                element: 'Electro',
                weapon: 'Bow',
                rarity: 4,
                icon: '⚡'
            },
            {
                id: 'sucrose',
                name: 'Sucrose',
                element: 'Anemo',
                weapon: 'Catalyst',
                rarity: 4,
                icon: '🌪️'
            }
        ];
        
        renderCharacters();
    }

    // Try to fetch characters from API
    async function fetchCharacters() {
        try {
            console.log('Fetching characters from API...');
            
            // Try Project Amber API
            const response = await fetch(`${API_BASE}/${LANGUAGE}/avatar`, {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'GenshinPlanner/1.0'
                }
            });
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.data && data.data.items) {
                // Transform API data
                characters = Object.entries(data.data.items).map(([id, charData]) => ({
                    id: id,
                    name: charData.name || id.replace(/_/g, ' '),
                    element: charData.element || 'Unknown',
                    weapon: charData.weapon || 'Unknown',
                    rarity: charData.rank || 4,
                    icon: getElementIcon(charData.element)
                }));
                
                renderCharacters();
                console.log(`Loaded ${characters.length} characters from API`);
            }
        } catch (error) {
            console.warn('API fetch failed, using demo data:', error);
        }
    }

    // Get icon for element
    function getElementIcon(element) {
        const icons = {
            'Pyro': '🔥',
            'Hydro': '💧',
            'Anemo': '🌪️',
            'Electro': '⚡',
            'Dendro': '🌿',
            'Cryo': '❄️',
            'Geo': '🪨'
        };
        return icons[element] || '👤';
    }

    // Render character list
    function renderCharacters(filter = '', elementFilter = 'all') {
        if (characterList.querySelector('.loading-state')) {
            characterList.innerHTML = '';
        }
        
        let filteredChars = characters.filter(char => {
            const matchesSearch = char.name.toLowerCase().includes(filter.toLowerCase());
            const matchesElement = elementFilter === 'all' || char.element.toLowerCase() === elementFilter;
            return matchesSearch && matchesElement;
        });
        
        if (filteredChars.length === 0) {
            characterList.innerHTML = `
                <div class="loading-state">
                    <i class="fas fa-search"></i>
                    <p>No characters found</p>
                </div>
            `;
            return;
        }
        
        characterList.innerHTML = '';
        
        filteredChars.forEach(char => {
            const card = document.createElement('div');
            card.className = `character-card ${selectedChar?.id === char.id ? 'selected' : ''}`;
            card.dataset.id = char.id;
            
            card.innerHTML = `
                <div class="character-icon ${char.element.toLowerCase()}">
                    ${char.icon}
                </div>
                <div class="character-name">${char.name}</div>
                <div class="character-info">
                    <span class="character-rarity">${'★'.repeat(char.rarity)}</span>
                    <span class="character-element ${char.element.toLowerCase()}">${char.element}</span>
                </div>
            `;
            
            card.addEventListener('click', () => selectCharacter(char.id));
            characterList.appendChild(card);
        });
    }

    // Select a character
    async function selectCharacter(charId) {
        const char = characters.find(c => c.id === charId);
        if (!char) return;
        
        // Update UI
        document.querySelectorAll('.character-card').forEach(card => {
            card.classList.remove('selected');
        });
        const selectedCard = document.querySelector(`.character-card[data-id="${charId}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }
        
        selectedChar = char;
        updateSelectedCharacterDisplay();
        await loadCharacterMaterials();
        
        // Save to localStorage
        localStorage.setItem('lastSelectedCharacter', charId);
    }

    // Update selected character display
    function updateSelectedCharacterDisplay() {
        if (!selectedChar) {
            selectedCharacter.innerHTML = `
                <div class="placeholder">
                    <i class="fas fa-user"></i>
                    <p>Select a character to view ascension materials</p>
                </div>
            `;
            return;
        }
        
        selectedCharacter.innerHTML = `
            <div class="selected-character-details">
                <div class="selected-character-image ${selectedChar.element.toLowerCase()}">
                    ${selectedChar.icon}
                </div>
                <div class="selected-character-info">
                    <h3>${selectedChar.name}</h3>
                    <p><strong>Element:</strong> ${selectedChar.element}</p>
                    <p><strong>Weapon:</strong> ${selectedChar.weapon}</p>
                    <p><strong>Rarity:</strong> ${'★'.repeat(selectedChar.rarity)}</p>
                </div>
            </div>
        `;
    }

    // Load character materials (demo data for now)
    async function loadCharacterMaterials() {
        if (!selectedChar) return;
        
        // Simulate API call delay
        // In a real app, you would fetch from: ${API_BASE}/${LANGUAGE}/avatarFetter/${selectedChar.id}
        
        // Demo material data based on character element
        const elementMaterials = {
            'Pyro': [
                { id: 'agnidus_agate', name: 'Agnidus Agate Sliver', type: 'Gem', quantity: 1, icon: '💎' },
                { id: 'everflame_seed', name: 'Everflame Seed', type: 'Boss Material', quantity: 2, icon: '🔥' },
                { id: 'nectar', name: 'Whopperflower Nectar', type: 'Common', quantity: 3, icon: '🍯' }
            ],
            'Hydro': [
                { id: 'varunada_lazurite', name: 'Varunada Lazurite Sliver', type: 'Gem', quantity: 1, icon: '💎' },
                { id: 'cleansing_heart', name: 'Cleansing Heart', type: 'Boss Material', quantity: 2, icon: '💧' },
                { id: 'nectar', name: 'Whopperflower Nectar', type: 'Common', quantity: 3, icon: '🍯' }
            ],
            'Cryo': [
                { id: 'shivada_jade', name: 'Shivada Jade Sliver', type: 'Gem', quantity: 1, icon: '💎' },
                { id: 'hoarfrost_core', name: 'Hoarfrost Core', type: 'Boss Material', quantity: 2, icon: '❄️' },
                { id: 'nectar', name: 'Whopperflower Nectar', type: 'Common', quantity: 3, icon: '🍯' }
            ],
            'Electro': [
                { id: 'vajrada_amethyst', name: 'Vajrada Amethyst Sliver', type: 'Gem', quantity: 1, icon: '💎' },
                { id: 'lightning_prism', name: 'Lightning Prism', type: 'Boss Material', quantity: 2, icon: '⚡' },
                { id: 'nectar', name: 'Whopperflower Nectar', type: 'Common', quantity: 3, icon: '🍯' }
            ],
            'Dendro': [
                { id: 'nagadus_emerald', name: 'Nagadus Emerald Sliver', type: 'Gem', quantity: 1, icon: '💎' },
                { id: 'majestic_hooked_beak', name: 'Majestic Hooked Beak', type: 'Boss Material', quantity: 2, icon: '🌿' },
                { id: 'nectar', name: 'Whopperflower Nectar', type: 'Common', quantity: 3, icon: '🍯' }
            ],
            'Anemo': [
                { id: 'vayuda_turquoise', name: 'Vayuda Turquoise Sliver', type: 'Gem', quantity: 1, icon: '💎' },
                { id: 'hurricane_seed', name: 'Hurricane Seed', type: 'Boss Material', quantity: 2, icon: '🌪️' },
                { id: 'nectar', name: 'Whopperflower Nectar', type: 'Common', quantity: 3, icon: '🍯' }
            ],
            'Geo': [
                { id: 'prithiva_topaz', name: 'Prithiva Topaz Sliver', type: 'Gem', quantity: 1, icon: '💎' },
                { id: 'basalt_pillar', name: 'Basalt Pillar', type: 'Boss Material', quantity: 2, icon: '🪨' },
                { id: 'nectar', name: 'Whopperflower Nectar', type: 'Common', quantity: 3, icon: '🍯' }
            ]
        };
        
        // Add common materials for all characters
        const commonMaterials = [
            { id: 'hero_wit', name: "Hero's Wit", type: 'EXP Book', quantity: 60, icon: '📚' },
            { id: 'mora', name: 'Mora', type: 'Currency', quantity: 2000000, icon: '💰' },
            { id: 'local_specialty', name: 'Local Specialty', type: 'Local', quantity: 168, icon: '🌱' }
        ];
        
        currentMaterials = [...(elementMaterials[selectedChar.element] || []), ...commonMaterials];
        
        updateMaterialsDisplay();
        updateSummary();
    }

    // Update materials display based on selected level
    function updateMaterialsDisplay() {
        if (!currentMaterials.length) {
            materialsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>No materials data available</p>
                </div>
            `;
            return;
        }
        
        const targetLevel = parseInt(levelSelect.value);
        const multiplier = targetLevel; // Simple multiplier for demo
        
        materialsGrid.innerHTML = '';
        
        currentMaterials.forEach(material => {
            const totalNeeded = material.quantity * multiplier;
            const owned = ownedMaterials[material.id] || 0;
            const remaining = Math.max(0, totalNeeded - owned);
            
            const card = document.createElement('div');
            card.className = 'material-card';
            card.dataset.id = material.id;
            
            card.innerHTML = `
                <div class="material-header">
                    <div class="material-icon">
                        ${material.icon}
                    </div>
                    <div class="material-info">
                        <div class="material-name">${material.name}</div>
                        <div class="material-type">${material.type}</div>
                    </div>
                </div>
                <div class="material-quantity">
                    ${remaining}/${totalNeeded}
                </div>
                ${owned > 0 ? `<div class="owned-info">Owned: ${owned}</div>` : ''}
            `;
            
            materialsGrid.appendChild(card);
        });
    }

    // Update summary calculations
    function updateSummary() {
        if (!currentMaterials.length) {
            totalMaterials.textContent = '0';
            totalResin.textContent = '0';
            totalMora.textContent = '0';
            return;
        }
        
        const targetLevel = parseInt(levelSelect.value);
        
        // Calculate totals
        let materialCount = 0;
        let resinCost = 0;
        let moraCost = 0;
        
        currentMaterials.forEach(material => {
            const needed = material.quantity * targetLevel;
            materialCount += needed;
            
            // Simulate resin and mora costs
            if (material.type.includes('Boss')) resinCost += 40 * needed;
            else if (material.type === 'Gem') resinCost += 20 * needed;
            else if (material.type === 'EXP Book') resinCost += 10 * needed;
            
            if (material.name === 'Mora') moraCost = needed;
        });
        
        // Add base mora cost for ascension
        moraCost += 200000 * targetLevel;
        
        totalMaterials.textContent = materialCount;
        totalResin.textContent = resinCost;
        totalMora.textContent = formatMora(moraCost);
    }

    // Format mora with commas
    function formatMora(amount) {
        return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    // Open material tracking modal
    function openTrackingModal() {
        if (!selectedChar || !currentMaterials.length) {
            alert('Please select a character first!');
            return;
        }
        
        trackingContent.innerHTML = '';
        
        currentMaterials.forEach(material => {
            const item = document.createElement('div');
            item.className = 'tracking-item';
            
            item.innerHTML = `
                <div class="tracking-info">
                    <strong>${material.name}</strong>
                    <div class="material-type">${material.type}</div>
                </div>
                <input type="number" 
                       class="tracking-input" 
                       data-id="${material.id}"
                       value="${ownedMaterials[material.id] || 0}" 
                       min="0" 
                       max="9999">
            `;
            
            trackingContent.appendChild(item);
        });
        
        trackingModal.classList.add('active');
    }

    // Save tracked materials
    function saveTrackedMaterials() {
        const inputs = trackingContent.querySelectorAll('.tracking-input');
        
        inputs.forEach(input => {
            const materialId = input.dataset.id;
            const value = parseInt(input.value) || 0;
            ownedMaterials[materialId] = value;
        });
        
        localStorage.setItem('genshinOwnedMaterials', JSON.stringify(ownedMaterials));
        trackingModal.classList.remove('active');
        updateMaterialsDisplay();
        updateSummary();
        
        alert('Progress saved!');
    }

    // Reset tracking
    function resetTracking() {
        if (confirm('Reset all tracked materials for this character?')) {
            currentMaterials.forEach(material => {
                delete ownedMaterials[material.id];
            });
            localStorage.setItem('genshinOwnedMaterials', JSON.stringify(ownedMaterials));
            updateMaterialsDisplay();
            updateSummary();
        }
    }

    // Save progress
    function saveProgress() {
        if (!selectedChar) {
            alert('Please select a character first!');
            return;
        }
        
        const progress = {
            character: selectedChar.id,
            date: new Date().toISOString(),
            ownedMaterials: ownedMaterials,
            targetLevel: levelSelect.value
        };
        
        localStorage.setItem('genshinProgress', JSON.stringify(progress));
        
        // Create download link
        const dataStr = JSON.stringify(progress, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const fileName = `genshin-plan-${selectedChar.id}-${new Date().toISOString().split('T')[0]}.json`;
        
        const link = document.createElement('a');
        link.setAttribute('href', dataUri);
        link.setAttribute('download', fileName);
        link.click();
        
        alert('Progress saved and downloaded!');
    }

    // Load saved character
    function loadSavedCharacter() {
        const lastChar = localStorage.getItem('lastSelectedCharacter');
        if (lastChar) {
            selectCharacter(lastChar);
        }
    }

    // Setup event listeners
    function setupEventListeners() {
        // Search input
        searchInput.addEventListener('input', (e) => {
            const activeFilter = document.querySelector('.filter-btn.active');
            const elementFilter = activeFilter ? activeFilter.dataset.filter : 'all';
            renderCharacters(e.target.value, elementFilter);
        });
        
        // Element filter buttons
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderCharacters(searchInput.value, btn.dataset.filter);
            });
        });
        
        // Level selector
        levelSelect.addEventListener('change', () => {
            updateMaterialsDisplay();
            updateSummary();
        });
        
        // Action buttons
        trackMaterialsBtn.addEventListener('click', openTrackingModal);
        resetBtn.addEventListener('click', resetTracking);
        saveBtn.addEventListener('click', saveProgress);
        
        // Modal controls
        closeModal.addEventListener('click', () => {
            trackingModal.classList.remove('active');
        });
        
        cancelTracking.addEventListener('click', () => {
            trackingModal.classList.remove('active');
        });
        
        saveTracking.addEventListener('click', saveTrackedMaterials);
        
        // Close modal when clicking outside
        trackingModal.addEventListener('click', (e) => {
            if (e.target === trackingModal) {
                trackingModal.classList.remove('active');
            }
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                trackingModal.classList.remove('active');
            }
        });
    }

    // Initialize the app
    init();
});