// Products Array
const products = [
    {
        id: 1,
        name: "Neon Mechanical Keyboard",
        price: 129.99,
        category: "keyboard",
        description: "RGB mechanical keyboard with blue switches",
        rating: 4.5,
        stock: 15,
        emoji: "⌨️"
    },
    {
        id: 2,
        name: "Quantum Wireless Mouse",
        price: 89.99,
        category: "mouse",
        description: "16000 DPI wireless gaming mouse",
        rating: 4.7,
        stock: 8,
        emoji: "🐁"
    },
    {
        id: 3,
        name: "Nova Pro Gaming Headset",
        price: 199.99,
        category: "headset",
        description: "7.1 surround sound with noise cancellation",
        rating: 4.8,
        stock: 5,
        emoji: "🎧"
    },
    {
        id: 4,
        name: "Glide XL Mousepad",
        price: 34.99,
        category: "accessory",
        description: "Extended RGB mousepad",
        rating: 4.3,
        stock: 25,
        emoji: "🖱️"
    },
    {
        id: 5,
        name: "Vertex Pro Controller",
        price: 69.99,
        category: "controller",
        description: "Elite wireless controller",
        rating: 4.6,
        stock: 12,
        emoji: "🎮"
    },
    {
        id: 6,
        name: "Thunderbolt Gaming Chair",
        price: 299.99,
        category: "accessory",
        description: "Ergonomic gaming chair",
        rating: 4.9,
        stock: 3,
        emoji: "💺"
    }
];

// Get cart from localStorage or create empty array
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Get wishlist from localStorage or create empty array
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];