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
};

module.exports = Review;
