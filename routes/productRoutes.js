const express = require('express');
const router = express.Router();
const Product = require('../models/productModel');

// Get all products
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/products - Fetching all products...');
    const products = await Product.getAll();
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching all products:', error.message);
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    console.log(`GET /api/products/${req.params.id} - Fetching product by ID...`);
    const product = await Product.getById(req.params.id);

    if (!product) {
      console.log(`Product with ID ${req.params.id} not found.`);
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error(`Error fetching product by ID ${req.params.id}:`, error.message);
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
});

// Create a new product
router.post('/', async (req, res) => {
  try {
    console.log('POST /api/products - Creating a new product...');
    const { name, description, price, color, shape, image_url, category_id, stock } = req.body;

    // Validate input
    if (!name || !price) {
      console.log('Validation failed: Name and price are required.');
      return res.status(400).json({ message: 'Name and price are required.' });
    }

    // Create the product in the database
    const productId = await Product.create({
      name,
      description,
      price,
      color,
      shape,
      image_url,
      category_id,
      stock,
    });

    console.log(`Product created successfully with ID: ${productId}`);
    res.status(201).json({ message: 'Product created successfully', productId });
  } catch (error) {
    console.error('Error creating product:', error.message);
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
});

// Search products by keyword
router.get('/search/:keyword', async (req, res) => {
  const { keyword } = req.params;

  try {
    const products = await Product.searchByKeywords(keyword);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error searching for products', error: error.message });
  }
});

// Update product details
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    const updated = await Product.updateById(id, updatedData);

    if (!updated) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Product.deleteById(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
});


module.exports = router;
