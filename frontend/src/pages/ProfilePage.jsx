import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyOrders } from '../api/orderApi';
import { updateUserProfile, getUserWishlist, removeFromWishlist } from '../api/userApi';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';
import SEO from '../components/SEO';
import InvoiceModal from '../components/ui/InvoiceModal';
import './ProfilePage.css';

const ProfilePage = () => {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { addToCart } = useCart();
    
    const [orders, setOrders] = useState([]);
    const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
    
    // View state: 'menu', 'orders', 'security', 'addresses', 'settings', 'reviews', 'communication', 'prime', 'wishlist'
    const [currentView, setCurrentView] = useState('menu');
    
    // Profile Edit states
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [saving, setSaving] = useState(false);

    // ── Wishlist State ──
    const [wishlist, setWishlist] = useState([]);
    const [wishlistLoading, setWishlistLoading] = useState(false);

    // ── Local Storage Address State ──
    const [addresses, setAddresses] = useState(() => {
        if (!user) return [];
        const stored = localStorage.getItem(`addresses_${user._id}`);
        return stored ? JSON.parse(stored) : [
            { id: '1', fullName: user.name || 'Valued Customer', phone: '9876543210', address: '77 Obsidian Hub, Silicon Boulevard', city: 'Mumbai', pincode: '400001', state: 'Maharashtra', isDefault: true }
        ];
    });

    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [addressForm, setAddressForm] = useState({
        fullName: '',
        phone: '',
        address: '',
        city: '',
        pincode: '',
        state: '',
        isDefault: false
    });

    // ── Local Storage Default Purchase Settings State ──
    const [purchaseSettings, setPurchaseSettings] = useState(() => {
        if (!user) return {};
        const stored = localStorage.getItem(`purchaseSettings_${user._id}`);
        return stored ? JSON.parse(stored) : {
            paymentMethod: 'card',
            shippingSpeed: 'express',
            oneClickOrdering: false
        };
    });

    // ── Local Storage Communication Preferences State ──
    const [commPrefs, setCommPrefs] = useState(() => {
        if (!user) return {};
        const stored = localStorage.getItem(`commPrefs_${user._id}`);
        return stored ? JSON.parse(stored) : {
            emails: true,
            sms: false,
            securityAlerts: true,
            promos: true
        };
    });

    // ── Review Your Purchases State ──
    const [reviewedProducts, setReviewedProducts] = useState(() => {
        if (!user) return {};
        const stored = localStorage.getItem(`reviewedProducts_${user._id}`);
        return stored ? JSON.parse(stored) : {};
    });

    const [activeFeedback, setActiveFeedback] = useState({});

    // ── Hardware Ecosystem Diagnostics State ──
    const [diagnosticsRunning, setDiagnosticsRunning] = useState(false);
    const [diagnosticsProgress, setDiagnosticsProgress] = useState(0);
    const [diagnosticsStatus, setDiagnosticsStatus] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/auth');
            return;
        }
        setEditName(user.name || '');
        setEditEmail(user.email || '');
        getMyOrders().then(setOrders).catch(console.error);
        loadWishlistData();
    }, [user, navigate]);

    // Save Addresses to LocalStorage when changed
    useEffect(() => {
        if (user && addresses.length > 0) {
            localStorage.setItem(`addresses_${user._id}`, JSON.stringify(addresses));
        }
    }, [addresses, user]);

    if (!user) return null;

    // Load Wishlist data with secure fallback
    const loadWishlistData = async () => {
        setWishlistLoading(true);
        try {
            const data = await getUserWishlist();
            setWishlist(data || []);
        } catch (err) {
            console.error('Error loading wishlist API:', err.message);
            const stored = localStorage.getItem(`wishlist_${user._id}`);
            if (stored) {
                setWishlist(JSON.parse(stored));
            } else {
                const initialWishlist = [
                    { _id: 'i17pm', name: 'iPhone 17 Pro Max', price: 159900, image: '/images/heroes/i17pm.png' },
                    { _id: 'tabs9', name: 'Galaxy Tab S10 Ultra', price: 108999, image: '/images/products/tabs9.png' }
                ];
                setWishlist(initialWishlist);
                localStorage.setItem(`wishlist_${user._id}`, JSON.stringify(initialWishlist));
            }
        } finally {
            setWishlistLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        showToast('Logged out successfully', 'success');
        navigate('/');
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (!editName.trim() || !editEmail.trim()) {
            showToast('Name and Email cannot be empty', 'error');
            return;
        }
        
        setSaving(true);
        try {
            await updateUserProfile({ name: editName, email: editEmail });
            await updateUser();
            setIsEditing(false);
            showToast('Account details updated successfully!', 'success');
        } catch (error) {
            showToast(error.response?.data?.message || error.message || 'Error updating details', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Address Actions
    const handleAddAddress = (e) => {
        e.preventDefault();
        const newAddress = {
            id: Date.now().toString(),
            fullName: addressForm.fullName,
            phone: addressForm.phone,
            address: addressForm.address,
            city: addressForm.city,
            pincode: addressForm.pincode,
            state: addressForm.state,
            isDefault: addressForm.isDefault || addresses.length === 0
        };

        let updated = [...addresses];
        if (newAddress.isDefault) {
            updated = updated.map(a => ({ ...a, isDefault: false }));
        }
        updated.push(newAddress);
        setAddresses(updated);
        setIsAddingAddress(false);
        setAddressForm({ fullName: '', phone: '', address: '', city: '', pincode: '', state: '', isDefault: false });
        showToast('Delivery Address saved successfully!', 'success');
    };

    const handleDeleteAddress = (id) => {
        const addressToDelete = addresses.find(a => a.id === id);
        let updated = addresses.filter(a => a.id !== id);
        if (addressToDelete?.isDefault && updated.length > 0) {
            updated[0].isDefault = true;
        }
        setAddresses(updated);
        showToast('Address deleted successfully!', 'success');
    };

    const handleSetDefaultAddress = (id) => {
        const updated = addresses.map(a => ({
            ...a,
            isDefault: a.id === id
        }));
        setAddresses(updated);
        showToast('Primary delivery address updated!', 'success');
    };

    // Purchase Settings Actions
    const handleSavePurchaseSettings = (e) => {
        e.preventDefault();
        localStorage.setItem(`purchaseSettings_${user._id}`, JSON.stringify(purchaseSettings));
        showToast('Default purchase settings saved!', 'success');
    };

    // Communication Preferences Actions
    const handleSaveCommPrefs = (e) => {
        e.preventDefault();
        localStorage.setItem(`commPrefs_${user._id}`, JSON.stringify(commPrefs));
        showToast('Communication parameters updated!', 'success');
    };

    // Review Actions
    const handleReviewSubmit = (productId, rating) => {
        const feedbackText = activeFeedback[productId] || '';
        const updated = {
            ...reviewedProducts,
            [productId]: { rating, feedback: feedbackText, timestamp: new Date().toISOString() }
        };
        setReviewedProducts(updated);
        localStorage.setItem(`reviewedProducts_${user._id}`, JSON.stringify(updated));
        showToast('✨ Feedback submitted! Thank you for reviewing.', 'success');
    };

    // Wishlist Actions
    const handleRemoveWishlist = async (productId) => {
        try {
            await removeFromWishlist(productId);
            setWishlist(wishlist.filter(p => p._id !== productId && p.id !== productId));
        } catch (err) {
            const updated = wishlist.filter(p => p._id !== productId && p.id !== productId);
            setWishlist(updated);
            localStorage.setItem(`wishlist_${user._id}`, JSON.stringify(updated));
        }
        showToast('Product removed from Wishlist', 'info');
    };

    const handleAddWishlistToCart = (product) => {
        addToCart({
            id: product._id || product.id,
            name: product.name,
            price: product.price,
            image: product.image || product.image_url || '/placeholder-phone.svg',
            quantity: 1
        });
        showToast(`${product.name} added to your active Shopping Cart!`, 'success');
    };

    // Diagnostics Sync Actions
    const runEcosystemDiagnostics = () => {
        if (diagnosticsRunning) return;
        setDiagnosticsRunning(true);
        setDiagnosticsProgress(0);
        setDiagnosticsStatus('Initializing node handshakes...');

        const phases = [
            { prog: 20, text: 'Mapping smart ecosystem devices...' },
            { prog: 50, text: 'Analyzing mesh network signal latency...' },
            { prog: 75, text: 'Checking firmware integrity logs...' },
            { prog: 100, text: 'Ecosystem diagnostics optimized!' }
        ];

        phases.forEach((phase, index) => {
            setTimeout(() => {
                setDiagnosticsProgress(phase.prog);
                setDiagnosticsStatus(phase.text);
                if (phase.prog === 100) {
                    setTimeout(() => {
                        setDiagnosticsRunning(false);
                        showToast('✨ Mesh optimization complete! Sync is fully stable.', 'success');
                    }, 500);
                }
            }, (index + 1) * 600);
        });
    };

    // Extract unique purchased products from all completed orders
    const purchasedProducts = useMemo(() => {
        const itemsMap = new Map();
        orders.forEach(o => {
            const items = o.orderItems || o.order_items || [];
            items.forEach(item => {
                const prodId = item.product || item.product_id;
                if (prodId && !itemsMap.has(prodId)) {
                    itemsMap.set(prodId, { id: prodId, name: item.name, image: item.image || item.image_url });
                }
            });
        });
        return Array.from(itemsMap.values());
    }, [orders]);

    const latestOrder = orders.length > 0 ? orders[0] : null;
    const latestOrderPrice = latestOrder ? (latestOrder.totalPrice !== undefined ? latestOrder.totalPrice : (latestOrder.total_price || 0)) : 0;
    const latestOrderStatus = latestOrder ? (latestOrder.orderStatus || latestOrder.order_status || 'Pending') : '';
    const latestOrderIdShort = latestOrder ? (latestOrder._id || latestOrder.id || '').toString().slice(-8).toUpperCase() : '';

    return (
        <div className="profile-page">
            <SEO title="My Account | OBSIDIAN TECH" />
            
            {/* Profile Navigation Header */}
            <div className="profile-breadcrumbs">
                <span className="crumb-link" onClick={() => setCurrentView('menu')}>Your Account</span>
                {currentView !== 'menu' && (
                    <>
                        <span className="crumb-separator">/</span>
                        <span className="crumb-current">
                            {currentView === 'orders' && 'Your Orders'}
                            {currentView === 'security' && 'Login & Security'}
                            {currentView === 'addresses' && 'Your Addresses'}
                            {currentView === 'settings' && 'Purchase Settings'}
                            {currentView === 'reviews' && 'Product Reviews'}
                            {currentView === 'communication' && 'Communication Settings'}
                            {currentView === 'prime' && 'Obsidian Core Member'}
                            {currentView === 'devices' && 'Intelligent Device Hub'}
                            {currentView === 'wishlist' && 'Ecosystem Wishlist'}
                        </span>
                    </>
                )}
            </div>

            {currentView === 'menu' && (
                <div className="profile-dashboard animate-fade-in">
                    {/* Welcome Banner */}
                    <div className="profile-welcome-banner">
                        <div className="avatar-large">{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</div>
                        <div className="welcome-text">
                            <h1>Hello, {user.name || 'Valued Customer'}</h1>
                            <p>Manage your orders, update profile configurations, address options, and mesh nodes.</p>
                        </div>
                        <button className="dashboard-signout-btn" onClick={handleLogout}>Sign Out</button>
                    </div>

                    {/* Amazon-Style Your Account Grid Options */}
                    <div className="account-grid">
                        
                        {/* Option 1: Your Orders */}
                        <div className="account-card" onClick={() => setCurrentView('orders')}>
                            <div className="card-icon-container">📦</div>
                            <div className="card-info">
                                <h3>Your Orders</h3>
                                <p>Track package shipping, view invoice details, or purchase again.</p>
                            </div>
                        </div>

                        {/* Option 2: Login & Security */}
                        <div className="account-card" onClick={() => setCurrentView('security')}>
                            <div className="card-icon-container">🔒</div>
                            <div className="card-info">
                                <h3>Login & Security</h3>
                                <p>Edit name, update email address, and manage security settings.</p>
                            </div>
                        </div>

                        {/* Option 3: Addresses */}
                        <div className="account-card" onClick={() => setCurrentView('addresses')}>
                            <div className="card-icon-container">📍</div>
                            <div className="card-info">
                                <h3>Your Addresses</h3>
                                <p>Manage delivery locations, add new shipping coordinates, or set primary addresses.</p>
                            </div>
                        </div>

                        {/* Option 4: Purchase Settings */}
                        <div className="account-card" onClick={() => setCurrentView('settings')}>
                            <div className="card-icon-container">⚙️</div>
                            <div className="card-info">
                                <h3>Default Purchase Settings</h3>
                                <p>Set default UPI/Card preferences, shipping options, and automatic checkout rules.</p>
                            </div>
                        </div>

                        {/* Option 5: Product Reviews */}
                        <div className="account-card" onClick={() => setCurrentView('reviews')}>
                            <div className="card-icon-container">⭐</div>
                            <div className="card-info">
                                <h3>Review Your Purchase</h3>
                                <p>Write reviews for bought items, select star ratings, and leave tech feedback.</p>
                            </div>
                        </div>

                        {/* Option 6: Communication Preferences */}
                        <div className="account-card" onClick={() => setCurrentView('communication')}>
                            <div className="card-icon-container">💬</div>
                            <div className="card-info">
                                <h3>Communication Settings</h3>
                                <p>Update newsletter sub options, SMS dispatch logs, and email triggers.</p>
                            </div>
                        </div>

                        {/* Option 7: Obsidian Core VIP Membership (New!) */}
                        <div className="account-card VIP" onClick={() => setCurrentView('prime')}>
                            <div className="card-icon-container">🔮</div>
                            <div className="card-info">
                                <h3 className="gold-glowing-text">Obsidian Core Membership</h3>
                                <p>Review your Core Member benefits, billing configurations, and private beta keys.</p>
                            </div>
                        </div>



                        {/* Option 9: Ecosystem Wishlist (New!) */}
                        <div className="account-card" onClick={() => setCurrentView('wishlist')}>
                            <div className="card-icon-container">💖</div>
                            <div className="card-info">
                                <h3>Ecosystem Wishlist</h3>
                                <p>Track saved items, review price updates, or move saved nodes directly to cart.</p>
                            </div>
                        </div>

                    </div>

                    {/* Quick Order Tracking Status Widget */}
                    {latestOrder && (
                        <div className="quick-track-widget">
                            <div className="widget-header">
                                <h4>🚚 Active Shipment Quick-Track</h4>
                                <span className="order-ref">Ref: #{latestOrderIdShort}</span>
                            </div>
                            <div className="widget-body">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <span style={{ fontSize: '13px', color: '#cbd5e1' }}>
                                        Status: <strong className="status-highlight">{latestOrderStatus}</strong>
                                    </span>
                                    <span style={{ fontSize: '13px', color: '#a1a1aa' }}>
                                        Total: <strong>₹{latestOrderPrice.toLocaleString('en-IN')}</strong>
                                    </span>
                                </div>
                                <div className="widget-tracker-bar">
                                    <div className="tracker-segment done"></div>
                                    <div className={`tracker-segment ${['confirmed', 'processing', 'shipped', 'delivered'].includes(latestOrderStatus.toLowerCase()) ? 'done' : ''}`}></div>
                                    <div className={`tracker-segment ${['processing', 'shipped', 'delivered'].includes(latestOrderStatus.toLowerCase()) ? 'done' : ''}`}></div>
                                    <div className={`tracker-segment ${['shipped', 'delivered'].includes(latestOrderStatus.toLowerCase()) ? 'done' : ''}`}></div>
                                    <div className={`tracker-segment ${latestOrderStatus.toLowerCase() === 'delivered' ? 'done' : ''}`}></div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '10px', color: '#71717a' }}>
                                    <span>Placed</span>
                                    <span>Confirmed</span>
                                    <span>Processing</span>
                                    <span>Shipped</span>
                                    <span>Delivered</span>
                                </div>
                            </div>
                            <div className="widget-footer">
                                <button className="widget-btn" onClick={() => navigate(`/order-tracking/${latestOrder._id || latestOrder.id}`)}>
                                    Full Tracking Details →
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── Your Orders View ── */}
            {currentView === 'orders' && (
                <div className="profile-orders-section animate-fade-in">
                    <div className="section-title-row">
                        <h2>Your Orders</h2>
                        <button className="back-btn" onClick={() => setCurrentView('menu')}>← Back to Account</button>
                    </div>

                    <div className="profile-orders-container">
                        {orders.length === 0 ? (
                            <div className="no-orders-state">
                                <p>You have not placed any orders yet.</p>
                                <button className="shop-now-btn" onClick={() => navigate('/products')}>Shop Ecosystem Now</button>
                            </div>
                        ) : (
                            orders.map(order => {
                                const orderId = order?._id || order?.id || '';
                                const orderIdShort = orderId ? orderId.toString().slice(-8).toUpperCase() : 'N/A';
                                const status = order?.orderStatus || order?.order_status || 'Pending';
                                const price = order?.totalPrice !== undefined ? order.totalPrice : (order?.total_price || 0);
                                const date = order?.createdAt || order?.created_at || new Date().toISOString();
                                const items = order?.orderItems || order?.order_items || [];
                                
                                return (
                                    <div key={orderId} className="premium-order-card">
                                        <div className="card-top-meta">
                                            <div className="meta-col">
                                                <span>ORDER PLACED</span>
                                                <strong>{new Date(date).toLocaleDateString('en-IN')}</strong>
                                            </div>
                                            <div className="meta-col">
                                                <span>TOTAL AMOUNT</span>
                                                <strong>₹{price.toLocaleString('en-IN')}</strong>
                                            </div>
                                            <div className="meta-col">
                                                <span>SHIP TO</span>
                                                <strong>{order.shippingAddress?.fullName || order.shipping_address?.fullName || user.name || 'Valued Customer'}</strong>
                                            </div>
                                            <div className="meta-col right-align">
                                                <span>ORDER REF</span>
                                                <strong>#{orderIdShort}</strong>
                                            </div>
                                        </div>
                                        
                                        <div className="card-items-body">
                                            <div className="items-list-col">
                                                <h4 className={`status-badge-inline ${status.toLowerCase()}`}>{status}</h4>
                                                {items.map((item, idx) => (
                                                    <div key={idx} className="order-product-row">
                                                        <img src={item.image || item.image_url || '/placeholder-phone.svg'} alt={item.name} />
                                                        <div className="product-info">
                                                            <h5>{item.name}</h5>
                                                            <span>Qty: {item.qty || item.quantity} × ₹{item.price?.toLocaleString('en-IN')}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            <div className="actions-buttons-col">
                                                <button 
                                                    className="order-btn-primary"
                                                    onClick={() => navigate(`/order-tracking/${orderId}`)}
                                                >
                                                    Track Shipment
                                                </button>
                                                <button 
                                                    className="order-btn-secondary"
                                                    onClick={() => {
                                                        setSelectedInvoiceOrder(order);
                                                        setIsInvoiceOpen(true);
                                                    }}
                                                >
                                                    📄 View/Print Invoice
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {/* ── Login & Security View ── */}
            {currentView === 'security' && (
                <div className="profile-security-section animate-fade-in">
                    <div className="section-title-row">
                        <h2>Login & Security</h2>
                        <button className="back-btn" onClick={() => setCurrentView('menu')}>← Back to Account</button>
                    </div>

                    <div className="security-card">
                        <div className="security-card-header">
                            <h3>Account Credentials Configuration</h3>
                            {!isEditing && (
                                <button className="edit-details-btn" onClick={() => setIsEditing(true)}>
                                    🔒 Edit Credentials
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleUpdateProfile} className="security-form">
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input 
                                    type="text" 
                                    className="security-input" 
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    disabled={!isEditing || saving}
                                    placeholder="Enter your full name"
                                    required 
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input 
                                    type="email" 
                                    className="security-input" 
                                    value={editEmail}
                                    onChange={(e) => setEditEmail(e.target.value)}
                                    disabled={!isEditing || saving}
                                    placeholder="Enter your email address"
                                    required 
                                />
                            </div>

                            {isEditing && (
                                <div className="form-actions-row">
                                    <button 
                                        type="submit" 
                                        className="save-changes-btn"
                                        disabled={saving}
                                    >
                                        {saving ? 'Saving Changes...' : '💾 Save Configurations'}
                                    </button>
                                    <button 
                                        type="button" 
                                        className="cancel-edit-btn"
                                        disabled={saving}
                                        onClick={() => {
                                            setIsEditing(false);
                                            setEditName(user.name || '');
                                            setEditEmail(user.email || '');
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            )}

            {/* ── Your Addresses View ── */}
            {currentView === 'addresses' && (
                <div className="profile-security-section animate-fade-in">
                    <div className="section-title-row">
                        <h2>Your Addresses</h2>
                        <button className="back-btn" onClick={() => setCurrentView('menu')}>← Back to Account</button>
                    </div>

                    <div className="addresses-container">
                        <div className="add-address-trigger-card" onClick={() => setIsAddingAddress(true)}>
                            <div className="trigger-plus">+</div>
                            <h4>Add New Address</h4>
                            <p>Register new coordinates for ecosystem delivery.</p>
                        </div>

                        {/* Saved Addresses list */}
                        {addresses.map(addr => (
                            <div key={addr.id} className={`address-display-card ${addr.isDefault ? 'default-active' : ''}`}>
                                {addr.isDefault && <span className="default-pill">Primary</span>}
                                <div className="address-details">
                                    <h5>{addr.fullName}</h5>
                                    <p className="addr-street">{addr.address}</p>
                                    <p className="addr-city">{addr.city}, {addr.state} — {addr.pincode}</p>
                                    <p className="addr-phone">📞 Phone: {addr.phone}</p>
                                </div>
                                <div className="address-actions-row">
                                    {!addr.isDefault && (
                                        <button className="addr-action-btn" onClick={() => handleSetDefaultAddress(addr.id)}>
                                            Set Primary
                                        </button>
                                    )}
                                    <button className="addr-action-btn delete" onClick={() => handleDeleteAddress(addr.id)}>
                                        🗑️ Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add Address Form overlay modal */}
                    {isAddingAddress && (
                        <div className="address-modal-overlay" onClick={() => setIsAddingAddress(false)}>
                            <div className="address-modal-card" onClick={e => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h3>📍 Add New Delivery Address</h3>
                                    <button className="modal-close-btn" onClick={() => setIsAddingAddress(false)}>×</button>
                                </div>
                                <form onSubmit={handleAddAddress} className="modal-form">
                                    <div className="form-group">
                                        <label className="form-label">Full Name</label>
                                        <input 
                                            type="text" 
                                            className="security-input" 
                                            value={addressForm.fullName}
                                            onChange={e => setAddressForm({ ...addressForm, fullName: e.target.value })}
                                            placeholder="Recipient name" 
                                            required 
                                        />
                                    </div>
                                    <div className="form-group-row">
                                        <div className="form-group">
                                            <label className="form-label">Phone</label>
                                            <input 
                                                type="tel" 
                                                className="security-input" 
                                                value={addressForm.phone}
                                                onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })}
                                                placeholder="10-digit number" 
                                                required 
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Pincode</label>
                                            <input 
                                                type="text" 
                                                className="security-input" 
                                                value={addressForm.pincode}
                                                onChange={e => setAddressForm({ ...addressForm, pincode: e.target.value })}
                                                placeholder="6-digit ZIP code" 
                                                required 
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Flat / House No. / Area Address</label>
                                        <input 
                                            type="text" 
                                            className="security-input" 
                                            value={addressForm.address}
                                            onChange={e => setAddressForm({ ...addressForm, address: e.target.value })}
                                            placeholder="Detailed address line" 
                                            required 
                                        />
                                    </div>
                                    <div className="form-group-row">
                                        <div className="form-group">
                                            <label className="form-label">City</label>
                                            <input 
                                                type="text" 
                                                className="security-input" 
                                                value={addressForm.city}
                                                onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
                                                placeholder="City" 
                                                required 
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">State</label>
                                            <input 
                                                type="text" 
                                                className="security-input" 
                                                value={addressForm.state}
                                                onChange={e => setAddressForm({ ...addressForm, state: e.target.value })}
                                                placeholder="State" 
                                                required 
                                            />
                                        </div>
                                    </div>
                                    <label className="default-checkbox-container">
                                        <input 
                                            type="checkbox" 
                                            checked={addressForm.isDefault}
                                            onChange={e => setAddressForm({ ...addressForm, isDefault: e.target.checked })} 
                                        />
                                        Make this my primary delivery address
                                    </label>
                                    <div className="form-actions-row">
                                        <button type="submit" className="save-changes-btn">Save Coordinates</button>
                                        <button type="button" className="cancel-edit-btn" onClick={() => setIsAddingAddress(false)}>Cancel</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── Default Purchase Settings View ── */}
            {currentView === 'settings' && (
                <div className="profile-security-section animate-fade-in">
                    <div className="section-title-row">
                        <h2>Default Purchase Settings</h2>
                        <button className="back-btn" onClick={() => setCurrentView('menu')}>← Back to Account</button>
                    </div>

                    <div className="security-card">
                        <div className="security-card-header">
                            <h3>Configure Automatic Checkout Settings</h3>
                        </div>
                        <form onSubmit={handleSavePurchaseSettings} className="security-form">
                            <div className="form-group">
                                <label className="form-label">Default Payment Channel</label>
                                <select 
                                    className="security-input" 
                                    value={purchaseSettings.paymentMethod}
                                    onChange={e => setPurchaseSettings({ ...purchaseSettings, paymentMethod: e.target.value })}
                                    style={{ background: '#111827', cursor: 'pointer' }}
                                >
                                    <option value="card">💳 Saved Credit / Debit Card</option>
                                    <option value="upi">📱 UPI (Unified Payments Interface)</option>
                                    <option value="cod">💵 Cash on Delivery (COD)</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Preferred Delivery Speed</label>
                                <select 
                                    className="security-input" 
                                    value={purchaseSettings.shippingSpeed}
                                    onChange={e => setPurchaseSettings({ ...purchaseSettings, shippingSpeed: e.target.value })}
                                    style={{ background: '#111827', cursor: 'pointer' }}
                                >
                                    <option value="standard">📦 Standard Delivery (3-5 Business Days) — FREE</option>
                                    <option value="express">⚡ Express Delivery (1-2 Days) — ₹500</option>
                                    <option value="sameday">🚀 Same-Day Obsidian Tech Premium Hub delivery — ₹900</option>
                                </select>
                            </div>

                            <label className="default-checkbox-container">
                                <input 
                                    type="checkbox" 
                                    checked={purchaseSettings.oneClickOrdering}
                                    onChange={e => setPurchaseSettings({ ...purchaseSettings, oneClickOrdering: e.target.checked })} 
                                />
                                Enable One-Click Automatic Checkout (Bypass gateway selections when shopping)
                            </label>

                            <div className="form-actions-row">
                                <button type="submit" className="save-changes-btn">Save Settings</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Review purchased products ── */}
            {currentView === 'reviews' && (
                <div className="profile-security-section animate-fade-in">
                    <div className="section-title-row">
                        <h2>Review Your Purchase</h2>
                        <button className="back-btn" onClick={() => setCurrentView('menu')}>← Back to Account</button>
                    </div>

                    <div className="profile-orders-container">
                        {purchasedProducts.length === 0 ? (
                            <div className="no-orders-state">
                                <p>You must purchase ecosystem products before leaving reviews.</p>
                                <button className="shop-now-btn" onClick={() => navigate('/products')}>Browse Products</button>
                            </div>
                        ) : (
                            purchasedProducts.map(product => {
                                const review = reviewedProducts[product.id];
                                return (
                                    <div key={product.id} className="premium-review-card">
                                        <div className="review-product-header">
                                            <img src={product.image || '/placeholder-phone.svg'} alt={product.name} />
                                            <div>
                                                <h4>{product.name}</h4>
                                                <span style={{ fontSize: '12px', color: '#71717a' }}>Ecosystem Item</span>
                                            </div>
                                        </div>

                                        {review ? (
                                            <div className="review-submitted-success">
                                                <div style={{ color: '#ffd60a', fontSize: '1.25rem', marginBottom: '8px' }}>
                                                    {'★'.repeat(review.rating) + '☆'.repeat(5 - review.rating)}
                                                </div>
                                                <p className="submitted-text">" {review.feedback} "</p>
                                                <span className="success-stamp">✓ Verified Purchase Feedback Logged</span>
                                            </div>
                                        ) : (
                                            <div className="review-composer">
                                                <div className="star-rating-row">
                                                    <span className="form-label">Rate this item:</span>
                                                    <div className="stars-interactive">
                                                        {[1, 2, 3, 4, 5].map(starNum => (
                                                            <button 
                                                                key={starNum} 
                                                                type="button" 
                                                                className="star-btn"
                                                                onClick={() => handleReviewSubmit(product.id, starNum)}
                                                            >
                                                                ⭐
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="feedback-composer-row">
                                                    <textarea 
                                                        className="security-input" 
                                                        rows="2"
                                                        value={activeFeedback[product.id] || ''}
                                                        onChange={e => setActiveFeedback({ ...activeFeedback, [product.id]: e.target.value })}
                                                        placeholder="Share your experience (Optional). Click a star rating to submit!"
                                                        style={{ resize: 'none' }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {/* ── Communication Preferences View ── */}
            {currentView === 'communication' && (
                <div className="profile-security-section animate-fade-in">
                    <div className="section-title-row">
                        <h2>Communication Settings</h2>
                        <button className="back-btn" onClick={() => setCurrentView('menu')}>← Back to Account</button>
                    </div>

                    <div className="security-card">
                        <div className="security-card-header">
                            <h3>Sync Marketing & Security Alerts</h3>
                        </div>
                        <form onSubmit={handleSaveCommPrefs} className="security-form">
                            <label className="default-checkbox-container">
                                <input 
                                    type="checkbox" 
                                    checked={commPrefs.emails}
                                    onChange={e => setCommPrefs({ ...commPrefs, emails: e.target.checked })} 
                                />
                                Email newsletters & monthly intelligence briefs
                            </label>

                            <label className="default-checkbox-container">
                                <input 
                                    type="checkbox" 
                                    checked={commPrefs.sms}
                                    onChange={e => setCommPrefs({ ...commPrefs, sms: e.target.checked })} 
                                />
                                SMS order shipping logs & active tracking updates
                            </label>

                            <label className="default-checkbox-container">
                                <input 
                                    type="checkbox" 
                                    checked={commPrefs.securityAlerts}
                                    onChange={e => setCommPrefs({ ...commPrefs, securityAlerts: e.target.checked })} 
                                />
                                Security warnings & 2-Factor challenge trigger emails
                            </label>

                            <label className="default-checkbox-container">
                                <input 
                                    type="checkbox" 
                                    checked={commPrefs.promos}
                                    onChange={e => setCommPrefs({ ...commPrefs, promos: e.target.checked })} 
                                />
                                Direct discount triggers, coupons, and premium product launch reveals
                            </label>

                            <div className="form-actions-row">
                                <button type="submit" className="save-changes-btn">Save Preferences</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Option 7: Obsidian Core Membership View (NEW!) ── */}
            {currentView === 'prime' && (
                <div className="profile-security-section animate-fade-in">
                    <div className="section-title-row">
                        <h2>Obsidian Core Membership</h2>
                        <button className="back-btn" onClick={() => setCurrentView('menu')}>← Back to Account</button>
                    </div>

                    {user?.isVip ? (
                        <div className="prime-membership-card">
                            <div className="membership-glare-card">
                                <span className="membership-vip-badge">💎 CORE MEMBER</span>
                                <h2 className="membership-brand-title">OBSIDIAN TECH</h2>
                                <div className="membership-details-block">
                                    <div className="detail-field">
                                        <span className="label">MEMBER STATUS</span>
                                        <span className="value active-status">● Active Core Premium</span>
                                    </div>
                                    <div className="detail-field">
                                        <span className="label">MEMBER NODE ID</span>
                                        <span className="value monospace">OB-CORE-{user?._id?.substring(0, 5).toUpperCase() || '77952'}-X</span>
                                    </div>
                                    <div className="detail-field">
                                        <span className="label">BILLING CYCLE</span>
                                        <span className="value">Renews May 2027 (Annual)</span>
                                    </div>
                                </div>

                                {/* Digital Key Barcode QR representation */}
                                <div className="membership-barcode-block">
                                    <div style={{ fontSize: '10px', color: '#6e6e73', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
                                        INTELLIGENT Mesh Key
                                    </div>
                                    <svg viewBox="0 0 100 100" width="80" height="80" style={{ background: '#ffffff', padding: '6px', borderRadius: '8px' }}>
                                        <rect width="30" height="30" fill="#000000" />
                                        <rect x="70" width="30" height="30" fill="#000000" />
                                        <rect y="70" width="30" height="30" fill="#000000" />
                                        <rect x="35" y="35" width="30" height="30" fill="#000000" />
                                        <rect x="75" y="75" width="25" height="25" fill="#000000" />
                                        <rect x="10" y="45" width="15" height="15" fill="#000000" />
                                        <rect x="50" y="10" width="10" height="15" fill="#000000" />
                                    </svg>
                                </div>
                            </div>

                            {/* VIP Core benefits grid */}
                            <div className="membership-benefits-section">
                                <h3>Exclusive Core Privileges</h3>
                                <div className="benefits-list-grid">
                                    <div className="benefit-item">
                                        <span className="benefit-icon">🚚</span>
                                        <div>
                                            <h5>Same-Day Member Delivery</h5>
                                            <p>Get all ecosystem products hand-dispatched to your door on the same day for free.</p>
                                        </div>
                                    </div>
                                    <div className="benefit-item">
                                        <span className="benefit-icon">💳</span>
                                        <div>
                                            <h5>15% Automatic Store Credits</h5>
                                            <p>Receive 15% discount credits on active products automatically calculated during checkout.</p>
                                        </div>
                                    </div>
                                    <div className="benefit-item">
                                        <span className="benefit-icon">📡</span>
                                        <div>
                                            <h5>Priority Dev Network</h5>
                                            <p>Access direct engineering support channels and private beta device firmware reveals.</p>
                                        </div>
                                    </div>
                                    <div className="benefit-item">
                                        <span className="benefit-icon">⚡</span>
                                        <div>
                                            <h5>Unlimited Cloud Diagnostics</h5>
                                            <p>Run uninterrupted mesh network performance analysis checks on registered device hubs.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="prime-membership-card" style={{ opacity: 0.8, filter: 'grayscale(0.5)' }}>
                            <div className="membership-glare-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
                                <span className="membership-vip-badge" style={{ background: '#333', color: '#888' }}>🔒 CORE MEMBER LOCKED</span>
                                <h2 className="membership-brand-title" style={{ marginTop: '20px' }}>UPGRADE TO MEMBER</h2>
                                <p style={{ color: '#a1a1a6', maxWidth: '400px', margin: '20px auto', lineHeight: '1.6' }}>
                                    Unlock exclusive privileges including 15% automatic checkout discounts, same-day delivery, and direct engineering support.
                                </p>
                                <button
                                    onClick={() => alert("Please contact support to upgrade to Member.")}
                                    style={{
                                        background: 'linear-gradient(135deg, #FFD700 0%, #FDB931 100%)',
                                        color: '#000',
                                        border: 'none',
                                        padding: '12px 30px',
                                        borderRadius: '24px',
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s',
                                        marginTop: '10px'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    Unlock Obsidian Core
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}



            {/* ── Option 9: Ecosystem Wishlist View (NEW!) ── */}
            {currentView === 'wishlist' && (
                <div className="profile-security-section animate-fade-in">
                    <div className="section-title-row">
                        <h2>Ecosystem Wishlist</h2>
                        <button className="back-btn" onClick={() => setCurrentView('menu')}>← Back to Account</button>
                    </div>

                    <div className="profile-orders-container">
                        {wishlistLoading ? (
                            <div className="loading-spinner">Syncing Saved Items...</div>
                        ) : wishlist.length === 0 ? (
                            <div className="no-orders-state">
                                <p>Your Wishlist is currently empty.</p>
                                <button className="shop-now-btn" onClick={() => navigate('/products')}>Browse Tech Nodes</button>
                            </div>
                        ) : (
                            <div className="wishlist-grid">
                                {wishlist.map(product => (
                                    <div key={product._id || product.id} className="wishlist-item-card">
                                        <button className="remove-wish-btn" onClick={() => handleRemoveWishlist(product._id || product.id)}>×</button>
                                        <img src={product.image || product.image_url || '/placeholder-phone.svg'} alt={product.name} />
                                        <div className="wishlist-info">
                                            <h4>{product.name}</h4>
                                            <strong className="price-tag">₹{product.price?.toLocaleString('en-IN')}</strong>
                                        </div>
                                        <div className="wishlist-actions">
                                            <button 
                                                className="order-btn-primary"
                                                onClick={() => handleAddWishlistToCart(product)}
                                            >
                                                🛒 Move to Cart
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Glassmorphic Invoice PDF Print Modal Overlay */}
            <InvoiceModal 
                isOpen={isInvoiceOpen} 
                onClose={() => setIsInvoiceOpen(false)} 
                order={selectedInvoiceOrder} 
            />
        </div>
    );
};

export default ProfilePage;
