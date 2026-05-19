import React from 'react';
import { useCart } from '../context/CartContext';
import SEO from '../components/SEO';
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
                <h1>Shopping Cart</h1>
                <p className="cart-count">{cartItems.length} items in your cart</p>

                <div className="cart-layout">
                    {/* Cart Items */}
                    <div className="cart-items-section">
                        {cartItems.length === 0 ? (
                            <div className="empty-cart">
                                <span className="empty-icon">🛒</span>
                                <h3>Your cart is empty</h3>
                                <p>Add some products to get started!</p>
                                <a href="/products" className="btn btn-primary">Browse Products</a>
                            </div>
                        ) : (
                            <div className="cart-items-list">
                                {cartItems.map(item => (
                                    <div key={item.id} className="cart-item">
                                        <div className="item-image">
                                            {item.image.startsWith('/') ? (
                                                <img src={item.image} alt={item.name} className="cart-item-img" />
                                            ) : (
                                                <span>{item.image}</span>
                                            )}
                                        </div>
                                        <div className="item-details">
                                            <h3>{item.name}</h3>
                                            {item.isBundle && item.bundleContents && (
                                                <p className="bundle-contents">📦 Includes: {item.bundleContents}</p>
                                            )}
                                            <p className="item-brand">{item.brand}</p>
                                            <p className="item-price">₹{item.price.toLocaleString('en-IN')}</p>
                                        </div>
                                        <div className="item-quantity">
                                            <button onClick={() => updateQuantity(item.id, -1)}>−</button>
                                            <span>{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                                        </div>
                                        <div className="item-total">
                                            <p className="total-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                                            <button className="remove-btn" onClick={() => removeItem(item.id)}>Remove</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Order Summary */}
                    {cartItems.length > 0 && (
                        <div className="order-summary">
                            <h3>Order Summary</h3>
                            <div className="summary-row">
                                <span>Subtotal <small>(incl. GST)</small></span>
                                <span>₹{subtotal.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="summary-row">
                                <span>Shipping</span>
                                <span>{shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString('en-IN')}`}</span>
                            </div>
                            <div className="summary-divider"></div>
                            <div className="summary-row total-row">
                                <span>Total</span>
                                <span>₹{total.toLocaleString('en-IN')}</span>
                            </div>
                            <a href="/checkout" className="btn btn-primary btn-lg checkout-btn">
                                Proceed to Checkout
                            </a>
                            <a href="/products" className="btn btn-outline continue-shopping">
                                Continue Shopping
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CartPage;
