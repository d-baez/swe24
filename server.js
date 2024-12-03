require('dotenv').config();  // Load environment variables
const express = require('express');
const paypal = require('@paypal/checkout-server-sdk');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Configure PayPal environment
let environment;
if (process.env.PAYPAL_MODE === 'sandbox') {
  environment = new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_SECRET);
} else {
  environment = new paypal.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_SECRET);
}

const client = new paypal.core.PayPalHttpClient(environment);

// Route to create a payment (to be called from the client-side)
app.post('/api/paypal/create-payment', async (req, res) => {
  try {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: req.body.amount,
        },
      }],
      application_context: {
        return_url: 'http://localhost:3000/api/paypal/execute-payment',
        cancel_url: 'http://localhost:3000/cancel',
      },
    });

    const order = await client.execute(request);
    res.json({ id: order.result.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Route to execute payment after approval
app.post('/api/paypal/execute-payment', async (req, res) => {
  const { orderID, payerID } = req.body;
  try {
    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});
    
    const capture = await client.execute(request);
    res.status(200).json({ success: true, capture });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
