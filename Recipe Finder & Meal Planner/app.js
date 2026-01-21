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
const clearPlanBtn = document.getElementById('clearPlanBtn');
const generateListBtn = document.getElementById('generateListBtn');
const exportBtn = document.getElementById('exportBtn');
const shoppingModal = document.getElementById('shoppingModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const printListBtn = document.getElementById('printListBtn');
const closeModalButton = document.querySelector('.close-modal');

// App State
let mealPlan = [];
let favorites = [];
let allRecipes = [...recipes]; // Copy with spread operator

// Initialize the app
function init() {
    console.log("Recipe Finder App Initialized");
    console.log("Array methods used: filter(), map(), reduce(), sort(), some(), every(), find(), findIndex(), forEach()");
    
    // Load saved data from localStorage
    loadSavedData();
    
    // Display all recipes initially
    displayRecipes(allRecipes);
    
    // Update stats
    updateStats(allRecipes);
    updateDashboardStats();
    
    // Setup event listeners
    setupEventListeners();
}

// Load saved data from localStorage
function loadSavedData() {
    // Load meal plan
    const savedPlan = localStorage.getItem('recipeFinder_mealPlan');
    if (savedPlan) {
        mealPlan = JSON.parse(savedPlan);
        updateMealPlanDisplay();
    }
    
    // Load favorites
    const savedFavorites = localStorage.getItem('recipeFinder_favorites');
    if (savedFavorites) {
        favorites = JSON.parse(savedFavorites);
        // Mark favorite recipes
        allRecipes.forEach(recipe => {
            recipe.favorite = favorites.includes(recipe.id);
        });
    }
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
    document.getElementById('categoryFilter').addEventListener('change', handleSearch);
    document.getElementById('sortBy').addEventListener('change', handleSearch);
    
    // Meal planner buttons
    clearPlanBtn.addEventListener('click', clearMealPlan);
    generateListBtn.addEventListener('click', generateShoppingList);
    
    // Export button
    exportBtn.addEventListener('click', exportData);
    
    // Modal buttons
    closeModalBtn.addEventListener('click', () => {
        shoppingModal.classList.remove('active');
    });
    
    closeModalButton.addEventListener('click', () => {
        shoppingModal.classList.remove('active');
    });
    
    printListBtn.addEventListener('click', printShoppingList);
    
    // Close modal on backdrop click
    shoppingModal.addEventListener('click', (e) => {
        if (e.target === shoppingModal) {
            shoppingModal.classList.remove('active');
        }
    });
}

// Handle search
function handleSearch() {
    const searchText = searchInput.value.trim().toLowerCase();
    let filteredRecipes = [...allRecipes]; // Create copy with spread operator
    
    // Filter by search text if provided
    if (searchText) {
        const searchIngredients = searchText.split(',').map(i => i.trim()).filter(i => i);
        const matchAll = document.querySelector('input[name="matchType"]:checked').value === 'all';
        
        // .filter() with .some() and .every()
        filteredRecipes = filteredRecipes.filter(recipe => {
            if (matchAll) {
                // Must contain ALL ingredients (AND operator) - using .every()
                return searchIngredients.every(searchIng => 
                    recipe.ingredients.some(recipeIng => 
                        recipeIng.name.toLowerCase().includes(searchIng)
                    )
                );
            } else {
                // Must contain ANY ingredient (OR operator) - using .some()
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

// Apply time, servings, and category filters
function applyFilters(recipesList) {
    let filtered = [...recipesList];
    
    // Time filter using .filter()
    const timeFilter = document.getElementById('timeFilter').value;
    if (timeFilter) {
        const maxTime = parseInt(timeFilter);
        filtered = filtered.filter(recipe => 
            (recipe.prepTime + recipe.cookTime) <= maxTime
        );
    }
    
    // Servings filter using .filter()
    const servingsFilter = document.getElementById('servingsFilter').value;
    if (servingsFilter) {
        const minServings = parseInt(servingsFilter);
        filtered = filtered.filter(recipe => recipe.servings >= minServings);
    }
    
    // Category filter using .filter() and .includes()
    const categoryFilter = document.getElementById('categoryFilter').value;
    if (categoryFilter) {
        filtered = filtered.filter(recipe => 
            recipe.tags.includes(categoryFilter)
        );
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
    
    // Append all cards at once
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
                <button class="btn-favorite ${recipe.favorite ? 'favorited' : ''}" data-id="${recipe.id}" title="${recipe.favorite ? 'Remove from favorites' : 'Add to favorites'}">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
        </div>
    `;
    
    // Add event listeners to buttons
    const viewBtn = card.querySelector('.btn-view');
    const addBtn = card.querySelector('.btn-add');
    const favoriteBtn = card.querySelector('.btn-favorite');
    
    viewBtn.addEventListener('click', () => viewRecipe(recipe.id));
    addBtn.addEventListener('click', () => addToPlan(recipe.id));
    favoriteBtn.addEventListener('click', () => toggleFavorite(recipe.id));
    
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

// Update dashboard stats
function updateDashboardStats() {
    // Total recipes
    document.getElementById('totalRecipeCount').textContent = allRecipes.length;
    
    // Quick recipes (<30 min) using filter()
    const quickRecipes = allRecipes.filter(recipe => 
        (recipe.prepTime + recipe.cookTime) < 30
    );
    document.getElementById('quickRecipeCount').textContent = quickRecipes.length;
    
    // Vegetarian recipes using filter()
    const vegRecipes = allRecipes.filter(recipe => 
        recipe.tags.includes('vegetarian')
    );
    document.getElementById('vegRecipeCount').textContent = vegRecipes.length;
    
    // Unique tags using Set and spread operator
    const allTags = allRecipes.reduce((tags, recipe) => {
        recipe.tags.forEach(tag => tags.add(tag));
        return tags;
    }, new Set());
    document.getElementById('totalTags').textContent = allTags.size;
}

// View recipe details
function viewRecipe(recipeId) {
    const recipe = allRecipes.find(r => r.id === recipeId); // Using .find()
    if (!recipe) return;
    
    const ingredientsList = recipe.ingredients
        .map(ing => `• ${ing.amount} ${ing.unit} ${ing.name}`)
        .join('\n');
    
    alert(`📋 Recipe Details:\n\n` +
          `🍽️ Name: ${recipe.name}\n` +
          `⏱️ Total Time: ${recipe.prepTime + recipe.cookTime} minutes\n` +
          `👥 Servings: ${recipe.servings}\n` +
          `🏷️ Tags: ${recipe.tags.join(', ')}\n\n` +
          `🥕 Ingredients:\n${ingredientsList}`);
}

// Toggle favorite
function toggleFavorite(recipeId) {
    const recipe = allRecipes.find(r => r.id === recipeId);
    if (!recipe) return;
    
    const index = favorites.indexOf(recipeId); // Using .indexOf()
    
    if (index > -1) {
        // Remove from favorites using .splice()
        favorites.splice(index, 1);
        recipe.favorite = false;
    } else {
        // Add to favorites using .push()
        favorites.push(recipeId);
        recipe.favorite = true;
    }
    
    // Save to localStorage
    localStorage.setItem('recipeFinder_favorites', JSON.stringify(favorites));
    
    // Update favorite button state
    updateFavoriteButton(recipeId);
    
    console.log('Favorites updated:', favorites);
}

// Update favorite button state
function updateFavoriteButton(recipeId) {
    const buttons = document.querySelectorAll(`.btn-favorite[data-id="${recipeId}"]`);
    const isFavorite = favorites.includes(recipeId);
    
    buttons.forEach(btn => {
        btn.classList.toggle('favorited', isFavorite);
        btn.title = isFavorite ? 'Remove from favorites' : 'Add to favorites';
    });
}

// MEAL PLANNER FUNCTIONS

// Add recipe to meal plan
function addToPlan(recipeId) {
    const recipe = allRecipes.find(r => r.id === recipeId);
    if (!recipe) return;
    
    // Check if recipe already in plan using .findIndex()
    const existingIndex = mealPlan.findIndex(item => item.id === recipe.id);
    
    if (existingIndex > -1) {
        // Update quantity if already exists
        mealPlan[existingIndex].quantity += 1;
    } else {
        // Add new recipe to plan with quantity 1 using spread operator
        mealPlan.push({
            ...recipe,
            quantity: 1,
            addedAt: new Date().toISOString()
        });
    }
    
    // Save to localStorage
    saveMealPlan();
    
    // Update display
    updateMealPlanDisplay();
    
    // Show feedback
    alert(`✅ Added "${recipe.name}" to your meal plan!\n\n📊 Total in plan: ${mealPlan.length} recipes`);
}

// Remove recipe from plan
function removeFromPlan(recipeId) {
    const index = mealPlan.findIndex(item => item.id === recipeId);
    if (index > -1) {
        mealPlan.splice(index, 1); // Using .splice()
        saveMealPlan();
        updateMealPlanDisplay();
    }
}

// Save meal plan to localStorage
function saveMealPlan() {
    localStorage.setItem('recipeFinder_mealPlan', JSON.stringify(mealPlan));
}

// Update meal plan display
function updateMealPlanDisplay() {
    const planContainer = document.getElementById('planContainer');
    const planCount = document.getElementById('planCount');
    const planTime = document.getElementById('planTime');
    const ingredientCount = document.getElementById('ingredientCount');
    
    if (mealPlan.length === 0) {
        planContainer.innerHTML = '<p class="empty-plan">No meals planned yet. Add recipes using "Add to Plan" button!</p>';
        planCount.textContent = '0';
        planTime.textContent = '0';
        ingredientCount.textContent = '0';
        return;
    }
    
    // Calculate statistics using .reduce()
    const totalTime = mealPlan.reduce((sum, item) => 
        sum + (item.prepTime + item.cookTime), 0
    );
    
    const totalIngredients = mealPlan.reduce((sum, item) => 
        sum + item.ingredients.length, 0
    );
    
    // Update stats
    planCount.textContent = mealPlan.length;
    planTime.textContent = totalTime;
    ingredientCount.textContent = totalIngredients;
    
    // Create plan items using .map()
    const planItems = mealPlan.map(item => `
        <div class="meal-plan-item">
            <div class="meal-plan-info">
                <h4>${item.name}</h4>
                <p>${item.prepTime + item.cookTime} min • ${item.servings} servings</p>
                <p><small>Ingredients: ${item.ingredients.length}</small></p>
            </div>
            <div class="meal-plan-actions">
                <button class="remove-plan-btn" data-id="${item.id}" title="Remove from plan">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    planContainer.innerHTML = planItems;
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-plan-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const recipeId = parseInt(e.target.closest('button').dataset.id);
            removeFromPlan(recipeId);
        });
    });
}

// Clear meal plan
function clearMealPlan() {
    if (mealPlan.length > 0 && confirm('Clear your entire meal plan?')) {
        mealPlan = [];
        saveMealPlan();
        updateMealPlanDisplay();
        alert('✅ Meal plan cleared!');
    }
}

// SHOPPING LIST FUNCTIONS

// Generate shopping list from meal plan
function generateShoppingList() {
    if (mealPlan.length === 0) {
        alert('Your meal plan is empty! Add some recipes first.');
        return;
    }
    
    // Use reduce to consolidate ingredients
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
                // Combine amounts
                list[key].amount += ingredient.amount;
                if (!list[key].recipes.includes(recipe.name)) {
                    list[key].recipes.push(recipe.name);
                }
            }
        });
        
        return list;
    }, {});
    
    // Convert to array and sort using .sort()
    const sortedList = Object.values(shoppingList)
        .sort((a, b) => a.name.localeCompare(b.name));
    
    // Display shopping list
    displayShoppingList(sortedList);
}

// Display shopping list in modal
function displayShoppingList(items) {
    const listHTML = items.map(item => `
        <div class="shopping-item">
            <div class="item-info">
                <h4>${item.name}</h4>
                <p><strong>${item.amount} ${item.unit}</strong></p>
                <p><small>For: ${item.recipes.join(', ')}</small></p>
            </div>
            <input type="checkbox" class="item-checkbox">
        </div>
    `).join('');
    
    document.getElementById('shoppingListContent').innerHTML = listHTML;
    shoppingModal.classList.add('active');
}

// Print shopping list
function printShoppingList() {
    const printContent = document.getElementById('shoppingListContent').innerHTML;
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Shopping List</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { color: #333; }
                .shopping-item { margin-bottom: 10px; padding: 10px; border-bottom: 1px solid #eee; }
            </style>
        </head>
        <body>
            <h1><i class="fas fa-shopping-cart"></i> Shopping List</h1>
            ${printContent}
            <p style="margin-top: 30px; color: #666;">Generated by Recipe Finder</p>
        </body>
        </html>
    `;
    
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload(); // Reload to restore event listeners
}

// EXPORT DATA FUNCTION
function exportData() {
    const data = {
        app: "Recipe Finder",
        version: "1.0",
        exportedAt: new Date().toISOString(),
        recipes: allRecipes,
        mealPlan: mealPlan,
        favorites: favorites
    };
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `recipe-finder-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('✅ Data exported successfully!');
}

// Initialize app when page loads
document.addEventListener('DOMContentLoaded', init);

// Log array methods used for learning
console.log('%c📚 Array Methods Demonstrated:', 'color: #4CAF50; font-size: 16px; font-weight: bold;');
console.log('1. .filter() - Filter recipes by ingredients/time/servings');
console.log('2. .map() - Create HTML elements from data');
console.log('3. .reduce() - Calculate totals and consolidate data');
console.log('4. .sort() - Sort recipes by various criteria');
console.log('5. .some() - Check if recipe contains ANY ingredient');
console.log('6. .every() - Check if recipe contains ALL ingredients');
console.log('7. .find() - Find specific recipe by ID');
console.log('8. .findIndex() - Find position of item in array');
console.log('9. .forEach() - Loop through arrays/DOM elements');
console.log('10. .includes() - Check if array contains value');
console.log('11. .indexOf() - Find position of value in array');
console.log('12. .slice() - Take portion of array');
console.log('13. .splice() - Remove items from array');
console.log('14. .join() - Convert array to string');
console.log('15. .push() - Add items to end of array');
console.log('16. Spread operator [...] - Copy arrays');
console.log('17. Set() - Store unique values');
console.log('18. Object.values() - Convert object to array');