// Application State Management
class AppState {
    constructor() {
        this.state = {
            characters: [],
            selectedCharacters: [],
            filters: {
                search: '',
                element: '',
                rarity: '',
                role: ''
            },
            viewMode: 'grid',
            darkMode: false,
            currentPage: 1,
            itemsPerPage: 12,
            hasMore: true,
            isLoading: false,
            error: null
        };

        this.init();
    }

    init() {
        // Load from localStorage
        this.loadFromStorage();
        
        // Apply dark mode if enabled
        if (this.state.darkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }

    // State getters
    getCharacters() {
        return this.state.characters;
    }

    getSelectedCharacters() {
        return this.state.selectedCharacters;
    }

    getFilters() {
        return this.state.filters;
    }

    getViewMode() {
        return this.state.viewMode;
    }

    getDarkMode() {
        return this.state.darkMode;
    }

    getCurrentPage() {
        return this.state.currentPage;
    }

    getItemsPerPage() {
        return this.state.itemsPerPage;
    }

    getHasMore() {
        return this.state.hasMore;
    }

    getIsLoading() {
        return this.state.isLoading;
    }

    getError() {
        return this.state.error;
    }

    // State setters
    setCharacters(characters) {
        this.state.characters = characters;
        this.saveToStorage();
    }

    addCharacter(character) {
        if (!this.state.selectedCharacters.some(c => c.name === character.name)) {
            this.state.selectedCharacters.push(character);
            this.saveToStorage();
        }
    }

    removeCharacter(characterName) {
        this.state.selectedCharacters = this.state.selectedCharacters.filter(
            c => c.name !== characterName
        );
        this.saveToStorage();
    }

    clearSelectedCharacters() {
        this.state.selectedCharacters = [];
        this.saveToStorage();
    }

    setFilter(filterType, value) {
        this.state.filters[filterType] = value;
        this.state.currentPage = 1; // Reset to first page when filter changes
        this.saveToStorage();
    }

    clearFilters() {
        this.state.filters = {
            search: '',
            element: '',
            rarity: '',
            role: ''
        };
        this.state.currentPage = 1;
        this.saveToStorage();
    }

    setViewMode(mode) {
        this.state.viewMode = mode;
        this.saveToStorage();
    }

    toggleDarkMode() {
        this.state.darkMode = !this.state.darkMode;
        document.documentElement.setAttribute(
            'data-theme', 
            this.state.darkMode ? 'dark' : 'light'
        );
        this.saveToStorage();
    }

    setPage(page) {
        this.state.currentPage = page;
    }

    setHasMore(hasMore) {
        this.state.hasMore = hasMore;
    }

    setIsLoading(isLoading) {
        this.state.isLoading = isLoading;
    }

    setError(error) {
        this.state.error = error;
    }

    // Pagination helpers
    getPaginatedCharacters() {
        const start = (this.state.currentPage - 1) * this.state.itemsPerPage;
        const end = start + this.state.itemsPerPage;
        return this.state.characters.slice(0, end);
    }

    canLoadMore() {
        return this.state.characters.length > this.getPaginatedCharacters().length;
    }

    // LocalStorage
    saveToStorage() {
        try {
            const storageData = {
                selectedCharacters: this.state.selectedCharacters,
                filters: this.state.filters,
                viewMode: this.state.viewMode,
                darkMode: this.state.darkMode
            };
            localStorage.setItem('genshin-planner', JSON.stringify(storageData));
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
        }
    }

    loadFromStorage() {
        try {
            const saved = JSON.parse(localStorage.getItem('genshin-planner'));
            if (saved) {
                this.state.selectedCharacters = saved.selectedCharacters || [];
                this.state.filters = saved.filters || this.state.filters;
                this.state.viewMode = saved.viewMode || 'grid';
                this.state.darkMode = saved.darkMode || false;
            }
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
        }
    }

    // Filter helpers
    getActiveFilters() {
        return Object.entries(this.state.filters)
            .filter(([_, value]) => value)
            .map(([key, value]) => ({ type: key, value }));
    }

    // Reset state
    reset() {
        this.state = {
            characters: [],
            selectedCharacters: [],
            filters: {
                search: '',
                element: '',
                rarity: '',
                role: ''
            },
            viewMode: 'grid',
            darkMode: this.state.darkMode,
            currentPage: 1,
            itemsPerPage: 12,
            hasMore: true,
            isLoading: false,
            error: null
        };
        this.saveToStorage();
    }
}

// Create singleton instance
export const appState = new AppState();