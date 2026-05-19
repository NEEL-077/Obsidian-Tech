import React from 'react';
import { Package, Heart, ShieldCheck, LifeBuoy, ChevronRight, UserCircle } from 'lucide-react';

const ProfileOverview = ({ user, activeOrders, wishlistCount, onTabChange }) => {
  const cards = [
    {
      id: 'orders',
      title: 'Your Orders',
      description: 'Track, return, or buy things again',
      icon: <Package size={32} />,
      count: activeOrders.length,
    },
    {
      id: 'security',
      title: 'Login & Security',
      description: 'Edit login, name, and mobile number',
      icon: <ShieldCheck size={32} />,
    },
    {
      id: 'addresses',
      title: 'Your Addresses',
      description: 'Edit addresses for orders and gifts',
      icon: <UserCircle size={32} />,
      count: user?.addresses?.length || 0,
    },
    {
      id: 'wishlist',
      title: 'Your Wishlist',
      description: 'View and buy items from your wishlist',
      icon: <Heart size={32} />,
      count: wishlistCount,
    },
    {
      id: 'support',
      title: 'Help Center',
      description: 'Contact us for any issues or queries',
      icon: <LifeBuoy size={32} />,
    }
  ];

  const profileCompletion = 75; // Mock percentage

  return (
    <div className="profile-overview-tab">
      <header className="overview-header">
        <div className="header-text">
          <h2>Hello, {user?.name.split(' ')[0]}!</h2>
          <p>Welcome to your account dashboard.</p>
        </div>
        <div className="profile-progress">
          <div className="progress-info">
            <span>Profile Completion</span>
            <span>{profileCompletion}%</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${profileCompletion}%` }}></div>
          </div>
        </div>
      </header>

      <div className="overview-grid">
        {cards.map((card) => (
          <div
            key={card.id}
            className="overview-card"
            onClick={() => onTabChange(card.id)}
          >
            <div className="card-icon">{card.icon}</div>
            <div className="card-content">
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              {card.count !== undefined && (
                <span className="card-badge">{card.count} items</span>
              )}
            </div>
            <ChevronRight className="card-arrow" size={20} />
          </div>
        ))}
      </div>

      <section className="recent-activity">
        <h3>Account Status</h3>
        <div className="status-grid">
          <div className="status-card">
            <span className="status-label">Member Since</span>
            <span className="status-value">{new Date(user?.createdAt).getFullYear() || 2024}</span>
          </div>
          <div className="status-card">
            <span className="status-label">Account Type</span>
            <span className="status-value">{user?.isAdmin ? 'Administrator' : 'Premium Customer'}</span>
          </div>
          <div className="status-card">
            <span className="status-label">Verified Email</span>
            <span className="status-value text-success">Yes</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProfileOverview;
