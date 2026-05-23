import React, { useEffect } from 'react';
import { motion } from 'motion/react';

const InvoiceModal = ({ isOpen, onClose, order }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const orderItems = order.orderItems || order.order_items || [];
  const shippingAddress = order.shippingAddress || order.shipping_address || {};
  const orderId = (order._id || order.id || '').toString().slice(-8).toUpperCase();
  const orderDateString = order.createdAt || order.created_at || new Date().toISOString();
  const orderDate = new Date(orderDateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const orderPrice = order.totalPrice !== undefined ? order.totalPrice : (order.total_price || 0);
  const shipping = order.shippingPrice !== undefined ? order.shippingPrice : (order.shipping_price || 0);
  const subtotal = orderPrice - shipping;
  const totalPrice = orderPrice;

  const customerName = order.userName || order.shippingAddress?.fullName || order.shipping_address?.fullName || order.user?.name || 'Valued Customer';
  const customerEmail = order.userEmail || order.user?.email || 'N/A';
  const paymentMethod = order.paymentMethod || order.payment_method || 'Card';
  const isPaid = order.isPaid !== undefined ? order.isPaid : (order.is_paid || false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="invoice-modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <style>{`
        /* --- Standard On-Screen Modal Glow/Scroll --- */
        .invoice-card {
          max-height: 90vh;
          overflow-y: auto;
          background: rgba(17, 24, 39, 0.85) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 16px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
          width: 100%;
          max-width: 760px;
          padding: 32px;
          color: #f8fafc;
          position: relative;
        }

        /* --- PDF/PRINT MEDIA OVERLAYS (CRITICAL) --- */
        @media print {
          /* Hide everything except the invoice container */
          body * {
            visibility: hidden;
            background: transparent !important;
          }
          .invoice-modal-overlay {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            background: transparent !important;
            backdrop-filter: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            height: 100% !important;
            display: block !important;
          }
          .invoice-card, .invoice-card * {
            visibility: visible;
          }
          .invoice-card {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            overflow: visible !important;
          }
          /* Print color corrections */
          .print-title {
            color: #0f172a !important;
          }
          .print-label {
            color: #475569 !important;
          }
          .print-value {
            color: #0f172a !important;
          }
          .print-table-header {
            background-color: #f1f5f9 !important;
            color: #0f172a !important;
            border-bottom: 2px solid #cbd5e1 !important;
          }
          .print-table-row {
            border-bottom: 1px solid #e2e8f0 !important;
            color: #334155 !important;
          }
          .print-summary-bg {
            background-color: #f8fafc !important;
            border-top: 2px solid #e2e8f0 !important;
          }
          .print-hide {
            display: none !important;
          }
        }
      `}</style>

      <motion.div 
        className="invoice-card"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Print & Action Controls (Hidden when printing PDF) */}
        <div 
          className="print-hide" 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginBottom: '24px', 
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            paddingBottom: '16px'
          }}
        >
          <span style={{ fontSize: '14px', color: '#9ca3af', fontWeight: '500' }}>📄 Official Invoice</span>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={handlePrint}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                color: '#fff',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>🖨️</span> Save as PDF / Print
            </button>
            <button 
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                color: '#f8fafc',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>

        {/* Invoice Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 className="print-title" style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#f8fafc', letterSpacing: '1px' }}>
              🏢 OBSIDIAN TECH
            </h1>
            <p className="print-label" style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#9ca3af' }}>
              Premium Intelligent Smart Hub Ecosystem
            </p>
            <p className="print-label" style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
              GSTIN: 24OBSID7762T1ZA
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 className="print-title" style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#f8fafc' }}>
              INVOICE
            </h2>
            <p className="print-label" style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#9ca3af' }}>
              Order ref: <strong className="print-value" style={{ color: '#e2e8f0' }}>#{orderId}</strong>
            </p>
            <p className="print-label" style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#9ca3af' }}>
              Date: <span className="print-value" style={{ color: '#cbd5e1' }}>{orderDate}</span>
            </p>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', margin: '24px 0', borderColor: 'rgba(255, 255, 255, 0.08)' }}></div>

        {/* Customer & Shipping details info */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          <div>
            <h4 className="print-title" style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Billing Details
            </h4>
            <p className="print-value" style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#f8fafc' }}>
              {customerName}
            </p>
            <p className="print-label" style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#9ca3af' }}>
              Email: {customerEmail}
            </p>
            <p className="print-label" style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#9ca3af' }}>
              Payment Mode: <span style={{ textTransform: 'uppercase' }}>{paymentMethod}</span>
            </p>
            <p className="print-label" style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#9ca3af' }}>
              Payment Status: <strong style={{ color: isPaid ? '#10b981' : '#ef4444' }}>{isPaid ? 'PAID' : 'PENDING'}</strong>
            </p>
          </div>
          <div>
            <h4 className="print-title" style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Shipping Destination
            </h4>
            <p className="print-value" style={{ margin: 0, fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5' }}>
              {shippingAddress.address || 'N/A'}<br />
              {shippingAddress.city} — {shippingAddress.postalCode || 'N/A'}<br />
              {shippingAddress.country || 'India'}
            </p>
          </div>
        </div>

        {/* Items Table */}
        <div style={{ overflowX: 'auto', marginBottom: '32px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr className="print-table-header" style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <th style={{ padding: '12px 16px', color: '#9ca3af', fontWeight: '600' }}>Product Details</th>
                <th style={{ padding: '12px 16px', color: '#9ca3af', fontWeight: '600', textAlign: 'center' }}>Qty</th>
                <th style={{ padding: '12px 16px', color: '#9ca3af', fontWeight: '600', textAlign: 'right' }}>Price</th>
                <th style={{ padding: '12px 16px', color: '#9ca3af', fontWeight: '600', textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {orderItems.map((item, idx) => (
                <tr className="print-table-row" key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '16px', fontWeight: '500', color: '#f8fafc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img 
                        className="print-hide" 
                        src={item.image || item.image_url} 
                        alt={item.name} 
                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} 
                      />
                      <span>{item.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center', color: '#cbd5e1' }}>{item.qty || item.quantity}</td>
                  <td style={{ padding: '16px', textAlign: 'right', color: '#cbd5e1' }}>₹{item.price?.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '16px', textAlign: 'right', fontWeight: '600', color: '#f8fafc' }}>
                    ₹{((item.price || 0) * (item.qty || item.quantity || 1))?.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pricing calculations details */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div className="print-summary-bg" style={{ width: '100%', maxWidth: '320px', background: 'rgba(255, 255, 255, 0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
              <span className="print-label" style={{ color: '#9ca3af' }}>Subtotal (Incl. GST)</span>
              <span className="print-value" style={{ color: '#cbd5e1', fontWeight: '500' }}>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13px' }}>
              <span className="print-label" style={{ color: '#9ca3af' }}>Shipping charges</span>
              <span className="print-value" style={{ color: '#cbd5e1', fontWeight: '500' }}>
                {shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString('en-IN')}`}
              </span>
            </div>
            
            {/* GST Details (Tax component isolation) */}
            <div style={{ borderTop: '1px dashed rgba(255, 255, 255, 0.1)', paddingTop: '10px', marginBottom: '12px', fontSize: '11px', color: '#6b7280' }}>
              <div style={{ display: 'flex', justifyBetween: 'row', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Base taxable amount:</span>
                <span>₹{(subtotal / 1.18).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
              <div style={{ display: 'flex', justifyBetween: 'row', justifyContent: 'space-between' }}>
                <span>CGST (9%) + SGST (9%):</span>
                <span>₹{(subtotal - (subtotal / 1.18)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <span className="print-label" style={{ fontSize: '15px', fontWeight: 'bold', color: '#e2e8f0' }}>Invoice Total</span>
              <span className="print-value" style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>₹{totalPrice.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Official signature stamp placeholder */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '48px' }}>
          <div>
            <p className="print-label" style={{ margin: 0, fontSize: '12px', color: '#6b7280', fontStyle: 'italic' }}>
              This is a computer-generated official document. No physical signature is required.
            </p>
          </div>
          <div style={{ textAlign: 'center', minWidth: '150px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px' }}>
            <span className="print-label" style={{ fontSize: '12px', color: '#9ca3af', display: 'block' }}>Authorized Signatory</span>
            <span style={{ fontSize: '12px', color: '#6b7280', display: 'block', textTransform: 'uppercase', marginTop: '2px', fontWeight: '600' }}>Obsidian Tech</span>
          </div>
        </div>

      </motion.div>
    </div>
  );
};

export default InvoiceModal;
