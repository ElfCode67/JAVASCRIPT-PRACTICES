// Cart Page Functions
document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart page
    updateCartCounts();
    renderCart();
    
    // Checkout button
    const checkoutBtn = document.getElementById('checkout-btn');
    const checkoutForm = document.getElementById('checkout-form');
    const orderSummary = document.getElementById('order-summary');
    const successMessage = document.getElementById('success-message');
    
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            checkoutForm.style.display = 'block';
            orderSummary.style.display = 'none';
            checkoutForm.scrollIntoView({ behavior: 'smooth' });
            document.getElementById('full-name')?.focus();
        });
    }
    
    // Cancel checkout
    const cancelCheckout = document.getElementById('cancel-checkout');
    if (cancelCheckout) {
        cancelCheckout.addEventListener('click', function() {
            checkoutForm.style.display = 'none';
            orderSummary.style.display = 'block';
        });
    }
    
    // Form submission
    const form = document.getElementById('checkout-form-element');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('full-name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                address: document.getElementById('address').value,
                city: document.getElementById('city').value,
                zip: document.getElementById('zip').value,
                payment: document.getElementById('payment-method').value
            };
            
            const errors = validateCheckoutForm(formData);
            
            if (Object.keys(errors).length === 0) {
                // Process order
                processOrder(formData);
            } else {
                showFormErrors(errors);
                showToast('Please fix the errors in the form', 'error');
            }
        });
    }
});

// Update cart page counts
function updateCartCounts() {
    const cartTotalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCount = document.getElementById('cart-count');
    const wishlistCount = document.getElementById('wishlist-count');
    
    if (cartCount) cartCount.textContent = cartTotalItems;
    if (wishlistCount) wishlistCount.textContent = wishlist.length;
}

// Format price
function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(price);
}

// Show toast notification
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    
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

// Calculate totals
function calculateTotals() {
    let subtotal = 0;
    
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
    });
    
    const freeShippingThreshold = 100;
    const shipping = subtotal >= freeShippingThreshold ? 0 : 9.99;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;
    
    return { subtotal, shipping, tax, total, freeShippingThreshold };
}

// Update free shipping progress
function updateShippingProgress() {
    const totals = calculateTotals();
    const progressContainer = document.getElementById('free-shipping-progress');
    const progressFill = document.getElementById('progress-fill');
    const shippingMessage = document.getElementById('shipping-message');
    
    if (!progressContainer || !progressFill || !shippingMessage) return;
    
    if (totals.subtotal >= totals.freeShippingThreshold) {
        progressContainer.style.display = 'none';
    } else {
        const remaining = totals.freeShippingThreshold - totals.subtotal;
        const progress = Math.min((totals.subtotal / totals.freeShippingThreshold) * 100, 100);
        
        progressContainer.style.display = 'block';
        progressFill.style.width = `${progress}%`;
        
        if (remaining > 0) {
            shippingMessage.textContent = `Add ${formatPrice(remaining)} more for FREE shipping! 🚚`;
        } else {
            shippingMessage.textContent = 'You qualify for FREE shipping!';
        }
    }
}

// Render cart with animations
function renderCart() {
    const cartContainer = document.getElementById('cart-container');
    const emptyCart = document.getElementById('empty-cart');
    const orderSummary = document.getElementById('order-summary');
    
    if (cart.length === 0) {
        emptyCart.style.display = 'block';
        orderSummary.style.display = 'none';
        cartContainer.innerHTML = '';
        return;
    }
    
    emptyCart.style.display = 'none';
    orderSummary.style.display = 'block';
    
    cartContainer.innerHTML = '';
    
    cart.forEach((item, index) => {
        const product = products.find(p => p.id === item.id);
        const maxStock = product ? product.stock : item.quantity;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-items-list fade-in';
        cartItem.style.animationDelay = `${index * 0.1}s`;
        cartItem.innerHTML = `
            <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 20px;">
                <div style="font-size: 3rem; flex-shrink: 0;">${item.emoji}</div>
                <div style="flex: 1; min-width: 0;">
                    <h3 style="margin-bottom: 5px; overflow: hidden; text-overflow: ellipsis;">${item.name}</h3>
                    <div style="color: #00f3ff; margin-bottom: 10px;">${formatPrice(item.price)} each</div>
                    ${product && item.quantity >= product.stock ? 
                        '<div style="color: #ef4444; font-size: 0.9rem; margin-bottom: 10px;"><i class="fas fa-exclamation-triangle"></i> Maximum available quantity</div>' : ''}
                    <div style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap;">
                        <div style="display: flex; align-items: center; gap: 10px; background: #1a1f2e; padding: 5px 15px; border-radius: 20px;">
                            <button 
                                onclick="updateCartQuantity(${item.id}, -1)" 
                                class="quantity-btn"
                                aria-label="Decrease quantity of ${item.name}"
                            >
                                <i class="fas fa-minus"></i>
                            </button>
                            <span style="font-weight: bold; min-width: 30px; text-align: center;">${item.quantity}</span>
                            <button 
                                onclick="updateCartQuantity(${item.id}, 1)" 
                                class="quantity-btn"
                                ${item.quantity >= maxStock ? 'disabled' : ''}
                                aria-label="Increase quantity of ${item.name}"
                            >
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <button 
                            onclick="removeCartItem(${item.id})" 
                            style="background: none; border: none; color: #ef4444; cursor: pointer;"
                            aria-label="Remove ${item.name} from cart"
                        >
                            <i class="fas fa-trash"></i> Remove
                        </button>
                    </div>
                </div>
                <div style="font-weight: bold; font-size: 1.2rem; flex-shrink: 0;">
                    ${formatPrice(item.price * item.quantity)}
                </div>
            </div>
        `;
        cartContainer.appendChild(cartItem);
    });
    
    // Update totals
    const totals = calculateTotals();
    document.getElementById('subtotal').textContent = formatPrice(totals.subtotal);
    document.getElementById('shipping').textContent = totals.shipping === 0 ? 'FREE' : formatPrice(totals.shipping);
    document.getElementById('tax').textContent = formatPrice(totals.tax);
    document.getElementById('total').textContent = formatPrice(totals.total);
    
    // Update shipping progress
    updateShippingProgress();
}

// Update quantity in cart page
function updateCartQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    const product = products.find(p => p.id === productId);
    
    if (!item) return;
    
    const newQuantity = item.quantity + change;
    
    if (product && newQuantity > product.stock) {
        showToast(`Only ${product.stock} available in stock`, 'error');
        return;
    }
    
    if (newQuantity < 1) {
        removeCartItem(productId);
    } else {
        item.quantity = newQuantity;
        storage.set('cart', cart);
        updateCartCounts();
        renderCart();
        
        // Update main page cart if it exists
        if (typeof updateCounts === 'function') updateCounts();
        if (typeof updateCartSidebar === 'function') updateCartSidebar();
    }
}

// Remove item from cart page
function removeCartItem(productId) {
    const index = cart.findIndex(item => item.id === productId);
    if (index !== -1) {
        cart.splice(index, 1);
        storage.set('cart', cart);
        updateCartCounts();
        renderCart();
        
        // Update main page
        if (typeof updateCounts === 'function') updateCounts();
        if (typeof updateCartSidebar === 'function') updateCartSidebar();
    }
}

// Validate checkout form
function validateCheckoutForm(formData) {
    const errors = {};
    
    if (!formData.name || formData.name.trim().length < 2) {
        errors.name = 'Please enter your full name (minimum 2 characters)';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
    }
    
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    if (!formData.phone || !phoneRegex.test(formData.phone) || formData.phone.replace(/\D/g, '').length < 10) {
        errors.phone = 'Please enter a valid phone number (minimum 10 digits)';
    }
    
    if (!formData.address || formData.address.trim().length < 5) {
        errors.address = 'Please enter your shipping address (minimum 5 characters)';
    }
    
    if (!formData.city || formData.city.trim().length < 2) {
        errors.city = 'Please enter your city';
    }
    
    if (!formData.zip || !/^\d{5}(-\d{4})?$/.test(formData.zip)) {
        errors.zip = 'Please enter a valid ZIP code';
    }
    
    if (!formData.payment) {
        errors.payment = 'Please select a payment method';
    }
    
    return errors;
}

// Show form errors
function showFormErrors(errors) {
    // Clear previous errors
    document.querySelectorAll('.error-message').forEach(el => {
        el.style.display = 'none';
    });
    
    document.querySelectorAll('.form-group input, .form-group select').forEach(el => {
        el.style.borderColor = '#2d3748';
    });
    
    // Show new errors
    Object.keys(errors).forEach(field => {
        const errorEl = document.getElementById(`${field}-error`);
        const inputEl = document.getElementById(field === 'name' ? 'full-name' : field === 'payment' ? 'payment-method' : field);
        
        if (errorEl) {
            errorEl.textContent = errors[field];
            errorEl.style.display = 'block';
        }
        
        if (inputEl) {
            inputEl.style.borderColor = '#ef4444';
            inputEl.focus();
        }
    });
}

// Process order
function processOrder(formData) {
    const totals = calculateTotals();
    const successMessage = document.getElementById('success-message');
    
    if (!successMessage) return;
    
    // Show success message
    successMessage.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 10px;">
            <i class="fas fa-check-circle" style="font-size: 2rem;"></i>
            <div>
                <h4 style="margin: 0; color: white;">Order Confirmed! 🎉</h4>
                <p style="margin: 5px 0; color: #d1fae5;">Your order #${Math.random().toString(36).substr(2, 9).toUpperCase()} has been placed.</p>
            </div>
        </div>
        <p style="margin: 10px 0; color: #a7f3d0;">
            A confirmation email has been sent to ${formData.email}.<br>
            Order total: <strong>${formatPrice(totals.total)}</strong>
        </p>
    `;
    successMessage.style.display = 'block';
    
    // Clear cart
    cart = [];
    storage.set('cart', []);
    
    // Hide checkout form
    document.getElementById('checkout-form').style.display = 'none';
    document.getElementById('order-summary').style.display = 'none';
    
    // Update counts
    updateCartCounts();
    if (typeof updateCounts === 'function') updateCounts();
    
    // Scroll to success message
    successMessage.scrollIntoView({ behavior: 'smooth' });
    
    // Show success toast
    showToast('Order placed successfully! Check your email for confirmation.', 'success');
}

// Make functions available globally
window.updateCartQuantity = updateCartQuantity;
window.removeCartItem = removeCartItem;