import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyOrders } from '../api/orderApi';
import SEO from '../components/SEO';
import './ProfilePage.css';

const ProfilePage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    
    useEffect(() => {
        if (!user) {
            navigate('/auth');
            return;
        }
        getMyOrders().then(setOrders).catch(console.error);
    }, [user, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!user) return null;

    return (
        <div className="profile-page">
            <SEO title="My Account | OBSIDIAN TECH" />
            
            <div className="profile-header">
                <div className="profile-avatar">{user.name.charAt(0)}</div>
                <div>
                    <h1 className="profile-name">{user.name}</h1>
                    <div className="profile-email">{user.email}</div>
                </div>
            </div>

            <div className="profile-container">
                <div className="profile-card">
                    <div className="profile-card-header">
                        <span className="profile-card-title">Personal Information</span>
                        <button className="profile-logout-btn" onClick={handleLogout}>Sign Out</button>
                    </div>
                    <div className="profile-card-body">
                        <div className="profile-field">
                            <label className="profile-label">Name</label>
                            <input type="text" className="profile-input" value={user.name} disabled />
                        </div>
                        <div className="profile-field">
                            <label className="profile-label">Email</label>
                            <input type="email" className="profile-input" value={user.email} disabled />
                        </div>
                    </div>
                </div>

                <div className="profile-card">
                    <div className="profile-card-header">
                        <span className="profile-card-title">Recent Orders</span>
                    </div>
                    <div className="profile-card-body" style={{ padding: '0 24px' }}>
                        {orders.length === 0 ? (
                            <p style={{ padding: '24px 0', color: '#6e6e73' }}>You have no recent orders.</p>
                        ) : (
                            orders.map(order => (
                                <div key={order._id} className="order-row">
                                    <div className="order-id">#{order._id.substring(0, 8)}</div>
                                    <div className="order-date">{new Date(order.createdAt).toLocaleDateString('en-IN')}</div>
                                    <div className="order-amount">₹{order.totalPrice.toLocaleString('en-IN')}</div>
                                    <div className={`order-status ${order.orderStatus}`}>
                                        {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                                    </div>
                                    <button 
                                        className="profile-save-btn" 
                                        style={{ padding: '6px 14px', fontSize: '0.8125rem' }}
                                        onClick={() => navigate(`/order-tracking/${order._id}`)}
                                    >
                                        Track
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
