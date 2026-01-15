// DOM Elements
const wishlistContainer = document.getElementById('wishlist-container');
const emptyWishlist = document.getElementById('empty-wishlist');

// Get wishlist products
function getWishlistProducts() {
    return products.filter(product => wishlist.includes(product.id));
}

// Render wishlist
function renderWishlist() {
    const wishlistProducts = getWishlistProducts();
    wishlistContainer.innerHTML = '';
    
    if (wishlistProducts.length === 0) {
        wishlistContainer.appendChild(emptyWishlist);
        return;
    }
    
    wishlistProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image">
                <div class="product-badge ${product.stock < 10 ? 'low-stock' : ''}">
                    ${product.stock < 10 ? `Only ${product.stock} left` : 'In Stock'}
                </div>
                <img src="assets/images/${product.image}" alt="${product.name}" onerror="this.src='assets/images/placeholder.jpg'">
                <button class="wishlist-btn active" onclick="removeFromWishlist(${product.id})">
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
                    <div class="wishlist-actions">
                        <button class="btn btn-secondary" onclick="addToCart(${product.id}); alert('Added to cart!')">
                            <i class="fas fa-cart-plus"></i> Add to Cart
                        </button>
                        <button class="btn remove-wishlist-btn" onclick="removeFromWishlist(${product.id})">
                            <i class="fas fa-trash"></i> Remove
                        </button>
                    </div>
                </div>
            </div>
        `;
        wishlistContainer.appendChild(productCard);
    });
}

// Remove from wishlist
function removeFromWishlist(productId) {
    const index = wishlist.findIndex(id => id === productId);
    if (index !== -1) {
        wishlist.splice(index, 1);
        updateCartCount();
        renderWishlist();
    }
}

// Initialize wishlist page
document.addEventListener('DOMContentLoaded', () => {
    renderWishlist();
    updateCartCount();
});

// Make functions globally available
window.removeFromWishlist = removeFromWishlist;