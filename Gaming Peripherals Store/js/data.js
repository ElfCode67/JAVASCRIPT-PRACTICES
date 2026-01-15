// Hardcoded gaming peripherals data
const products = [
  {
    id: 1,
    name: "Neon Blaze Mechanical Keyboard",
    price: 129.99,
    category: "keyboard",
    brand: "HyperX",
    description: "RGB mechanical keyboard with blue switches",
    rating: 4.5,
    stock: 15,
    image: "keyboard.jpg",
    tags: ["mechanical", "rgb", "gaming"]
  },
  {
    id: 2,
    name: "Quantum Pulse Wireless Mouse",
    price: 89.99,
    category: "mouse",
    brand: "Razer",
    description: "16000 DPI wireless gaming mouse",
    rating: 4.7,
    stock: 8,
    image: "mouse.jpg",
    tags: ["wireless", "high-dpi", "ergonomic"]
  },
  {
    id: 3,
    name: "Nova Pro Gaming Headset",
    price: 199.99,
    category: "headset",
    brand: "SteelSeries",
    description: "7.1 surround sound with noise cancellation",
    rating: 4.8,
    stock: 5,
    image: "headset.jpg",
    tags: ["wireless", "surround", "noise-cancelling"]
  },
  {
    id: 4,
    name: "Glide XL Gaming Mousepad",
    price: 34.99,
    category: "accessory",
    brand: "Corsair",
    description: "Extended RGB mousepad with smooth surface",
    rating: 4.3,
    stock: 25,
    image: "mousepad.jpg",
    tags: ["rgb", "extended", "cloth"]
  },
  {
    id: 5,
    name: "Vertex Pro Controller",
    price: 69.99,
    category: "controller",
    brand: "Xbox",
    description: "Elite wireless controller with paddles",
    rating: 4.6,
    stock: 12,
    image: "controller.jpg",
    tags: ["wireless", "paddles", "customizable"]
  }
];

// Categories for filtering
const categories = ["all", "keyboard", "mouse", "headset", "controller", "accessory"];

// Sample reviews
const reviews = [
  {
    id: 1,
    productId: 1,
    userName: "ProGamer92",
    rating: 5,
    comment: "Best keyboard I've ever used! The RGB is insane.",
    date: "2024-01-15"
  },
  {
    id: 2,
    productId: 1,
    userName: "TechEnthusiast",
    rating: 4,
    comment: "Great feel, but software could be better.",
    date: "2024-01-10"
  }
];

// Cart & Wishlist (stored in localStorage or as arrays)
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];