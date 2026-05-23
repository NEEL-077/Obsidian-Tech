import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getOrderById } from '../api/orderApi';
import InvoiceModal from '../components/ui/InvoiceModal';
import './OrderTrackingPage.css';

const OrderTrackingPage = () => {
    const { orderId: routeOrderId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

    useEffect(() => {
        if (!user) navigate('/auth');
        else {
            getOrderById(routeOrderId)
                .then(data => setOrder(data))
                .catch(() => navigate('/profile'))
                .finally(() => setLoading(false));
        }
    }, [user, routeOrderId, navigate]);

    if (loading || !order) return <div style={{ color: '#f5f5f7', textAlign: 'center', padding: '100px' }}>Loading...</div>;

    const orderId = order._id || order.id || '';
    const orderDate = order.createdAt || order.created_at || new Date().toISOString();
    const orderStatus = (order.orderStatus || order.order_status || 'Pending').toLowerCase();

    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <div className="order-tracking-page">
            <div className="container">
                <h1 className="tracking-title">Track your order.</h1>
                
                <div className="tracking-card">
                    <div className="tracking-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                            <div className="tracking-order-id">Order {orderId}</div>
                            <div className="tracking-date">{formatDate(orderDate)}</div>
                        </div>
                        <button 
                            style={{ 
                                padding: '8px 18px', 
                                fontSize: '0.8125rem',
                                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                                border: 'none',
                                color: '#ffffff',
                                borderRadius: '8px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                            onClick={() => setIsInvoiceOpen(true)}
                        >
                            📄 View Invoice
                        </button>
                    </div>
                    
                    <div className="tracking-card-body">
                        <div className="tracking-steps">
                            <div className="tracking-step done">
                                <div className="tracking-step-dot">✓</div>
                                <div className="tracking-step-label">Placed</div>
                            </div>
                            <div className={`tracking-step ${['confirmed', 'processing', 'shipped', 'delivered'].includes(orderStatus) ? 'done' : orderStatus === 'pending' ? 'active' : ''}`}>
                                <div className="tracking-step-dot"></div>
                                <div className="tracking-step-label">Confirmed</div>
                            </div>
                            <div className={`tracking-step ${['processing', 'shipped', 'delivered'].includes(orderStatus) ? 'done' : orderStatus === 'confirmed' ? 'active' : ''}`}>
                                <div className="tracking-step-dot"></div>
                                <div className="tracking-step-label">Processing</div>
                            </div>
                            <div className={`tracking-step ${['shipped', 'delivered'].includes(orderStatus) ? 'done' : orderStatus === 'processing' ? 'active' : ''}`}>
                                <div className="tracking-step-dot"></div>
                                <div className="tracking-step-label">Shipped</div>
                            </div>
                            <div className={`tracking-step ${orderStatus === 'delivered' ? 'done' : orderStatus === 'shipped' ? 'active' : ''}`}>
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

            {/* Glassmorphic Invoice PDF Print Modal Overlay */}
            <InvoiceModal 
                isOpen={isInvoiceOpen} 
                onClose={() => setIsInvoiceOpen(false)} 
                order={order} 
            />
        </div>
    );
};

export default OrderTrackingPage;
