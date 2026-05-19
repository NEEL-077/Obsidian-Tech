import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getMyOrders } from '../api/orderApi';
import {
    getUserWishlist,
    removeFromWishlist,
    addUserAddress,
    updateUserAddress,
    deleteUserAddress,
    updateUserProfile
} from '../api/userApi';

// Profile Modules
import ProfileSidebar from '../components/profile/ProfileSidebar';
import ProfileOverview from '../components/profile/ProfileOverview';
import OrdersModule from '../components/profile/OrdersModule';
import ReturnsModule from '../components/profile/ReturnsModule';
import AddressModule from '../components/profile/AddressModule';
import PaymentsModule from '../components/profile/PaymentsModule';
import GSTModule from '../components/profile/GSTModule';
import SecurityModule from '../components/profile/SecurityModule';
import NotificationsModule from '../components/profile/NotificationsModule';
import WishlistModule from '../components/profile/WishlistModule';
import SupportModule from '../components/profile/SupportModule';

// Mock Data
import {
    mockReturns,
    mockPayments,
    mockTickets,
    mockGstDetails,
    mockNotifications,
    mockUpiIds,
    mockSessions
} from '../utils/mockProfileData';

import './ProfilePage.css';
import SEO from '../components/SEO';

const ProfilePage = () => {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();

    // UI State
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Data State (Real + Mock)
    const [orders, setOrders] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [returns, setReturns] = useState(mockReturns);

    // Persistent Payments State
    const [payments, setPayments] = useState(() => {
        const saved = localStorage.getItem('profile_payments');
        if (saved) return JSON.parse(saved);
        return mockPayments.map(p => ({ ...p, name: user?.name || 'User' }));
    });

    // Persistent UPI State
    const [upiIds, setUpiIds] = useState(() => {
        const saved = localStorage.getItem('profile_upi_ids');
        if (saved) return JSON.parse(saved);
        const handle = user?.email?.includes('@') ? user.email.split('@')[0] : 'user';
        return mockUpiIds.map((u, i) => i === 0 ? { ...u, value: `${handle}@okaxis` } : u);
    });
    const [tickets, setTickets] = useState(mockTickets);

    // Security State (Derived from user object)
    const is2FAEnabled = user?.twoFactorEnabled || false;
    const [activeSessions, setActiveSessions] = useState(() => {
        const saved = localStorage.getItem('profile_sessions');
        if (saved) return JSON.parse(saved);
        return mockSessions;
    });

    const loadUserData = useCallback(async (isRefresh = false) => {
        if (!isRefresh) setLoading(true);
        else setRefreshing(true);

        try {
            const [ordersData, wishlistData] = await Promise.all([
                getMyOrders().catch(() => []),
                getUserWishlist().catch(() => [])
            ]);

            setOrders(ordersData);
            setWishlist(wishlistData);
            
            // Sync User Profile from Server for live state (e.g. 2FA)
            await updateUser();
        } catch (err) {
            console.error('Failed to load profile data:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [updateUser]); // Depend on updateUser for live sync

    useEffect(() => {
        if (!user) {
            navigate('/auth');
            return;
        }
        loadUserData();
    }, [user, navigate, loadUserData]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Generic Handlers (to be passed to modules)
    const handleAddAddress = async (data) => {
        try {
            await addUserAddress(data);
            await updateUser();
            alert('Address added successfully!');
        } catch (err) {
            alert('Failed to add address');
        }
    };

    const handleDeleteAddress = async (id) => {
        if (window.confirm('Delete this address?')) {
            try {
                await deleteUserAddress(id);
                await updateUser();
            } catch (err) {
                alert('Failed to delete address');
            }
        }
    };

    const handleRemoveWishlist = async (id) => {
        try {
            await removeFromWishlist(id);
            setWishlist(prev => prev.filter(item => item.productId !== id));
        } catch (err) {
            alert('Failed to remove from wishlist');
        }
    };

    const renderActiveModule = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <ProfileOverview
                        user={user}
                        activeOrders={orders}
                        wishlistCount={wishlist.length}
                        onTabChange={setActiveTab}
                    />
                );
            case 'orders':
                return (
                    <OrdersModule
                        orders={orders}
                        loading={loading}
                        onTrackOrder={(id) => navigate(`/order-tracking/${id}`)}
                        onNavigate={navigate}
                    />
                );
            case 'returns':
                return (
                    <ReturnsModule
                        returns={returns}
                        onInitiateReturn={() => alert('Return system is being integrated. Please contact support.')}
                    />
                );
            case 'addresses':
                return (
                    <AddressModule
                        addresses={user.addresses || []}
                        onAddAddress={handleAddAddress}
                        onDeleteAddress={handleDeleteAddress}
                        onSetDefault={(id) => console.log('Set default:', id)}
                    />
                );
            case 'payments':
                return (
                    <PaymentsModule
                        user={user}
                        payments={payments}
                        upiIds={upiIds}
                        onDeletePayment={(id) => {
                            const updated = payments.filter(p => p.id !== id);
                            setPayments(updated);
                            localStorage.setItem('profile_payments', JSON.stringify(updated));
                        }}
                        onDeleteUPI={(id) => {
                            const updated = upiIds.filter(u => u.id !== id);
                            setUpiIds(updated);
                            localStorage.setItem('profile_upi_ids', JSON.stringify(updated));
                        }}
                        onAddPayment={() => alert('Payment gateway integration coming soon.')}
                    />
                );
            case 'security':
                return (
                    <SecurityModule
                        user={user}
                        is2FAEnabled={is2FAEnabled}
                        onRefreshUser={loadUserData}
                        sessions={activeSessions}
                        onLogoutSession={(id) => {
                            const updated = activeSessions.filter(s => s.id !== id);
                            setActiveSessions(updated);
                            localStorage.setItem('profile_sessions', JSON.stringify(updated));
                        }}
                        onLogout={handleLogout}
                    />
                );
            case 'notifications':
                return (
                    <NotificationsModule
                        preferences={mockNotifications}
                    />
                );
            case 'wishlist':
                return (
                    <WishlistModule
                        wishlist={wishlist}
                        onRemove={handleRemoveWishlist}
                        onMoveToCart={(id) => console.log('Move to cart:', id)}
                        onNavigate={navigate}
                    />
                );
            case 'support':
                return (
                    <SupportModule
                        tickets={tickets}
                        onRaiseTicket={() => alert('New ticket form coming soon.')}
                    />
                );
            default:
                return <ProfileOverview user={user} activeOrders={orders} wishlistCount={wishlist.length} onTabChange={setActiveTab} />;
        }
    };

    if (!user) return null;

    return (
        <div className="profile-page">
            <SEO
                title={`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} | My Account | OBSIDIAN TECH`}
                description="Manage your orders, addresses, payment methods, and account security at OBSIDIAN TECH."
                url="/profile"
            />

            <div className="container">
                {/* Dashboard Layout */}
                <div className="profile-layout-v2">
                    {/* Persistent Sidebar */}
                    <ProfileSidebar
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        onLogout={handleLogout}
                        user={user}
                    />

                    {/* Dynamic Content Area */}
                    <main className="profile-content-area">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {renderActiveModule()}
                            </motion.div>
                        </AnimatePresence>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
