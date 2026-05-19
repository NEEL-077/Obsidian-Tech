import React, { useState } from 'react';

const PaymentGateway = ({ orderData, onSuccess, onError }) => {
    const [processing, setProcessing] = useState(false);

    const handlePayment = async (paymentMethod) => {
        setProcessing(true);

        try {
            if (paymentMethod === 'razorpay') {
                // Razorpay integration
                const options = {
                    key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_demo', // Demo key
                    amount: orderData.totalPrice * 100, // Amount in paise
                    currency: 'INR',
                    name: 'OBSIDIAN TECH',
                    description: `Order #${orderData._id}`,
                    order_id: orderData._id,
                    handler: function (response) {
                        // Payment successful
                        onSuccess({
                            paymentId: response.razorpay_payment_id,
                            orderId: response.razorpay_order_id,
                            signature: response.razorpay_signature,
                            method: 'razorpay'
                        });
                    },
                    prefill: {
                        name: orderData.userName,
                        email: orderData.userEmail,
                        contact: orderData.shippingAddress.phone || ''
                    },
                    theme: {
                        color: '#667eea'
                    },
                    modal: {
                        ondismiss: function() {
                            setProcessing(false);
                            onError('Payment cancelled by user');
                        }
                    }
                };

                if (window.Razorpay) {
                    const rzp = new window.Razorpay(options);
                    rzp.open();
                } else {
                    throw new Error('Razorpay SDK not loaded');
                }
            } else if (paymentMethod === 'stripe') {
                // Stripe integration (placeholder)
                // In a real implementation, you would integrate with Stripe Elements
                setTimeout(() => {
                    onSuccess({
                        paymentId: 'stripe_' + Date.now(),
                        method: 'stripe'
                    });
                }, 2000);
            } else if (paymentMethod === 'cod') {
                // Cash on Delivery
                onSuccess({
                    paymentId: 'cod_' + Date.now(),
                    method: 'cod',
                    status: 'pending'
                });
            } else {
                // Demo payment for testing
                setTimeout(() => {
                    onSuccess({
                        paymentId: 'demo_' + Date.now(),
                        method: 'demo',
                        status: 'completed'
                    });
                }, 1500);
            }
        } catch (error) {
            setProcessing(false);
            onError(error.message || 'Payment failed');
        }
    };

    return (
        <div className="payment-gateway">
            <div className="payment-methods">
                <h3>Choose Payment Method</h3>
                
                <div className="payment-options">
                    <button
                        className="payment-btn razorpay"
                        onClick={() => handlePayment('razorpay')}
                        disabled={processing}
                    >
                        <span className="payment-icon">💳</span>
                        <div className="payment-info">
                            <strong>Razorpay</strong>
                            <p>Credit/Debit Card, UPI, Net Banking</p>
                        </div>
                    </button>

                    <button
                        className="payment-btn stripe"
                        onClick={() => handlePayment('stripe')}
                        disabled={processing}
                    >
                        <span className="payment-icon">💎</span>
                        <div className="payment-info">
                            <strong>Stripe</strong>
                            <p>International Cards</p>
                        </div>
                    </button>

                    <button
                        className="payment-btn cod"
                        onClick={() => handlePayment('cod')}
                        disabled={processing}
                    >
                        <span className="payment-icon">💵</span>
                        <div className="payment-info">
                            <strong>Cash on Delivery</strong>
                            <p>Pay when you receive</p>
                        </div>
                    </button>

                    <button
                        className="payment-btn demo"
                        onClick={() => handlePayment('demo')}
                        disabled={processing}
                    >
                        <span className="payment-icon">🧪</span>
                        <div className="payment-info">
                            <strong>Demo Payment</strong>
                            <p>For testing purposes</p>
                        </div>
                    </button>
                </div>

                {processing && (
                    <div className="processing-overlay">
                        <div className="processing-spinner"></div>
                        <p>Processing payment...</p>
                    </div>
                )}
            </div>

            <div className="payment-summary">
                <h4>Payment Summary</h4>
                <div className="summary-row">
                    <span>Order Total</span>
                    <span>₹{orderData.totalPrice.toLocaleString()}</span>
                </div>
                <div className="summary-note">
                    <p>🔒 Your payment information is secure and encrypted</p>
                </div>
            </div>
        </div>
    );
};

export default PaymentGateway;
