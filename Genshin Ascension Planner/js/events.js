// Event Listeners and Delegation
import { appState } from './state.js';
import { ui } from './ui.js';
import { api } from './api.js';

class EventManager {
    constructor() {
        this.initEventListeners();
    }

    initEventListeners() {
        // Search and filter events
        this.debouncedSearch = this.debounce(this.handleSearch.bind(this), 300);
        document.getElementById('characterSearch').addEventListener('input', this.debouncedSearch);
        document.getElementById('elementFilter').addEventListener('change', this.handleFilterChange.bind(this));
        document.getElementById('rarityFilter').addEventListener('change', this.handleFilterChange.bind(this));
        document.getElementById('roleFilter').addEventListener('change', this.handleFilterChange.bind(this));
        document.getElementById('clearFilters').addEventListener('click', this.handleClearFilters.bind(this));

        // Character grid events (delegation)
        document.addEventListener('click', this.handleCharacterGridClick.bind(this));

        // My characters events (delegation)
        document.addEventListener('click', this.handleSelectedCharactersClick.bind(this));

        // Modal events
        document.getElementById('closeModal').addEventListener('click', () => ui.hideAscensionModal());
        document.getElementById('ascensionModal').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                ui.hideAscensionModal();
            }
        });

        // Keyboard events for modal
        document.addEventListener('keydown', this.handleKeyboardEvents.bind(this));

        // Dark mode toggle
        document.getElementById('darkModeToggle').addEventListener('click', () => {
            appState.toggleDarkMode();
        });

        // View mode toggle
        document.getElementById('toggleView').addEventListener('click', () => {
            const currentMode = appState.getViewMode();
            appState.setViewMode(currentMode === 'grid' ? 'list' : 'grid');
            ui.updateViewMode();
        });

        // Clear all selected characters
        document.getElementById('clearAll').addEventListener('click', () => {
            appState.clearSelectedCharacters();
            ui.renderSelectedCharacters();
        });

        // Load more characters
        document.getElementById('loadMore').addEventListener('click', () => {
            this.loadMoreCharacters();
        });

        // Retry button for error state
        document.getElementById('retryButton').addEventListener('click', () => {
            this.loadCharacters();
        });

        // Active filters removal (delegation)
        document.addEventListener('click', this.handleActiveFiltersClick.bind(this));
    }

    // Debounce helper for search
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Handle search input
    handleSearch(e) {
        appState.setFilter('search', e.target.value);
        ui.updateFilterInputs();
        ui.renderActiveFilters();
        this.loadCharacters();
    }

    // Handle filter changes
    handleFilterChange(e) {
        const filterType = e.target.id.replace('Filter', '').toLowerCase();
        appState.setFilter(filterType, e.target.value);
        ui.renderActiveFilters();
        this.loadCharacters();
    }

    // Handle clear filters
    handleClearFilters() {
        appState.clearFilters();
        ui.updateFilterInputs();
        ui.renderActiveFilters();
        this.loadCharacters();
    }

    // Handle character grid clicks (event delegation)
    handleCharacterGridClick(e) {
        const card = e.target.closest('.character-card');
        if (card) {
            const characterName = card.dataset.character;
            
            if (e.target.closest('.add-character-btn')) {
                // Add to selected characters
                const character = appState.getCharacters().find(c => c.name === characterName);
                if (character) {
                    appState.addCharacter(character);
                    ui.renderSelectedCharacters();
                    
                    // Visual feedback
                    const btn = e.target.closest('.add-character-btn');
                    btn.innerHTML = '<i class="fas fa-check"></i> Added!';
                    btn.style.background = 'var(--success)';
                    setTimeout(() => {
                        btn.innerHTML = '<i class="fas fa-plus"></i> Add to My Characters';
                        btn.style.background = '';
                    }, 2000);
                }
            } else {
                // Show ascension modal
                ui.showAscensionModal(characterName);
            }
        }
    }

    // Handle selected characters clicks (event delegation)
    handleSelectedCharactersClick(e) {
        const selectedChar = e.target.closest('.selected-character');
        if (selectedChar) {
            const characterName = selectedChar.dataset.character;
            
            if (e.target.closest('.remove-btn')) {
                // Remove from selected
                appState.removeCharacter(characterName);
                ui.renderSelectedCharacters();
            } else if (e.target.closest('.plan-btn')) {
                // Show ascension modal
                ui.showAscensionModal(characterName);
            }
        }
    }

    // Handle active filters removal (event delegation)
    handleActiveFiltersClick(e) {
        if (e.target.closest('.filter-tag .remove')) {
            const filterType = e.target.closest('.remove').dataset.filter;
            appState.setFilter(filterType, '');
            ui.updateFilterInputs();
            ui.renderActiveFilters();
            this.loadCharacters();
        }
    }

    // Handle keyboard events
    handleKeyboardEvents(e) {
        // Close modal on Escape
        if (e.key === 'Escape' && !ui.elements.ascensionModal.classList.contains('hidden')) {
            ui.hideAscensionModal();
        }
    }

    // Load characters from API
    async loadCharacters() {
        appState.setIsLoading(true);
        appState.setError(null);
        ui.showLoading();
        ui.hideError();

        try {
            const filters = appState.getFilters();
            const characters = await api.searchCharacters(filters.search, {
                element: filters.element,
                rarity: filters.rarity,
                role: filters.role
            });

            appState.setCharacters(characters);
            appState.setPage(1);
            
            const paginated = appState.getPaginatedCharacters();
            ui.renderCharacters(paginated);
            appState.setHasMore(appState.canLoadMore());

        } catch (error) {
            appState.setError(error.message);
            ui.showError(error.message);
        } finally {
            appState.setIsLoading(false);
            ui.showLoading(false);
        }
    }

    // Load more characters
    async loadMoreCharacters() {
        if (appState.getIsLoading() || !appState.getHasMore()) return;

        appState.setIsLoading(true);
        
        try {
            appState.setPage(appState.getCurrentPage() + 1);
            const paginated = appState.getPaginatedCharacters();
            ui.renderCharacters(paginated);
            appState.setHasMore(appState.canLoadMore());
        } catch (error) {
            console.error('Failed to load more characters:', error);
        } finally {
            appState.setIsLoading(false);
        }
    }
}

export const eventManager = new EventManager();