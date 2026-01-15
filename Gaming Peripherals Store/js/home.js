// DOM Elements
const productsContainer = document.getElementById('products-container');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const sortSelect = document.getElementById('sort-by');

// Render products
function renderProducts(productsToRender) {
    productsContainer.innerHTML = '';
    
    if (productsToRender.length === 0) {
        productsContainer.innerHTML = `
            <div class="no-products">
                <i class="fas fa-gamepad fa-3x"></i>
                <h3>No products found</h3>
                <p>Try different search or filter</p>
            </div>
        `;
        return;
    }
    
    productsToRender.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image">
                <div class="product-badge ${product.stock < 10 ? 'low-stock' : ''}">
                    ${product.stock < 10 ? `Only ${product.stock} left` : 'In Stock'}
                </div>
                <img src="assets/images/${product.image}" alt="${product.name}" onerror="this.src='assets/images/placeholder.jpg'">
                <button class="wishlist-btn ${wishlist.includes(product.id) ? 'active' : ''}" 
                        onclick="toggleWishlist(${product.id}); this.classList.toggle('active')">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
            <div class="product-info">
                <span class="product-category">${product.category.toUpperCase()}</span>
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                
                <div class="product-rating">
                    ${generateStars(product.rating)}
                    <span class="rating-value">${product.rating}</span>
                </div>
                
                <div class="product-footer">
                    <div class="product-price">
                        <span class="price">${formatPrice(product.price)}</span>
                    </div>
                    <button class="btn btn-primary" onclick="addToCart(${product.id}); showCartSidebar()">
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                </div>
            </div>
        `;
        productsContainer.appendChild(productCard);
    });
}

// Generate star rating HTML
function generateStars(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i === fullStars && hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

// Filter and sort products
function filterAndSortProducts() {
    let filtered = [...products];
    
    // Search filter
    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
        filtered = filtered.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.brand.toLowerCase().includes(searchTerm) ||
            product.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
    }
    
    // Category filter
    const selectedCategory = categoryFilter.value;
    if (selectedCategory !== 'all') {
        filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    // Sort
    const sortValue = sortSelect.value;
    switch(sortValue) {
        case 'price-low':
            filtered.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filtered.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            filtered.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'rating':
            filtered.sort((a, b) => b.rating - a.rating);
            break;
    }
    
    renderProducts(filtered);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Initial render
    renderProducts(products);
    updateCartCount();
    
    // Event listeners for filtering
    searchInput.addEventListener('input', filterAndSortProducts);
    categoryFilter.addEventListener('change', filterAndSortProducts);
    sortSelect.addEventListener('change', filterAndSortProducts);
    
    // Search button
    document.getElementById('search-btn').addEventListener('click', filterAndSortProducts);
    
    // Enter key for search
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') filterAndSortProducts();
    });
});