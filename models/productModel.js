const { promisePool } = require('../db');

const Product = {
  getAll: async () => {
    const [products] = await promisePool.query('SELECT * FROM products');
    return products;
  },

  getById: async (id) => {
    const [product] = await promisePool.query('SELECT * FROM products WHERE product_id = ?', [id]);
    return product[0];
  },

  create: async (data) => {
    const { name, description, price, color, shape, image_url, category_id, stock } = data;
    const [result] = await promisePool.query(
      'INSERT INTO products (name, description, price, color, shape, image_url, category_id, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, description, price, color, shape, image_url, category_id, stock]
    );
    return result.insertId;
  },
};

module.exports = Product;
