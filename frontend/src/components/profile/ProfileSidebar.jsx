import React from 'react';
import {
  User,
  Package,
  Undo2,
  MapPin,
  CreditCard,
  Building2,
  ShieldCheck,
  Bell,
  Heart,
  LifeBuoy,
  LogOut
} from 'lucide-react';

const ProfileSidebar = ({ activeTab, setActiveTab, onLogout, user }) => {
  const menuItems = [
    { id: 'overview', label: 'Profile Overview', icon: <User size={20} /> },
    { id: 'orders', label: 'My Orders', icon: <Package size={20} /> },
    { id: 'returns', label: 'Returns & Refunds', icon: <Undo2 size={20} /> },
    { id: 'addresses', label: 'Addresses', icon: <MapPin size={20} /> },
    { id: 'payments', label: 'Payment Methods', icon: <CreditCard size={20} /> },
    { id: 'security', label: 'Login & Security', icon: <ShieldCheck size={20} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={20} /> },
    { id: 'wishlist', label: 'Wishlist', icon: <Heart size={20} /> },
    { id: 'support', label: 'Help Center', icon: <LifeBuoy size={20} /> },
  ];

  return (
    <aside className="profile-sidebar">
      <div className="sidebar-user-card">
        <div className="user-avatar">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} />
          ) : (
            <span>{user?.name?.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="user-meta">
          <h3>{user?.name}</h3>
          <p>{user?.email}</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={onLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default ProfileSidebar;
