import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const [isAdded, setIsAdded] = useState(false);

    const {
        _id,
        id,
        name = 'iPhone 15 Pro',
        brand = 'Apple',
        price = 99517,
        originalPrice = 107917,
        image = '/images/phones/apple-iphone-15-pro.jpg',
        rating = 0,
        numReviews = 0,
        reviews,           // legacy fallback
        badge = null,
        inStock = true,
        countInStock,
    } = product || {};

    const reviewCount = numReviews || reviews || 0;
    const parsedRating = parseFloat(rating) || 0;
    const isInStock = inStock !== undefined ? inStock : (countInStock > 0);


    const productId = _id || id;
    const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

    const handleAddToCart = (e) => {
        e.preventDefault(); // Prevent navigation when clicking add to cart
        e.stopPropagation();
        addToCart(product);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    const handleWishlist = (e) => {
        e.preventDefault(); // Prevent navigation when clicking wishlist
        e.stopPropagation();
        // Add wishlist functionality here
    };

    return (
        <Link to={`/product/${productId}`} className="product-card-link">
            <div className="product-card">
                {badge && <div className="product-badge badge badge-primary">{badge}</div>}
                {discount > 0 && <div className="product-discount">-{discount}%</div>}

                <div className="product-image-wrapper">
                    <div className="product-image">
                        {image.startsWith('/') ? (
                            <img src={image} alt={`${brand} ${name} — Buy Online at OBSIDIAN TECH`} className="product-img" />
                        ) : (
                            <span className="product-emoji">{image}</span>
                        )}
                    </div>
                    <div className="product-overlay">
                        <span className="quick-view-label">
                            Quick View
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M5 12h14M12 5l7 7-7 7"/>
                            </svg>
                        </span>
                    </div>
                    <button className="wishlist-btn" title="Add to wishlist" onClick={handleWishlist}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                    </button>
                </div>

                <div className="product-info">
                    <div className="product-brand">{brand}</div>
                    <h3 className="product-name">{name}</h3>

                    <div className="product-rating">
                        <span className="rating-stars">★</span>
                        <span className="rating-value">{parsedRating.toFixed(1)}</span>
                        <span className="rating-count">({reviewCount})</span>
                    </div>

                    <div className="product-price-row">
                        <div className="product-pricing">
                            <div className="product-price-wrapper">
                                <span className="product-price">₹{price.toLocaleString('en-IN')}</span>
                                <span className="tax-inclusive-label">(Incl. of all taxes)</span>
                            </div>
                            {originalPrice && originalPrice > price && (
                                <span className="product-price-old">₹{originalPrice.toLocaleString('en-IN')}</span>
                            )}
                        </div>
                        {!isInStock && <span className="stock-badge">Out of Stock</span>}
                    </div>

                    <button
                        className={`btn btn-primary btn-add-cart ${isAdded ? 'added' : ''}`}
                        onClick={handleAddToCart}
                        disabled={!isInStock}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                            <circle cx="9" cy="21" r="1" />
                            <circle cx="20" cy="21" r="1" />
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                        <span>{isAdded ? '✓ Added!' : (isInStock ? 'Add to Cart' : 'Unavailable')}</span>
                    </button>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
