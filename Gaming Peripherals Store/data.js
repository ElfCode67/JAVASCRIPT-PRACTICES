// Products Array (Expanded)
const products = [
    {
        id: 1,
        name: "Neon Mechanical Keyboard",
        price: 129.99,
        category: "keyboard",
        description: "RGB mechanical keyboard with blue switches for tactile feedback",
        rating: 4.5,
        stock: 15,
        emoji: "⌨️",
        features: ["RGB Backlighting", "Blue Switches", "USB-C Connection", "N-Key Rollover", "Aluminum Frame"],
        images: ["⌨️"],
        brand: "Nexus",
        color: "Black/RGB"
    },
    {
        id: 2,
        name: "Quantum Wireless Mouse",
        price: 89.99,
        category: "mouse",
        description: "16000 DPI wireless gaming mouse with ultra-low latency",
        rating: 4.7,
        stock: 8,
        emoji: "🐁",
        features: ["16000 DPI", "Wireless 2.4GHz", "6 Programmable Buttons", "50hr Battery", "Lightweight Design"],
        images: ["🐁"],
        brand: "Quantum",
        color: "Matte Black"
    },
    {
        id: 3,
        name: "Nova Pro Gaming Headset",
        price: 199.99,
        category: "headset",
        description: "7.1 surround sound with active noise cancellation",
        rating: 4.8,
        stock: 5,
        emoji: "🎧",
        features: ["7.1 Surround Sound", "Active Noise Cancellation", "Detachable Mic", "Memory Foam Cushions", "Wireless"],
        images: ["🎧"],
        brand: "Nova",
        color: "White"
    },
    {
        id: 4,
        name: "Glide XL Mousepad",
        price: 34.99,
        category: "accessory",
        description: "Extended RGB mousepad for maximum control",
        rating: 4.3,
        stock: 25,
        emoji: "🖱️",
        features: ["Extended Size (900x400mm)", "RGB Lighting", "Anti-Slip Base", "Water Resistant", "Stitched Edges"],
        images: ["🖱️"],
        brand: "Glide",
        color: "Black/RGB"
    },
    {
        id: 5,
        name: "Vertex Pro Controller",
        price: 69.99,
        category: "controller",
        description: "Elite wireless controller with customizable buttons",
        rating: 4.6,
        stock: 12,
        emoji: "🎮",
        features: ["Wireless Connectivity", "Programmable Buttons", "Hair Trigger Locks", "40hr Battery", "Gyro Controls"],
        images: ["🎮"],
        brand: "Vertex",
        color: "Midnight Blue"
    },
    {
        id: 6,
        name: "Thunderbolt Gaming Chair",
        price: 299.99,
        category: "accessory",
        description: "Ergonomic gaming chair with premium materials",
        rating: 4.9,
        stock: 3,
        emoji: "💺",
        features: ["Ergonomic Design", "Lumbar Support", "4D Armrests", "Recline up to 180°", "Memory Foam"],
        images: ["💺"],
        brand: "Thunderbolt",
        color: "Black/Red"
    },
    {
        id: 7,
        name: "Crystal Clear Headset Stand",
        price: 49.99,
        category: "accessory",
        description: "Acrylic headset stand with RGB lighting",
        rating: 4.4,
        stock: 18,
        emoji: "💡",
        features: ["Acrylic Material", "RGB Lighting", "Cable Management", "Weighted Base", "USB Hub"],
        images: ["💡"],
        brand: "Crystal",
        color: "Clear/RGB"
    },
    {
        id: 8,
        name: "Swift Mouse Bungee",
        price: 19.99,
        category: "accessory",
        description: "Mouse bungee for smooth cable management",
        rating: 4.2,
        stock: 30,
        emoji: "🎯",
        features: ["Adjustable Spring", "Rubber Base", "360° Rotation", "Easy Installation", "Compact Design"],
        images: ["🎯"],
        brand: "Swift",
        color: "Black"
    },
    {
        id: 9,
        name: "Silent Red Keyboard",
        price: 149.99,
        category: "keyboard",
        description: "Silent mechanical keyboard for office/gaming",
        rating: 4.6,
        stock: 10,
        emoji: "🔇",
        features: ["Silent Red Switches", "Hot-swappable", "PBT Keycaps", "USB Passthrough", "Volume Knob"],
        images: ["🔇"],
        brand: "Silent",
        color: "Gray"
    },
    {
        id: 10,
        name: "HyperGlide Mouse Feet",
        price: 12.99,
        category: "accessory",
        description: "Replacement mouse feet for smoother gliding",
        rating: 4.7,
        stock: 40,
        emoji: "⛸️",
        features: ["PTFE Material", "Smoother Glide", "Reduced Friction", "Easy Installation", "Compatibility Kit"],
        images: ["⛸️"],
        brand: "HyperGlide",
        color: "White"
    }
];

// Safe localStorage wrapper with error handling
const storage = {
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Error reading from localStorage (${key}):`, error);
            return defaultValue;
        }
    },
    
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error writing to localStorage (${key}):`, error);
            showToast('Unable to save data. Storage may be full.', 'error');
            return false;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Error removing from localStorage (${key}):`, error);
            return false;
        }
    }
};

// Get cart from localStorage or create empty array
let cart = storage.get('cart', []);

// Get wishlist from localStorage or create empty array
let wishlist = storage.get('wishlist', []);

// Get recently viewed products
let recentProducts = storage.get('recentProducts', []);

// Validate and clean cart data
function validateCart() {
    cart = cart.filter(item => {
        const product = products.find(p => p.id === item.id);
        if (!product) return false;
        
        if (item.quantity > product.stock) {
            item.quantity = product.stock;
        }
        return item.quantity > 0;
    });
    
    storage.set('cart', cart);
}

// Initialize cart validation
validateCart();

// Add to recent products
function addToRecent(productId) {
    const index = recentProducts.indexOf(productId);
    if (index !== -1) {
        recentProducts.splice(index, 1);
    }
    
    recentProducts.unshift(productId);
    recentProducts = recentProducts.slice(0, 5); // Keep only 5 most recent
    storage.set('recentProducts', recentProducts);
}

// Get recent products
function getRecentProducts() {
    return recentProducts
        .map(id => products.find(p => p.id === id))
        .filter(product => product !== undefined);
}