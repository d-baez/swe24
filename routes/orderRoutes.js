const express = require('express');
const Order = require('../models/orderModel');
const Discount = require('../models/discountModel');
const router = express.Router();

// Helper function for discount calculation
const calculateDiscount = async (discountCode, totalAmount) => {
  if (!discountCode) return 0;

  const discount = await Discount.getByCode(discountCode);
  if (!discount) throw new Error('Invalid discount code');

  // Validate totalAmount
  if (totalAmount === null || totalAmount === undefined) {
    throw new Error('Total amount is missing');
  }
  if (typeof totalAmount !== 'number' || isNaN(totalAmount)) {
    throw new Error('Total amount must be a valid number');
  }
  if (totalAmount <= 0) {
    throw new Error('Total amount must be greater than zero');
  }

  return discount.discount_type === 'percentage'
    ? (totalAmount * discount.discount_value) / 100
    : discount.discount_value;
};



// Generate a unique order number
const generateOrderNumber = () => `ORD-${Date.now()}`;

// Create an order
router.post('/', async (req, res) => {
  try {
    const { user_id, items, tax_amount, shipping_address, discount_code, payment_method } = req.body;

    // Validate required fields
    if (!user_id || !items || !tax_amount || !shipping_address || !payment_method) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Ensure items is an array
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items must be a non-empty array' });
    }

    // Calculate discount
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountAmount = await calculateDiscount(discount_code, totalAmount);
    const finalPrice = totalAmount - discountAmount + tax_amount;

    // Generate a unique order number
    const order_number = generateOrderNumber();

    // Create the order in the database
    const orderId = await Order.create(
      {
        user_id,
        order_number,
        final_price: finalPrice,
        tax_amount,
        discount_code,
        shipping_address,
        payment_method,
        payment_status: 'Pending', // Default payment status
        discounted_total: finalPrice - tax_amount, // Optional: without tax
      },
      items // Pass items to Order.create
    );

    res.status(201).json({ message: 'Order created successfully', orderId, order_number });
  } catch (error) {
    console.error('Error creating order:', error.message);
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
});


// List all orders (Admin)
router.get('/list', async (req, res) => {
  try {
    const orders = await Order.getAll();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});


// Update payment status
router.patch('/:id/payment-status', async (req, res) => {
  try {
    const { payment_status, capture_id } = req.body;

    if (!payment_status || !capture_id) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const affectedRows = await Order.updatePaymentStatus(req.params.id, payment_status, capture_id);

    if (affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ message: 'Payment status updated successfully' });
  } catch (error) {
    console.error('Error updating payment status:', error.message);
    res.status(500).json({ message: 'Error updating payment status', error: error.message });
  }
});

// Get the status of an order by its ID
router.get('/:id/:order_id', async (req, res) => {
  const { id, order_id } = req.params;

  try {
    const order = await Order.getById(order_id);

    if (!order || order.user_id !== parseInt(id)) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ order_id: order.order_id, status: order.status });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order status', error: error.message });
  }
});

// Apply discount code to an order
router.post('/:id/:order_id/apply-discount', async (req, res) => {
  const { id, order_id } = req.params;
  const { discount_code } = req.body;

  try {
    const order = await Order.getById(order_id);
    console.log('Fetched order:', order); // Debugging log

    if (!order || order.user_id !== parseInt(id)) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Ensure final_price is a valid number
    let finalPrice = parseFloat(order.final_price);
    if (isNaN(finalPrice)) {
      throw new Error('Final price is invalid or not a number');
    }

    console.log('Applying discount to order with final_price:', finalPrice); // Debugging log

    // Retrieve and validate discount details
    const discount = await Discount.getByCode(discount_code);
    if (!discount) {
      return res.status(400).json({ message: 'Invalid discount code' });
    }

    // Calculate discounted total
    const discountAmount = discount.discount_type === 'percentage'
      ? (finalPrice * discount.discount_value) / 100
      : discount.discount_value;

    const discountedTotal = Math.max(finalPrice - discountAmount, 0);

    // Update the order with the discount
    await Order.updateDiscount(order_id, discount_code, discountedTotal);

    // Log success and send response
    res.status(200).json({ message: 'Discount applied successfully', discountedTotal });
  } catch (error) {
    console.error('Error applying discount:', error.message);
    res.status(500).json({ message: 'Error applying discount', error: error.message });
  }
});

// Get all orders for a user
router.get('/user/:id/history', async (req, res) => {
  const { id } = req.params; // `id` should be a user_id

  try {
    console.log(`Request for order history for user ID: ${id}`);

    // Fetch orders for the user
    const orders = await Order.getByUserId(id);

    if (!orders || orders.length === 0) {
      console.warn(`No order history found for user ID: ${id}`);
      return res.status(404).json({ message: 'Order history not found' });
    }

    console.log(`Order history for user ID ${id}:`, orders);
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching order history:', error.message);
    res.status(500).json({ message: 'Error fetching order history', error: error.message });
  }
});


// Request to cancel an order
router.post('/:id/:order_id/cancel', async (req, res) => {
  const { id, order_id } = req.params;

  try {
    const order = await Order.getById(order_id);

    if (!order || order.user_id !== parseInt(id)) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status === 'Cancelled') {
      return res.status(400).json({ message: 'Order already cancelled' });
    }

    await Order.updateStatus(order_id, 'Cancelled');
    res.status(200).json({ message: 'Order cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling order', error: error.message });
  }
});

// Update order status
router.put('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['Processed', 'Shipped', 'Delivered'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const updated = await Order.updateStatus(id, status);

    if (!updated) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ message: 'Order status updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status', error: error.message });
  }
});


module.exports = router;
