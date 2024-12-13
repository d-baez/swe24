const express = require('express');
const paypal = require('@paypal/checkout-server-sdk');
const Discount = require('../models/discountModel');
const Order = require('../models/orderModel');
const router = express.Router();

// Configure PayPal environment
const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_SECRET
);
const client = new paypal.core.PayPalHttpClient(environment);

// Helper function to calculate discount
const calculateDiscount = async (discountCode, amount) => {
  if (!discountCode) return 0;

  const discount = await Discount.getByCode(discountCode);
  if (!discount) throw new Error('Invalid discount code');

  return discount.discount_type === 'percentage'
    ? (amount * discount.discount_value) / 100
    : discount.discount_value;
};

// Generate a unique order number
const generateOrderNumber = () => `ORD-${Date.now()}`;

// Create PayPal payment
router.post('/create-payment', async (req, res) => {
  try {
    const { amount, currency = 'USD', discountCode, user_id, shipping_address, tax_amount, items } = req.body;

    // Validate required fields
    if (!amount || !user_id || !shipping_address || tax_amount === undefined || !items || items.length === 0) {
      console.error('Missing required fields:', req.body);
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Calculate discount
    const discountAmount = await calculateDiscount(discountCode, amount);
    const finalAmount = Math.max(amount - discountAmount, 0);

    console.log(`Final payment amount after discount: ${finalAmount}`);

    // Generate a unique order number
    const orderNumber = generateOrderNumber();

    // Create PayPal order
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: { currency_code: currency, value: finalAmount.toFixed(2) },
        },
      ],
      application_context: {
        return_url: 'http://localhost:3000/api/payments/execute-payment',
        cancel_url: 'http://localhost:3000/api/payments/cancel',
      },
    });

    const paypalResponse = await client.execute(request);
    const approveUrl = paypalResponse.result.links.find((link) => link.rel === 'approve').href;

    console.log(`Redirect the user to approve the payment: ${approveUrl}`);

    // Save the order in the database
    const orderId = await Order.create({
      user_id,
      order_number: paypalResponse.result.id, // Use PayPal order ID for the order_number
      final_price: finalAmount,
      tax_amount,
      shipping_address,
      discount_code: discountCode || null,
      payment_method: 'PayPal',
      payment_status: 'Pending',
    }, items);

    res.status(201).json({
      message: 'Payment created successfully',
      paypal_order_id: paypalResponse.result.id,
      approve_url: approveUrl,
      orderId,
    });
  } catch (error) {
    console.error('Error creating payment:', error.message);
    res.status(500).json({ message: 'Error creating payment', error: error.message });
  }
});

// Execute PayPal payment
router.post('/execute-payment', async (req, res) => {
  const { orderID } = req.body;

  try {
    if (!orderID) {
      console.error('Missing orderID in request body.');
      return res.status(400).json({ message: 'Missing orderID' });
    }

    // Capture the PayPal order
    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    const capture = await client.execute(request);
    console.log('PayPal order captured successfully:', capture.result);

    // Update the order in the database with capture details
    const updatedRows = await Order.updatePaymentStatus(orderID, 'Completed', capture.result.id);

    if (updatedRows === 0) {
      console.warn(`Order with PayPal ID ${orderID} not found in the database.`);
      return res.status(404).json({ message: `Order with PayPal ID ${orderID} not found.` });
    }

    res.status(200).json({
      message: 'Payment captured successfully',
      captureId: capture.result.id,
    });
  } catch (error) {
    console.error('Error capturing payment:', error.message);
    res.status(500).json({ message: 'Error capturing payment', error: error.message });
  }
});

// Handle payment cancellation
router.get('/cancel', (req, res) => {
  console.log('Payment cancelled.');
  res.status(200).json({ message: 'Payment cancelled' });
});


// Create a discount code
router.post('/discounts', async (req, res) => {
  try {
    const { code, discount_type, discount_value, start_date, expiration_date, description } = req.body;

    if (!code || !discount_type || !discount_value || !start_date || !expiration_date) {
      return res.status(400).json({ message: 'Missing required discount fields' });
    }

    const discountId = await Discount.create({
      code,
      discount_type,
      discount_value,
      start_date,
      expiration_date,
      description: description || null,
    });

    res.status(201).json({ message: 'Discount created successfully', discountId });
  } catch (error) {
    console.error('Error creating discount:', error.message);
    res.status(500).json({ message: 'Error creating discount', error: error.message });
  }
});


module.exports = router;
