// Main Application Initialization
import { appState } from './state.js';
import { ui } from './ui.js';
import { eventManager } from './events.js';

class GenshinPlannerApp {
    constructor() {
        this.init();
    }

    async init() {
        console.log('Genshin Impact Ascension Planner initializing...');
        
        // Initialize UI from state
        ui.updateFilterInputs();
        ui.renderActiveFilters();
        ui.updateViewMode();
        ui.renderSelectedCharacters();
        
        // Load initial characters
        await this.loadInitialCharacters();
        
        // Update character count
        const characters = appState.getCharacters();
        ui.elements.characterCount.textContent = `${characters.length} characters`;
        
        // Add event listener for DOM content loaded
        document.addEventListener('DOMContentLoaded', () => {
            console.log('App initialized successfully');
        });
    }

    async loadInitialCharacters() {
        try {
            // Show loading state
            ui.showLoading();
            
            // Fetch characters from API
            const characters = await this.fetchCharacters();
            
            // Update state and UI
            appState.setCharacters(characters);
            const paginated = appState.getPaginatedCharacters();
            ui.renderCharacters(paginated);
            appState.setHasMore(appState.canLoadMore());
            
        } catch (error) {
            console.error('Failed to load initial characters:', error);
            ui.showError(error.message);
        } finally {
            ui.showLoading(false);
        }
    }

    async fetchCharacters() {
        try {
            // Fetch all characters from API
            const characters = await fetch('https://api.genshin.dev/characters/all')
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    return response.json();
                });

            // Transform API data to match our format
            return characters.map(char => ({
                name: char.name,
                title: char.title || '',
                vision: char.vision || 'Unknown',
                weapon: char.weapon || 'Unknown',
                nation: char.nation || 'Unknown',
                affiliation: char.affiliation || 'Unknown',
                rarity: char.rarity || 4,
                constellation: char.constellation || '',
                birthday: char.birthday || '',
                description: char.description || '',
                skillTalents: char.skillTalents || [],
                passiveTalents: char.passiveTalents || [],
                constellations: char.constellations || []
            }));

        } catch (error) {
            console.error('API fetch failed, using fallback data:', error);
            
            // Fallback data if API fails
            return this.getFallbackCharacters();
        }
    }

    getFallbackCharacters() {
        // Fallback character data in case API is unavailable
        return [
            {
                name: 'Traveler',
                title: 'Outlander',
                vision: 'Adaptive',
                weapon: 'Sword',
                nation: 'Unknown',
                affiliation: 'Unknown',
                rarity: 5,
                constellation: 'Viator/Viatrix',
                description: 'A traveler from another world who had their only kin taken away, forcing them to embark on a journey to find The Seven.'
            },
            {
                name: 'Amber',
                title: 'Gliding Champion',
                vision: 'Pyro',
                weapon: 'Bow',
                nation: 'Mondstadt',
                affiliation: 'Knights of Favonius',
                rarity: 4,
                constellation: 'Lepus',
                description: 'Always energetic and full of life, Amber\'s the best — albeit only — Outrider of the Knights of Favonius.'
            },
            {
                name: 'Kaeya',
                title: 'Frostwind Swordsman',
                vision: 'Cryo',
                weapon: 'Sword',
                nation: 'Mondstadt',
                affiliation: 'Knights of Favonius',
                rarity: 4,
                constellation: 'Pavo Ocellus',
                description: 'A thinker in the Knights of Favonius with a somewhat exotic appearance.'
            },
            {
                name: 'Lisa',
                title: 'Witch of Purple Rose',
                vision: 'Electro',
                weapon: 'Catalyst',
                nation: 'Mondstadt',
                affiliation: 'Knights of Favonius',
                rarity: 4,
                constellation: 'Tempus Fugit',
                description: 'The languid but knowledgeable Librarian of the Knights of Favonius.'
            },
            {
                name: 'Barbara',
                title: 'Shining Idol',
                vision: 'Hydro',
                weapon: 'Catalyst',
                nation: 'Mondstadt',
                affiliation: 'Church of Favonius',
                rarity: 4,
                constellation: 'Crater',
                description: 'Every citizen of Mondstadt adores Barbara. She learned how to heal wounds because she wanted to heal people\'s hearts.'
            },
            {
                name: 'Diluc',
                title: 'Darknight Hero',
                vision: 'Pyro',
                weapon: 'Claymore',
                nation: 'Mondstadt',
                affiliation: 'Dawn Winery',
                rarity: 5,
                constellation: 'Noctua',
                description: 'The tycoon of a winery empire in Mondstadt, unmatched in every possible way.'
            },
            {
                name: 'Jean',
                title: 'Dandelion Knight',
                vision: 'Anemo',
                weapon: 'Sword',
                nation: 'Mondstadt',
                affiliation: 'Knights of Favonius',
                rarity: 5,
                constellation: 'Leo Minor',
                description: 'The righteous and rigorous Dandelion Knight, and Acting Grand Master of the Knights of Favonius.'
            }
        ];
    }

    // Utility method to update UI when state changes
    updateUI() {
        ui.updateFilterInputs();
        ui.renderActiveFilters();
        ui.renderSelectedCharacters();
        
        const characters = appState.getCharacters();
        const paginated = appState.getPaginatedCharacters();
        ui.renderCharacters(paginated);
        ui.elements.characterCount.textContent = `${characters.length} characters`;
    }

    // Reset application
    resetApp() {
        appState.reset();
        this.updateUI();
    }
}

// Initialize the application when the script loads
const app = new GenshinPlannerApp();

// Make app available globally for debugging (optional)
window.GenshinPlanner = app;

// Export for module usage
export default app;