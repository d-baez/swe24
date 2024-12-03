const { promisePool } = require('../db');

const User = {
  register: async (data) => {
    const { username, password_hash, name, email, phone, shipping_address } = data;
    const [result] = await promisePool.query(
      'INSERT INTO users (username, password_hash, name, email, phone, shipping_address) VALUES (?, ?, ?, ?, ?, ?)',
      [username, password_hash, name, email, phone, shipping_address]
    );
    return result.insertId;
  },

  getByUsername: async (username) => {
    const [user] = await promisePool.query('SELECT * FROM users WHERE username = ?', [username]);
    return user[0];
  },

  getById: async (id) => {
    const [user] = await promisePool.query('SELECT * FROM users WHERE user_id = ?', [id]);
    return user[0];
  },
};

module.exports = User;
