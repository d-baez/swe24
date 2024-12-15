const { promisePool } = require('../db');

const Product = {
  // Get all products
  getAll: async () => {
    try {
      console.log('Fetching all products...');
      const [products] = await promisePool.query('SELECT * FROM products');
      console.log('Products fetched successfully:', products.length);
      return products;
    } catch (error) {
      console.error('Error in getAll:', error.message);
      throw new Error('Error fetching products.');
    }
  },

  // Get product by ID
  getById: async (id) => {
    try {
      console.log(`Fetching product by ID: ${id}`);
      const [product] = await promisePool.query('SELECT * FROM products WHERE product_id = ?', [id]);

      if (!product.length) {
        console.log(`Product with ID ${id} not found.`);
        return null; // Return null if no product is found
      }

      console.log('Product fetched successfully:', product[0]);
      return product[0];
    } catch (error) {
      console.error('Error in getById:', error.message);
      throw new Error('Error fetching product by ID.');
    }
  },

  // Create a new product
  create: async (data) => {
    try {
      const { name, description, price, color, shape, image_url, category_id, stock } = data;
      console.log('Creating a new product with data:', data);

      const [result] = await promisePool.query(
        'INSERT INTO products (name, description, price, color, shape, image_url, category_id, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [name, description, price, color, shape, image_url, category_id, stock]
      );

      console.log('Product created successfully with ID:', result.insertId);
      return result.insertId;
    } catch (error) {
      console.error('Error in create:', error.message);
      throw new Error('Error creating product.');
    }
  },

  // Get Products by Category
  getByCategory: async (categoryId) => {
    try {
      console.log(`Fetching products in category ID: ${categoryId}`);
      const [products] = await promisePool.query(
        `SELECT * FROM products WHERE category_id = ?`,
        [categoryId]
      );
      return products;
    } catch (error) {
      console.error('Error in getByCategory:', error.message);
      throw new Error('Error fetching products.');
    }
  },

  updateById: async (id, data) => {
    const { name, description, price, color, shape, image_url, category_id, stock } = data;

    try {
      const [result] = await promisePool.query(
        `UPDATE products 
         SET name = ?, description = ?, price = ?, color = ?, shape = ?, 
             image_url = ?, category_id = ?, stock = ? 
         WHERE product_id = ?`,
        [name, description, price, color, shape, image_url, category_id, stock, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in Product.updateById:', error.message);
      throw new Error('Error updating product: ' + error.message);
    }
  },

  deleteById: async (id) => {
    try {
      const [result] = await promisePool.query('DELETE FROM products WHERE product_id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in Product.deleteById:', error.message);
      throw new Error('Error deleting product: ' + error.message);
    }
  },

  // Search for products by keywords
  searchByKeywords: async (keywords) => {
    try {
      const query = `%${keywords}%`;
      const [results] = await promisePool.query(
        'SELECT * FROM products WHERE keywords LIKE ? OR name LIKE ?',
        [query, query]
      );
      return results;
    } catch (error) {
      console.error('Error in Product.searchByKeywords:', error.message);
      throw new Error('Error searching products: ' + error.message);
    }
  },

};

module.exports = Product;
