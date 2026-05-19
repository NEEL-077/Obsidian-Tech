import React from 'react';
import { CreditCard, Plus, Trash2, Smartphone, ShieldCheck } from 'lucide-react';

const PaymentsModule = ({ user, payments, upiIds, onAddPayment, onDeletePayment, onDeleteUPI }) => {
  return (
    <div className="payments-module">
      <div className="module-header">
        <div className="header-text">
          <h2>Payment Methods</h2>
          <p>Saved cards and UPI IDs for faster checkout.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={onAddPayment}
        >
          <Plus size={20} /> Add New Method
        </button>
      </div>

      <div className="payments-grid">
        {payments.map((pmt) => (
          <div key={pmt.id} className={`payment-card ${pmt.isDefault ? 'default' : ''}`}>
            <div className="card-brand">
              {pmt.type === 'visa' ? <span className="brand-logo visa">VISA</span> :
                pmt.type === 'mastercard' ? <span className="brand-logo mastercard">MasterCard</span> : <CreditCard />}
              {pmt.isDefault && <span className="default-badge">Default</span>}
            </div>
            <div className="card-number">
              <span>**** **** ****</span>
              <span>{pmt.last4}</span>
            </div>
            <div className="card-footer">
              <div className="card-holder">
                <span className="label">Card Holder</span>
                <span className="name">{user?.name || pmt.name}</span>
              </div>
              <div className="card-expiry">
                <span className="label">Expires</span>
                <span className="expiry">{pmt.expiry}</span>
              </div>
              <button
                className="delete-icon"
                onClick={() => onDeletePayment(pmt.id)}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        <div className="upi-section">
          <h3>UPI IDs</h3>
          <div className="upi-list">
            {upiIds?.map((upi) => (
              <div key={upi.id} className="upi-item">
                <div className="upi-info">
                  <Smartphone size={20} />
                  <span>{upi.value}</span>
                </div>
                <button
                  className="action-link delete"
                  onClick={() => onDeleteUPI(upi.id)}
                >
                  Remove
                </button>
              </div>
            ))}
            {upiIds?.length === 0 && (
              <p className="no-upi-text">No UPI IDs saved.</p>
            )}
          </div>
        </div>
      </div>

      <div className="security-info">
        <ShieldCheck size={20} className="text-success" />
        <p>OBSIDIAN TECH uses industry-standard 256-bit encryption to protect your payment details.</p>
      </div>
    </div>
  );
};

export default PaymentsModule;
