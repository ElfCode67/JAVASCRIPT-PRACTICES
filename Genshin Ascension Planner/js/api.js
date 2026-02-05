// Genshin Impact API Service
const API_BASE = 'https://api.genshin.dev';

class GenshinAPI {
    constructor() {
        this.cache = new Map();
        this.rateLimit = {
            remaining: 60,
            reset: Date.now() + 60000
        };
    }

    async fetchWithCache(endpoint) {
        if (this.cache.has(endpoint)) {
            return this.cache.get(endpoint);
        }

        // Rate limiting
        const now = Date.now();
        if (this.rateLimit.remaining <= 0 && now < this.rateLimit.reset) {
            throw new Error('Rate limit exceeded. Please try again later.');
        }

        try {
            const response = await fetch(`${API_BASE}${endpoint}`);
            
            // Update rate limit from headers if available
            const remaining = response.headers.get('X-RateLimit-Remaining');
            const reset = response.headers.get('X-RateLimit-Reset');
            if (remaining && reset) {
                this.rateLimit.remaining = parseInt(remaining);
                this.rateLimit.reset = parseInt(reset) * 1000;
            } else {
                this.rateLimit.remaining--;
            }

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            this.cache.set(endpoint, data);
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    async getCharacters() {
        try {
            const characters = await this.fetchWithCache('/characters');
            return characters;
        } catch (error) {
            console.error('Failed to fetch characters:', error);
            throw error;
        }
    }

    async getCharacterDetails(name) {
        try {
            const details = await this.fetchWithCache(`/characters/${name}`);
            return details;
        } catch (error) {
            console.error(`Failed to fetch details for ${name}:`, error);
            throw error;
        }
    }

    async getMaterials() {
        try {
            const materials = await this.fetchWithCache('/materials');
            return materials;
        } catch (error) {
            console.error('Failed to fetch materials:', error);
            throw error;
        }
    }

    async getMaterialDetails(type, name) {
        try {
            const details = await this.fetchWithCache(`/materials/${type}/${name}`);
            return details;
        } catch (error) {
            console.error(`Failed to fetch material ${type}/${name}:`, error);
            throw error;
        }
    }

    async searchCharacters(query, filters = {}) {
        try {
            let characters = await this.getCharacters();
            
            // Filter characters
            characters = characters.filter(character => {
                // Name search
                if (query && !character.name.toLowerCase().includes(query.toLowerCase())) {
                    return false;
                }
                
                // Element filter
                if (filters.element && character.vision !== filters.element) {
                    return false;
                }
                
                // Rarity filter
                if (filters.rarity && character.rarity !== parseInt(filters.rarity)) {
                    return false;
                }
                
                // Role filter (this would need additional data - using placeholder)
                if (filters.role && !this.checkRole(character, filters.role)) {
                    return false;
                }
                
                return true;
            });

            return characters;
        } catch (error) {
            console.error('Search failed:', error);
            throw error;
        }
    }

    // Placeholder role checking - in a real app, this would come from API or local data
    checkRole(character, role) {
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
            // Add more as needed
        };
        
        return roleMap[character.name] === role;
    }

    getAscensionMaterials(character) {
        // This is a simplified version. In reality, you'd need more detailed data
        const ascensionLevels = [
            { level: '20', cost: 20000, materials: [] },
            { level: '40', cost: 40000, materials: [] },
            { level: '50', cost: 60000, materials: [] },
            { level: '60', cost: 80000, materials: [] },
            { level: '70', cost: 100000, materials: [] },
            { level: '80', cost: 120000, materials: [] },
            { level: '90', cost: 150000, materials: [] }
        ];

        // Assign materials based on character element and rarity
        ascensionLevels.forEach(level => {
            // These would be populated from actual API data
            level.materials = this.generateMaterialsForLevel(character, level.level);
        });

        return ascensionLevels;
    }

    generateMaterialsForLevel(character, level) {
        // Simplified material generation
        const baseMaterials = [
            { name: "Character EXP Material", count: 5, type: "character_exp" },
            { name: "Mora", count: 10000, type: "currency" }
        ];

        if (parseInt(level) >= 40) {
            baseMaterials.push({ 
                name: `${character.vision} Gemstone`, 
                count: 2, 
                type: "elemental_stone" 
            });
        }

        if (parseInt(level) >= 50) {
            baseMaterials.push({ 
                name: "Local Specialty", 
                count: 10, 
                type: "local_specialty" 
            });
        }

        return baseMaterials;
    }
}

export const api = new GenshinAPI();