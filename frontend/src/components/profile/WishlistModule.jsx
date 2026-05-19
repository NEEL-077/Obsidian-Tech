import React from 'react';
import { Heart, ShoppingCart, Trash2, ChevronRight } from 'lucide-react';

const WishlistModule = ({ wishlist, onRemove, onMoveToCart, onNavigate }) => {
  if (wishlist.length === 0) {
    return (
      <div className="empty-state">
        <Heart size={64} className="empty-icon" />
        <h3>Your wishlist is empty</h3>
        <p>Save products you love for later shopping.</p>
        <button className="btn btn-primary" onClick={() => onNavigate('/products')}>
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="wishlist-module">
      <div className="module-header">
        <h2>Your Wishlist ({wishlist.length} Items)</h2>
        <p>Manage your saved items or move them to your shopping cart.</p>
      </div>

      <div className="wishlist-grid">
        {wishlist.map((item) => (
          <div key={item.productId} className="wishlist-card">
            <div className="card-top">
              <img src={item.product.image} alt={item.product.name} onClick={() => onNavigate(`/product/${item.productId}`)} />
              <button 
                className="remove-btn"
                onClick={() => onRemove(item.productId)}
                title="Remove from wishlist"
              >
                <Trash2 size={18} />
              </button>
            </div>
            
            <div className="card-info">
              <span className="brand">{item.product.brand}</span>
              <h3 onClick={() => onNavigate(`/product/${item.productId}`)}>
                {item.product.name}
              </h3>
              <div className="rating">
                <span className="stars">★★★★☆</span>
                <span className="reviews">(128)</span>
              </div>
              <div className="price">
                <span className="current">₹{item.product.price.toLocaleString()}</span>
                {item.product.oldPrice && (
                  <span className="old">₹{item.product.oldPrice.toLocaleString()}</span>
                )}
              </div>
            </div>

            <div className="card-actions">
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => onMoveToCart(item.productId)}
              >
                <ShoppingCart size={16} /> Add to Cart
              </button>
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => onNavigate(`/product/${item.productId}`)}
              >
                <ChevronRight size={16} /> Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistModule;
