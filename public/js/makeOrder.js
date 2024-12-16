
// Function to make an order and handle payment
import {validateAddress} from "./validateAddress";

const makeOrder = async (userId, shippingAddress) => {
    try {
        // Fetch the cart items
        const cartResponse = await fetch(`/api/users/${userId}/cart`);
        if (!cartResponse.ok) {
            throw new Error('Error fetching cart items');
        }
        const cartItems = await cartResponse.json();
        if (!cartItems.length) {
            alert('Cart is empty');
            return;
        }

        // Validate the shipping address
        const isAddressValid = await validateAddress(shippingAddress);
        if (!isAddressValid) {
            alert('Shipping address is invalid');
            return;
        }

        // Create order
        const orderResponse = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, items: cartItems, shippingAddress }),
        });
        if (!orderResponse.ok) {
            throw new Error('Error creating order');
        }
        const order = await orderResponse.json();

        // Handle payment
        const paymentResponse = await fetch('/api/payments/create-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: order.total, orderId: order.id }),
        });
        if (!paymentResponse.ok) {
            throw new Error('Error processing payment');
        }
        const paymentResult = await paymentResponse.json();
        alert('Payment processed successfully');
        window.location.href = '/orderSuccess.html'; // Redirect to success page
    } catch (error) {
        alert('Order and payment processing failed:', error.message);
    }
};

