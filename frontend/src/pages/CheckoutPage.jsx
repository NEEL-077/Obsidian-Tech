import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder, payOrder } from '../api/orderApi';
import { validateCoupon } from '../api/couponApi';
import PaymentGateway from '../components/PaymentGateway';
import './CheckoutPage.css';
import '../components/PaymentGateway.css';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { cartItems, clearCart } = useCart();
    const { user } = useAuth();

    useEffect(() => {
        if (!user) {
            navigate('/auth');
        } else if (cartItems.length === 0) {
            navigate('/cart');
        }
    }, [user, cartItems, navigate]);

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 50000 ? 0 : 500;
    const tax = 0;
    
    // Coupon state
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponError, setCouponError] = useState('');
    
    // GST state
    const [gstNumber, setGstNumber] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [gstError, setGstError] = useState('');
    const [gstSaved, setGstSaved] = useState(false);

    const validateGST = (gst) => {
        const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        return gstRegex.test(gst);
    };

    const handleSaveGST = () => {
        if (!gstNumber.trim()) {
            setGstError('Please enter a GST number');
            return;
        }
        if (!validateGST(gstNumber)) {
            setGstError('Invalid GSTIN format (e.g., 22AAAAA0000A1Z5)');
            return;
        }
        if (!businessName.trim()) {
            setGstError('Please enter business name');
            return;
        }
        setGstError('');
        setGstSaved(true);
    };

    const handleRemoveGST = () => {
        setGstSaved(false);
        setGstNumber('');
        setBusinessName('');
        setGstError('');
    };
    
    // Calculate totals with coupon
    const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
    const orderTotal = subtotal + shipping + tax - discountAmount;

    // Checkout steps
    const [currentStep, setCurrentStep] = useState(1); // 1: Details, 2: Payment
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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            setCouponError('Please enter a coupon code');
            return;
        }

        setCouponLoading(true);
        setCouponError('');

        try {
            const cartItemsForValidation = cartItems.map(item => ({
                category: item.category || 'phones',
                brand: item.brand,
                price: item.price,
                quantity: item.quantity
            }));

            const couponData = {
                code: couponCode,
                orderAmount: subtotal,
                cartItems: cartItemsForValidation
            };

            const result = await validateCoupon(couponData);
            setAppliedCoupon(result);
            setCouponError('');
        } catch (error) {
            setCouponError(error.response?.data?.message || 'Invalid coupon code');
            setAppliedCoupon(null);
        } finally {
            setCouponLoading(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        setCouponError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user || !user.token) {
            alert('Session expired or user not logged in. Please sign in again.');
            navigate('/auth');
            return;
        }

        try {
            const orderItems = cartItems.map(item => ({
                name: item.name,
                qty: item.quantity,
                image: item.image || '📱',
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
                taxPrice: tax,
                shippingPrice: shipping,
                totalPrice: orderTotal,
                couponCode: appliedCoupon ? appliedCoupon.coupon.code : null,
                discountAmount: discountAmount,
                gstNumber: gstSaved ? gstNumber : null,
                businessName: gstSaved ? businessName : null
            };

            const order = await createOrder(orderData);
            setCreatedOrder(order);
            setCurrentStep(2); // Move to payment step
        } catch (error) {
            alert('Error creating order: ' + (error.response?.data?.message || error.message));
        }
    };

    const handlePaymentSuccess = async (paymentResult) => {
        try {
            await payOrder(createdOrder._id, paymentResult);
            clearCart();
            alert('Order placed and payment successful!');
            navigate('/profile');
        } catch (error) {
            alert('Payment verification failed: ' + (error.response?.data?.message || error.message));
        }
    };

    const handlePaymentError = (error) => {
        alert('Payment failed: ' + error);
    };

    return (
        <div className="checkout-page">
            <div className="container">
                <div className="checkout-header">
                    <h1>Checkout</h1>
                    <div className="checkout-steps">
                        <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
                            <span className="step-number">1</span>
                            <span className="step-label">Details</span>
                        </div>
                        <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
                            <span className="step-number">2</span>
                            <span className="step-label">Payment</span>
                        </div>
                    </div>
                </div>

                {currentStep === 1 && (
                    <div className="checkout-layout">
                    {/* Checkout Form */}
                    <div className="checkout-form-section">
                        <form onSubmit={handleSubmit}>
                            {/* Shipping Information */}
                            <div className="form-section">
                                <h2>Shipping Information</h2>
                                <div className="form-grid">
                                    <div className="form-group full-width">
                                        <label>Full Name *</label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            required
                                            placeholder="Enter your full name"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone *</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                            placeholder="+91 XXXXX XXXXX"
                                        />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Address *</label>
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            required
                                            placeholder="Street address, apartment, suite, etc."
                                            rows="3"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>City *</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            required
                                            placeholder="City"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>State *</label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            required
                                            placeholder="State"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Pincode *</label>
                                        <input
                                            type="text"
                                            name="pincode"
                                            value={formData.pincode}
                                            onChange={handleChange}
                                            required
                                            placeholder="000000"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Coupon Section */}
                            <div className="form-section">
                                <h2>Discount Code</h2>
                                <div className="coupon-section">
                                    {!appliedCoupon ? (
                                        <div className="coupon-input-group">
                                            <input
                                                type="text"
                                                placeholder="Enter coupon code"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                className="coupon-input"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleApplyCoupon}
                                                disabled={couponLoading}
                                                className="btn btn-outline apply-coupon-btn"
                                            >
                                                {couponLoading ? 'Applying...' : 'Apply'}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="applied-coupon">
                                            <div className="coupon-success">
                                                <span className="coupon-icon">🎉</span>
                                                <div className="coupon-details">
                                                    <strong>{appliedCoupon.coupon.code}</strong>
                                                    <p>{appliedCoupon.coupon.description}</p>
                                                    <p className="discount-amount">You saved ₹{appliedCoupon.discountAmount.toLocaleString()}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveCoupon}
                                                    className="remove-coupon-btn"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {couponError && (
                                        <div className="coupon-error">
                                            <span className="error-icon">⚠️</span>
                                            {couponError}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* GST Section */}
                            <div className="form-section">
                                <h2>GST Details (Optional)</h2>
                                <div className="gst-section">
                                    {!gstSaved ? (
                                        <div className="gst-input-grid">
                                            <div className="form-group full-width">
                                                <input
                                                    type="text"
                                                    placeholder="Business Name"
                                                    value={businessName}
                                                    onChange={(e) => setBusinessName(e.target.value)}
                                                    className="gst-input"
                                                />
                                            </div>
                                            <div className="gst-input-group">
                                                <input
                                                    type="text"
                                                    placeholder="GST Number (GSTIN)"
                                                    value={gstNumber}
                                                    onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                                                    className="gst-input"
                                                    maxLength={15}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleSaveGST}
                                                    className="btn btn-outline save-gst-btn"
                                                >
                                                    Save
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="applied-gst">
                                            <div className="gst-success">
                                                <span className="gst-icon">🏢</span>
                                                <div className="gst-details">
                                                    <strong>{businessName}</strong>
                                                    <p>GSTIN: {gstNumber}</p>
                                                    <p className="gst-benefit-text">GST Invoice will be generated for this business.</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveGST}
                                                    className="remove-gst-btn"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {gstError && (
                                        <div className="gst-error">
                                            <span className="error-icon">⚠️</span>
                                            {gstError}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="form-section">
                                <h2>Payment Method</h2>
                                <div className="payment-methods">
                                    <label className="payment-option">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="card"
                                            checked={formData.paymentMethod === 'card'}
                                            onChange={handleChange}
                                        />
                                        <div className="payment-content">
                                            <span className="payment-icon">💳</span>
                                            <div>
                                                <strong>Credit/Debit Card</strong>
                                                <p>Pay securely with your card</p>
                                            </div>
                                        </div>
                                    </label>
                                    <label className="payment-option">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="upi"
                                            checked={formData.paymentMethod === 'upi'}
                                            onChange={handleChange}
                                        />
                                        <div className="payment-content">
                                            <span className="payment-icon">📱</span>
                                            <div>
                                                <strong>UPI</strong>
                                                <p>Pay using UPI apps</p>
                                            </div>
                                        </div>
                                    </label>
                                    <label className="payment-option">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="cod"
                                            checked={formData.paymentMethod === 'cod'}
                                            onChange={handleChange}
                                        />
                                        <div className="payment-content">
                                            <span className="payment-icon">💵</span>
                                            <div>
                                                <strong>Cash on Delivery</strong>
                                                <p>Pay when you receive</p>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary btn-lg place-order-btn">
                                Continue to Payment - ₹{orderTotal.toLocaleString('en-IN')}
                            </button>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="checkout-summary">
                        <h3>Order Summary</h3>
                        <div className="summary-items">
                            {cartItems.map(item => (
                                <div key={item.id || item._id} className="summary-item">
                                    <span className="item-emoji">{item.image.startsWith('/') ? <img src={item.image} alt={item.name} style={{ width: '30px', height: '30px', objectFit: 'cover' }} /> : item.image}</span>
                                    <div className="item-info">
                                        <h4>{item.name}</h4>
                                        <p>Qty: {item.quantity}</p>
                                    </div>
                                    <span className="item-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                                </div>
                            ))}
                        </div>
                        <div className="summary-divider"></div>
                        <div className="summary-totals">
                            <div className="summary-row">
                                <span>Subtotal <small>(incl. GST)</small></span>
                                <span>₹{subtotal.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="summary-row">
                                <span>Shipping</span>
                                <span className={shipping === 0 ? "free-shipping" : ""}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                            </div>
                            {appliedCoupon && (
                                <div className="summary-row discount-row">
                                    <span>Discount ({appliedCoupon.coupon.code})</span>
                                    <span className="discount-amount">-₹{discountAmount.toLocaleString('en-IN')}</span>
                                </div>
                            )}
                            {gstSaved && (
                                <div className="summary-row gst-row">
                                    <div className="gst-summary-info">
                                        <span>GST Details</span>
                                        <small>{businessName} ({gstNumber})</small>
                                    </div>
                                    <span className="gst-badge">Applied</span>
                                </div>
                            )}
                            <div className="summary-row total-row">
                                <span>Total</span>
                                <span>₹{orderTotal.toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    </div>
                </div>
                )}

                {currentStep === 2 && createdOrder && (
                    <div className="payment-step">
                        <div className="payment-header">
                            <button 
                                className="back-btn"
                                onClick={() => setCurrentStep(1)}
                            >
                                ← Back to Details
                            </button>
                            <h2>Complete Payment</h2>
                            <p>Order #{createdOrder._id} created successfully</p>
                        </div>

                        <PaymentGateway
                            orderData={{
                                ...createdOrder,
                                userName: user.name,
                                userEmail: user.email
                            }}
                            onSuccess={handlePaymentSuccess}
                            onError={handlePaymentError}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default CheckoutPage;
