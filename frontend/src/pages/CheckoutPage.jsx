import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder, payOrder } from '../api/orderApi';
import PaymentGateway from '../components/PaymentGateway';
import './CheckoutPage.css';
import '../components/PaymentGateway.css';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { cartItems, clearCart } = useCart();
    const { user } = useAuth();

    useEffect(() => {
        if (!user) navigate('/auth');
        else if (cartItems.length === 0) navigate('/cart');
    }, [user, cartItems, navigate]);

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 50000 ? 0 : 500;
    const orderTotal = subtotal + shipping;

    const [currentStep, setCurrentStep] = useState(1);
    const [createdOrder, setCreatedOrder] = useState(null);

    const [formData, setFormData] = useState({
        fullName: user?.name || '',
        email: user?.email || '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        paymentMethod: 'card'
    });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const orderItems = cartItems.map(item => ({
                name: item.name,
                qty: item.quantity,
                image: item.image || '/placeholder-phone.svg',
                price: item.price,
                product: item._id || item.id
            }));

            const orderData = {
                orderItems,
                shippingAddress: {
                    address: formData.address,
                    city: formData.city,
                    postalCode: formData.pincode,
                    country: 'India'
                },
                paymentMethod: formData.paymentMethod,
                itemsPrice: subtotal,
                taxPrice: 0,
                shippingPrice: shipping,
                totalPrice: orderTotal
            };

            const order = await createOrder(orderData);
            setCreatedOrder(order);
            setCurrentStep(2);
        } catch (error) {
            alert('Error creating order');
        }
    };

    const handlePaymentSuccess = async (paymentResult) => {
        try {
            await payOrder(createdOrder._id, paymentResult);
            clearCart();
            alert('Order placed successfully!');
            navigate('/profile');
        } catch (error) {
            alert('Payment failed');
        }
    };

    return (
        <div className="checkout-page">
            <h1 className="checkout-title">Checkout.</h1>
            
            <div className="checkout-layout">
                {currentStep === 1 ? (
                    <form onSubmit={handleSubmit} className="checkout-form-col">
                        <div className="checkout-section">
                            <div className="checkout-section-header">
                                <span className="checkout-step-number">1</span>
                                Shipping Details
                            </div>
                            <div className="checkout-section-body">
                                <div className="checkout-field">
                                    <label className="checkout-label">Full Name</label>
                                    <input className="checkout-input" type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
                                </div>
                                <div className="checkout-field-row">
                                    <div className="checkout-field">
                                        <label className="checkout-label">Email</label>
                                        <input className="checkout-input" type="email" name="email" value={formData.email} onChange={handleChange} required />
                                    </div>
                                    <div className="checkout-field">
                                        <label className="checkout-label">Phone</label>
                                        <input className="checkout-input" type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
                                    </div>
                                </div>
                                <div className="checkout-field">
                                    <label className="checkout-label">Address</label>
                                    <input className="checkout-input" type="text" name="address" value={formData.address} onChange={handleChange} required />
                                </div>
                                <div className="checkout-field-row">
                                    <div className="checkout-field">
                                        <label className="checkout-label">City</label>
                                        <input className="checkout-input" type="text" name="city" value={formData.city} onChange={handleChange} required />
                                    </div>
                                    <div className="checkout-field">
                                        <label className="checkout-label">Pincode</label>
                                        <input className="checkout-input" type="text" name="pincode" value={formData.pincode} onChange={handleChange} required />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="checkout-section">
                            <div className="checkout-section-header">
                                <span className="checkout-step-number">2</span>
                                Payment Method
                            </div>
                            <div className="checkout-section-body">
                                <div className="payment-options">
                                    <label className={`payment-option ${formData.paymentMethod === 'card' ? 'selected' : ''}`}>
                                        <input type="radio" name="paymentMethod" value="card" checked={formData.paymentMethod === 'card'} onChange={handleChange} />
                                        <span className="payment-option-label">Credit / Debit Card</span>
                                    </label>
                                    <label className={`payment-option ${formData.paymentMethod === 'upi' ? 'selected' : ''}`}>
                                        <input type="radio" name="paymentMethod" value="upi" checked={formData.paymentMethod === 'upi'} onChange={handleChange} />
                                        <span className="payment-option-label">UPI</span>
                                    </label>
                                    <label className={`payment-option ${formData.paymentMethod === 'cod' ? 'selected' : ''}`}>
                                        <input type="radio" name="paymentMethod" value="cod" checked={formData.paymentMethod === 'cod'} onChange={handleChange} />
                                        <span className="payment-option-label">Cash on Delivery</span>
                                    </label>
                                </div>
                                <button type="submit" className="place-order-btn">Continue to Payment</button>
                            </div>
                        </div>
                    </form>
                ) : (
                    <div className="payment-step">
                        <PaymentGateway
                            orderData={createdOrder}
                            onSuccess={handlePaymentSuccess}
                            onError={(err) => alert(err)}
                        />
                    </div>
                )}

                <div className="checkout-summary">
                    <h2 className="checkout-summary-title">Order Summary</h2>
                    {cartItems.map(item => (
                        <div key={item.id} className="summary-item">
                            <div className="summary-item-img">
                                {item.image.startsWith('/') ? <img src={item.image} alt={item.name} /> : <span>{item.image}</span>}
                            </div>
                            <div className="summary-item-name">{item.name} <span>x{item.quantity}</span></div>
                            <div className="summary-item-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
                        </div>
                    ))}
                    <div className="summary-totals">
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>₹{subtotal.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="summary-row">
                            <span>Shipping</span>
                            <span>{shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString('en-IN')}`}</span>
                        </div>
                        <div className="summary-total-row">
                            <span>Total</span>
                            <span>₹{orderTotal.toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
