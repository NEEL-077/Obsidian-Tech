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

    useEffect(() => {
        if (!user) navigate('/auth');
        else {
            getOrderById(orderId)
                .then(data => setOrder(data))
                .catch(() => navigate('/profile'))
                .finally(() => setLoading(false));
        }
    }, [user, orderId, navigate]);

    if (loading || !order) return <div style={{ color: '#f5f5f7', textAlign: 'center', padding: '100px' }}>Loading...</div>;

    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <div className="order-tracking-page">
            <div className="container">
                <h1 className="tracking-title">Track your order.</h1>
                
                <div className="tracking-card">
                    <div className="tracking-card-header">
                        <div className="tracking-order-id">Order {order._id}</div>
                        <div className="tracking-date">{formatDate(order.createdAt)}</div>
                    </div>
                    
                    <div className="tracking-card-body">
                        <div className="tracking-steps">
                            <div className="tracking-step done">
                                <div className="tracking-step-dot">✓</div>
                                <div className="tracking-step-label">Placed</div>
                            </div>
                            <div className={`tracking-step ${order.orderStatus === 'processing' || order.orderStatus === 'shipped' || order.orderStatus === 'delivered' ? 'done' : order.orderStatus === 'confirmed' ? 'active' : ''}`}>
                                <div className="tracking-step-dot"></div>
                                <div className="tracking-step-label">Confirmed</div>
                            </div>
                            <div className={`tracking-step ${order.orderStatus === 'shipped' || order.orderStatus === 'delivered' ? 'done' : order.orderStatus === 'processing' ? 'active' : ''}`}>
                                <div className="tracking-step-dot"></div>
                                <div className="tracking-step-label">Processing</div>
                            </div>
                            <div className={`tracking-step ${order.orderStatus === 'delivered' ? 'done' : order.orderStatus === 'shipped' ? 'active' : ''}`}>
                                <div className="tracking-step-dot"></div>
                                <div className="tracking-step-label">Shipped</div>
                            </div>
                            <div className={`tracking-step ${order.orderStatus === 'delivered' ? 'done' : ''}`}>
                                <div className="tracking-step-dot"></div>
                                <div className="tracking-step-label">Delivered</div>
                            </div>
                        </div>

                        <div className="tracking-items">
                            {order.orderItems.map((item, idx) => (
                                <div key={idx} className="tracking-item">
                                    <div className="tracking-item-img">
                                        {item.image.startsWith('/') ? <img src={item.image} alt={item.name} /> : <span>{item.image}</span>}
                                    </div>
                                    <div className="tracking-item-name">{item.name}</div>
                                    <div className="tracking-item-qty">Qty: {item.qty}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderTrackingPage;
