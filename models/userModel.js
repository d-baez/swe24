const { promisePool } = require('../db');

const User = {
  // Register a new user
  register: async (data) => {
    try {
      const { username, password_hash, name, email, phone, shipping_address } = data;
      console.log(`Registering new user: ${username}`);
      const [result] = await promisePool.query(
        'INSERT INTO users (username, password_hash, name, email, phone, shipping_address) VALUES (?, ?, ?, ?, ?, ?)',
        [username, password_hash, name, email, phone, shipping_address]
      );
      console.log(`User registered with ID: ${result.insertId}`);
      return result.insertId;
    } catch (error) {
      console.error('Error in register:', error.message);
      throw error;
    }
  },

  // Get user by username
  getByUsername: async (username) => {
    try {
      console.log(`Fetching user by username: ${username}`);
      const [user] = await promisePool.query('SELECT * FROM users WHERE username = ?', [username]);
      if (!user.length) {
        console.log(`No user found with username: ${username}`);
        return null;
      }
      console.log('User fetched by username:', user[0]);
      return user[0];
    } catch (error) {
      console.error('Error in getByUsername:', error.message);
      throw error;
    }
  },

  // Get user by email
  getByEmail: async (email) => {
    try {
      console.log(`Fetching user by email: ${email}`);
      const [user] = await promisePool.query('SELECT * FROM users WHERE email = ?', [email]);
      if (!user.length) {
        console.log(`No user found with email: ${email}`);
        return null;
      }
      console.log('User fetched by email:', user[0]);
      return user[0];
    } catch (error) {
      console.error('Error in getByEmail:', error.message);
      throw error;
    }
  },

  // Get user by ID
  getById: async (id) => {
    try {
      console.log(`Fetching user by ID: ${id}`);
      const [user] = await promisePool.query('SELECT * FROM users WHERE user_id = ?', [id]);
      if (!user.length) {
        console.log(`No user found with ID: ${id}`);
        return null;
      }
      console.log('User fetched by ID:', user[0]);
      return user[0];
    } catch (error) {
      console.error('Error in getById:', error.message);
      throw error;
    }
  },

  // Check if user exists by username
  findByUsername: async (username, email) => {
    try {
      console.log(`Checking if user exists by username: ${username}`);
      const [users] = await promisePool.query(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
      if (!users.length) {
        console.log('No user found with the provided username.');
        return null;
      }
      console.log('User found by username:', users[0]);
      return users[0];
    } catch (error) {
      console.error('Error in findByUsernameOrEmail:', error.message);
      throw error;
    }
  },

  // Validate user login
  findByUsername: async (username) => {
    try {
      console.log(`Validating login for username: ${username}`);
      const [users] = await promisePool.query('SELECT * FROM users WHERE username = ?', [username]);
      if (!users.length) {
        console.log(`No user found for username: ${username}`);
        return null;
      }
      console.log('User found for login:', users[0]);
      return users[0];
    } catch (error) {
      console.error('Error in findByUsername:', error.message);
      throw error;
    }
  },

  // Update user account
  updateAccount: async (id, data) => {
    const { username, password, email, phone, shipping_address } = data;

    try {
      console.log(`Updating user account for user ID: ${id}`);
      const [result] = await promisePool.query(
        `UPDATE users 
        SET username = COALESCE(?, username), 
            password_hash = COALESCE(?, password_hash), 
            email = COALESCE(?, email), 
            phone = COALESCE(?, phone), 
            shipping_address = COALESCE(?, shipping_address)
        WHERE user_id = ?`,
        [username || null, password || null, email || null, phone || null, shipping_address || null, id]
      );

      if (result.affectedRows === 0) {
        console.log(`No user found with ID: ${id}`);
        return null;
      }

      console.log(`User account updated successfully for ID: ${id}`);
      return result.affectedRows;
    } catch (error) {
      console.error('Error in updateAccount:', error.message);
      throw new Error('Error updating user account: ' + error.message);
    }
  },

  getAll: async () => {
    try {
      const [users] = await promisePool.query('SELECT * FROM users');
      return users;
    } catch (error) {
      console.error('Error in User.getAll:', error.message);
      throw new Error('Error fetching users: ' + error.message);
    }
  },

  // Update user's cart
  updateCart: async (userId, cart) => {
    try {
      console.log(`Updating cart for user ID: ${userId}`);
      const [result] = await promisePool.query(
        'UPDATE users SET cart = ? WHERE user_id = ?',
        [JSON.stringify(cart), userId] // Serialize the cart object into JSON
      );

      if (result.affectedRows === 0) {
        throw new Error('No user found with the specified ID');
      }

      console.log('Cart updated successfully for user ID:', userId);
      return result.affectedRows;
    } catch (error) {
      console.error('Error in User.updateCart:', error.message);
      throw new Error('Error updating cart: ' + error.message);
    }
  },

  // Get user's cart
  getCart: async (userId) => {
    try {
      console.log(`Fetching cart for user ID: ${userId}`);
      const [rows] = await promisePool.query(
        'SELECT cart FROM users WHERE user_id = ?',
        [userId]
      );

      if (!rows.length) {
        throw new Error('No user found with the specified ID');
      }

      const cart = JSON.parse(rows[0].cart || '[]'); // Parse the JSON cart field
      console.log('Cart fetched successfully for user ID:', userId);
      return cart;
    } catch (error) {
      console.error('Error in User.getCart:', error.message);
      throw new Error('Error fetching cart: ' + error.message);
    }
  },

  // Update shipping address for a user
  updateShippingAddress: async (userId, newAddress) => {
    try {
      const [result] = await promisePool.query(
        'UPDATE users SET shipping_address = ? WHERE user_id = ?',
        [newAddress, userId]
      );

      if (result.affectedRows === 0) {
        console.log(`No user found with ID: ${userId}`);
        return false; // Indicates no user was updated
      }

      console.log(`Shipping address updated for user ID: ${userId}`);
      return true; // Indicates the update was successful
    } catch (error) {
      console.error('Error in User.updateShippingAddress:', error.message);
      throw new Error('Error updating shipping address: ' + error.message);
    }
  },
};

module.exports = User;
