// populateProducts.js
const Product = require('../models/productModel'); // Assuming you have a Product model

// Retrieve all available products
const populateProducts = async () => {
  try {
    const products = await Product.find(); // Assuming Product is a MongoDB model
    return products;
  } catch (error) {
    console.error('Error populating products:', error);
    throw new Error('Error retrieving products');
  }
};

module.exports = { populateProducts };
