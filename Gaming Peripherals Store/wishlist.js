// Wishlist Page Functions
document.addEventListener('DOMContentLoaded', function() {
    updateWishlistCounts();
    renderWishlist();
    
    // Set up product modal if it exists
    const productModal = document.getElementById('product-modal');
    if (productModal) {
        const modalClose = productModal.querySelector('.modal-close');
        if (modalClose) {
            modalClose.addEventListener('click', function() {
                productModal.classList.remove('show');
                document.body.style.overflow = '';
            });
        }
        
        productModal.addEventListener('click', function(e) {
            if (e.target === productModal) {
                productModal.classList.remove('show');
                document.body.style.overflow = '';
            }
        });
    }
});

// Update wishlist page counts
function updateWishlistCounts() {
    const cartCount = document.getElementById('cart-count');
    const wishlistCount = document.getElementById('wishlist-count');
    
    if (cartCount) {
        const cartTotal = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = cartTotal;
    }
    
    if (wishlistCount) {
        wishlistCount.textContent = wishlist.length;
    }
}

// Format price
function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(price);
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

// Show product modal on wishlist page
function showWishlistProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const modal = document.getElementById('product-modal');
    const modalBody = document.getElementById('modal-body');
    
    if (!modal || !modalBody) return;
    
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
            
            <div class="modal-actions">
                <button 
                    onclick="addToCartFromWishlist(${product.id})" 
                    class="btn btn-primary"
                    ${!stockStatus.available || inCart >= product.stock ? 'disabled' : ''}
                    style="flex: 1;"
                >
                    <i class="fas fa-cart-plus"></i> 
                    ${!stockStatus.available ? 'Out of Stock' : inCart >= product.stock ? 'Max in Cart' : 'Add to Cart'}
                </button>
                <button 
                    onclick="removeFromWishlistPage(${product.id})" 
                    class="btn btn-secondary"
                >
                    <i class="fas fa-trash"></i> Remove
                </button>
            </div>
        </div>
    `;
    
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Add to cart from wishlist
function addToCartFromWishlist(productId) {
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    // Check stock availability
    const existingItem = cart.find(item => item.id === productId);
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    
    if (currentQuantity >= product.stock) {
        showWishlistToast(`Sorry, only ${product.stock} available in stock`, 'error');
        return;
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
    
    storage.set('cart', cart);
    updateWishlistCounts();
    showWishlistToast(`${product.name} added to cart!`, 'success');
    
    // Update the product card
    const productCard = document.querySelector(`[data-product-id="${productId}"]`);
    if (productCard) {
        const inCartBadge = productCard.querySelector('.in-cart-badge');
        if (inCartBadge) {
            inCartBadge.textContent = `${currentQuantity + 1} in cart`;
        } else {
            const badge = document.createElement('div');
            badge.className = 'in-cart-badge';
            badge.textContent = '1 in cart';
            productCard.appendChild(badge);
        }
    }
}

// Remove from wishlist page
function removeFromWishlistPage(productId) {
    const index = wishlist.indexOf(productId);
    const product = products.find(p => p.id === productId);
    
    if (index !== -1) {
        wishlist.splice(index, 1);
        storage.set('wishlist', wishlist);
        updateWishlistCounts();
        renderWishlist();
        
        if (product) {
            showWishlistToast(`${product.name} removed from wishlist`, 'info');
        }
    }
}

// Show toast on wishlist page
function showWishlistToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
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
    
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });
    
    setTimeout(() => {
        if (toast.parentNode) {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }
    }, 3000);
}

// Render wishlist
function renderWishlist() {
    const container = document.getElementById('wishlist-container');
    const emptyWishlist = document.getElementById('empty-wishlist');
    
    if (!container) return;
    
    // Clear container
    container.innerHTML = '';
    
    if (wishlist.length === 0) {
        emptyWishlist.style.display = 'block';
        container.appendChild(emptyWishlist);
        return;
    }
    
    emptyWishlist.style.display = 'none';
    
    // Get wishlist products
    const wishlistProducts = wishlist.map(id => products.find(p => p.id === id)).filter(p => p);
    
    wishlistProducts.forEach((product, index) => {
        const stockStatus = getStockStatus(product.stock);
        const cartItem = cart.find(item => item.id === product.id);
        const inCart = cartItem ? cartItem.quantity : 0;
        
        const productCard = document.createElement('div');
        productCard.className = 'product-card fade-in';
        productCard.setAttribute('data-product-id', product.id);
        productCard.style.animationDelay = `${index * 0.1}s`;
        
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
                onclick="showWishlistProduct(${product.id})" 
                class="btn btn-secondary" 
                style="width: 100%; margin-bottom: 10px;"
            >
                <i class="fas fa-info-circle"></i> View Details
            </button>
            <div style="display: flex; gap: 10px;">
                <button 
                    onclick="addToCartFromWishlist(${product.id})" 
                    class="btn btn-primary" 
                    style="flex: 1;"
                    ${!stockStatus.available || inCart >= product.stock ? 'disabled' : ''}
                >
                    <i class="fas fa-cart-plus"></i> ${!stockStatus.available ? 'Out of Stock' : 'Add to Cart'}
                </button>
                <button 
                    onclick="removeFromWishlistPage(${product.id})" 
                    class="btn btn-secondary"
                    style="color: #ef4444;"
                >
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        container.appendChild(productCard);
    });
}

// Make functions available globally
window.showWishlistProduct = showWishlistProduct;
window.addToCartFromWishlist = addToCartFromWishlist;
window.removeFromWishlistPage = removeFromWishlistPage;