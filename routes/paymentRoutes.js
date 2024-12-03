const express = require('express');
const paypal = require('@paypal/checkout-server-sdk');
const Discount = require('../models/discountModel');
const Order = require('../models/orderModel');  // Assuming you have an Order model
const router = express.Router();

// PayPal client setup using sandbox credentials
const environment = new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_SECRET); 
const client = new paypal.core.PayPalHttpClient(environment);

// 1. Create Payment Route (Create PayPal Order)
router.post('/create-payment', async (req, res) => {
  try {
    const { amount, currency, paymentMethodId, discountCode, user_id, shipping_address } = req.body;

    // Calculate discount if applicable
    let discountAmount = 0;
    if (discountCode) {
      const discount = await Discount.getByCode(discountCode);
      if (!discount) {
        return res.status(400).json({ message: 'Invalid discount code' });
      }

      if (discount.discount_type === 'percentage') {
        discountAmount = (amount * discount.discount_value) / 100;
      } else if (discount.discount_type === 'fixed') {
        discountAmount = discount.discount_value;
      }
    }

    const finalAmount = Math.max(amount - discountAmount, 0);  // Final amount after discount

    // PayPal order creation request
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: currency,
          value: finalAmount.toFixed(2), // Convert to fixed decimal
        },
      }],
      application_context: {
        return_url: 'http://localhost:3000/api/paypal/execute-payment', // After approval
        cancel_url: 'http://localhost:3000/cancel', // If payment is cancelled
      },
    });

    const order = await client.execute(request);

    // Save PayPal order ID in the database (e.g., order model) if needed
    const orderId = await Order.create({
      user_id,
      final_price: finalAmount,
      shipping_address,
      paypal_order_id: order.result.id,  // Save PayPal order ID
      paypal_payment_status: 'Pending',
    });

    // Return PayPal approval URL
    res.json({ id: order.result.id });  // Send back PayPal order ID
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ message: 'Payment processing failed', error });
  }
});

// 2. Execute Payment Route (Capture PayPal Order)
router.post('/execute-payment', async (req, res) => {
  const { orderID, payerID } = req.body;

  try {
    // PayPal capture request
    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    const capture = await client.execute(request);

    // Update order status in the database to reflect payment capture
    const updatedOrder = await Order.updatePaymentStatus(orderID, 'Completed', capture.result.id);

    res.status(200).json({ success: true, capture });
  } catch (error) {
    console.error('Capture error:', error);
    res.status(500).json({ message: 'Payment capture failed', error });
  }
});

module.exports = router;
