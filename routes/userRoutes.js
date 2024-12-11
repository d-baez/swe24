const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, password, name, email, phone, shipping_address } = req.body;

    // Check if the username or email already exists
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists.' });
    }

    // Hash the password
    const password_hash = await bcrypt.hash(password, 10);

    // Create the user
    const userId = await User.register({
      username,
      password_hash,
      name,
      email,
      phone,
      shipping_address,
    });

    res.status(201).json({ message: 'User registered successfully', userId });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

// User login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    // Fetch the user from the database
    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    // Compare the password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    // Generate a JWT
    const token = jwt.sign(
      { id: user.user_id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred. Please try again later.', error: error.message });
  }
});

// List all users (Admin only)
router.get('/', async (req, res) => {
  try {
    const users = await User.getAll();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.getById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user.', error: error.message });
  }
});

// Add a product to the user's cart
router.post('/:id/cart', async (req, res) => {
  const { product_id, quantity } = req.body;
  const user_id = req.params.id;

  if (!product_id || !quantity) {
    return res.status(400).json({ message: 'Product ID and quantity are required' });
  }

  try {
    const user = await User.getById(user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let cart = user.cart ? JSON.parse(user.cart) : [];
    const existingItem = cart.find(item => item.product_id === product_id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ product_id, quantity });
    }

    await User.updateCart(user_id, JSON.stringify(cart));
    res.status(200).json({ message: 'Product added to cart', cart });
  } catch (error) {
    res.status(500).json({ message: 'Error adding to cart', error: error.message });
  }
});

// Update user account details
router.put('/:id/update', async (req, res) => {
  const { id } = req.params;
  const { username, password, email, phone, shipping_address } = req.body;

  try {
    const user = await User.getById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash the password if it's being updated
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    await User.updateAccount(id, {
      username,
      password: hashedPassword, // Use hashed password
      email,
      phone,
      shipping_address,
    });

    res.status(200).json({ message: 'User account updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user account', error: error.message });
  }
});

// Remove a product from the user's cart
router.delete('/:id/cart', async (req, res) => {
  const { product_id } = req.body;
  const user_id = req.params.id;

  try {
    const user = await User.getById(user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let cart = user.cart ? JSON.parse(user.cart) : [];
    cart = cart.filter(item => item.product_id !== product_id);

    await User.updateCart(user_id, JSON.stringify(cart));
    res.status(200).json({ message: 'Product removed from cart', cart });
  } catch (error) {
    res.status(500).json({ message: 'Error removing from cart', error: error.message });
  }
});

// Logout user
router.post('/logout', (req, res) => {
  // Clear session
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Error logging out', error: err.message });
    }
    res.status(200).json({ message: 'User logged out successfully' });
  });
});

// Update user's shipping address
router.put('/:id/update-address', async (req, res) => {
  const { id } = req.params;
  const { shipping_address } = req.body;

  try {
    const user = await User.getById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.updateShippingAddress(id, shipping_address);
    res.status(200).json({ message: 'Shipping address updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating shipping address', error: error.message });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const user = await User.getByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Assume a password reset email is sent (mocked for now)
    console.log(`Password reset email sent to ${email}`);
    res.status(200).json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
});

// View user's cart
router.get('/:id/cart', async (req, res) => {
  const user_id = req.params.id;

  try {
    const user = await User.getById(user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const cart = user.cart ? JSON.parse(user.cart) : [];
    res.status(200).json({ cart, total: cart.reduce((sum, item) => sum + item.quantity, 0) });
  } catch (error) {
    res.status(500).json({ message: 'Error viewing cart', error: error.message });
  }
});

// Update cart item quantity
router.put('/:id/cart/:product_id', async (req, res) => {
  const { id, product_id } = req.params;
  const { quantity } = req.body;

  if (!quantity) {
    return res.status(400).json({ message: 'Quantity is required' });
  }

  try {
    const user = await User.getById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let cart = user.cart ? JSON.parse(user.cart) : [];
    const item = cart.find(item => item.product_id === parseInt(product_id));

    if (!item) {
      return res.status(404).json({ message: 'Product not in cart' });
    }

    item.quantity = quantity;
    await User.updateCart(id, JSON.stringify(cart));
    res.status(200).json({ message: 'Cart updated successfully', cart });
  } catch (error) {
    res.status(500).json({ message: 'Error updating cart', error: error.message });
  }
});

// Logout user
router.post('/logout', (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Error logging out' });
      }
      res.status(200).json({ message: 'User logged out successfully' });
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging out', error: error.message });
  }
});

// User login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    req.session.user = { id: user.user_id, username: user.username };
    res.status(200).json({ message: 'Login successful', user: { id: user.user_id, username: user.username } });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});


module.exports = router;
