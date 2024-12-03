const express = require('express');
const Order = require('../models/orderModel');
const Discount = require('../models/discountModel');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { user_id, items, tax_amount, shipping_address, discount_code } = req.body;

    let discountAmount = 0;
    if (discount_code) {
      const discount = await Discount.getByCode(discount_code);
      if (!discount) {
        return res.status(400).json({ message: 'Invalid discount code' });
      }

      // Calculate discount
      const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      if (discount.discount_type === 'percentage') {
        discountAmount = (totalAmount * discount.discount_value) / 100;
      } else if (discount.discount_type === 'fixed') {
        discountAmount = discount.discount_value;
      }
    }

    const finalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0) - discountAmount + tax_amount;

    // Create order
    const orderId = await Order.create({
      user_id,
      final_price: finalPrice,
      tax_amount,
      discount_code,
      shipping_address,
      payment_method: 'Pending',
      payment_status: 'Pending',
    });

    res.status(201).json({ message: 'Order created', orderId });
  } catch (error) {
    res.status(500).json({ message: 'Error creating order', error });
  }
});

module.exports = router;
