import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getOrderById } from '../api/orderApi';
import './OrderTrackingPage.css';

const OrderTrackingPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user) {
            navigate('/auth');
            return;
        }

        loadOrder();
    }, [user, orderId, navigate]);

    const loadOrder = async () => {
        try {
            setLoading(true);
            const orderData = await getOrderById(orderId);
            setOrder(orderData);
        } catch (err) {
            setError('Order not found or you do not have permission to view it');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: '⏳',
            confirmed: '✅',
            processing: '📦',
            shipped: '🚚',
            delivered: '🎉',
            cancelled: '❌'
        };
        return icons[status] || '📋';
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: '#ffc107',
            confirmed: '#28a745',
            processing: '#17a2b8',
            shipped: '#fd7e14',
            delivered: '#28a745',
            cancelled: '#dc3545'
        };
        return colors[status] || '#6c757d';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="order-tracking-page">
                <div className="container">
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Loading order details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="order-tracking-page">
                <div className="container">
                    <div className="error-state">
                        <span className="error-icon">⚠️</span>
                        <h2>Order Not Found</h2>
                        <p>{error}</p>
                        <button className="btn btn-primary" onClick={() => navigate('/profile')}>
                            Go to Profile
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="order-tracking-page">
            <div className="container">
                <div className="tracking-header">
                    <button className="back-btn" onClick={() => navigate('/profile')}>
                        ← Back to Orders
                    </button>
                    <h1>Order Tracking</h1>
                    <p className="order-id">Order #{order._id}</p>
                </div>

                <div className="tracking-layout">
                    {/* Order Status Timeline */}
                    <div className="status-timeline">
                        <h2>Order Status</h2>
                        <div className="current-status">
                            <span 
                                className="status-icon"
                                style={{ backgroundColor: getStatusColor(order.orderStatus) }}
                            >
                                {getStatusIcon(order.orderStatus)}
                            </span>
                            <div className="status-info">
                                <h3>{order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}</h3>
                                <p>Last updated: {formatDate(order.statusHistory[order.statusHistory.length - 1]?.timestamp)}</p>
                                {order.trackingNumber && (
                                    <p className="tracking-number">
                                        <strong>Tracking Number:</strong> {order.trackingNumber}
                                    </p>
                                )}
                                {order.estimatedDelivery && (
                                    <p className="estimated-delivery">
                                        <strong>Estimated Delivery:</strong> {formatDate(order.estimatedDelivery)}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="timeline">
                            <h3>Order Timeline</h3>
                            <div className="timeline-items">
                                {order.statusHistory.map((status, index) => (
                                    <div key={index} className="timeline-item">
                                        <div className="timeline-marker">
                                            <span 
                                                className="marker-icon"
                                                style={{ backgroundColor: getStatusColor(status.status) }}
                                            >
                                                {getStatusIcon(status.status)}
                                            </span>
                                        </div>
                                        <div className="timeline-content">
                                            <h4>{status.status.charAt(0).toUpperCase() + status.status.slice(1)}</h4>
                                            <p className="timeline-note">{status.note}</p>
                                            <p className="timeline-date">{formatDate(status.timestamp)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Order Details */}
                    <div className="order-details">
                        <div className="details-section">
                            <h3>Order Information</h3>
                            <div className="info-grid">
                                <div className="info-item">
                                    <label>Order Date</label>
                                    <span>{formatDate(order.createdAt)}</span>
                                </div>
                                <div className="info-item">
                                    <label>Payment Method</label>
                                    <span>{order.paymentMethod}</span>
                                </div>
                                <div className="info-item">
                                    <label>Payment Status</label>
                                    <span className={order.isPaid ? 'paid' : 'unpaid'}>
                                        {order.isPaid ? 'Paid' : 'Pending'}
                                    </span>
                                </div>
                                <div className="info-item">
                                    <label>Total Amount</label>
                                    <span className="amount">₹{order.totalPrice.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="details-section">
                            <h3>Shipping Address</h3>
                            <div className="address-card">
                                <p>{order.shippingAddress.address}</p>
                                <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                                <p>{order.shippingAddress.country}</p>
                            </div>
                        </div>

                        <div className="details-section">
                            <h3>Order Items</h3>
                            <div className="order-items">
                                {order.orderItems.map((item, index) => (
                                    <div key={index} className="order-item">
                                        <div className="item-image">
                                            {item.image.startsWith('/') ? (
                                                <img src={item.image} alt={item.name} />
                                            ) : (
                                                <span className="item-emoji">{item.image}</span>
                                            )}
                                        </div>
                                        <div className="item-info">
                                            <h4>{item.name}</h4>
                                            <p>Quantity: {item.qty}</p>
                                            <p className="item-price">₹{item.price.toLocaleString()}</p>
                                        </div>
                                        <div className="item-total">
                                            ₹{(item.price * item.qty).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="details-section">
                            <h3>Order Summary</h3>
                            <div className="order-summary">
                                <div className="summary-row">
                                    <span>Items Price</span>
                                    <span>₹{order.itemsPrice?.toLocaleString() || (order.totalPrice - order.taxPrice - order.shippingPrice).toLocaleString()}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Shipping</span>
                                    <span>{order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice.toLocaleString()}`}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Tax</span>
                                    <span>₹{order.taxPrice.toLocaleString()}</span>
                                </div>
                                {order.discountAmount > 0 && (
                                    <div className="summary-row discount-row">
                                        <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                                        <span>-₹{order.discountAmount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="summary-row total-row">
                                    <span>Total</span>
                                    <span>₹{order.totalPrice.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="order-actions">
                            {order.orderStatus === 'pending' && (
                                <button className="btn btn-outline">
                                    Cancel Order
                                </button>
                            )}
                            <button className="btn btn-primary" onClick={() => navigate('/products')}>
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderTrackingPage;
