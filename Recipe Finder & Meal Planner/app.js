// Netflix-inspired Recipe Data
const recipes = [
    {
        id: 1,
        name: "Spicy Chicken Stir Fry",
        ingredients: [
            { name: "chicken breast", amount: 500, unit: "grams" },
            { name: "bell peppers", amount: 2, unit: "pieces" },
            { name: "broccoli", amount: 2, unit: "cups" },
            { name: "soy sauce", amount: 3, unit: "tbsp" },
            { name: "chili flakes", amount: 1, unit: "tsp" },
            { name: "garlic", amount: 3, unit: "cloves" }
        ],
        prepTime: 15,
        cookTime: 10,
        servings: 4,
        tags: ["spicy", "asian", "quick", "chicken", "dinner"],
        color: "linear-gradient(135deg, #FF416C, #FF4B2B)"
    },
    {
        id: 2,
        name: "Creamy Mushroom Pasta",
        ingredients: [
            { name: "pasta", amount: 400, unit: "grams" },
            { name: "mushrooms", amount: 300, unit: "grams" },
            { name: "heavy cream", amount: 1, unit: "cup" },
            { name: "parmesan", amount: 1, unit: "cup" },
            { name: "garlic", amount: 2, unit: "cloves" },
            { name: "butter", amount: 2, unit: "tbsp" }
        ],
        prepTime: 10,
        cookTime: 20,
        servings: 4,
        tags: ["vegetarian", "italian", "pasta", "creamy", "dinner"],
        color: "linear-gradient(135deg, #667eea, #764ba2)"
    },
    {
        id: 3,
        name: "Avocado Toast Deluxe",
        ingredients: [
            { name: "sourdough bread", amount: 2, unit: "slices" },
            { name: "avocado", amount: 1, unit: "ripe" },
            { name: "eggs", amount: 2, unit: "large" },
            { name: "cherry tomatoes", amount: 10, unit: "pieces" },
            { name: "feta cheese", amount: 50, unit: "grams" },
            { name: "lemon juice", amount: 1, unit: "tbsp" }
        ],
        prepTime: 5,
        cookTime: 5,
        servings: 1,
        tags: ["vegetarian", "breakfast", "quick", "healthy", "brunch"],
        color: "linear-gradient(135deg, #4CAF50, #2E7D32)"
    },
    {
        id: 4,
        name: "Beef Bourguignon",
        ingredients: [
            { name: "beef chuck", amount: 800, unit: "grams" },
            { name: "red wine", amount: 2, unit: "cups" },
            { name: "carrots", amount: 3, unit: "large" },
            { name: "onions", amount: 2, unit: "medium" },
            { name: "mushrooms", amount: 200, unit: "grams" },
            { name: "bacon", amount: 100, unit: "grams" }
        ],
        prepTime: 30,
        cookTime: 120,
        servings: 6,
        tags: ["french", "beef", "dinner", "slow-cooked", "comfort"],
        color: "linear-gradient(135deg, #8B4513, #A0522D)"
    },
    {
        id: 5,
        name: "Berry Protein Smoothie",
        ingredients: [
            { name: "mixed berries", amount: 2, unit: "cups" },
            { name: "protein powder", amount: 1, unit: "scoop" },
            { name: "greek yogurt", amount: 1, unit: "cup" },
            { name: "almond milk", amount: 1, unit: "cup" },
            { name: "chia seeds", amount: 1, unit: "tbsp" },
            { name: "honey", amount: 1, unit: "tbsp" }
        ],
        prepTime: 5,
        cookTime: 0,
        servings: 2,
        tags: ["vegetarian", "breakfast", "quick", "healthy", "smoothie"],
        color: "linear-gradient(135deg, #EC407A, #D81B60)"
    },
    {
        id: 6,
        name: "Vegetable Curry",
        ingredients: [
            { name: "potatoes", amount: 2, unit: "medium" },
            { name: "carrots", amount: 2, unit: "large" },
            { name: "cauliflower", amount: 1, unit: "small" },
            { name: "coconut milk", amount: 1, unit: "can" },
            { name: "curry powder", amount: 2, unit: "tbsp" },
            { name: "chickpeas", amount: 1, unit: "can" }
        ],
        prepTime: 20,
        cookTime: 30,
        servings: 4,
        tags: ["vegetarian", "vegan", "curry", "healthy", "dinner"],
        color: "linear-gradient(135deg, #FF9800, #F57C00)"
    },
    {
        id: 7,
        name: "Salmon Teriyaki",
        ingredients: [
            { name: "salmon fillets", amount: 4, unit: "pieces" },
            { name: "soy sauce", amount: 0.25, unit: "cup" },
            { name: "brown sugar", amount: 2, unit: "tbsp" },
            { name: "ginger", amount: 1, unit: "tbsp" },
            { name: "garlic", amount: 2, unit: "cloves" },
            { name: "sesame seeds", amount: 1, unit: "tbsp" }
        ],
        prepTime: 10,
        cookTime: 15,
        servings: 4,
        tags: ["asian", "seafood", "healthy", "quick", "dinner"],
        color: "linear-gradient(135deg, #2196F3, #1976D2)"
    },
    {
        id: 8,
        name: "Chocolate Lava Cake",
        ingredients: [
            { name: "dark chocolate", amount: 200, unit: "grams" },
            { name: "butter", amount: 100, unit: "grams" },
            { name: "eggs", amount: 2, unit: "large" },
            { name: "sugar", amount: 0.5, unit: "cup" },
            { name: "flour", amount: 0.25, unit: "cup" },
            { name: "cocoa powder", amount: 2, unit: "tbsp" }
        ],
        prepTime: 15,
        cookTime: 12,
        servings: 4,
        tags: ["dessert", "chocolate", "baking", "sweet"],
        color: "linear-gradient(135deg, #795548, #5D4037)"
    }
];

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const heroSearch = document.getElementById('heroSearch');
const heroSearchBtn = document.querySelector('.hero-search-btn');
const recipesContainer = document.getElementById('recipesContainer');
const planContainer = document.getElementById('planContainer');
const favoritesContainer = document.getElementById('favoritesContainer');
const shoppingModal = document.getElementById('shoppingModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const printListBtn = document.getElementById('printListBtn');
const closeModalButton = document.querySelector('.close-modal');
const generateListBtn = document.getElementById('generateListBtn');
const clearPlanBtn = document.getElementById('clearPlanBtn');
const categoryFilter = document.getElementById('categoryFilter');
const tags = document.querySelectorAll('.tag');
const categoryCards = document.querySelectorAll('.category-card');

// App State
let mealPlan = [];
let favorites = [];
let allRecipes = [...recipes];
let currentCategory = '';

// Initialize the app
function init() {
    console.log("RecipeFlix App Initialized");
    
    // Load saved data
    loadSavedData();
    
    // Display all recipes
    displayRecipes(allRecipes);
    
    // Update stats
    updateDashboardStats();
    
    // Setup event listeners
    setupEventListeners();
    
    // Add scroll effect to navbar
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// Load saved data from localStorage
function loadSavedData() {
    const savedPlan = localStorage.getItem('recipeFlix_mealPlan');
    const savedFavorites = localStorage.getItem('recipeFlix_favorites');
    
    if (savedPlan) mealPlan = JSON.parse(savedPlan);
    if (savedFavorites) {
        favorites = JSON.parse(savedFavorites);
        allRecipes.forEach(recipe => {
            recipe.favorite = favorites.includes(recipe.id);
        });
    }
    
    updateMealPlanDisplay();
    updateFavoritesDisplay();
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    searchBtn.addEventListener('click', handleSearch);
    heroSearchBtn.addEventListener('click', handleHeroSearch);
    searchInput.addEventListener('keypress', (e) => e.key === 'Enter' && handleSearch());
    heroSearch.addEventListener('keypress', (e) => e.key === 'Enter' && handleHeroSearch());
    
    // Category filtering
    categoryFilter.addEventListener('change', handleCategoryFilter);
    
    // Quick tags
    tags.forEach(tag => {
        tag.addEventListener('click', (e) => {
            const searchText = e.target.dataset.search;
            heroSearch.value = searchText;
            handleHeroSearch();
        });
    });
    
    // Category cards
    categoryCards.forEach(card => {
        card.addEventListener('click', (e) => {
            const category = e.currentTarget.dataset.category;
            categoryFilter.value = category;
            handleCategoryFilter();
            // Scroll to recipes
            document.getElementById('recipes').scrollIntoView({ behavior: 'smooth' });
        });
    });
    
    // Meal planner buttons
    generateListBtn.addEventListener('click', generateShoppingList);
    clearPlanBtn.addEventListener('click', clearMealPlan);
    
    // Modal controls
    closeModalBtn.addEventListener('click', () => shoppingModal.classList.remove('active'));
    closeModalButton.addEventListener('click', () => shoppingModal.classList.remove('active'));
    printListBtn.addEventListener('click', printShoppingList);
    shoppingModal.addEventListener('click', (e) => {
        if (e.target === shoppingModal) shoppingModal.classList.remove('active');
    });
}

// Handle search
function handleSearch() {
    const searchText = searchInput.value.trim().toLowerCase();
    performSearch(searchText);
}

function handleHeroSearch() {
    const searchText = heroSearch.value.trim().toLowerCase();
    performSearch(searchText);
}

function performSearch(searchText) {
    let results = [...allRecipes];
    
    if (searchText) {
        const searchTerms = searchText.split(' ').filter(term => term.length > 0);
        results = results.filter(recipe => {
            return searchTerms.some(term =>
                recipe.name.toLowerCase().includes(term) ||
                recipe.ingredients.some(ing => ing.name.toLowerCase().includes(term)) ||
                recipe.tags.some(tag => tag.toLowerCase().includes(term))
            );
        });
    }
    
    // Apply category filter if active
    if (currentCategory) {
        results = results.filter(recipe => recipe.tags.includes(currentCategory));
    }
    
    displayRecipes(results);
    updateResultsCount(results.length);
}

// Handle category filter
function handleCategoryFilter() {
    const category = categoryFilter.value;
    currentCategory = category;
    
    if (category) {
        const filtered = allRecipes.filter(recipe => recipe.tags.includes(category));
        displayRecipes(filtered);
        updateResultsCount(filtered.length);
    } else {
        displayRecipes(allRecipes);
        updateResultsCount(allRecipes.length);
    }
}

// Display recipes
function displayRecipes(recipesList) {
    recipesContainer.innerHTML = '';
    
    if (recipesList.length === 0) {
        recipesContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No recipes found</h3>
                <p>Try a different search term</p>
            </div>
        `;
        return;
    }
    
    recipesList.forEach(recipe => {
        const card = createRecipeCard(recipe);
        recipesContainer.appendChild(card);
    });
}

// Create Netflix-style recipe card
function createRecipeCard(recipe) {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.dataset.id = recipe.id;
    
    const totalTime = recipe.prepTime + recipe.cookTime;
    const isFavorite = favorites.includes(recipe.id);
    
    card.innerHTML = `
        <div class="recipe-image" style="background: ${recipe.color}">
            <i class="fas fa-${getRecipeIcon(recipe.tags)}"></i>
            <div class="recipe-overlay">
                <button class="btn-add" data-id="${recipe.id}" title="Add to meal plan">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        </div>
        <div class="recipe-content">
            <h3 class="recipe-title">${recipe.name}</h3>
            <div class="recipe-meta">
                <span><i class="fas fa-clock"></i> ${totalTime}m</span>
                <span><i class="fas fa-users"></i> ${recipe.servings}</span>
            </div>
            <div class="recipe-tags">
                ${recipe.tags.slice(0, 3).map(tag => 
                    `<span class="recipe-tag">${tag}</span>`
                ).join('')}
            </div>
        </div>
        <div class="recipe-actions">
            <button class="btn-favorite ${isFavorite ? 'favorited' : ''}" data-id="${recipe.id}" 
                    title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
                <i class="fas fa-heart"></i>
            </button>
        </div>
    `;
    
    // Add event listeners
    const favoriteBtn = card.querySelector('.btn-favorite');
    const addBtn = card.querySelector('.btn-add');
    
    favoriteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(recipe.id);
    });
    
    addBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        addToPlan(recipe.id);
    });
    
    // Click card to view details
    card.addEventListener('click', () => viewRecipe(recipe.id));
    
    return card;
}

// Get recipe icon
function getRecipeIcon(tags) {
    const iconMap = {
        vegetarian: 'leaf',
        vegan: 'seedling',
        breakfast: 'sun',
        dessert: 'ice-cream',
        pasta: 'pasta',
        spicy: 'pepper-hot',
        seafood: 'fish',
        chicken: 'drumstick-bite',
        beef: 'hamburger',
        quick: 'bolt',
        healthy: 'heart',
        asian: 'globe-asia'
    };
    
    for (const tag of tags) {
        if (iconMap[tag]) return iconMap[tag];
    }
    return 'utensils';
}

// Update results count
function updateResultsCount(count) {
    const resultsHeader = document.querySelector('#recipes .row-title');
    if (resultsHeader) {
        resultsHeader.textContent = `Browse Recipes (${count})`;
    }
}

// Update dashboard stats
function updateDashboardStats() {
    document.getElementById('totalRecipeCount').textContent = allRecipes.length;
    
    const quickRecipes = allRecipes.filter(recipe => 
        (recipe.prepTime + recipe.cookTime) < 30
    );
    document.getElementById('quickRecipeCount').textContent = quickRecipes.length;
    
    const vegRecipes = allRecipes.filter(recipe => 
        recipe.tags.includes('vegetarian') || recipe.tags.includes('vegan')
    );
    document.getElementById('vegRecipeCount').textContent = vegRecipes.length;
    
    document.getElementById('planCount').textContent = mealPlan.length;
    
    // Update favorites count
    document.getElementById('favoritesCount').textContent = `${favorites.length} favorites`;
}

// View recipe details
function viewRecipe(recipeId) {
    const recipe = allRecipes.find(r => r.id === recipeId);
    if (!recipe) return;
    
    const ingredientsList = recipe.ingredients
        .map(ing => `• ${ing.amount} ${ing.unit} ${ing.name}`)
        .join('\n');
    
    const modalHTML = `
        <div class="modal-content dark-modal" style="max-width: 800px;">
            <div class="modal-header">
                <h3>${recipe.name}</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body" style="padding: 0;">
                <div style="display: grid; grid-template-columns: 300px 1fr; gap: 2rem;">
                    <div style="background: ${recipe.color}; height: 300px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-${getRecipeIcon(recipe.tags)}" style="font-size: 4rem; color: white;"></i>
                    </div>
                    <div style="padding: 2rem;">
                        <div style="display: flex; gap: 2rem; margin-bottom: 1.5rem;">
                            <div>
                                <i class="fas fa-clock"></i>
                                <p>${recipe.prepTime + recipe.cookTime} min</p>
                            </div>
                            <div>
                                <i class="fas fa-users"></i>
                                <p>${recipe.servings} servings</p>
                            </div>
                        </div>
                        
                        <h4 style="margin-bottom: 1rem;">Ingredients</h4>
                        <div style="margin-bottom: 1.5rem;">
                            ${recipe.ingredients.map(ing => 
                                `<p>• ${ing.amount} ${ing.unit} ${ing.name}</p>`
                            ).join('')}
                        </div>
                        
                        <div style="display: flex; gap: 1rem;">
                            <button class="btn-primary" onclick="addToPlan(${recipe.id}); shoppingModal.classList.remove('active');">
                                <i class="fas fa-plus"></i> Add to Plan
                            </button>
                            <button class="btn-secondary" onclick="toggleFavorite(${recipe.id}); shoppingModal.classList.remove('active');">
                                <i class="fas fa-heart"></i> ${favorites.includes(recipe.id) ? 'Remove Favorite' : 'Add Favorite'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = modalHTML;
    document.body.appendChild(modal);
    
    // Add close functionality
    modal.querySelector('.close-modal').addEventListener('click', () => {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    });
}

// Toggle favorite
function toggleFavorite(recipeId) {
    const index = favorites.indexOf(recipeId);
    
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(recipeId);
    }
    
    // Update recipe favorite status
    const recipe = allRecipes.find(r => r.id === recipeId);
    if (recipe) recipe.favorite = !recipe.favorite;
    
    // Save and update UI
    localStorage.setItem('recipeFlix_favorites', JSON.stringify(favorites));
    updateFavoriteButton(recipeId);
    updateFavoritesDisplay();
    updateDashboardStats();
}

function updateFavoriteButton(recipeId) {
    const buttons = document.querySelectorAll(`.btn-favorite[data-id="${recipeId}"]`);
    const isFavorite = favorites.includes(recipeId);
    
    buttons.forEach(btn => {
        btn.classList.toggle('favorited', isFavorite);
        btn.title = isFavorite ? 'Remove from favorites' : 'Add to favorites';
    });
}

function updateFavoritesDisplay() {
    favoritesContainer.innerHTML = '';
    
    if (favorites.length === 0) {
        favoritesContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-heart"></i>
                <h3>No favorites yet</h3>
                <p>Click the heart icon to add recipes to favorites</p>
            </div>
        `;
        return;
    }
    
    const favoriteRecipes = allRecipes.filter(recipe => favorites.includes(recipe.id));
    favoriteRecipes.forEach(recipe => {
        const card = createRecipeCard(recipe);
        favoritesContainer.appendChild(card);
    });
}

// Meal planner functions
function addToPlan(recipeId) {
    const recipe = allRecipes.find(r => r.id === recipeId);
    if (!recipe) return;
    
    const existingIndex = mealPlan.findIndex(item => item.id === recipe.id);
    
    if (existingIndex > -1) {
        mealPlan[existingIndex].quantity += 1;
    } else {
        mealPlan.push({
            ...recipe,
            quantity: 1,
            addedAt: new Date().toISOString()
        });
    }
    
    saveMealPlan();
    updateMealPlanDisplay();
    updateDashboardStats();
    
    // Show notification
    showNotification(`Added "${recipe.name}" to meal plan!`);
}

function removeFromPlan(recipeId) {
    const index = mealPlan.findIndex(item => item.id === recipeId);
    if (index > -1) {
        mealPlan.splice(index, 1);
        saveMealPlan();
        updateMealPlanDisplay();
        updateDashboardStats();
    }
}

function saveMealPlan() {
    localStorage.setItem('recipeFlix_mealPlan', JSON.stringify(mealPlan));
}

function updateMealPlanDisplay() {
    if (mealPlan.length === 0) {
        planContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-plus"></i>
                <h3>Your meal plan is empty</h3>
                <p>Add recipes to start planning your meals</p>
            </div>
        `;
        return;
    }
    
    const planItems = mealPlan.map(item => `
        <div class="plan-item">
            <div class="plan-info">
                <h4>${item.name}</h4>
                <p>${item.prepTime + item.cookTime} min • ${item.servings} servings</p>
                <p><small>${item.ingredients.length} ingredients</small></p>
            </div>
            <div class="plan-actions">
                <button class="remove-plan-btn" data-id="${item.id}" title="Remove from plan">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    planContainer.innerHTML = `<div class="plan-items">${planItems}</div>`;
    
    // Add remove button listeners
    document.querySelectorAll('.remove-plan-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const recipeId = parseInt(e.target.closest('button').dataset.id);
            removeFromPlan(recipeId);
        });
    });
}

function clearMealPlan() {
    if (mealPlan.length > 0 && confirm('Clear your entire meal plan?')) {
        mealPlan = [];
        saveMealPlan();
        updateMealPlanDisplay();
        updateDashboardStats();
        showNotification('Meal plan cleared!');
    }
}

// Shopping list functions
function generateShoppingList() {
    if (mealPlan.length === 0) {
        showNotification('Your meal plan is empty! Add recipes first.');
        return;
    }
    
    const shoppingList = mealPlan.reduce((list, recipe) => {
        recipe.ingredients.forEach(ingredient => {
            const key = ingredient.name.toLowerCase();
            
            if (!list[key]) {
                list[key] = {
                    name: ingredient.name,
                    amount: ingredient.amount,
                    unit: ingredient.unit,
                    recipes: [recipe.name]
                };
            } else {
                list[key].amount += ingredient.amount;
                if (!list[key].recipes.includes(recipe.name)) {
                    list[key].recipes.push(recipe.name);
                }
            }
        });
        
        return list;
    }, {});
    
    const sortedList = Object.values(shoppingList)
        .sort((a, b) => a.name.localeCompare(b.name));
    
    displayShoppingList(sortedList);
}

function displayShoppingList(items) {
    const listHTML = items.map(item => `
        <div class="shopping-item">
            <div class="item-info">
                <h4>${item.name}</h4>
                <p><strong>${item.amount} ${item.unit}</strong></p>
                <p><small>For: ${item.recipes.slice(0, 2).join(', ')}${item.recipes.length > 2 ? '...' : ''}</small></p>
            </div>
            <input type="checkbox" class="item-checkbox">
        </div>
    `).join('');
    
    document.getElementById('shoppingListContent').innerHTML = listHTML;
    shoppingModal.classList.add('active');
}

function printShoppingList() {
    const printContent = document.getElementById('shoppingListContent').innerHTML;
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Shopping List - RecipeFlix</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 40px; background: #141414; color: white; }
                h1 { color: #E50914; margin-bottom: 30px; }
                .shopping-item { 
                    background: #2D2D2D; 
                    padding: 15px; 
                    margin-bottom: 10px; 
                    border-radius: 4px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                @media print {
                    body { background: white; color: black; }
                    .shopping-item { background: #f5f5f5; }
                }
            </style>
        </head>
        <body>
            <h1><i class="fas fa-shopping-cart"></i> RecipeFlix Shopping List</h1>
            ${printContent}
            <p style="margin-top: 30px; color: #808080;">Generated on ${new Date().toLocaleDateString()}</p>
        </body>
        </html>
    `;
    
    window.print();
    window.location.reload();
}

// Helper function for notifications
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #E50914;
        color: white;
        padding: 1rem 2rem;
        border-radius: 4px;
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Export functions to global scope for modal use
window.addToPlan = addToPlan;
window.toggleFavorite = toggleFavorite;

// Initialize app
document.addEventListener('DOMContentLoaded', init);