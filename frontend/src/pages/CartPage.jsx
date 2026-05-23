import React from 'react';
import { useCart } from '../context/CartContext';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';
import './CartPage.css';

const CartPage = () => {
    const { cartItems, updateQuantity, removeFromCart } = useCart();

    const removeItem = (id) => {
        removeFromCart(id);
    };

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 50000 ? 0 : 500;
    const total = subtotal + shipping;

    return (
        <div className="cart-page">
            <SEO
                title="Your Cart"
                description="Review your selected smartphones and accessories before checkout. Free shipping on orders above ₹50,000."
                url="/cart"
                noIndex={true}
            />
            <div className="container">
                <h1 className="cart-title">Review your bag.</h1>

                {cartItems.length === 0 ? (
                    <div className="cart-empty">
                        <div className="cart-empty-icon">🛍️</div>
                        <h2>Your bag is empty.</h2>
                        <p>Sign in to see if you have any saved items.</p>
                        <Link to="/products" className="btn btn-primary btn-lg" style={{ marginTop: '20px' }}>Continue Shopping</Link>
                    </div>
                ) : (
                    <>
                        <div className="cart-items">
                            {cartItems.map(item => (
                                <div key={item.id} className="cart-item">
                                    <div className="cart-item-image">
                                        {item.image.startsWith('/') ? (
                                            <img src={item.image} alt={item.name} />
                                        ) : (
                                            <span style={{ fontSize: '3rem' }}>{item.image}</span>
                                        )}
                                    </div>
                                    <div className="cart-item-details">
                                        <div className="cart-item-brand">{item.brand}</div>
                                        <div className="cart-item-name">{item.name}</div>
                                        <div className="cart-item-price">₹{item.price.toLocaleString('en-IN')}</div>
                                    </div>
                                    <div className="cart-qty-controls">
                                        <button className="qty-btn" onClick={() => updateQuantity(item.id, -1)}>−</button>
                                        <span className="qty-value">{item.quantity}</span>
                                        <button className="qty-btn" onClick={() => updateQuantity(item.id, 1)}>+</button>
                                    </div>
                                    <button className="cart-remove-btn" onClick={() => removeItem(item.id)} title="Remove">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M18 6L6 18M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="cart-summary">
                            <h3 className="cart-summary-title">Order Summary</h3>
                            <div className="cart-summary-row">
                                <span>Subtotal</span>
                                <span>₹{subtotal.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="cart-summary-row">
                                <span>Estimated Shipping</span>
                                <span>{shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString('en-IN')}`}</span>
                            </div>
                            <div className="cart-summary-total">
                                <span>Total</span>
                                <span>₹{total.toLocaleString('en-IN')}</span>
                            </div>
                            <Link to="/checkout" className="checkout-btn">
                                Check Out
                            </Link>
                            <Link to="/products" className="cart-continue-link">
                                Continue Shopping
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CartPage;
