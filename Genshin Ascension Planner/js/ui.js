// DOM Rendering and UI Management
import { appState } from './state.js';
import { api } from './api.js';

class UI {
    constructor() {
        this.elements = {
            charactersGrid: document.getElementById('charactersGrid'),
            selectedCharacters: document.getElementById('selectedCharacters'),
            loadingState: document.getElementById('loadingState'),
            errorState: document.getElementById('errorState'),
            emptyState: document.getElementById('emptyState'),
            ascensionModal: document.getElementById('ascensionModal'),
            modalCharacterInfo: document.getElementById('modalCharacterInfo'),
            ascensionContent: document.getElementById('ascensionContent'),
            modalLoading: document.getElementById('modalLoading'),
            characterSearch: document.getElementById('characterSearch'),
            elementFilter: document.getElementById('elementFilter'),
            rarityFilter: document.getElementById('rarityFilter'),
            roleFilter: document.getElementById('roleFilter'),
            activeFilters: document.getElementById('activeFilters'),
            characterCount: document.getElementById('characterCount'),
            selectedCount: document.getElementById('selectedCount'),
            loadMore: document.getElementById('loadMore')
        };
    }

    // Show/hide loading state
    showLoading(show = true) {
        if (show) {
            this.elements.loadingState.classList.remove('hidden');
            this.elements.errorState.classList.add('hidden');
            this.elements.emptyState.classList.add('hidden');
        } else {
            this.elements.loadingState.classList.add('hidden');
        }
    }

    // Show error state
    showError(message) {
        this.elements.errorState.classList.remove('hidden');
        this.elements.errorMessage.textContent = message;
        this.elements.loadingState.classList.add('hidden');
    }

    // Hide error state
    hideError() {
        this.elements.errorState.classList.add('hidden');
    }

    // Render character cards
    renderCharacters(characters) {
        this.elements.charactersGrid.innerHTML = '';
        
        if (characters.length === 0) {
            this.elements.emptyState.classList.remove('hidden');
            this.elements.loadMore.classList.add('hidden');
            return;
        }

        this.elements.emptyState.classList.add('hidden');
        
        characters.forEach(character => {
            const card = this.createCharacterCard(character);
            this.elements.charactersGrid.appendChild(card);
        });

        // Update character count
        this.elements.characterCount.textContent = `${characters.length} character${characters.length !== 1 ? 's' : ''}`;

        // Show/hide load more button
        if (appState.canLoadMore()) {
            this.elements.loadMore.classList.remove('hidden');
        } else {
            this.elements.loadMore.classList.add('hidden');
        }
    }

    // Create character card element
    createCharacterCard(character) {
        const card = document.createElement('div');
        card.className = 'character-card';
        card.dataset.character = character.name;
        
        const elementColor = this.getElementColor(character.vision);
        
        card.innerHTML = `
            <div class="card-image">
                <img 
                    src="https://api.genshin.dev/characters/${character.name}/card" 
                    alt="${character.name}"
                    onerror="this.src='https://via.placeholder.com/300x200/2d5aa0/ffffff?text=${encodeURIComponent(character.name)}'"
                >
                <span class="card-badge">${'★'.repeat(character.rarity)}</span>
                <div class="element-badge" style="background-color: ${elementColor}">
                    <i class="fas ${this.getElementIcon(character.vision)}"></i>
                </div>
            </div>
            <div class="card-content">
                <div class="card-header">
                    <h3 class="card-title">${character.name}</h3>
                </div>
                <span class="role-tag">${this.getCharacterRole(character.name)}</span>
                <p class="card-description">${character.description || 'A character from Teyvat'}</p>
                <button class="btn-primary add-character-btn" style="width: 100%">
                    <i class="fas fa-plus"></i> Add to My Characters
                </button>
            </div>
        `;

        return card;
    }

    // Render selected characters
    renderSelectedCharacters() {
        const selected = appState.getSelectedCharacters();
        this.elements.selectedCharacters.innerHTML = '';
        
        if (selected.length === 0) {
            this.elements.selectedCharacters.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <p>No characters selected yet</p>
                    <p class="text-muted">Click "Add to My Characters" on any character card</p>
                </div>
            `;
            this.elements.selectedCount.textContent = '0';
            return;
        }

        this.elements.selectedCount.textContent = selected.length;

        selected.forEach(character => {
            const selectedEl = this.createSelectedCharacterElement(character);
            this.elements.selectedCharacters.appendChild(selectedEl);
        });
    }

    // Create selected character element
    createSelectedCharacterElement(character) {
        const element = document.createElement('div');
        element.className = 'selected-character';
        element.dataset.character = character.name;
        
        const elementColor = this.getElementColor(character.vision);
        
        element.innerHTML = `
            <img 
                src="https://api.genshin.dev/characters/${character.name}/icon" 
                alt="${character.name}"
                onerror="this.src='https://via.placeholder.com/60/2d5aa0/ffffff?text=${encodeURIComponent(character.name.charAt(0))}'"
            >
            <div class="selected-character-info">
                <h4>${character.name}</h4>
                <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
                    <span class="role-tag">${this.getCharacterRole(character.name)}</span>
                    <span style="color: ${elementColor}">
                        <i class="fas ${this.getElementIcon(character.vision)}"></i>
                        ${character.vision}
                    </span>
                </div>
            </div>
            <div class="selected-character-controls">
                <button class="btn-icon plan-btn" title="Plan Ascension">
                    <i class="fas fa-sort-amount-up"></i>
                </button>
                <button class="btn-icon remove-btn" title="Remove">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        return element;
    }

    // Render active filters
    renderActiveFilters() {
        const activeFilters = appState.getActiveFilters();
        this.elements.activeFilters.innerHTML = '';
        
        activeFilters.forEach(filter => {
            const filterEl = document.createElement('div');
            filterEl.className = 'filter-tag';
            
            let displayValue = filter.value;
            let icon = 'fas fa-filter';
            
            switch (filter.type) {
                case 'element':
                    icon = this.getElementIcon(filter.value);
                    break;
                case 'rarity':
                    icon = 'fas fa-star';
                    displayValue = filter.value + '★';
                    break;
                case 'role':
                    icon = 'fas fa-user-tag';
                    break;
                case 'search':
                    icon = 'fas fa-search';
                    break;
            }
            
            filterEl.innerHTML = `
                <i class="${icon}"></i>
                <span>${displayValue}</span>
                <button class="remove" data-filter="${filter.type}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            this.elements.activeFilters.appendChild(filterEl);
        });
    }

    // Update filter inputs from state
    updateFilterInputs() {
        const filters = appState.getFilters();
        this.elements.characterSearch.value = filters.search || '';
        this.elements.elementFilter.value = filters.element || '';
        this.elements.rarityFilter.value = filters.rarity || '';
        this.elements.roleFilter.value = filters.role || '';
    }

    // Show ascension modal
    async showAscensionModal(characterName) {
        this.elements.ascensionModal.classList.remove('hidden');
        this.elements.ascensionContent.innerHTML = '';
        this.elements.modalLoading.classList.remove('hidden');
        
        try {
            const character = await api.getCharacterDetails(characterName);
            this.renderModalCharacterInfo(character);
            
            const materials = await api.getAscensionMaterials(character);
            this.renderAscensionContent(materials);
            
            this.elements.modalLoading.classList.add('hidden');
        } catch (error) {
            this.elements.modalLoading.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to load ascension data</p>
                </div>
            `;
            console.error('Failed to load ascension data:', error);
        }
    }

    // Hide ascension modal
    hideAscensionModal() {
        this.elements.ascensionModal.classList.add('hidden');
    }

    // Render character info in modal
    renderModalCharacterInfo(character) {
        const elementColor = this.getElementColor(character.vision);
        
        this.elements.modalCharacterInfo.innerHTML = `
            <img 
                src="https://api.genshin.dev/characters/${character.name}/icon-big" 
                alt="${character.name}"
                onerror="this.src='https://via.placeholder.com/100/${elementColor.replace('#', '')}/ffffff?text=${encodeURIComponent(character.name)}'"
            >
            <div style="flex: 1">
                <h3 style="margin-bottom: 8px">${character.name}</h3>
                <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 8px">
                    <span style="color: ${elementColor}; font-weight: 600">
                        <i class="fas ${this.getElementIcon(character.vision)}"></i>
                        ${character.vision}
                    </span>
                    <span style="color: var(--warning); font-weight: 600">
                        ${'★'.repeat(character.rarity)}
                    </span>
                    <span class="role-tag">${this.getCharacterRole(character.name)}</span>
                </div>
                <p style="color: var(--text-secondary)">${character.description || ''}</p>
            </div>
        `;
    }

    // Render ascension content
    renderAscensionContent(ascensionLevels) {
        this.elements.ascensionContent.innerHTML = `
            <h3 style="margin-bottom: 1.5rem">Ascension Requirements</h3>
            ${ascensionLevels.map(level => this.createAscensionLevelHTML(level)).join('')}
        `;
    }

    // Create ascension level HTML
    createAscensionLevelHTML(level) {
        return `
            <div class="ascension-level">
                <div class="level-header">
                    <span class="level-title">Ascension to Level ${level.level}</span>
                    <span class="level-badge">${level.cost.toLocaleString()} Mora</span>
                </div>
                <div class="materials-grid">
                    ${level.materials.map(material => this.createMaterialItemHTML(material)).join('')}
                </div>
            </div>
        `;
    }

    // Create material item HTML
    createMaterialItemHTML(material) {
        return `
            <div class="material-item">
                <div class="material-icon" style="background: var(--surface-alt); display: flex; align-items: center; justify-content: center">
                    <i class="fas ${this.getMaterialIcon(material.type)}"></i>
                </div>
                <div class="material-info">
                    <div class="material-name">${material.name}</div>
                    <div class="material-count">×${material.count}</div>
                </div>
            </div>
        `;
    }

    // Helper methods
    getElementColor(element) {
        const colors = {
            'Pyro': '#ff5722',
            'Hydro': '#2196f3',
            'Electro': '#9c27b0',
            'Cryo': '#03a9f4',
            'Anemo': '#4caf50',
            'Geo': '#ff9800',
            'Dendro': '#8bc34a'
        };
        return colors[element] || '#6c757d';
    }

    getElementIcon(element) {
        const icons = {
            'Pyro': 'fa-fire',
            'Hydro': 'fa-tint',
            'Electro': 'fa-bolt',
            'Cryo': 'fa-snowflake',
            'Anemo': 'fa-wind',
            'Geo': 'fa-mountain',
            'Dendro': 'fa-leaf'
        };
        return icons[element] || 'fa-question';
    }

    getMaterialIcon(type) {
        const icons = {
            'character_exp': 'fa-chart-line',
            'currency': 'fa-coins',
            'elemental_stone': 'fa-gem',
            'local_specialty': 'fa-seedling',
            'boss_material': 'fa-skull',
            'common_material': 'fa-cube',
            'talent_material': 'fa-scroll'
        };
        return icons[type] || 'fa-box';
    }

    getCharacterRole(name) {
        const roleMap = {
            'Venti': 'Support',
            'Zhongli': 'Support',
            'Raiden Shogun': 'DPS',
            'Nahida': 'Support',
            'Hu Tao': 'DPS',
            'Ganyu': 'DPS',
            'Kazuha': 'Support',
            'Bennett': 'Support',
            'Xingqiu': 'Support',
            'Xiangling': 'Sub DPS',
            'Barbara': 'Healer',
            'Qiqi': 'Healer',
            'Jean': 'Healer',
            'Diluc': 'DPS',
            'Keqing': 'DPS',
            'Mona': 'Support',
            'Albedo': 'Support',
            'Klee': 'DPS',
            'Eula': 'DPS',
            'Ayaka': 'DPS',
            'Yoimiya': 'DPS',
            'Kokomi': 'Healer',
            'Itto': 'DPS',
            'Yae Miko': 'Sub DPS',
            'Ayato': 'DPS',
            'Tighnari': 'DPS',
            'Cyno': 'DPS',
            'Nilou': 'Support',
            'Wanderer': 'DPS',
            'Alhaitham': 'DPS',
            'Baizhu': 'Healer',
            'Lyney': 'DPS',
            'Neuvillette': 'DPS',
            'Wriothesley': 'DPS',
            'Furina': 'Support',
            'Navia': 'DPS'
        };
        return roleMap[name] || 'Character';
    }

    // Update view mode
    updateViewMode() {
        const viewMode = appState.getViewMode();
        this.elements.charactersGrid.className = `characters-grid ${viewMode}-view`;
        const toggleBtn = document.getElementById('toggleView');
        if (toggleBtn) {
            toggleBtn.innerHTML = viewMode === 'grid' 
                ? '<i class="fas fa-list"></i>'
                : '<i class="fas fa-th-large"></i>';
        }
    }
}

export const ui = new UI();