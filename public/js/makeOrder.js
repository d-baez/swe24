// makeOrder.js
const { addToCart, getCart } = require('./cartManagement');
const Order = require('../models/orderModel'); // Assuming you have an Order model
const Product = require('../models/productModel'); // Assuming you have a Product model
const paypal = require('@paypal/checkout-server-sdk');
const { addressValidation_controller } = require('./validateAddress'); // Address validation logic

// PayPal client setup using sandbox credentials
const environment = new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_SECRET); 
const client = new paypal.core.PayPalHttpClient(environment);

// Create an order from cart
const makeOrder = async (userId, shippingAddress) => {
  const cartItems = getCart(userId);

  if (!cartItems.length) {
    throw new Error('Cart is empty');
  }

  // Validate the shipping address using SmartyStreets (address validation)
  const isAddressValid = await addressValidation_controller(shippingAddress);
  if (isAddressValid === -1) {
    throw new Error('Invalid shipping address');
  }

  // Verify product stock
  for (const item of cartItems) {
    const product = await Product.findById(item.productId);
    if (!product || product.stock < item.quantity) {
      throw new Error(`Not enough stock for ${product.name}`);
    }
  }

  // Calculate the total price
  let totalAmount = 0;
  cartItems.forEach(item => {
    totalAmount += item.price * item.quantity;
  });

  // Store the order in the database (assuming you have an Order model)
  const orderData = {
    userId,
    items: cartItems,
    totalAmount,
    shippingAddress
  };

  const order = await Order.create(orderData);

  // PayPal order creation request
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer('return=representation');
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: 'USD', // Use 'USD' or the required currency
        value: totalAmount.toFixed(2), // Convert to fixed decimal
      },
    }],
    application_context: {
      return_url: 'http://localhost:3000/api/paypal/execute-payment', // After approval
      cancel_url: 'http://localhost:3000/cancel', // If payment is cancelled
    },
  });

  try {
    const paypalOrder = await client.execute(request); // Execute PayPal request to create order

    // Save PayPal order ID in the database
    await Order.update({ paypal_order_id: paypalOrder.result.id, paypal_payment_status: 'Pending' }, { where: { id: order.id } });

    // Return PayPal order ID and approval URL to the client
    return { order, paypalOrder: paypalOrder.result }; // Return order and PayPal order details (approval URL)
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    throw new Error('Error processing PayPal order');
  }
};

module.exports = { makeOrder };
