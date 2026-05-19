import React, { useState } from 'react';
import { Building2, Save, Edit2, CheckCircle, AlertTriangle } from 'lucide-react';

const GSTModule = ({ gstData, onUpdateGST }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(gstData || {
    businessName: '',
    gstNumber: '',
    billingAddress: '',
  });

  const [errors, setErrors] = useState({});

  const validateGst = (gst) => {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(gst);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.businessName) newErrors.businessName = 'Business name is required';
    if (!validateGst(formData.gstNumber)) newErrors.gstNumber = 'Invalid GST format';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onUpdateGST(formData);
    setIsEditing(false);
  };

  return (
    <div className="gst-module">
      <div className="module-header">
        <div className="header-text">
          <h2>Business GST Details</h2>
          <p>Add your business details to get GST invoices and claim tax credits.</p>
        </div>
        {!isEditing && (
          <button 
            className="btn btn-outline"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 size={18} /> Edit Details
          </button>
        )}
      </div>

      <div className="gst-content">
        {isEditing ? (
          <form className="gst-form" onSubmit={handleSave}>
            <div className="form-group">
              <label>Registered Business Name</label>
              <input 
                type="text" 
                placeholder="e.g. Acme Solutions Pvt Ltd"
                value={formData.businessName}
                onChange={(e) => setFormData({...formData, businessName: e.target.value})}
              />
              {errors.businessName && <p className="error-text">{errors.businessName}</p>}
            </div>
            <div className="form-group">
              <label>GSTIN (15-digit)</label>
              <input 
                type="text" 
                placeholder="e.g. 22AAAAA0000A1Z5"
                value={formData.gstNumber}
                onChange={(e) => setFormData({...formData, gstNumber: e.target.value.toUpperCase()})}
              />
              {errors.gstNumber && <p className="error-text">{errors.gstNumber}</p>}
            </div>
            <div className="form-group">
              <label>Billing Address</label>
              <textarea 
                placeholder="Full registered business address"
                value={formData.billingAddress}
                onChange={(e) => setFormData({...formData, billingAddress: e.target.value})}
              />
            </div>
            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-outline"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
              >
                <Save size={18} /> Save GST Details
              </button>
            </div>
          </form>
        ) : (
          <div className="gst-display-card">
            <div className="business-header">
              <Building2 size={48} className="business-icon" />
              <div className="business-info">
                <h3>{gstData?.businessName || 'No business details added'}</h3>
                {gstData?.gstNumber && (
                  <span className="gst-badge">
                    <CheckCircle size={14} /> verified
                  </span>
                )}
              </div>
            </div>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">GSTIN</span>
                <span className="value">{gstData?.gstNumber || 'Not available'}</span>
              </div>
              <div className="info-item">
                <span className="label">Billing Address</span>
                <span className="value">{gstData?.billingAddress || 'Not available'}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {!gstData?.gstNumber && !isEditing && (
        <div className="gst-banner-info">
          <AlertTriangle size={20} className="text-warning" />
          <p>Don't forget to add your GSTIN to get business invoices for your orders.</p>
        </div>
      )}
    </div>
  );
};

export default GSTModule;
