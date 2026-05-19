import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProduct } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import SEO from '../components/SEO';
import './ProductDetailPage.css';

const ProductDetailPage = () => {
    const { id } = useParams();
    const { getProductDetails, productDetails: product, loading, error } = useProduct();
    const { addToCart } = useCart();

    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedStorage, setSelectedStorage] = useState(0); // Index of selected storage option

    useEffect(() => {
        getProductDetails(id);
    }, [id]);

    if (loading) return <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>Loading product details...</div>;
    if (error) return <div className="container" style={{ padding: '100px 0', textAlign: 'center', color: 'red' }}>{error}</div>;
    if (!product || !product.name) return null;

    const images = product.images && product.images.length > 0
        ? product.images
        : product.image
            ? [product.image]
            : ['📱'];
    const features = product.features || [];
    const specifications = product.specifications || {};
    const reviews = product.reviews || [];
    const storageOptions = product.storageOptions || [];

    // Get current storage option details
    const currentStorage = storageOptions.length > 0 ? storageOptions[selectedStorage] : {
        storage: product.specs?.Storage || '128GB',
        price: product.price,
        originalPrice: product.originalPrice,
        inStock: product.countInStock > 0,
        countInStock: product.countInStock
    };

    // Build JSON-LD Product schema for Google Rich Results
    const productSchema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        brand: { '@type': 'Brand', name: product.brand },
        description: product.description || `Buy ${product.name} by ${product.brand} at OBSIDIAN TECH.`,
        image: images[0]?.startsWith('/') ? `https://www.OBSIDIAN TECH.com${images[0]}` : images[0],
        sku: product._id || product.id,
        offers: {
            '@type': 'Offer',
            url: `https://www.OBSIDIAN TECH.com/product/${product._id || product.id}`,
            priceCurrency: 'INR',
            price: product.price,
            priceValidUntil: '2026-12-31',
            availability: product.inStock
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            seller: { '@type': 'Organization', name: 'OBSIDIAN TECH' },
        },
        ...(product.rating && {
            aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: product.rating,
                reviewCount: product.reviews || 1,
                bestRating: 5,
                worstRating: 1,
            },
        }),
    };

    const productImage = images[0]?.startsWith('/') ? images[0] : null;

    const handleQuantityChange = (change) => {
        const newQuantity = quantity + change;
        if (newQuantity >= 1 && newQuantity <= 10) {
            setQuantity(newQuantity);
        }
    };

    return (
        <div className="product-detail-page">
            <SEO
                title={`${product.name} — ${product.brand}`}
                description={`Buy ${product.name} by ${product.brand} at ₹${product.price?.toLocaleString('en-IN')}. ${product.description || 'Top-rated smartphone available at OBSIDIAN TECH with free shipping.'}`}
                image={productImage}
                url={`/product/${product._id || product.id}`}
                type="product"
                jsonLd={productSchema}
            />
            <div className="container">
                {/* Breadcrumb */}
                <div className="breadcrumb">
                    <a href="/">Home</a>
                    <span>/</span>
                    <a href="/products">Products</a>
                    <span>/</span>
                    <span>{product.name}</span>
                </div>

                <div className="product-detail-layout">
                    {/* Image Gallery */}
                    <div className="product-gallery">
                        <div className="gallery-main">
                            {images[selectedImage].startsWith('/') ? (
                                <img
                                    src={images[selectedImage]}
                                    alt={`${product.brand} ${product.name}`}
                                    className="main-image"
                                />
                            ) : (
                                <span className="main-image">{images[selectedImage]}</span>
                            )}
                            {product.originalPrice > product.price && (
                                <div className="discount-badge">
                                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                                </div>
                            )}
                        </div>
                        <div className="gallery-thumbnails">
                            {images.map((img, index) => (
                                <button
                                    key={index}
                                    className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                                    onClick={() => setSelectedImage(index)}
                                >
                                    {img.startsWith('/') ? (
                                        <img
                                            src={img}
                                            alt={`${product.brand} ${product.name} view ${index + 1}`}
                                            className="thumbnail-img"
                                        />
                                    ) : (
                                        <span>{img}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="product-info-section">
                        <div className="product-brand-badge">{product.brand}</div>
                        <h1 className="product-title">{product.name}</h1>

                        <div className="product-rating-row">
                            <div className="rating-display">
                                <span className="stars">★</span>
                                <span className="rating-value">{product.rating}</span>
                                <span className="rating-count">({product.reviews} reviews)</span>
                            </div>
                            {currentStorage.inStock && <span className="stock-badge in-stock">In Stock ({currentStorage.countInStock} available)</span>}
                        </div>

                        <div className="product-pricing">
                            <div className="price-main-row">
                                <span className="current-price">₹{currentStorage.price.toLocaleString('en-IN')}</span>
                                <span className="tax-label">(Inclusive of all taxes)</span>
                            </div>
                            {currentStorage.originalPrice && currentStorage.originalPrice > currentStorage.price && (
                                <span className="original-price">₹{currentStorage.originalPrice.toLocaleString('en-IN')}</span>
                            )}
                        </div>

                        <p className="product-description">{product.description}</p>

                        {/* Storage Options */}
                        {storageOptions.length > 0 && (
                            <div className="storage-section">
                                <label>Storage:</label>
                                <div className="storage-options">
                                    {storageOptions.map((option, index) => (
                                        <button
                                            key={index}
                                            className={`storage-option ${selectedStorage === index ? 'selected' : ''} ${!option.inStock ? 'out-of-stock' : ''}`}
                                            onClick={() => setSelectedStorage(index)}
                                            disabled={!option.inStock}
                                        >
                                            <span className="storage-size">{option.storage}</span>
                                            <span className="storage-price">₹{option.price.toLocaleString('en-IN')}</span>
                                            {!option.inStock && <span className="out-of-stock-label">Out of Stock</span>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity Selector */}
                        <div className="quantity-section">
                            <label>Quantity:</label>
                            <div className="quantity-controls">
                                <button onClick={() => handleQuantityChange(-1)}>−</button>
                                <span>{quantity}</span>
                                <button onClick={() => handleQuantityChange(1)}>+</button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="product-actions">
                            <button
                                className="btn btn-primary btn-lg"
                                onClick={() => addToCart({
                                    ...product,
                                    price: currentStorage.price,
                                    storage: currentStorage.storage,
                                    selectedStorageOption: selectedStorage
                                }, quantity)}
                                disabled={!currentStorage.inStock}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                                    <circle cx="9" cy="21" r="1" />
                                    <circle cx="20" cy="21" r="1" />
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                </svg>
                                <span>{!currentStorage.inStock ? 'Out of Stock' : 'Add to Cart'}</span>
                            </button>
                            <button className="btn btn-outline btn-lg">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                </svg>
                                Wishlist
                            </button>
                        </div>

                        <div className="key-features">
                            <h3>Key Features</h3>
                            <ul>
                                {features.map((feature, index) => (
                                    <li key={index}>✓ {feature}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Specifications */}
                {Object.keys(specifications).length > 0 && (
                    <div className="specifications-section">
                        <h2>Specifications</h2>
                        <div className="specs-grid">
                            {Object.entries(specifications).map(([key, value]) => (
                                <div key={key} className="spec-item">
                                    <span className="spec-label">{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</span>
                                    <span className="spec-value">{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Reviews */}
                <div className="reviews-section">
                    <div className="reviews-header">
                        <h2>Customer Reviews</h2>
                        <button className="btn btn-outline">Write a Review</button>
                    </div>

                    <div className="reviews-list">
                        {reviews.length === 0 && <p style={{ marginTop: '20px' }}>No reviews yet.</p>}
                        {reviews.map(review => (
                            <div key={review._id || review.id} className="review-card">
                                <div className="review-header">
                                    <div className="review-user">
                                        <div className="user-avatar">{review.name ? review.name.charAt(0) : 'U'}</div>
                                        <div>
                                            <h4>{review.name || review.user}</h4>
                                            <span className="review-date">{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : review.date}</span>
                                        </div>
                                    </div>
                                    <div className="review-rating">
                                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                    </div>
                                </div>
                                <p className="review-comment">{review.comment}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
