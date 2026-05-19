import React from 'react';
import { Package, Download, RefreshCw, ChevronRight, Truck } from 'lucide-react';

const OrdersModule = ({ orders, loading, onTrackOrder, onNavigate }) => {
  if (loading) return <div className="loading-spinner">Loading orders...</div>;

  if (orders.length === 0) {
    return (
      <div className="empty-state">
        <Package size={64} className="empty-icon" />
        <h3>No orders yet</h3>
        <p>Start shopping to see your orders here.</p>
        <button className="btn btn-primary" onClick={() => onNavigate('/products')}>
          Browse Products
        </button>
      </div>
    );
  }

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'status-delivered';
      case 'processing': return 'status-processing';
      case 'cancelled': return 'status-cancelled';
      case 'shipped': return 'status-shipped';
      default: return 'status-pending';
    }
  };

  return (
    <div className="orders-module">
      <div className="module-header">
        <h2>Your Orders</h2>
        <div className="order-filters">
          <button className="filter-pill active">All</button>
          <button className="filter-pill">Active</button>
          <button className="filter-pill">Cancelled</button>
        </div>
      </div>

      <div className="orders-list">
        {orders.map((order) => (
          <div key={order._id} className="order-card-premium">
            <div className="order-card-header">
              <div className="header-meta">
                <div className="meta-group">
                  <span className="label">Order Placed</span>
                  <span className="value">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="meta-group">
                  <span className="label">Total Amount</span>
                  <span className="value">₹{order.totalPrice.toLocaleString()}</span>
                </div>
                <div className="meta-group">
                  <span className="label">Order ID</span>
                  <span className="value">#{order._id.substring(0, 12)}</span>
                </div>
              </div>
              <div className="header-actions">
                <button className="action-link"><Download size={16} /> Invoice</button>
              </div>
            </div>

            <div className="order-card-body">
              <div className="status-indicator">
                <span className={`status-badge ${getStatusClass(order.orderStatus)}`}>
                  {order.orderStatus || (order.isDelivered ? 'Delivered' : 'Processing')}
                </span>
                <span className="arrival-date">Estimated: {new Date(order.createdAt).toLocaleDateString()}</span>
              </div>

              {order.orderItems.map((item, idx) => (
                <div key={idx} className="item-row">
                  <img src={item.image} alt={item.name} className="item-thumb" />
                  <div className="item-info">
                    <h4>{item.name}</h4>
                    <p className="item-price">₹{item.price.toLocaleString()} × {item.qty}</p>
                    <div className="item-actions">
                      <button className="btn btn-secondary btn-sm"><RefreshCw size={14} /> Buy it again</button>
                      <button className="btn btn-outline btn-sm">View Item</button>
                    </div>
                  </div>
                  <ChevronRight size={20} className="row-arrow" />
                </div>
              ))}
            </div>

            <div className="order-card-footer">
              <button 
                className="btn btn-primary"
                onClick={() => onTrackOrder(order._id)}
              >
                <Truck size={18} /> Track Shipment
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersModule;
