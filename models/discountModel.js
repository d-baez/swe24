const { promisePool } = require('../db');

const Discount = {
  getByCode: async (code) => {
    const [discount] = await promisePool.query('SELECT * FROM discounts WHERE code = ?', [code]);
    return discount[0];
  },

  create: async (data) => {
    const { code, discount_type, discount_value, start_date, expiration_date, description } = data;
    const [result] = await promisePool.query(
      'INSERT INTO discounts (code, discount_type, discount_value, start_date, expiration_date, description) VALUES (?, ?, ?, ?, ?, ?)',
      [code, discount_type, discount_value, start_date, expiration_date, description]
    );
    return result.insertId;
  },

  update: async (discountId, data) => {
    const { code, discount_type, discount_value, start_date, expiration_date, description } = data;
    const [result] = await promisePool.query(
      `UPDATE discounts 
       SET code = ?, discount_type = ?, discount_value = ?, start_date = ?, expiration_date = ?, description = ? 
       WHERE discount_id = ?`,
      [code, discount_type, discount_value, start_date, expiration_date, description, discountId]
    );
    return result.affectedRows;
  },

  delete: async (discountId) => {
    const [result] = await promisePool.query('DELETE FROM discounts WHERE discount_id = ?', [discountId]);
    return result.affectedRows;
  },
};

module.exports = Discount;
