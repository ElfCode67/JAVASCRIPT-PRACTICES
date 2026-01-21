// Recipe Data - Simple array of objects
const recipes = [
    {
        id: 1,
        name: "Vegetable Stir Fry",
        ingredients: [
            { name: "broccoli", amount: 2, unit: "cups" },
            { name: "carrot", amount: 2, unit: "pieces" },
            { name: "bell pepper", amount: 1, unit: "piece" },
            { name: "soy sauce", amount: 3, unit: "tbsp" },
            { name: "garlic", amount: 3, unit: "cloves" }
        ],
        prepTime: 15,
        cookTime: 10,
        servings: 4,
        tags: ["vegetarian", "asian", "quick", "healthy"]
    },
    {
        id: 2,
        name: "Chicken Alfredo Pasta",
        ingredients: [
            { name: "chicken breast", amount: 500, unit: "grams" },
            { name: "pasta", amount: 400, unit: "grams" },
            { name: "heavy cream", amount: 2, unit: "cups" },
            { name: "parmesan cheese", amount: 1, unit: "cup" },
            { name: "garlic", amount: 3, unit: "cloves" }
        ],
        prepTime: 20,
        cookTime: 25,
        servings: 6,
        tags: ["italian", "dinner", "pasta", "chicken"]
    },
    {
        id: 3,
        name: "Greek Salad",
        ingredients: [
            { name: "cucumber", amount: 1, unit: "large" },
            { name: "tomatoes", amount: 3, unit: "medium" },
            { name: "red onion", amount: 0.5, unit: "piece" },
            { name: "feta cheese", amount: 200, unit: "grams" },
            { name: "olives", amount: 0.5, unit: "cup" },
            { name: "olive oil", amount: 0.25, unit: "cup" }
        ],
        prepTime: 15,
        cookTime: 0,
        servings: 4,
        tags: ["vegetarian", "salad", "healthy", "quick"]
    },
    {
        id: 4,
        name: "Beef Tacos",
        ingredients: [
            { name: "ground beef", amount: 500, unit: "grams" },
            { name: "taco shells", amount: 12, unit: "pieces" },
            { name: "lettuce", amount: 2, unit: "cups" },
            { name: "tomatoes", amount: 2, unit: "medium" },
            { name: "cheddar cheese", amount: 1.5, unit: "cups" },
            { name: "sour cream", amount: 0.5, unit: "cup" }
        ],
        prepTime: 15,
        cookTime: 15,
        servings: 4,
        tags: ["mexican", "dinner", "quick", "beef"]
    },
    {
        id: 5,
        name: "Berry Smoothie",
        ingredients: [
            { name: "mixed berries", amount: 2, unit: "cups" },
            { name: "banana", amount: 1, unit: "ripe" },
            { name: "yogurt", amount: 1, unit: "cup" },
            { name: "milk", amount: 1, unit: "cup" },
            { name: "honey", amount: 1, unit: "tbsp" }
        ],
        prepTime: 5,
        cookTime: 0,
        servings: 2,
        tags: ["breakfast", "vegetarian", "healthy", "quick", "smoothie"]
    },
    {
        id: 6,
        name: "Vegetable Lasagna",
        ingredients: [
            { name: "lasagna noodles", amount: 12, unit: "sheets" },
            { name: "ricotta cheese", amount: 500, unit: "grams" },
            { name: "mozzarella", amount: 2, unit: "cups" },
            { name: "spinach", amount: 200, unit: "grams" },
            { name: "tomato sauce", amount: 3, unit: "cups" },
            { name: "zucchini", amount: 2, unit: "medium" }
        ],
        prepTime: 30,
        cookTime: 40,
        servings: 8,
        tags: ["vegetarian", "italian", "dinner", "pasta"]
    }
];

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const recipesContainer = document.getElementById('recipesContainer');
const resultsCount = document.getElementById('resultsCount');
const totalRecipes = document.getElementById('totalRecipes');
const avgTime = document.getElementById('avgTime');
const noResults = document.getElementById('noResults');
const sampleTags = document.querySelectorAll('.sample-tag');

// Initialize the app
function init() {
    console.log("Recipe Finder App Initialized");
    
    // Display all recipes initially
    displayRecipes(recipes);
    
    // Update stats
    updateStats(recipes);
    
    // Setup event listeners
    setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
    // Search button click
    searchBtn.addEventListener('click', handleSearch);
    
    // Enter key in search input
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    
    // Sample search tags
    sampleTags.forEach(tag => {
        tag.addEventListener('click', (e) => {
            const searchText = e.target.dataset.search;
            searchInput.value = searchText;
            handleSearch();
        });
    });
    
    // Filter changes
    document.getElementById('timeFilter').addEventListener('change', handleSearch);
    document.getElementById('servingsFilter').addEventListener('change', handleSearch);
    document.getElementById('sortBy').addEventListener('change', handleSearch);
}

// Handle search
function handleSearch() {
    const searchText = searchInput.value.trim().toLowerCase();
    let filteredRecipes = [...recipes]; // Create copy with spread operator
    
    // Filter by search text if provided
    if (searchText) {
        const searchIngredients = searchText.split(',').map(i => i.trim()).filter(i => i);
        const matchAll = document.querySelector('input[name="matchType"]:checked').value === 'all';
        
        // .filter() with .some() and .every()
        filteredRecipes = filteredRecipes.filter(recipe => {
            if (matchAll) {
                // Must contain ALL ingredients (AND operator)
                return searchIngredients.every(searchIng => 
                    recipe.ingredients.some(recipeIng => 
                        recipeIng.name.toLowerCase().includes(searchIng)
                    )
                );
            } else {
                // Must contain ANY ingredient (OR operator)
                return searchIngredients.some(searchIng => 
                    recipe.ingredients.some(recipeIng => 
                        recipeIng.name.toLowerCase().includes(searchIng)
                    )
                );
            }
        });
    }
    
    // Apply additional filters
    filteredRecipes = applyFilters(filteredRecipes);
    
    // Sort recipes
    filteredRecipes = sortRecipes(filteredRecipes);
    
    // Update display
    displayRecipes(filteredRecipes);
    updateStats(filteredRecipes);
}

// Apply time and servings filters
function applyFilters(recipesList) {
    let filtered = [...recipesList];
    
    // Time filter
    const timeFilter = document.getElementById('timeFilter').value;
    if (timeFilter) {
        const maxTime = parseInt(timeFilter);
        filtered = filtered.filter(recipe => 
            (recipe.prepTime + recipe.cookTime) <= maxTime
        );
    }
    
    // Servings filter
    const servingsFilter = document.getElementById('servingsFilter').value;
    if (servingsFilter) {
        const minServings = parseInt(servingsFilter);
        filtered = filtered.filter(recipe => recipe.servings >= minServings);
    }
    
    return filtered;
}

// Sort recipes using .sort()
function sortRecipes(recipesList) {
    const sortBy = document.getElementById('sortBy').value;
    const sorted = [...recipesList];
    
    sorted.sort((a, b) => {
        switch(sortBy) {
            case 'time':
                const timeA = a.prepTime + a.cookTime;
                const timeB = b.prepTime + b.cookTime;
                return timeA - timeB;
                
            case 'servings':
                return b.servings - a.servings;
                
            case 'name':
            default:
                return a.name.localeCompare(b.name);
        }
    });
    
    return sorted;
}

// Display recipes using .map()
function displayRecipes(recipesList) {
    if (recipesList.length === 0) {
        recipesContainer.style.display = 'none';
        noResults.style.display = 'block';
        return;
    }
    
    recipesContainer.style.display = 'grid';
    noResults.style.display = 'none';
    
    // Clear current recipes
    recipesContainer.innerHTML = '';
    
    // Create recipe cards using .map()
    const recipeCards = recipesList.map(recipe => createRecipeCard(recipe));
    
    // Append all cards at once (better performance)
    recipeCards.forEach(card => {
        recipesContainer.appendChild(card);
    });
}

// Create a recipe card element
function createRecipeCard(recipe) {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    
    const totalTime = recipe.prepTime + recipe.cookTime;
    const ingredientsText = recipe.ingredients
        .slice(0, 3) // Take first 3 ingredients
        .map(ing => ing.name) // Get just the names
        .join(', '); // Join with commas
    
    card.innerHTML = `
        <div class="recipe-image">
            <i class="fas fa-${getRecipeIcon(recipe.tags)}"></i>
        </div>
        <div class="recipe-content">
            <h3 class="recipe-title">${recipe.name}</h3>
            <div class="recipe-meta">
                <span><i class="fas fa-clock"></i> ${totalTime} min</span>
                <span><i class="fas fa-users"></i> ${recipe.servings} servings</span>
            </div>
            <div class="recipe-tags">
                ${recipe.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <p class="recipe-ingredients">
                <strong>Ingredients:</strong> ${ingredientsText}${recipe.ingredients.length > 3 ? '...' : ''}
            </p>
            <div class="recipe-actions">
                <button class="btn btn-view" data-id="${recipe.id}">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="btn btn-add" data-id="${recipe.id}">
                    <i class="fas fa-plus"></i> Add to Plan
                </button>
            </div>
        </div>
    `;
    
    // Add event listeners to buttons
    const viewBtn = card.querySelector('.btn-view');
    const addBtn = card.querySelector('.btn-add');
    
    viewBtn.addEventListener('click', () => viewRecipe(recipe.id));
    addBtn.addEventListener('click', () => addToPlan(recipe.id));
    
    return card;
}

// Get appropriate icon for recipe
function getRecipeIcon(tags) {
    if (tags.includes('vegetarian')) return 'leaf';
    if (tags.includes('pasta')) return 'pizza-slice';
    if (tags.includes('salad')) return 'leaf';
    if (tags.includes('smoothie')) return 'blender';
    if (tags.includes('breakfast')) return 'egg';
    if (tags.includes('quick')) return 'bolt';
    return 'utensils';
}

// Update statistics using .reduce()
function updateStats(recipesList) {
    resultsCount.textContent = `${recipesList.length} Recipe${recipesList.length !== 1 ? 's' : ''} Found`;
    totalRecipes.textContent = `${recipesList.length} recipe${recipesList.length !== 1 ? 's' : ''}`;
    
    // Calculate average time using .reduce()
    if (recipesList.length > 0) {
        const totalTime = recipesList.reduce((sum, recipe) => {
            return sum + (recipe.prepTime + recipe.cookTime);
        }, 0);
        
        const averageTime = Math.round(totalTime / recipesList.length);
        avgTime.textContent = `${averageTime} min avg`;
    } else {
        avgTime.textContent = '0 min avg';
    }
}

// View recipe details
function viewRecipe(recipeId) {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;
    
    alert(`Recipe Details:\n\n` +
          `Name: ${recipe.name}\n` +
          `Total Time: ${recipe.prepTime + recipe.cookTime} minutes\n` +
          `Servings: ${recipe.servings}\n` +
          `Tags: ${recipe.tags.join(', ')}\n\n` +
          `Ingredients:\n${recipe.ingredients.map(ing => 
            `• ${ing.amount} ${ing.unit} ${ing.name}`
          ).join('\n')}\n\n` +
          `(In a full app, this would open a modal with more details)`);
}

// Add recipe to plan (simulated)
function addToPlan(recipeId) {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;
    
    alert(`Added "${recipe.name}" to your meal plan!\n\n` +
          `(In a full app, this would update your meal planner)`);
    
    // Simulate adding to plan with console log
    console.log(`Recipe added to plan:`, recipe);
}

// Initialize app when page loads
document.addEventListener('DOMContentLoaded', init);

// Export recipes for debugging (optional)
window.recipes = recipes;
console.log('Array methods used in this app:');
console.log('- .filter() - Filtering recipes by ingredients');
console.log('- .map() - Creating recipe cards');
console.log('- .reduce() - Calculating average time');
console.log('- .sort() - Sorting recipes');
console.log('- .some() - Checking if recipe contains any ingredient');
console.log('- .every() - Checking if recipe contains all ingredients');
console.log('- .forEach() - Setting up event listeners');
console.log('- Spread operator [...] - Creating copies of arrays');