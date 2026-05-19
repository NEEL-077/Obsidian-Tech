import React, { useState } from 'react';
import { MapPin, Plus, Edit2, Trash2, Home, Briefcase, Globe } from 'lucide-react';

const AddressModule = ({ 
  addresses, 
  onAddAddress, 
  onEditAddress, 
  onDeleteAddress,
  onSetDefault 
}) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    type: 'Home',
    isDefault: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddAddress(formData);
    setShowForm(false);
  };

  return (
    <div className="address-module">
      <div className="module-header">
        <h2>Your Addresses</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          <Plus size={20} /> Add New Address
        </button>
      </div>

      <div className="address-grid">
        {addresses.map((addr) => (
          <div key={addr._id} className={`address-card ${addr.isDefault ? 'default' : ''}`}>
            {addr.isDefault && <span className="default-badge">Default</span>}
            <div className="address-type-icon">
              {addr.type === 'Home' ? <Home size={18} /> : 
               addr.type === 'Work' ? <Briefcase size={18} /> : <Globe size={18} />}
              <span>{addr.type || 'Other'}</span>
            </div>
            <div className="address-card-body">
              <h4>{addr.name}</h4>
              <p className="phone">{addr.phone}</p>
              <p className="street">{addr.address}</p>
              <p className="locality">{addr.city}, {addr.state} - {addr.pincode}</p>
            </div>
            <div className="address-card-actions">
              <button 
                className="action-link edit"
                onClick={() => onEditAddress(addr)}
              >
                <Edit2 size={16} /> Edit
              </button>
              <button 
                className="action-link delete"
                onClick={() => onDeleteAddress(addr._id)}
              >
                <Trash2 size={16} /> Delete
              </button>
              {!addr.isDefault && (
                <button 
                  className="action-link set-default"
                  onClick={() => onSetDefault(addr._id)}
                >
                  Set as Default
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add New Address</h3>
              <button className="close-btn" onClick={() => setShowForm(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="address-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Address (House No, Building, Street, Area)</label>
                <textarea required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input type="text" required value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input type="text" required value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Pincode</label>
                  <input type="text" required value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value})} />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Address</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressModule;
