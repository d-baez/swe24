const { promisePool } = require('../db');

const Review = {
  add: async (data) => {
    const { user_id, rating, comment } = data;
    const [result] = await promisePool.query(
      'INSERT INTO reviews (user_id, rating, comment) VALUES (?, ?, ?)',
      [user_id, rating, comment]
    );
    return result.insertId;
  },

  getByUserId: async (userId) => {
    const [reviews] = await promisePool.query('SELECT * FROM reviews WHERE user_id = ?', [userId]);
    return reviews;
  },

  // Get Reviews by Product ID
  getByProductId: async (productId) => {
    try {
      console.log(`Fetching reviews for product ID: ${productId}`);
      const [reviews] = await promisePool.query(
        `SELECT * FROM reviews WHERE product_id = ?`,
        [productId]
      );
      return reviews;
    } catch (error) {
      console.error('Error in getByProductId:', error.message);
      throw new Error('Error fetching reviews.');
    }
  },

  // Get review by ID
  getById: async (id) => {
    try {
      const [review] = await promisePool.query('SELECT * FROM reviews WHERE review_id = ?', [id]);
      return review[0] || null; // Return the review if found, otherwise null
    } catch (error) {
      console.error('Error in Review.getById:', error.message);
      throw new Error('Error fetching review by ID: ' + error.message);
    }
  },

  // Delete a review by ID
  delete: async (id) => {
    try {
      const [result] = await promisePool.query('DELETE FROM reviews WHERE review_id = ?', [id]);
      return result.affectedRows;
    } catch (error) {
      console.error('Error in Review.delete:', error.message);
      throw new Error('Error deleting review: ' + error.message);
    }
  },

};

module.exports = Review;
