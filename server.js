require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const cors = require('cors'); // Added for cross-origin requests
const { connectDB } = require('./db'); // Import the database connection function

const app = express();
const PORT = process.env.PORT || 3000;

// Test database connection
connectDB()
  .then(() => console.log('Database connection successful.'))
  .catch((error) => {
    console.error('Database connection failed:', error.message);
    process.exit(1); // Exit the process if the connection fails
  });

// Middlewares
app.use(cors({ origin: 'http://127.0.0.1:8080', credentials: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: true,
  })
);

// Debugging Middleware
app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.originalUrl}`);
  next();
});

// API routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));

// Serve static files from the public directory
app.use(express.static('public'));

// Specific HTML routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/products', (req, res) => res.sendFile(path.join(__dirname, 'public', 'products.html')));
app.get('/cart', (req, res) => res.sendFile(path.join(__dirname, 'public', 'cart.html')));
app.get('/checkout', (req, res) => res.sendFile(path.join(__dirname, 'public', 'checkout.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'public', 'register.html')));
app.get('/order-status', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'orderStatus.html'))
);
app.get('/success', (req, res) => res.sendFile(path.join(__dirname, 'public', 'success.html')));

// Handle undefined routes
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Start the server
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
