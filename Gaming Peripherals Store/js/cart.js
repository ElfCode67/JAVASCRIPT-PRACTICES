// DOM Elements
const cartItemsList = document.getElementById('cart-items-list');
const emptyCart = document.getElementById('empty-cart');
const itemCount = document.getElementById('item-count');
const subtotalEl = document.getElementById('subtotal');
const shippingEl = document.getElementById('shipping');
const taxEl = document.getElementById('tax');
const totalEl = document.getElementById('total');
const checkoutBtn = document.getElementById('checkout-btn');
const checkoutForm = document.getElementById('checkout-form');
const backToCartBtn = document.getElementById('back-to-cart');
const checkoutFormElement = document.getElementById('checkoutForm');

// Calculate cart totals
function calculateCartTotals() {
    let subtotal = 0;
    let itemCount = 0;
    
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
        itemCount += item.quantity;
    });
    
    const shipping = subtotal > 100 ? 0 : 9.99;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;
    
    return {
        subtotal,
        shipping,
        tax,
        total,
        itemCount
    };
}

// Update order summary
function updateOrderSummary() {
    const totals = calculateCartTotals();
    
    subtotalEl.textContent = formatPrice(totals.subtotal);
    shippingEl.textContent = totals.shipping === 0 ? 'FREE' : formatPrice(totals.shipping);
    taxEl.textContent = formatPrice(totals.tax);
    totalEl.textContent = formatPrice(totals.total);
    itemCount.textContent = `${totals.itemCount} ${totals.itemCount === 1 ? 'item' : 'items'}`;
}

// Render cart items
function renderCartItems() {
    cartItemsList.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsList.appendChild(emptyCart);
        checkoutBtn.disabled = true;
        checkoutBtn.innerHTML = '<i class="fas fa-lock"></i> Cart is Empty';
        checkoutBtn.classList.add('disabled');
        return;
    }
    
    checkoutBtn.disabled = false;
    checkoutBtn.innerHTML = '<i class="fas fa-lock"></i> Proceed to Checkout';
    checkoutBtn.classList.remove('disabled');
    
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-image">
                <img src="assets/images/${item.image}" alt="${item.name}" 
                     onerror="this.src='assets/images/placeholder.jpg'">
            </div>
            <div class="cart-item-details">
                <h3 class="cart-item-title">${item.name}</h3>
                <div class="cart-item-category">${item.category.toUpperCase()}</div>
                <div class="cart-item-price">${formatPrice(item.price)} each</div>
                
                <div class="cart-item-controls">
                    <div class="quantity-control">
                        <button class="quantity-btn decrease" onclick="updateQuantity(${item.id}, -1)">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn increase" onclick="updateQuantity(${item.id}, 1)">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <button class="remove-item" onclick="removeItem(${item.id})">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
            <div class="cart-item-total">
                <strong>${formatPrice(item.price * item.quantity)}</strong>
            </div>
        `;
        cartItemsList.appendChild(cartItem);
    });
}

// Update item quantity
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity < 1) {
        removeItem(productId);
    } else if (item.quantity > item.stock) {
        alert(`Only ${item.stock} items available in stock!`);
        item.quantity = item.stock;
    }
    
    updateCart();
}

// Remove item from cart
function removeItem(productId) {
    if (confirm('Are you sure you want to remove this item from your cart?')) {
        const index = cart.findIndex(item => item.id === productId);
        if (index !== -1) {
            cart.splice(index, 1);
            updateCart();
        }
    }
}

// Update cart and localStorage
function updateCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCartItems();
    updateOrderSummary();
}

// Form validation
function validateForm() {
    let isValid = true;
    
    // Clear previous errors
    document.querySelectorAll('.error-message').forEach(el => {
        el.textContent = '';
    });
    
    // Name validation
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    
    if (!firstName) {
        document.getElementById('firstName-error').textContent = 'First name is required';
        isValid = false;
    }
    
    if (!lastName) {
        document.getElementById('lastName-error').textContent = 'Last name is required';
        isValid = false;
    }
    
    // Email validation
    const email = document.getElementById('email').value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
        document.getElementById('email-error').textContent = 'Email is required';
        isValid = false;
    } else if (!emailRegex.test(email)) {
        document.getElementById('email-error').textContent = 'Please enter a valid email';
        isValid = false;
    }
    
    // Address validation
    const address = document.getElementById('address').value.trim();
    if (!address) {
        document.getElementById('address-error').textContent = 'Address is required';
        isValid = false;
    }
    
    // City validation
    const city = document.getElementById('city').value.trim();
    if (!city) {
        document.getElementById('city-error').textContent = 'City is required';
        isValid = false;
    }
    
    // ZIP validation
    const zip = document.getElementById('zip').value.trim();
    const zipRegex = /^\d{5}(-\d{4})?$/;
    
    if (!zip) {
        document.getElementById('zip-error').textContent = 'ZIP code is required';
        isValid = false;
    } else if (!zipRegex.test(zip)) {
        document.getElementById('zip-error').textContent = 'Please enter a valid ZIP code';
        isValid = false;
    }
    
    // Credit card validation (if selected)
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    
    if (paymentMethod === 'credit') {
        const cardNumber = document.getElementById('cardNumber').value.trim();
        const expiry = document.getElementById('expiry').value.trim();
        const cvv = document.getElementById('cvv').value.trim();
        
        // Simple card validation
        const cardRegex = /^\d{4} \d{4} \d{4} \d{4}$/;
        const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
        const cvvRegex = /^\d{3,4}$/;
        
        if (!cardNumber) {
            document.getElementById('cardNumber-error').textContent = 'Card number is required';
            isValid = false;
        } else if (!cardRegex.test(cardNumber)) {
            document.getElementById('cardNumber-error').textContent = 'Please enter a valid card number (XXXX XXXX XXXX XXXX)';
            isValid = false;
        }
        
        if (!expiry) {
            document.getElementById('expiry-error').textContent = 'Expiry date is required';
            isValid = false;
        } else if (!expiryRegex.test(expiry)) {
            document.getElementById('expiry-error').textContent = 'Please enter a valid expiry date (MM/YY)';
            isValid = false;
        }
        
        if (!cvv) {
            document.getElementById('cvv-error').textContent = 'CVV is required';
            isValid = false;
        } else if (!cvvRegex.test(cvv)) {
            document.getElementById('cvv-error').textContent = 'Please enter a valid CVV';
            isValid = false;
        }
    }
    
    return isValid;
}

// Process checkout
function processCheckout(event) {
    event.preventDefault();
    
    if (!validateForm()) {
        showFormMessage('Please fix the errors above', 'error');
        return;
    }
    
    // Simulate order processing
    showFormMessage('Processing your order...', 'success');
    
    setTimeout(() => {
        // Clear cart
        cart = [];
        updateCart();
        
        // Show success message
        showFormMessage('🎉 Order placed successfully! You will receive a confirmation email shortly.', 'success');
        
        // Reset form
        checkoutFormElement.reset();
        
        // Hide form after 3 seconds
        setTimeout(() => {
            checkoutForm.classList.remove('show');
            showFormMessage('', '');
        }, 3000);
    }, 2000);
}

// Show form message
function showFormMessage(message, type) {
    const messageEl = document.getElementById('form-message');
    messageEl.textContent = message;
    messageEl.className = `form-message ${type}`;
}

// Initialize cart page
document.addEventListener('DOMContentLoaded', () => {
    // Initial render
    renderCartItems();
    updateOrderSummary();
    updateCartCount();
    
    // Checkout button click
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) return;
        checkoutForm.classList.add('show');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // Back to cart button
    backToCartBtn.addEventListener('click', () => {
        checkoutForm.classList.remove('show');
    });
    
    // Form submission
    checkoutFormElement.addEventListener('submit', processCheckout);
    
    // Payment method change
    document.querySelectorAll('input[name="payment"]').forEach(radio => {
        radio.addEventListener('change', () => {
            const creditCardForm = document.getElementById('credit-card-form');
            if (radio.value === 'credit') {
                creditCardForm.style.display = 'block';
            } else {
                creditCardForm.style.display = 'none';
            }
        });
    });
});

// Make functions globally available
window.updateQuantity = updateQuantity;
window.removeItem = removeItem;