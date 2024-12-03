// cartManagement.js
let cart = {};

// Add item to cart
const addToCart = (userId, productId, quantity, price) => {
  if (!cart[userId]) {
    cart[userId] = [];
  }

  // Check if item already in cart
  const existingItemIndex = cart[userId].findIndex(item => item.productId === productId);
  if (existingItemIndex >= 0) {
    // Update the quantity of the existing item
    cart[userId][existingItemIndex].quantity += quantity;
  } else {
    // Add new item to the cart
    cart[userId].push({ productId, quantity, price });
  }

  return cart[userId];
};

// Remove item from cart
const removeFromCart = (userId, productId) => {
  if (cart[userId]) {
    cart[userId] = cart[userId].filter(item => item.productId !== productId);
  }

  return cart[userId];
};

// Update item quantity in cart
const updateCartItem = (userId, productId, newQuantity) => {
  if (cart[userId]) {
    const itemIndex = cart[userId].findIndex(item => item.productId === productId);
    if (itemIndex >= 0) {
      cart[userId][itemIndex].quantity = newQuantity;
    }
  }

  return cart[userId];
};

// Get all items in cart for a user
const getCart = (userId) => {
  return cart[userId] || [];
};

module.exports = {
  addToCart,
  removeFromCart,
  updateCartItem,
  getCart
};
