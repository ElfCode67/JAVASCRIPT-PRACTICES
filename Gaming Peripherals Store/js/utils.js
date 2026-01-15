// Format price with $ and two decimals
function formatPrice(price) {
    return `$${price.toFixed(2)}`;
}

// Update cart/wishlist count in header
function updateCartCount() {
    const cartCount = cart.length;
    const wishlistCount = wishlist.length;
    document.getElementById('cart-count').textContent = cartCount;
    document.getElementById('wishlist-count').textContent = wishlistCount;
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

// Add to cart function
function addToCart(productId, quantity = 1) {
    const product = products.find(p => p.id === productId);
    if (!product) return false;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            ...product,
            quantity: quantity
        });
    }
    
    updateCartCount();
    return true;
}

// Remove from cart
function removeFromCart(productId) {
    const index = cart.findIndex(item => item.id === productId);
    if (index !== -1) {
        cart.splice(index, 1);
        updateCartCount();
        return true;
    }
    return false;
}

// Toggle wishlist
function toggleWishlist(productId) {
    const index = wishlist.findIndex(id => id === productId);
    
    if (index === -1) {
        wishlist.push(productId);
    } else {
        wishlist.splice(index, 1);
    }
    
    updateCartCount();
    return index === -1; // Returns true if added
}