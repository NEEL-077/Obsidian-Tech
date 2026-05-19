import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import './AdminPage.css';

const ORDER_STATUSES = [
  { value: 'Pending', label: '🕐 Pending', color: '#f59e0b', bg: '#fef3c7' },
  { value: 'Confirmed', label: '✅ Confirmed', color: '#10b981', bg: '#d1fae5' },
  { value: 'Processing', label: '⚙️ Processing', color: '#3b82f6', bg: '#dbeafe' },
  { value: 'Shipped', label: '🚚 Shipped', color: '#8b5cf6', bg: '#ede9fe' },
  { value: 'Out for Delivery', label: '📦 Out for Delivery', color: '#f97316', bg: '#ffedd5' },
  { value: 'Delivered', label: '🎉 Delivered', color: '#22c55e', bg: '#dcfce7' },
  { value: 'Cancelled', label: '❌ Cancelled', color: '#ef4444', bg: '#fee2e2' },
  { value: 'Returned', label: '↩️ Returned', color: '#ec4899', bg: '#fce7f3' },
  { value: 'Refunded', label: '💰 Refunded', color: '#6366f1', bg: '#e0e7ff' },
];

const OrderRow = ({ order, getAuthHeaders, onRefresh }) => {
  const [expanded, setExpanded] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState(order.status || 'Pending');
  const [trackingNumber, setTrackingNumber] = React.useState(order.trackingNumber || '');
  const [carrier, setCarrier] = React.useState(order.carrier || '');
  const [estimatedDelivery, setEstimatedDelivery] = React.useState(
    order.estimatedDelivery ? new Date(order.estimatedDelivery).toISOString().split('T')[0] : ''
  );
  const [note, setNote] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [saveMsg, setSaveMsg] = React.useState('');

  const statusInfo = ORDER_STATUSES.find(s => s.value === (order.status || 'Pending')) || ORDER_STATUSES[0];

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      const res = await fetch(`/api/orders/${order._id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          status: selectedStatus,
          note: note || undefined,
          trackingNumber: trackingNumber || undefined,
          carrier: carrier || undefined,
          estimatedDelivery: estimatedDelivery || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSaveMsg('✅ Status updated!');
        onRefresh();
        setTimeout(() => setSaveMsg(''), 3000);
      } else {
        setSaveMsg(`❌ ${data.message || 'Update failed'}`);
      }
    } catch (e) {
      setSaveMsg('❌ Network error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <tr style={{ cursor: 'pointer' }} onClick={() => setExpanded(e => !e)}>
        <td>
          <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#aaa' }}>
            #{order._id?.slice(-8).toUpperCase()}
          </span>
        </td>
        <td>
          <div style={{ fontWeight: '500' }}>{order.userName}</div>
          <div style={{ fontSize: '12px', color: '#888' }}>{order.userEmail}</div>
        </td>
        <td style={{ color: '#aaa', fontSize: '13px' }}>{order.orderItems?.length} item(s)</td>
        <td style={{ fontWeight: '600', color: '#e2e8f0' }}>₹{order.totalPrice?.toLocaleString('en-IN')}</td>
        <td>
          <span style={{
            padding: '3px 8px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
            background: order.isPaid ? '#dcfce7' : '#fee2e2',
            color: order.isPaid ? '#166534' : '#991b1b'
          }}>
            {order.isPaid ? 'Paid' : 'Unpaid'}
          </span>
        </td>
        <td>
          <span className="inventory-status-badge" style={{
            background: statusInfo.bg,
            color: statusInfo.color,
            border: `1px solid ${statusInfo.color}33`,
            padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600'
          }}>
            {order.status || 'Pending'}
          </span>
        </td>
        <td style={{ color: '#888', fontSize: '13px' }}>
          {new Date(order.createdAt).toLocaleDateString('en-IN')}
        </td>
        <td className="text-right">
          <button
            className="btn-export"
            style={{ padding: '5px 12px', fontSize: '12px' }}
            onClick={e => { e.stopPropagation(); setExpanded(ex => !ex); }}
          >
            {expanded ? '▲ Close' : '▼ Manage'}
          </button>
        </td>
      </tr>

      {expanded && (
        <tr>
          <td colSpan="8" style={{ background: '#111827', padding: '0' }}>
            <div style={{ padding: '20px 24px', borderTop: '1px solid #1f2937', borderBottom: '1px solid #1f2937' }}>

              {/* Order Items */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ color: '#9ca3af', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Order Items</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {order.orderItems?.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#1f2937', borderRadius: '8px', padding: '10px 14px', minWidth: '220px' }}>
                      <img src={item.image} alt={item.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '500', color: '#e2e8f0' }}>{item.name}</div>
                        <div style={{ fontSize: '12px', color: '#9ca3af' }}>Qty: {item.qty} × ₹{item.price?.toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ color: '#9ca3af', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Shipping Address</h4>
                <div style={{ color: '#cbd5e1', fontSize: '13px', background: '#1f2937', padding: '10px 14px', borderRadius: '8px', display: 'inline-block' }}>
                  {order.shippingAddress?.address}, {order.shippingAddress?.city} — {order.shippingAddress?.postalCode}, {order.shippingAddress?.country}
                </div>
              </div>

              {/* Status Control */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', color: '#9ca3af', fontSize: '12px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Update Status</label>
                  <select
                    value={selectedStatus}
                    onChange={e => setSelectedStatus(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#e2e8f0', fontSize: '14px', cursor: 'pointer' }}
                  >
                    {ORDER_STATUSES.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#9ca3af', fontSize: '12px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tracking Number</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={e => setTrackingNumber(e.target.value)}
                    placeholder="e.g. BD1234567890"
                    style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#e2e8f0', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#9ca3af', fontSize: '12px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Carrier / Courier</label>
                  <select
                    value={carrier}
                    onChange={e => setCarrier(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#e2e8f0', fontSize: '14px' }}
                  >
                    <option value="">Select Carrier</option>
                    <option value="Blue Dart">Blue Dart</option>
                    <option value="Delhivery">Delhivery</option>
                    <option value="DTDC">DTDC</option>
                    <option value="Ekart">Ekart (Flipkart)</option>
                    <option value="Shadowfax">Shadowfax</option>
                    <option value="XpressBees">XpressBees</option>
                    <option value="Amazon Logistics">Amazon Logistics</option>
                    <option value="India Post">India Post</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#9ca3af', fontSize: '12px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Est. Delivery Date</label>
                  <input
                    type="date"
                    value={estimatedDelivery}
                    onChange={e => setEstimatedDelivery(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#e2e8f0', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: '12px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Admin Note (optional)</label>
                <input
                  type="text"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="e.g. Package dispatched from Delhi warehouse"
                  style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#e2e8f0', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    padding: '10px 24px', background: saving ? '#374151' : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600',
                    cursor: saving ? 'not-allowed' : 'pointer', fontSize: '14px'
                  }}
                >
                  {saving ? 'Saving...' : '💾 Save Status'}
                </button>
                {saveMsg && <span style={{ fontSize: '13px', color: saveMsg.startsWith('✅') ? '#22c55e' : '#ef4444' }}>{saveMsg}</span>}

                {/* Status History */}
                {order.statusHistory?.length > 0 && (
                  <div style={{ marginLeft: 'auto', fontSize: '12px', color: '#6b7280' }}>
                    Last: <strong style={{ color: '#9ca3af' }}>{order.statusHistory[order.statusHistory.length - 1]?.status}</strong>
                    {' '}at {new Date(order.statusHistory[order.statusHistory.length - 1]?.timestamp).toLocaleString('en-IN')}
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

const AdminPage = () => {
  const { user, login, logout } = useAuth();
  const { socket, isConnected } = useSocket();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Dashboard data
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [coupons, setCoupons] = useState([]);

  // Product form data
  const [productForm, setProductForm] = useState({
    name: '',
    brand: '',
    price: '',
    originalPrice: '',
    description: '',
    category: 'phones',
    image: '',
    inStock: true,
    countInStock: 10
  });

  const [inventoryEdits, setInventoryEdits] = useState({});
  const [imageUpload, setImageUpload] = useState({ uploading: false, preview: '', error: '' });

  const handleImageUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setImageUpload(s => ({ ...s, error: 'Only image files are allowed (JPG, PNG, WEBP).' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageUpload(s => ({ ...s, error: 'File too large. Max size is 5MB.' }));
      return;
    }
    setImageUpload({ uploading: true, preview: URL.createObjectURL(file), error: '' });
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch('/api/upload/image', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user?.token || localStorage.getItem('token')}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setProductForm(prev => ({ ...prev, image: data.imagePath }));
        setImageUpload(s => ({ ...s, uploading: false, error: '' }));
      } else {
        setImageUpload(s => ({ ...s, uploading: false, error: data.message || 'Upload failed.' }));
      }
    } catch {
      setImageUpload(s => ({ ...s, uploading: false, error: 'Upload failed. Check your connection.' }));
    }
  };

  // Coupon form data
  const [couponForm, setCouponForm] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    usageLimit: '',
    validFrom: '',
    validUntil: '',
    isActive: true
  });

  useEffect(() => {
    // Check if user is admin
    if (user && user.isAdmin) {
      setIsLoggedIn(true);
      loadDashboardData();
    }
  }, [user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });

      const data = await response.json();

      if (response.ok && data.isAdmin) {
        await login(loginData.email, loginData.password);
        setIsLoggedIn(true);
        loadDashboardData();
      } else {
        setError('Invalid admin credentials');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = useCallback(async () => {
    const token = user?.token || localStorage.getItem('token');
    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    try {
      // Load stats
      const statsRes = await fetch('/api/admin/stats', { headers: authHeaders });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Load users
      const usersRes = await fetch('/api/admin/users', { headers: authHeaders });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }

      // Load orders
      const ordersRes = await fetch('/api/admin/orders', { headers: authHeaders });
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData);
      }

      // Load products
      const productsRes = await fetch('/api/products');
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData.products || []);
      }

      // Load coupons
      const couponsRes = await fetch('/api/coupons', { headers: authHeaders });
      if (couponsRes.ok) {
        const couponsData = await couponsRes.json();
        setCoupons(couponsData);
      }
      
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  }, [user]);

  // Set up real-time listeners
  useEffect(() => {
    if (socket && isLoggedIn) {
      console.log('📡 Setting up Admin real-time listeners');
      
      // Join admin room
      socket.emit('join_admin_room');

      // Listen for database changes
      socket.on('database_change', (data) => {
        console.log(`✨ DB Change detected in ${data.collection}, refreshing dashboard...`);
        loadDashboardData();
      });

      // Special notification for new orders
      socket.on('new_order_placed', (data) => {
        console.log('🔥 New order placed!', data.orderId);
        // We could show a toast here if we had a toast library
      });

      return () => {
        socket.off('database_change');
        socket.off('new_order_placed');
      };
    }
  }, [socket, isLoggedIn, loadDashboardData]);

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${user?.token || localStorage.getItem('token')}`
  });

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...productForm,
          price: parseFloat(productForm.price),
          originalPrice: parseFloat(productForm.originalPrice),
          countInStock: parseInt(productForm.countInStock)
        })
      });

      if (response.ok) {
        setProductForm({
          name: '',
          brand: '',
          price: '',
          originalPrice: '',
          description: '',
          category: 'phones',
          image: '',
          inStock: true,
          countInStock: 10
        });
        loadDashboardData();
        alert('Product added successfully!');
      } else {
        alert('Failed to add product');
      }
    } catch (err) {
      alert('Error adding product');
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        loadDashboardData();
        alert('Product deleted successfully!');
      } else {
        alert('Failed to delete product');
      }
    } catch (err) {
      alert('Error deleting product');
    }
  };

  // Inventory Management functions
  const handleStockEditChange = (productId, value) => {
    let finalValue = value;
    if (value !== '') {
      const parsedValue = parseInt(value);
      if (isNaN(parsedValue)) {
        finalValue = 0;
      } else if (parsedValue < 0) {
        finalValue = 0;
      } else {
        finalValue = parsedValue;
      }
    }

    setInventoryEdits({
      ...inventoryEdits,
      [productId]: finalValue
    });
  };

  const handleUpdateStock = async (productId, currentProduct) => {
    const newStock = inventoryEdits[productId];
    if (newStock === undefined || newStock === '') return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...currentProduct,
          countInStock: parseInt(newStock),
          inStock: parseInt(newStock) > 0
        })
      });

      if (response.ok) {
        alert('Stock updated successfully!');
        // remove from edit state
        const newEdits = { ...inventoryEdits };
        delete newEdits[productId];
        setInventoryEdits(newEdits);
        loadDashboardData();
      } else {
        alert('Failed to update stock');
      }
    } catch (err) {
      alert('Error updating stock');
    } finally {
      setLoading(false);
    }
  };

  // Coupon management functions
  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token || localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...couponForm,
          discountValue: parseFloat(couponForm.discountValue),
          minOrderAmount: parseFloat(couponForm.minOrderAmount) || 0,
          maxDiscountAmount: couponForm.maxDiscountAmount ? parseFloat(couponForm.maxDiscountAmount) : null,
          usageLimit: couponForm.usageLimit ? parseInt(couponForm.usageLimit) : null
        })
      });

      if (response.ok) {
        setCouponForm({
          code: '',
          description: '',
          discountType: 'percentage',
          discountValue: '',
          minOrderAmount: '',
          maxDiscountAmount: '',
          usageLimit: '',
          validFrom: '',
          validUntil: '',
          isActive: true
        });
        loadDashboardData();
        alert('Coupon created successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to create coupon');
      }
    } catch (err) {
      alert('Error creating coupon');
    } finally {
      setLoading(false);
    }
  };

  const deleteCoupon = async (couponId) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    try {
      const response = await fetch(`/api/coupons/${couponId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token || localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        loadDashboardData();
        alert('Coupon deleted successfully!');
      } else {
        alert('Failed to delete coupon');
      }
    } catch (err) {
      alert('Error deleting coupon');
    }
  };

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setActiveTab('dashboard');
  };

  if (!isLoggedIn) {
    return (
      <div className="admin-login">
        <div className="login-container">
          <h1>Admin Login</h1>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="text"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                placeholder="admin"
                required
              />
            </div>

            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                required
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-sidebar">
        <div className="admin-logo">
          <h2>OBSIDIAN TECH</h2>
          <span>Admin Panel</span>
        </div>

        <nav className="admin-nav">
          <button
            className={activeTab === 'dashboard' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveTab('dashboard')}
          >
            <span className="nav-icon">📊</span>
            Dashboard
          </button>
          <button
            className={activeTab === 'products' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveTab('products')}
          >
            <span className="nav-icon">📱</span>
            Products
          </button>
          <button
            className={activeTab === 'inventory' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveTab('inventory')}
          >
            <span className="nav-icon">📦</span>
            Inventory
          </button>
          <button
            className={activeTab === 'users' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveTab('users')}
          >
            <span className="nav-icon">👥</span>
            Users
          </button>
          <button
            className={activeTab === 'orders' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveTab('orders')}
          >
            <span className="nav-icon">🛒</span>
            Orders
          </button>
          <button
            className={activeTab === 'coupons' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveTab('coupons')}
          >
            <span className="nav-icon">🎟️</span>
            Coupons
          </button>
        </nav>

        <div className="admin-user">
          <div className="user-info">
            <span className="user-avatar">👤</span>
            <div>
              <div className="user-name">administrator</div>
              <div className="user-role">super admin</div>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <span>🚪</span> Logout
          </button>
        </div>
      </div>

      <div className="admin-main">
        <div className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: isConnected ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: '600',
              color: isConnected ? '#22c55e' : '#ef4444',
              border: `1px solid ${isConnected ? '#22c55e' : '#ef4444'}33`
            }}>
              <span style={{ 
                width: '6px', 
                height: '6px', 
                borderRadius: '50%', 
                backgroundColor: isConnected ? '#22c55e' : '#ef4444',
                boxShadow: isConnected ? '0 0 8px #22c55e' : 'none'
              }}></span>
              {isConnected ? 'LIVE' : 'DISCONNECTED'}
            </div>
          </div>
          <div className="header-actions">
            <span className="current-time" style={{ fontSize: '12px', color: '#6b7280' }}>
              Last sync: {lastUpdate.toLocaleTimeString()}
            </span>
            <span className="current-time">{new Date().toLocaleDateString()}</span>
          </div>
        </div>

        <div className="admin-content">
          {activeTab === 'dashboard' && (
            <div className="dashboard">
              <div className="stats-overview">
                <div className="stat-card users">
                  <div className="stat-icon">👥</div>
                  <div className="stat-info">
                    <h3>{stats.totalUsers || 0}</h3>
                    <p>Total Users</p>
                  </div>
                </div>
                <div className="stat-card products">
                  <div className="stat-icon">📱</div>
                  <div className="stat-info">
                    <h3>{stats.totalProducts || 0}</h3>
                    <p>Total Products</p>
                  </div>
                </div>
                <div className="stat-card orders">
                  <div className="stat-icon">🛒</div>
                  <div className="stat-info">
                    <h3>{stats.totalOrders || 0}</h3>
                    <p>Total Orders</p>
                  </div>
                </div>
                <div className="stat-card revenue">
                  <div className="stat-icon">💰</div>
                  <div className="stat-info">
                    <h3>₹{(stats.totalSales || 0).toLocaleString()}</h3>
                    <p>Total Revenue</p>
                  </div>
                </div>
              </div>

              <div className="dashboard-grid">
                <div className="recent-orders-card">
                  <div className="card-header">
                    <h3>Recent Orders</h3>
                    <span className="view-all">View All</span>
                  </div>
                  <div className="orders-table">
                    {stats.recentOrders?.length > 0 ? (
                      <table>
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Amount</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.recentOrders.map(order => (
                            <tr key={order._id}>
                              <td>#{order._id}</td>
                              <td>{order.user?.name || order.userName}</td>
                              <td>₹{order.totalPrice.toLocaleString()}</td>
                              <td>
                                <span className={`status ${order.isPaid ? 'paid' : 'pending'}`}>
                                  {order.isPaid ? 'Paid' : 'Pending'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="no-data">No recent orders</div>
                    )}
                  </div>
                </div>

                <div className="quick-actions-card">
                  <div className="card-header">
                    <h3>Quick Actions</h3>
                  </div>
                  <div className="quick-actions">
                    <button
                      className="action-btn add-product"
                      onClick={() => setActiveTab('products')}
                    >
                      <span>➕</span>
                      Add Product
                    </button>
                    <button
                      className="action-btn view-users"
                      onClick={() => setActiveTab('users')}
                    >
                      <span>👥</span>
                      Manage Users
                    </button>
                    <button
                      className="action-btn view-orders"
                      onClick={() => setActiveTab('orders')}
                    >
                      <span>📋</span>
                      View Orders
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="products-management">
              <div className="add-product-form">
                <h3>Add New Product</h3>
                <form onSubmit={handleProductSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Product Name:</label>
                      <input
                        type="text"
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Brand:</label>
                      <input
                        type="text"
                        value={productForm.brand}
                        onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Price:</label>
                      <input
                        type="number"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Original Price:</label>
                      <input
                        type="number"
                        value={productForm.originalPrice}
                        onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Category:</label>
                      <select
                        value={productForm.category}
                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      >
                        <option value="phones">Phones</option>
                        <option value="accessories">Accessories</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Initial Stock:</label>
                      <input
                        type="number"
                        value={productForm.countInStock}
                        onChange={(e) => setProductForm({ ...productForm, countInStock: e.target.value })}
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Product Image:</label>
                    <div
                      className="image-upload-zone"
                      onClick={() => document.getElementById('admin-img-input').click()}
                      onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
                      onDragLeave={e => e.currentTarget.classList.remove('drag-over')}
                      onDrop={e => {
                        e.preventDefault();
                        e.currentTarget.classList.remove('drag-over');
                        const file = e.dataTransfer.files[0];
                        if (file) handleImageUpload(file);
                      }}
                    >
                      {imageUpload.preview || productForm.image ? (
                        <div className="image-upload-preview">
                          <img
                            src={imageUpload.preview || productForm.image}
                            alt="Preview"
                            className="upload-preview-img"
                          />
                          <div className="image-upload-overlay">
                            <span>🔄 Click or drag to replace</span>
                          </div>
                        </div>
                      ) : (
                        <div className="image-upload-placeholder">
                          <div className="upload-icon">
                            {imageUpload.uploading ? (
                              <div className="upload-spinner" />
                            ) : (
                              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                              </svg>
                            )}
                          </div>
                          <p className="upload-main-text">
                            {imageUpload.uploading ? 'Uploading…' : 'Click to upload or drag & drop'}
                          </p>
                          <p className="upload-sub-text">PNG, JPG, WEBP · Max 5MB</p>
                        </div>
                      )}
                      <input
                        id="admin-img-input"
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={e => {
                          const file = e.target.files[0];
                          if (file) handleImageUpload(file);
                          e.target.value = '';
                        }}
                      />
                    </div>
                    {imageUpload.uploading && (
                      <div className="upload-progress-bar"><div className="upload-progress-fill" /></div>
                    )}
                    {imageUpload.error && (
                      <p className="upload-error">⚠️ {imageUpload.error}</p>
                    )}
                    {productForm.image && !imageUpload.uploading && (
                      <p className="upload-success">✅ Image uploaded successfully</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Description:</label>
                    <textarea
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      rows="4"
                    />
                  </div>

                  <button type="submit" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Product'}
                  </button>
                </form>
              </div>

              <div className="products-list">
                <h3>Existing Products</h3>
                <div className="products-grid">
                  {products && products.length > 0 ? (
                    products.map(product => (
                      <div key={product._id} className="product-card">
                        <img src={product.image} alt={product.name} />
                        <h4>{product.name}</h4>
                        <p>{product.brand}</p>
                        <p>₹{product.price}</p>
                        <button
                          onClick={() => deleteProduct(product._id)}
                          className="delete-btn"
                        >
                          Delete
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="no-data">No products found</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="inventory-management">
              <div className="inventory-header-bar">
                <div>
                  <h3 className="inventory-title">Inventory Management</h3>
                  <p className="inventory-subtitle">Monitor and update product stock levels in real-time</p>
                </div>
                <div className="inventory-actions">
                  <div className="inventory-search">
                    <span className="search-icon">🔍</span>
                    <input type="text" placeholder="Search products..." className="inventory-search-input" />
                  </div>
                  <button className="btn-export">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
                    Export
                  </button>
                </div>
              </div>

              <div className="inventory-table-wrapper">
                <table className="inventory-data-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Brand</th>
                      <th>Price</th>
                      <th className="text-center">Stock Level</th>
                      <th>Status</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => {
                      const editValue = inventoryEdits[product._id] !== undefined ? inventoryEdits[product._id] : product.countInStock;
                      const isEdited = inventoryEdits[product._id] !== undefined && parseInt(inventoryEdits[product._id]) !== product.countInStock;

                      return (
                        <tr key={product._id} className={isEdited ? 'row-edited' : ''}>
                          <td>
                            <div className="inventory-product-cell">
                              <div className="inventory-img-wrap">
                                <img src={product.image} alt={product.name} className="inventory-img" />
                              </div>
                              <span className="font-medium product-name-cell">{product.name}</span>
                            </div>
                          </td>
                          <td>
                            <span className="brand-badge">{product.brand}</span>
                          </td>
                          <td className="price-cell">₹{product.price.toLocaleString('en-IN')}</td>
                          <td className="text-center">
                            <div className={`stock-control-pill ${isEdited ? 'editing' : ''}`}>
                              <button
                                className="stock-btn minus"
                                onClick={() => handleStockEditChange(product._id, Math.max(0, parseInt(editValue || 0) - 1))}
                              >
                                −
                              </button>
                              <input
                                type="number"
                                className="stock-input-flat"
                                value={editValue}
                                min="0"
                                onChange={(e) => handleStockEditChange(product._id, e.target.value)}
                              />
                              <button
                                className="stock-btn plus"
                                onClick={() => handleStockEditChange(product._id, parseInt(editValue || 0) + 1)}
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td>
                            <span className={`inventory-status-badge ${product.countInStock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                              <span className="status-dot"></span>
                              {product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </td>
                          <td className="text-right">
                            <button
                              className={`btn-save-stock ${isEdited ? 'btn-save-stock-active' : ''}`}
                              onClick={() => handleUpdateStock(product._id, product)}
                              disabled={!isEdited || loading}
                            >
                              {isEdited ? (loading ? '...' : 'Save Changes') : 'Up to date'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {(!products || products.length === 0) && (
                  <div className="no-data">No products found</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="users-management">
              <h3>User Management</h3>
              <div className="users-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Admin</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user._id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.isAdmin ? 'Yes' : 'No'}</td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="orders-management">
              <div className="inventory-header-bar">
                <div>
                  <h3 className="inventory-title">Order Management</h3>
                  <p className="inventory-subtitle">View and update order statuses, tracking info, and dispatch details</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ color: '#888', fontSize: '13px' }}>{orders.length} orders total</span>
                  <button className="btn-export" onClick={loadDashboardData}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>
                    Refresh
                  </button>
                </div>
              </div>

              <div className="inventory-table-wrapper">
                <table className="inventory-data-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Payment</th>
                      <th>Order Status</th>
                      <th>Date</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 && (
                      <tr><td colSpan="8" className="no-data">No orders found</td></tr>
                    )}
                    {orders.map(order => (
                      <OrderRow
                        key={order._id}
                        order={order}
                        getAuthHeaders={getAuthHeaders}
                        onRefresh={loadDashboardData}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'coupons' && (
            <div className="coupons-management">
              <div className="section-header">
                <h3>Coupon Management</h3>
              </div>

              {/* Add Coupon Form */}
              <div className="add-coupon-form">
                <h4>Create New Coupon</h4>
                <form onSubmit={handleCouponSubmit}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Coupon Code *</label>
                      <input
                        type="text"
                        value={couponForm.code}
                        onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                        placeholder="SAVE20"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Description *</label>
                      <input
                        type="text"
                        value={couponForm.description}
                        onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                        placeholder="20% off on all products"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Discount Type *</label>
                      <select
                        value={couponForm.discountType}
                        onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                        required
                      >
                        <option value="percentage">Percentage</option>
                        <option value="fixed">Fixed Amount</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Discount Value *</label>
                      <input
                        type="number"
                        value={couponForm.discountValue}
                        onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })}
                        placeholder={couponForm.discountType === 'percentage' ? '20' : '1000'}
                        min="0"
                        step={couponForm.discountType === 'percentage' ? '0.01' : '1'}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Minimum Order Amount</label>
                      <input
                        type="number"
                        value={couponForm.minOrderAmount}
                        onChange={(e) => setCouponForm({ ...couponForm, minOrderAmount: e.target.value })}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    {couponForm.discountType === 'percentage' && (
                      <div className="form-group">
                        <label>Maximum Discount Amount</label>
                        <input
                          type="number"
                          value={couponForm.maxDiscountAmount}
                          onChange={(e) => setCouponForm({ ...couponForm, maxDiscountAmount: e.target.value })}
                          placeholder="5000"
                          min="0"
                        />
                      </div>
                    )}
                    <div className="form-group">
                      <label>Usage Limit</label>
                      <input
                        type="number"
                        value={couponForm.usageLimit}
                        onChange={(e) => setCouponForm({ ...couponForm, usageLimit: e.target.value })}
                        placeholder="100"
                        min="1"
                      />
                    </div>
                    <div className="form-group">
                      <label>Valid From *</label>
                      <input
                        type="datetime-local"
                        value={couponForm.validFrom}
                        onChange={(e) => setCouponForm({ ...couponForm, validFrom: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Valid Until *</label>
                      <input
                        type="datetime-local"
                        value={couponForm.validUntil}
                        onChange={(e) => setCouponForm({ ...couponForm, validUntil: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={couponForm.isActive}
                          onChange={(e) => setCouponForm({ ...couponForm, isActive: e.target.checked })}
                        />
                        Active
                      </label>
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="submit-btn">
                    {loading ? 'Creating...' : 'Create Coupon'}
                  </button>
                </form>
              </div>

              {/* Coupons List */}
              <div className="coupons-list">
                <h4>Existing Coupons</h4>
                <div className="coupons-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Description</th>
                        <th>Discount</th>
                        <th>Usage</th>
                        <th>Valid Until</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coupons.map(coupon => (
                        <tr key={coupon._id}>
                          <td className="coupon-code">{coupon.code}</td>
                          <td>{coupon.description}</td>
                          <td>
                            {coupon.discountType === 'percentage'
                              ? `${coupon.discountValue}%`
                              : `₹${coupon.discountValue}`}
                            {coupon.maxDiscountAmount && ` (max ₹${coupon.maxDiscountAmount})`}
                          </td>
                          <td>
                            {coupon.usedCount || 0}
                            {coupon.usageLimit && ` / ${coupon.usageLimit}`}
                          </td>
                          <td>{new Date(coupon.validUntil).toLocaleDateString()}</td>
                          <td>
                            <span className={`status ${coupon.isActive ? 'active' : 'inactive'}`}>
                              {coupon.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() => deleteCoupon(coupon._id)}
                              className="delete-btn"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {coupons.length === 0 && (
                    <div className="empty-state">
                      <p>No coupons created yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
