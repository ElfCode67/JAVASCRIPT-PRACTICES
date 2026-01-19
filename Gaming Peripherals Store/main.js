// DOM Elements
const productsContainer = document.getElementById('products-container');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const sortBy = document.getElementById('sort-by');
const cartCount = document.getElementById('cart-count');
const wishlistCount = document.getElementById('wishlist-count');
const cartBadge = document.getElementById('cart-badge');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const cartToggle = document.getElementById('cart-toggle');
const closeCart = document.getElementById('close-cart');
const clearSearchBtn = document.getElementById('clear-search');
const resultsCounter = document.getElementById('results-counter');
const noResults = document.getElementById('no-results');
const productModal = document.getElementById('product-modal');
const loadingState = document.getElementById('loading-state');

// Current filtered products
let currentProducts = [...products];
let isLoading = false;

// Format price with USD currency
function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(price);
}

// Generate star rating with accessibility
function generateStars(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            stars += '<i class="fas fa-star" aria-hidden="true"></i>';
        } else if (hasHalfStar && i === fullStars + 1) {
            stars += '<i class="fas fa-star-half-alt" aria-hidden="true"></i>';
        } else {
            stars += '<i class="far fa-star" aria-hidden="true"></i>';
        }
    }
    
    return `<span class="sr-only">Rating: ${rating} out of 5 stars</span>${stars}`;
}

// Show loading state
function showLoading(show) {
    if (!loadingState) return;
    isLoading = show;
    loadingState.style.display = show ? 'block' : 'none';
    
    if (show && productsContainer) {
        productsContainer.style.opacity = '0.5';
    } else if (productsContainer) {
        productsContainer.style.opacity = '1';
    }
}

// Show toast notification with animations
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    
    const icon = type === 'success' ? 'fa-check-circle' : 
                 type === 'error' ? 'fa-exclamation-circle' : 
                 'fa-info-circle';
    
    toast.innerHTML = `
        <i class="fas ${icon}" aria-hidden="true"></i>
        <span>${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()" aria-label="Close notification">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(toast);
    
    // Trigger animation
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });
    
    // Auto-remove
    setTimeout(() => {
        if (toast.parentNode) {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }
    }, 3000);
}

// Update cart and wishlist counts
function updateCounts() {
    const cartTotalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    // Update counts on all elements
    const cartCountElements = document.querySelectorAll('#cart-count, #cart-count-badge');
    cartCountElements.forEach(el => {
        if (el) el.textContent = cartTotalItems;
    });
    
    const wishlistCountElements = document.querySelectorAll('#wishlist-count, #wishlist-count-badge');
    wishlistCountElements.forEach(el => {
        if (el) el.textContent = wishlist.length;
    });
    
    if (cartBadge) cartBadge.textContent = cartTotalItems;
    
    // Save to localStorage
    storage.set('cart', cart);
    storage.set('wishlist', wishlist);
}

// Add to cart with animation feedback
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        showToast('Product not found', 'error');
        return false;
    }
    
    // Check stock availability
    const existingItem = cart.find(item => item.id === productId);
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    
    if (currentQuantity >= product.stock) {
        showToast(`Sorry, only ${product.stock} available in stock`, 'error');
        return false;
    }
    
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
    
    // Show success animation
    showToast(`${product.name} added to cart! 🎮`, 'success');
    
    // Add to recent
    addToRecent(productId);
    
    // Auto-open cart sidebar on first add
    if (cart.length === 1 && cartSidebar) {
        cartSidebar.classList.add('open');
        if (cartOverlay) cartOverlay.classList.add('show');
    }
    
    // Trigger cart button animation
    if (cartToggle) {
        cartToggle.classList.add('pulse');
        setTimeout(() => cartToggle.classList.remove('pulse'), 500);
    }
    
    return true;
}

// Remove from cart with confirmation
function removeFromCart(productId, confirm = true) {
    if (confirm) {
        const item = cart.find(item => item.id === productId);
        if (!item) return false;
        
        const product = products.find(p => p.id === productId);
        showToast(`${item.name} removed from cart`, 'info');
    }
    
    cart = cart.filter(item => item.id !== productId);
    updateCounts();
    updateCartSidebar();
    return true;
}

// Update quantity with stock validation
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    const product = products.find(p => p.id === productId);
    
    if (!item || !product) return;
    
    const newQuantity = item.quantity + change;
    
    // Validate against stock
    if (newQuantity > product.stock) {
        showToast(`Only ${product.stock} available in stock`, 'error');
        return;
    }
    
    if (newQuantity < 1) {
        removeFromCart(productId);
    } else {
        item.quantity = newQuantity;
        updateCounts();
        updateCartSidebar();
    }
}

// Toggle wishlist with animation feedback
function toggleWishlist(productId) {
    const index = wishlist.indexOf(productId);
    const product = products.find(p => p.id === productId);
    const wishlistBtn = document.querySelector(`[data-product-id="${productId}"] .wishlist-btn`);
    
    if (index === -1) {
        wishlist.push(productId);
        showToast(`${product.name} added to wishlist! ❤️`, 'success');
        
        // Heart animation
        if (wishlistBtn) {
            wishlistBtn.classList.add('heart-pulse');
            setTimeout(() => wishlistBtn.classList.remove('heart-pulse'), 500);
        }
    } else {
        wishlist.splice(index, 1);
        showToast(`${product.name} removed from wishlist`, 'info');
    }
    
    updateCounts();
    
    // Update heart icon in product cards
    const heartIcons = document.querySelectorAll(`[data-product-id="${productId}"] .wishlist-btn i`);
    heartIcons.forEach(icon => {
        if (index === -1) {
            icon.classList.add('fas');
            icon.classList.remove('far');
        } else {
            icon.classList.add('far');
            icon.classList.remove('fas');
        }
    });
    
    return index === -1;
}

// Update cart sidebar
function updateCartSidebar() {
    if (!cartItems || !cartTotal) return;
    
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #94a3b8;">
                <div style="font-size: 3rem; margin-bottom: 15px;">🛒</div>
                <p>Your cart is empty</p>
            </div>
        `;
        cartTotal.textContent = formatPrice(0);
        return;
    }
    
    let total = 0;
    
    cart.forEach(item => {
        const product = products.find(p => p.id === item.id);
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px; padding: 15px 0; border-bottom: 1px solid #2d3748;">
                <div style="font-size: 2rem; flex-shrink: 0;">${item.emoji}</div>
                <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: bold; margin-bottom: 5px; overflow: hidden; text-overflow: ellipsis;">${item.name}</div>
                    <div style="color: #00f3ff; font-size: 0.9rem;">${formatPrice(item.price)} × ${item.quantity}</div>
                    <div style="display: flex; align-items: center; gap: 10px; margin-top: 8px;">
                        <button 
                            onclick="updateQuantity(${item.id}, -1)" 
                            class="quantity-btn"
                            aria-label="Decrease quantity of ${item.name}"
                        >
                            <i class="fas fa-minus"></i>
                        </button>
                        <span style="min-width: 20px; text-align: center; font-weight: bold;">${item.quantity}</span>
                        <button 
                            onclick="updateQuantity(${item.id}, 1)" 
                            class="quantity-btn"
                            aria-label="Increase quantity of ${item.name}"
                            ${item.quantity >= product.stock ? 'disabled' : ''}
                        >
                            <i class="fas fa-plus"></i>
                        </button>
                        ${item.quantity >= product.stock ? '<span style="color: #ef4444; font-size: 0.8rem; margin-left: 5px;">Max</span>' : ''}
                    </div>
                </div>
                <div style="text-align: right; flex-shrink: 0;">
                    <div style="font-weight: bold; margin-bottom: 8px;">${formatPrice(itemTotal)}</div>
                    <button 
                        onclick="removeFromCart(${item.id})" 
                        style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 0.9rem;"
                        aria-label="Remove ${item.name} from cart"
                    >
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });
    
    cartTotal.textContent = formatPrice(total);
}

// Get stock status
function getStockStatus(stock) {
    if (stock === 0) {
        return { text: 'Out of Stock', class: 'out-of-stock', available: false };
    } else if (stock <= 5) {
        return { text: `Only ${stock} left!`, class: 'low-stock', available: true };
    } else {
        return { text: 'In Stock', class: 'in-stock', available: true };
    }
}

// Show product details modal
function showProductDetails(productId) {
    const product = products.find(p => p.id === productId);
    if (!product || !productModal) return;
    
    const modalBody = document.getElementById('modal-body');
    const stockStatus = getStockStatus(product.stock);
    const isInWishlist = wishlist.includes(product.id);
    const cartItem = cart.find(item => item.id === productId);
    const inCart = cartItem ? cartItem.quantity : 0;
    
    modalBody.innerHTML = `
        <div class="modal-product">
            <div class="modal-emoji">${product.emoji}</div>
            <div class="modal-category">${product.category.toUpperCase()}</div>
            <h2 id="modal-title" class="modal-title">${product.name}</h2>
            <div class="modal-rating">
                ${generateStars(product.rating)}
                <span>${product.rating} / 5.0</span>
            </div>
            
            <div style="margin: 20px 0; color: #94a3b8;">
                <strong>Brand:</strong> ${product.brand} | 
                <strong>Color:</strong> ${product.color}
            </div>
            
            <p class="modal-description">${product.description}</p>
            
            <div class="modal-features">
                <h3>Key Features:</h3>
                <ul>
                    ${product.features.map(feature => `<li><i class="fas fa-check"></i> ${feature}</li>`).join('')}
                </ul>
            </div>
            
            <div class="modal-stock ${stockStatus.class}">
                <i class="fas fa-box"></i> ${stockStatus.text}
            </div>
            
            <div class="modal-price">${formatPrice(product.price)}</div>
            
            ${inCart > 0 ? `
                <div class="in-cart-notice">
                    <i class="fas fa-shopping-cart"></i> ${inCart} in cart
                    ${inCart >= product.stock ? '<span style="margin-left: 10px; color: #ef4444;">(Maximum quantity)</span>' : ''}
                </div>
            ` : ''}
            
            <div class="modal-actions">
                <button 
                    onclick="addToCart(${product.id}); closeProductModal();" 
                    class="btn btn-primary"
                    ${!stockStatus.available || inCart >= product.stock ? 'disabled' : ''}
                    style="flex: 1;"
                    id="modal-add-to-cart"
                >
                    <i class="fas fa-cart-plus"></i> 
                    ${!stockStatus.available ? 'Out of Stock' : inCart >= product.stock ? 'Max in Cart' : 'Add to Cart'}
                </button>
                <button 
                    onclick="toggleWishlist(${product.id})" 
                    class="btn ${isInWishlist ? 'btn-primary' : 'btn-secondary'}"
                    aria-label="${isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}"
                >
                    <i class="fas fa-heart ${isInWishlist ? 'active' : ''}"></i>
                </button>
            </div>
        </div>
    `;
    
    productModal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Add to recent products
    addToRecent(productId);
}

// Close product modal
function closeProductModal() {
    if (productModal) {
        productModal.classList.remove('show');
        document.body.style.overflow = '';
        
        // Focus on last focused element
        const lastFocus = document.activeElement;
        if (lastFocus && lastFocus.id === 'modal-add-to-cart') {
            const productId = lastFocus.getAttribute('onclick').match(/\d+/)[0];
            const viewBtn = document.querySelector(`[onclick="showProductDetails(${productId})"]`);
            if (viewBtn) viewBtn.focus();
        }
    }
}

// Render products with animation
function renderProducts(filteredProducts = currentProducts) {
    if (!productsContainer) return;
    
    showLoading(true);
    
    // Clear container with fade out
    productsContainer.style.opacity = '0';
    
    setTimeout(() => {
        productsContainer.innerHTML = '';
        
        // Update results counter
        if (resultsCounter) {
            resultsCounter.textContent = `Showing ${filteredProducts.length} of ${products.length} products`;
            resultsCounter.classList.add('fade-in');
        }
        
        // Show no results state
        if (filteredProducts.length === 0) {
            if (noResults) {
                noResults.style.display = 'block';
                noResults.classList.add('fade-in');
            }
            showLoading(false);
            return;
        }
        
        if (noResults) noResults.style.display = 'none';
        
        // Render each product with delay for animation
        filteredProducts.forEach((product, index) => {
            setTimeout(() => {
                const isInWishlist = wishlist.includes(product.id);
                const stockStatus = getStockStatus(product.stock);
                const cartItem = cart.find(item => item.id === product.id);
                const inCart = cartItem ? cartItem.quantity : 0;
                
                const productCard = document.createElement('div');
                productCard.className = 'product-card fade-in';
                productCard.setAttribute('role', 'listitem');
                productCard.setAttribute('data-product-id', product.id);
                productCard.style.animationDelay = `${index * 0.05}s`;
                
                productCard.innerHTML = `
                    <div class="product-emoji">${product.emoji}</div>
                    <div class="product-category">${product.category.toUpperCase()}</div>
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-rating">
                        ${generateStars(product.rating)}
                        <span>${product.rating}</span>
                    </div>
                    <div class="stock-indicator ${stockStatus.class}">
                        <i class="fas fa-box"></i> ${stockStatus.text}
                    </div>
                    ${inCart > 0 ? `<div class="in-cart-badge">${inCart} in cart</div>` : ''}
                    <div class="product-price">${formatPrice(product.price)}</div>
                    <button 
                        onclick="showProductDetails(${product.id})" 
                        class="btn btn-secondary" 
                        style="width: 100%; margin-bottom: 10px;"
                        aria-label="View details for ${product.name}"
                    >
                        <i class="fas fa-info-circle"></i> View Details
                    </button>
                    <div style="display: flex; gap: 10px;">
                        <button 
                            onclick="addToCart(${product.id})" 
                            class="btn btn-primary" 
                            style="flex: 1;"
                            ${!stockStatus.available || inCart >= product.stock ? 'disabled' : ''}
                            aria-label="${!stockStatus.available ? 'Out of stock' : inCart >= product.stock ? 'Maximum quantity in cart' : 'Add ' + product.name + ' to cart'}"
                        >
                            <i class="fas fa-cart-plus"></i> ${!stockStatus.available ? 'Out of Stock' : 'Add'}
                        </button>
                        <button 
                            onclick="toggleWishlist(${product.id})" 
                            class="btn btn-secondary wishlist-btn ${isInWishlist ? 'active' : ''}"
                            aria-label="${isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}"
                        >
                            <i class="${isInWishlist ? 'fas' : 'far'} fa-heart"></i>
                        </button>
                    </div>
                `;
                
                productsContainer.appendChild(productCard);
            }, index * 50);
        });
        
        // Show recently viewed products if on homepage
        if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
            setTimeout(() => renderRecentProducts(), filteredProducts.length * 50 + 100);
        }
        
        showLoading(false);
        productsContainer.style.opacity = '1';
    }, 200);
}

// Render recent products
function renderRecentProducts() {
    const recent = getRecentProducts();
    if (recent.length === 0) return;
    
    const recentContainer = document.createElement('div');
    recentContainer.className = 'recent-products';
    recentContainer.innerHTML = `
        <h2><i class="fas fa-history"></i> Recently Viewed</h2>
        <div class="products-grid" id="recent-products-container"></div>
    `;
    
    // Check if we already have a recent products section
    const existingRecent = document.querySelector('.recent-products');
    if (existingRecent) existingRecent.remove();
    
    productsContainer.parentNode.insertBefore(recentContainer, productsContainer.nextSibling);
    
    const recentProductsGrid = document.getElementById('recent-products-container');
    recent.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.setAttribute('role', 'listitem');
        
        productCard.innerHTML = `
            <div class="product-emoji">${product.emoji}</div>
            <div class="product-category">${product.category.toUpperCase()}</div>
            <h3 class="product-title">${product.name}</h3>
            <div class="product-price">${formatPrice(product.price)}</div>
            <button onclick="showProductDetails(${product.id})" class="btn btn-secondary" style="width: 100%;">
                <i class="fas fa-eye"></i> View Again
            </button>
        `;
        
        recentProductsGrid.appendChild(productCard);
    });
}

// Sort products
function sortProducts(productsToSort) {
    if (!sortBy) return productsToSort;
    
    const sortValue = sortBy.value;
    const sorted = [...productsToSort];
    
    switch (sortValue) {
        case 'price-low':
            return sorted.sort((a, b) => a.price - b.price);
        case 'price-high':
            return sorted.sort((a, b) => b.price - a.price);
        case 'rating':
            return sorted.sort((a, b) => b.rating - a.rating);
        case 'name':
            return sorted.sort((a, b) => a.name.localeCompare(b.name));
        default:
            return sorted;
    }
}

// Filter and sort products
function filterProducts() {
    if (!searchInput || !categoryFilter) return;
    
    const searchTerm = searchInput.value.toLowerCase().trim();
    const category = categoryFilter.value;
    
    // Show/hide clear button
    if (clearSearchBtn) {
        clearSearchBtn.style.display = searchTerm ? 'inline-flex' : 'none';
    }
    
    showLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
        let filtered = products.filter(product => {
            const matchesSearch = searchTerm === '' || 
                product.name.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm) ||
                product.category.toLowerCase().includes(searchTerm) ||
                product.brand.toLowerCase().includes(searchTerm);
            
            const matchesCategory = category === 'all' || product.category === category;
            
            return matchesSearch && matchesCategory;
        });
        
        // Apply sorting
        filtered = sortProducts(filtered);
        currentProducts = filtered;
        
        renderProducts(filtered);
    }, 300);
}

// Reset filters
function resetFilters() {
    if (searchInput) searchInput.value = '';
    if (categoryFilter) categoryFilter.value = 'all';
    if (sortBy) sortBy.value = 'default';
    if (clearSearchBtn) clearSearchBtn.style.display = 'none';
    
    filterProducts();
}

// Close cart sidebar
function closeCartSidebar() {
    if (cartSidebar) cartSidebar.classList.remove('open');
    if (cartOverlay) cartOverlay.classList.remove('show');
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Add skip to main content link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-to-main';
    skipLink.textContent = 'Skip to main content';
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add main content id
    const mainContent = document.querySelector('main');
    if (mainContent) mainContent.id = 'main-content';
    
    // Add pulse animation style
    const style = document.createElement('style');
    style.textContent = `
        .pulse { animation: pulse 0.5s ease; }
        .heart-pulse { animation: heartPulse 0.5s ease; }
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        @keyframes heartPulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.3); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
    
    // Render products on homepage
    if (productsContainer) {
        // Simulate initial loading
        setTimeout(() => {
            renderProducts();
        }, 500);
        
        // Search on input with debounce
        let searchTimeout;
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    filterProducts();
                }, 300);
            });
            
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    filterProducts();
                }
            });
        }
        
        // Category filter
        if (categoryFilter) {
            categoryFilter.addEventListener('change', filterProducts);
        }
        
        // Sort dropdown
        if (sortBy) {
            sortBy.addEventListener('change', filterProducts);
        }
        
        // Clear search button
        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', function() {
                searchInput.value = '';
                filterProducts();
                searchInput.focus();
            });
        }
    }
    
    // Update counts and cart sidebar
    updateCounts();
    if (cartItems) {
        updateCartSidebar();
    }
    
    // Cart sidebar controls
    if (cartToggle) {
        cartToggle.addEventListener('click', function() {
            cartSidebar.classList.add('open');
            if (cartOverlay) cartOverlay.classList.add('show');
            document.querySelector('.close-btn')?.focus();
        });
    }
    
    if (closeCart) {
        closeCart.addEventListener('click', closeCartSidebar);
    }
    
    if (cartOverlay) {
        cartOverlay.addEventListener('click', closeCartSidebar);
    }
    
    // Modal close handlers
    if (productModal) {
        const modalClose = productModal.querySelector('.modal-close');
        if (modalClose) {
            modalClose.addEventListener('click', closeProductModal);
        }
        
        productModal.addEventListener('click', function(e) {
            if (e.target === productModal) {
                closeProductModal();
            }
        });
    }
    
    // Keyboard navigation and accessibility
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeCartSidebar();
            closeProductModal();
        }
        
        // Tab trapping in modal
        if (productModal.classList.contains('show')) {
            if (e.key === 'Tab') {
                const focusableElements = productModal.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];
                
                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        }
    });
    
    // Check for localStorage availability
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
    } catch (e) {
        showToast('Your browser storage is full or disabled. Some features may not work.', 'error');
    }
    
    // Update page title with cart count
    const updateTitle = () => {
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        if (count > 0 && !document.title.includes('(')) {
            document.title = document.title.replace('Nexus Gaming', `(${count}) Nexus Gaming`);
        } else if (count === 0) {
            document.title = document.title.replace(/\(\d+\)\s*/, '');
        }
    };
    
    // Watch for cart changes
    const originalUpdateCounts = updateCounts;
    window.updateCounts = function() {
        originalUpdateCounts();
        updateTitle();
    };
    
    // Initialize title
    updateTitle();
});

// Make functions available globally
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.toggleWishlist = toggleWishlist;
window.filterProducts = filterProducts;
window.resetFilters = resetFilters;
window.showProductDetails = showProductDetails;
window.closeProductModal = closeProductModal;
window.closeCartSidebar = closeCartSidebar;