
// Function to create a payment
const createPayment = async (paymentDetails) => {
    try {
        const response = await fetch('/api/payments/create-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentDetails)
        });
        if (!response.ok) throw new Error('Failed to create payment');
        return await response.json();
    } catch (error) {
        console.error('Error creating payment:', error);
    }
};

// Function to execute a payment
const executePayment = async (paymentId, payerId) => {
    try {
        const response = await fetch('/api/payments/execute-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId, payerId })
        });
        if (!response.ok) throw new Error('Failed to execute payment');
        return await response.json();
    } catch (error) {
        console.error('Error executing payment:', error);
    }
};

// Function to cancel a payment
const cancelPayment = async () => {
    try {
        const response = await fetch('/api/payments/cancel', { method: 'GET' });
        if (!response.ok) throw new Error('Failed to cancel payment');
        return await response.json();
    } catch (error) {
        console.error('Error cancelling payment:', error);
    }
};

// Function to apply discounts to payments
const applyPaymentDiscount = async (discountCode) => {
    try {
        const response = await fetch('/api/payments/discounts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ discountCode })
        });
        if (!response.ok) throw new Error('Failed to apply discount');
        return await response.json();
    } catch (error) {
        console.error('Error applying discount:', error);
    }
};
