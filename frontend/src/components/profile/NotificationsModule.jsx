import React from 'react';
import { Bell, Mail, Smartphone, Megaphone, ShieldCheck } from 'lucide-react';

const NotificationsModule = ({ preferences, onUpdatePreferences }) => {
  const categories = [
    {
      id: 'order_updates',
      title: 'Order Tracking & Updates',
      description: 'Receive real-time notifications for order confirmation, shipping, and delivery.',
      icon: <Bell size={24} />,
      email: true,
      sms: true,
    },
    {
      id: 'promotions',
      title: 'Promotions & Offers',
      description: 'Get notified about sales, exclusive deals, and upcoming product launches.',
      icon: <Megaphone size={24} />,
      email: false,
      sms: false,
    },
    {
      id: 'security_alerts',
      title: 'Security & Account Alerts',
      description: 'Important alerts about password changes and unrecognized login attempts.',
      icon: <ShieldCheck size={24} />,
      email: true,
      sms: true,
      locked: true,
    },
    {
      id: 'newsletter',
      title: 'Weekly Newsletter',
      description: 'The latest tech news and blog posts from the OBSIDIAN TECH community.',
      icon: <Mail size={24} />,
      email: false,
      sms: false,
    }
  ];

  return (
    <div className="notifications-module">
      <div className="module-header">
        <div className="header-text">
          <h2>Notification Settings</h2>
          <p>Choose how you want to be notified about your account activity and orders.</p>
        </div>
      </div>

      <div className="notifications-list">
        {categories.map((cat) => (
          <div key={cat.id} className="notification-item">
            <div className="item-main">
              <div className="item-icon">{cat.icon}</div>
              <div className="item-info">
                <h3>{cat.title}</h3>
                <p>{cat.description}</p>
              </div>
            </div>
            
            <div className="item-toggles">
              <div className="toggle-group">
                <span className="toggle-label"><Mail size={14} /> Email</span>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    defaultChecked={cat.email} 
                    disabled={cat.locked}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
              <div className="toggle-group">
                <span className="toggle-label"><Smartphone size={14} /> SMS</span>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    defaultChecked={cat.sms} 
                    disabled={cat.locked}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="notification-actions">
        <button className="btn btn-primary" onClick={() => alert('Preferences saved!')}>
          Save Preferences
        </button>
      </div>
    </div>
  );
};

export default NotificationsModule;
