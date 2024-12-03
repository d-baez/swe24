const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, password, name, email, phone, shipping_address } = req.body;

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const userId = await User.register({ username, password_hash, name, email, phone, shipping_address });
    res.status(201).json({ message: 'User registered', userId });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error });
  }
});


// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.getById(req.params.id);
    if (user) res.json(user);
    else res.status(404).json({ message: 'User not found' });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error });
  }
});

// User login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    // Fetch user from the database
    const user = await User.findByUsername(username); // Assuming User model has a findByUsername method

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: '1h', // Token expires in 1 hour
    });

    res.status(200).json({
      message: 'Login successful',
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred. Please try again later.' });
  }
});


module.exports = router;
