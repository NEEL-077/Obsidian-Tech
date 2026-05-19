import React from 'react';
import { Undo2, Truck, CheckCircle, RefreshCcw } from 'lucide-react';

const ReturnsModule = ({ returns, onInitiateReturn }) => {
  return (
    <div className="returns-module">
      <div className="module-header">
        <h2>Returns & Refunds</h2>
        <p>Track your return requests and refund status below.</p>
        <button 
          className="btn btn-primary"
          onClick={onInitiateReturn}
        >
          <Undo2 size={20} /> Initiate a Return
        </button>
      </div>

      <div className="returns-list">
        {returns.map((ret) => (
          <div key={ret.id} className="return-card">
            <div className="return-header">
              <div className="return-meta">
                <span className="return-id">#{ret.id}</span>
                <span className="return-date">Requested on {new Date(ret.date).toLocaleDateString()}</span>
              </div>
              <div className={`status-badge ${ret.status}`}>
                {ret.status === 'refunded' ? <CheckCircle size={14} /> : <Truck size={14} />}
                {ret.status.charAt(0).toUpperCase() + ret.status.slice(1)}
              </div>
            </div>

            <div className="return-body">
              <div className="product-info-compact">
                <img src={ret.image} alt={ret.productName} className="product-thumb" />
                <div className="product-details">
                  <h4>{ret.productName}</h4>
                  <p className="order-ref">From Order #{ret.orderId}</p>
                  <p className="return-reason">Reason: {ret.reason}</p>
                </div>
              </div>
              <div className="refund-summary">
                <span className="label">Refund Amount</span>
                <span className="value">₹{ret.amount.toLocaleString()}</span>
                <span className="method">Original Payment Method</span>
              </div>
            </div>

            <div className="return-footer">
              <button className="action-btn">
                <RefreshCcw size={16} /> View Refund History
              </button>
            </div>
          </div>
        ))}

        {returns.length === 0 && (
          <div className="empty-state">
            <Undo2 size={48} className="empty-icon" />
            <h3>No returns found</h3>
            <p>You haven't initiated any returns yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReturnsModule;
