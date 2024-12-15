const { promisePool } = require('../db');

const Order = {
  // Create a new order
  create: async (orderData, items) => {
    const {
      user_id,
      order_number,
      final_price,
      tax_amount,
      discount_code,
      shipping_address,
      payment_method,
      payment_status,
      discounted_total,
    } = orderData;

    try {
      console.log('Creating a new order with data:', orderData);

      // Validate product IDs
      const productIds = items.map((item) => item.product_id);
      const [validProducts] = await promisePool.query(
        `SELECT product_id FROM products WHERE product_id IN (?)`,
        [productIds]
      );

      const validProductIds = validProducts.map((product) => product.product_id);
      const invalidProducts = productIds.filter((id) => !validProductIds.includes(id));

      if (invalidProducts.length > 0) {
        throw new Error(`Invalid product IDs: ${invalidProducts.join(', ')}`);
      }

      // Insert into orders table
      const [result] = await promisePool.query(
        `INSERT INTO orders 
        (user_id, order_number, final_price, tax_amount, discount_code, shipping_address, 
         payment_method, payment_status, discounted_total) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user_id,
          order_number,
          final_price,
          tax_amount,
          discount_code,
          shipping_address,
          payment_method,
          payment_status,
          discounted_total || null,
        ]
      );

      const orderId = result.insertId;

      // Insert items into order_items table
      for (const item of items) {
        await promisePool.query(
          `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) 
           VALUES (?, ?, ?, ?)`,
          [orderId, item.product_id, item.quantity, item.price]
        );
      }

      console.log('Order created successfully with ID:', orderId);
      return orderId;
    } catch (error) {
      console.error('Error in Order.create:', error.message);
      throw new Error('Error creating order: ' + error.message);
    }
  },

  // Update the payment status using order_number
  updatePaymentStatus: async (orderId, paymentStatus, captureId) => {
    try {
      console.log(`Updating payment status for PayPal Order ID: ${orderId}`);
      const [result] = await promisePool.query(
        `UPDATE orders 
         SET payment_status = ?, paypal_capture_id = ? 
         WHERE order_number = ?`, // Use the correct column and treat order_number as a string
        [paymentStatus, captureId, orderId]
      );

      console.log('Payment status updated. Rows affected:', result.affectedRows);
      return result.affectedRows;
    } catch (error) {
      console.error('Error in updatePaymentStatus:', error.message);
      throw new Error('Error updating payment status: ' + error.message);
    }
  },

  updateStatus: async (id, status) => {
    try {
      const [result] = await promisePool.query(
        `UPDATE orders 
         SET status = ? 
         WHERE order_id = ?`,
        [status, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in Order.updateStatus:', error.message);
      throw new Error('Error updating order status: ' + error.message);
    }
  },

  // Get order by ID
  getById: async (orderId) => {
    try {
      console.log(`Fetching order by ID: ${orderId}`);
      const [order] = await promisePool.query('SELECT * FROM orders WHERE order_id = ?', [orderId]);

      if (!order.length) {
        console.log(`Order with ID ${orderId} not found.`);
        return null;
      }

      console.log('Order fetched successfully:', order[0]);
      return order[0];
    } catch (error) {
      console.error('Error in Order.getById:', error.message);
      throw new Error('Error fetching order: ' + error.message);
    }
  },

  // Get order by order_number (if needed for PayPal-related operations)
  getByOrderNumber: async (orderNumber) => {
    try {
      console.log(`Fetching order by order number: ${orderNumber}`);
      const [order] = await promisePool.query(
        'SELECT * FROM orders WHERE order_number = ?',
        [orderNumber]
      );

      if (!order.length) {
        console.log(`Order with order number ${orderNumber} not found.`);
        return null;
      }

      console.log('Order fetched successfully:', order[0]);
      return order[0];
    } catch (error) {
      console.error('Error in Order.getByOrderNumber:', error.message);
      throw new Error('Error fetching order: ' + error.message);
    }
  },

  // Add Cancel Order
  cancelOrder: async (orderId) => {
    try {
      console.log(`Cancelling order with ID: ${orderId}`);
      const [result] = await promisePool.query(
        `UPDATE orders SET status = 'Cancelled' WHERE order_id = ?`,
        [orderId]
      );
      return result.affectedRows;
    } catch (error) {
      console.error('Error in cancelOrder:', error.message);
      throw new Error('Error cancelling order.');
    }
  },

  // Get All Orders for a User
  getOrdersByUserId: async (userId) => {
    try {
      console.log(`Fetching all orders for user ID: ${userId}`);
      const [orders] = await promisePool.query(
        `SELECT * FROM orders WHERE user_id = ?`,
        [userId]
      );
      return orders;
    } catch (error) {
      console.error('Error in getOrdersByUserId:', error.message);
      throw new Error('Error fetching orders.');
    }
  },

  getAll: async () => {
    try {
      const [orders] = await promisePool.query('SELECT * FROM orders');
      return orders;
    } catch (error) {
      console.error('Error in Order.getAll:', error.message);
      throw new Error('Error fetching orders: ' + error.message);
    }
  },

  updateDiscount: async (orderId, discountCode, discountedTotal) => {
    try {
      console.log(`Updating discount for order ID: ${orderId}`);
      const [result] = await promisePool.query(
        `UPDATE orders 
         SET discount_code = ?, discounted_total = ? 
         WHERE order_id = ?`,
        [discountCode, discountedTotal, orderId]
      );

      console.log('Discount updated successfully. Rows affected:', result.affectedRows);
      return result.affectedRows;
    } catch (error) {
      console.error('Error in Order.updateDiscount:', error.message);
      throw new Error('Error updating discount for order: ' + error.message);
    }
  },

  getByUserId: async (userId) => {
    try {
      console.log(`Fetching orders for user ID: ${userId}`);
      const [orders] = await promisePool.query(
        `SELECT * FROM orders WHERE user_id = ? ORDER BY order_date DESC`,
        [userId]
      );

      if (!orders || orders.length === 0) {
        console.warn(`No order history found for user ID: ${userId}`);
        return [];
      }

      console.log(`Fetched orders for user ID ${userId}:`, orders);
      return orders;
    } catch (error) {
      console.error('Error in getByUserId:', error.message);
      throw new Error('Error fetching order history: ' + error.message);
    }
  }

};

module.exports = Order;