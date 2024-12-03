const express = require('express');
const router = express.Router();
const Product = require('../models/productModel');

router.get('/', async (req, res) => {
  try {
    const products = await Product.getAll();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.getById(req.params.id);
    if (product) res.json(product);
    else res.status(404).json({ message: 'Product not found' });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error });
  }
});

router.post('/', async (req, res) => {
  try {
    const productId = await Product.create(req.body);
    res.status(201).json({ message: 'Product created', productId });
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error });
  }
});

module.exports = router;
