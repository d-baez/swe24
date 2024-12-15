const { promisePool } = require('../db');

const Discount = {
  getByCode: async (code) => {
    try {
      console.log(`Fetching discount with code: ${code}`);
      const [discount] = await promisePool.query(
        'SELECT * FROM discounts WHERE code = ? AND start_date <= CURDATE() AND expiration_date >= CURDATE()',
        [code]
      );

      if (!discount.length) {
        console.log(`No valid discount found with code: ${code}`);
        return null;
      }

      console.log('Discount fetched successfully:', discount[0]);
      return discount[0];
    } catch (error) {
      console.error('Error in Discount.getByCode:', error.message);
      throw new Error('Error fetching discount: ' + error.message);
    }
  },

  create: async (data) => {
    const { code, discount_type, discount_value, start_date, expiration_date, description } = data;

    try {
      const [result] = await promisePool.query(
        `INSERT INTO discounts (code, discount_type, discount_value, start_date, expiration_date, description)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [code, discount_type, discount_value, start_date, expiration_date, description]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error in Discount.create:', error.message);
      throw new Error('Error creating discount: ' + error.message);
    }
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
