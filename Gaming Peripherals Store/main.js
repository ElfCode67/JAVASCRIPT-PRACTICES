// DOM Elements
const productsContainer = document.getElementById('products-container');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const cartCount = document.getElementById('cart-count');
const wishlistCount = document.getElementById('wishlist-count');
const cartBadge = document.getElementById('cart-badge');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const cartSidebar = document.getElementById('cart-sidebar');
const cartToggle = document.getElementById('cart-toggle');
const closeCart = document.getElementById('close-cart');

// Format price
function formatPrice(price) {
    return `$${price.toFixed(2)}`;
}

// Generate star rating
function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rating)) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

// Update cart and wishlist counts
function updateCounts() {
    const cartTotalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = cartTotalItems;
    wishlistCount.textContent = wishlist.length;
    cartBadge.textContent = cartTotalItems;
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

// Add to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    
    if (!product) return false;
    
    // Check if product already in cart
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            emoji: product.emoji,
            quantity: 1
        });
    }
    
    updateCounts();
    updateCartSidebar();
    return true;
}

// Remove from cart
function removeFromCart(productId) {
    const index = cart.findIndex(item => item.id === productId);
    if (index !== -1) {
        cart.splice(index, 1);
        updateCounts();
        updateCartSidebar();
        return true;
    }
    return false;
}

// Update quantity
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity < 1) {
        removeFromCart(productId);
    } else {
        updateCounts();
        updateCartSidebar();
    }
}

// Toggle wishlist
function toggleWishlist(productId) {
    const index = wishlist.indexOf(productId);
    
    if (index === -1) {
        wishlist.push(productId);
    } else {
        wishlist.splice(index, 1);
    }
    
    updateCounts();
    renderProducts();
    return index === -1; // Returns true if added
}

// Update cart sidebar
function updateCartSidebar() {
    if (!cartItems || !cartTotal) return;
    
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: #94a3b8;">Your cart is empty</p>';
        cartTotal.textContent = '$0.00';
        return;
    }
    
    let total = 0;
    
    cart.forEach(item => {
        total += item.price * item.quantity;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px; padding: 10px 0; border-bottom: 1px solid #2d3748;">
                <div style="font-size: 2rem;">${item.emoji}</div>
                <div style="flex: 1;">
                    <div style="font-weight: bold;">${item.name}</div>
                    <div style="color: #00f3ff;">${formatPrice(item.price)} × ${item.quantity}</div>
                    <div style="display: flex; gap: 10px; margin-top: 5px;">
                        <button onclick="updateQuantity(${item.id}, -1)" style="background: none; border: none; color: #e2e8f0; cursor: pointer;">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span>${item.quantity}</span>
                        <button onclick="updateQuantity(${item.id}, 1)" style="background: none; border: none; color: #e2e8f0; cursor: pointer;">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                <div>
                    <div style="font-weight: bold;">${formatPrice(item.price * item.quantity)}</div>
                    <button onclick="removeFromCart(${item.id})" style="background: none; border: none; color: #ef4444; cursor: pointer; margin-top: 5px;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });
    
    cartTotal.textContent = formatPrice(total);
}

// Render products
function renderProducts(filteredProducts = products) {
    if (!productsContainer) return;
    
    productsContainer.innerHTML = '';
    
    filteredProducts.forEach(product => {
        const isInWishlist = wishlist.includes(product.id);
        
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-emoji">${product.emoji}</div>
            <div class="product-category">${product.category.toUpperCase()}</div>
            <h3 class="product-title">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-rating">
                ${generateStars(product.rating)}
                <span>${product.rating}</span>
            </div>
            <div class="product-price">${formatPrice(product.price)}</div>
            <div style="display: flex; gap: 10px;">
                <button onclick="addToCart(${product.id})" class="btn btn-primary">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
                <button onclick="toggleWishlist(${product.id})" class="btn btn-secondary">
                    <i class="fas fa-heart ${isInWishlist ? 'active' : ''}"></i>
                </button>
            </div>
        `;
        productsContainer.appendChild(productCard);
    });
}

// Filter and sort products
function filterProducts() {
    if (!searchInput || !categoryFilter) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const category = categoryFilter.value;
    
    let filtered = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                             product.description.toLowerCase().includes(searchTerm);
        const matchesCategory = category === 'all' || product.category === category;
        
        return matchesSearch && matchesCategory;
    });
    
    renderProducts(filtered);
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Only run on pages that need these elements
    if (productsContainer) {
        renderProducts();
        
        // Add event listeners for filtering
        if (searchInput) {
            searchInput.addEventListener('input', filterProducts);
        }
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', filterProducts);
        }
    }
    
    // Update counts and cart sidebar
    updateCounts();
    if (cartItems) {
        updateCartSidebar();
    }
    
    // Cart sidebar toggle
    if (cartToggle && cartSidebar && closeCart) {
        cartToggle.addEventListener('click', function() {
            cartSidebar.classList.add('open');
        });
        
        closeCart.addEventListener('click', function() {
            cartSidebar.classList.remove('open');
        });
        
        // Close cart when clicking outside
        document.addEventListener('click', function(event) {
            if (!cartSidebar.contains(event.target) && 
                !cartToggle.contains(event.target) && 
                cartSidebar.classList.contains('open')) {
                cartSidebar.classList.remove('open');
            }
        });
    }
});

// Make functions available globally
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.toggleWishlist = toggleWishlist;