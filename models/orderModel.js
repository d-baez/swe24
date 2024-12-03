const { promisePool } = require('../db');

const Order = {
  create: async (data) => {
    const {
      user_id,
      final_price,
      tax_amount,
      discount_code,
      shipping_address,
      paypal_order_id, // PayPal order ID from PayPal's response
      paypal_payment_status, // Payment status (e.g., Pending, Completed)
      paypal_capture_id, // PayPal capture ID after successful capture
      paypal_transaction_details, // Any additional details from PayPal
    } = data;

    const [result] = await promisePool.query(
      `INSERT INTO orders 
      (user_id, final_price, tax_amount, discount_code, shipping_address, 
      paypal_order_id, paypal_payment_status, paypal_capture_id, paypal_transaction_details) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, final_price, tax_amount, discount_code, shipping_address, 
      paypal_order_id, paypal_payment_status, paypal_capture_id, paypal_transaction_details]
    );
    return result.insertId;
  },

  updatePaymentStatus: async (orderId, paymentStatus, captureId) => {
    const [result] = await promisePool.query(
      `UPDATE orders 
       SET paypal_payment_status = ?, paypal_capture_id = ? 
       WHERE order_id = ?`,
      [paymentStatus, captureId, orderId]
    );
    return result.affectedRows;
  },
};

module.exports = Order;
