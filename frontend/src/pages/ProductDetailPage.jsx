import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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

    // Customization states
    const colors = [
        { name: 'Titanium', hex: '#878681' },
        { name: 'Midnight', hex: '#1c1d21' },
        { name: 'Starlight', hex: '#f0e5d3' },
        { name: 'Blue', hex: '#202f43' }
    ];

    const storages = [
        { size: '128GB', priceAdd: 0 },
        { size: '256GB', priceAdd: 10000 },
        { size: '512GB', priceAdd: 30000 },
        { size: '1TB', priceAdd: 50000 }
    ];

    const [selectedColor, setSelectedColor] = useState(colors[0]);
    const [selectedStorage, setSelectedStorage] = useState(storages[0]);
    const [appleCare, setAppleCare] = useState(false);

    useEffect(() => {
        getProductDetails(id);
    }, [id]);

    if (loading) return <div style={{ color: '#f5f5f7', textAlign: 'center', padding: '100px' }}>Loading...</div>;
    if (error) return <div style={{ color: '#ff453a', textAlign: 'center', padding: '100px' }}>{error}</div>;
    if (!product || !product.name) return null;

    const images = product.images && product.images.length > 0
        ? product.images
        : product.image
            ? [product.image]
            : ['/placeholder-phone.svg']; // We will use a proper layout or just let the image error handle it, or use SVG.

    const handleQuantityChange = (change) => {
        const newQuantity = quantity + change;
        if (newQuantity >= 1 && newQuantity <= (product.countInStock || 10)) {
            setQuantity(newQuantity);
        }
    };

    // Dynamic price calculation
    const currentPrice = (product.price || 0) + selectedStorage.priceAdd + (appleCare ? 14900 : 0);

    const handleAddToCart = (redirect = false) => {
        // Create a custom variant product to pass to the cart
        const customizedProduct = {
            ...product,
            price: currentPrice,
            name: `${product.name} - ${selectedStorage.size} - ${selectedColor.name}`
        };
        addToCart(customizedProduct, quantity);
        if (redirect) window.location.href = '/cart';
    };

    return (
        <div className="product-detail-page">
            <SEO title={`${product.name} - ${product.brand}`} />
            
            <Link to="/products" className="product-detail-back">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                Back to Shop
            </Link>

            <div className="product-detail-layout">
                {/* Image Panel */}
                <div className="product-detail-image-wrap">
                    {images[selectedImage].startsWith('/') && images[selectedImage] !== '/placeholder-phone.svg' ? (
                        <img src={images[selectedImage]} alt={product.name} />
                    ) : (
                        <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                    )}
                </div>

                {/* Info Panel */}
                <div className="product-detail-info">
                    <div className="product-detail-brand">{product.brand}</div>
                    <h1 className="product-detail-name">{product.name}</h1>
                    
                    <div className="product-detail-rating">
                        <span className="stars">{'★'.repeat(Math.round(product.rating || 0))}</span>
                        <span>{product.rating} ({product.numReviews || product.reviews?.length || 0} reviews)</span>
                    </div>

                    <div className="product-detail-price">₹{currentPrice.toLocaleString('en-IN')}</div>
                    {product.originalPrice > product.price && (
                        <div className="product-detail-price-old">MRP: ₹{(product.originalPrice + selectedStorage.priceAdd).toLocaleString('en-IN')}</div>
                    )}
                    <div className="product-detail-tax">Inclusive of all taxes</div>

                    {/* Apple-style Customizations */}
                    <div className="customizations-container">
                        {/* Color Selector */}
                        <div className="customization-section">
                            <h3>Color. <span>{selectedColor.name}</span></h3>
                            <div className="color-selector">
                                {colors.map(c => (
                                    <button 
                                        key={c.name}
                                        className={`color-btn ${selectedColor.name === c.name ? 'active' : ''}`}
                                        style={{ '--color': c.hex }}
                                        onClick={() => setSelectedColor(c)}
                                        aria-label={c.name}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Storage Selector */}
                        <div className="customization-section">
                            <h3>Storage. <span>How much space do you need?</span></h3>
                            <div className="storage-selector">
                                {storages.map(s => {
                                    const diff = s.priceAdd - selectedStorage.priceAdd;
                                    return (
                                        <button 
                                            key={s.size}
                                            className={`storage-btn ${selectedStorage.size === s.size ? 'active' : ''}`}
                                            onClick={() => setSelectedStorage(s)}
                                        >
                                            <span className="storage-size">{s.size}</span>
                                            {diff > 0 && <span className="storage-price">+₹{diff.toLocaleString('en-IN')}</span>}
                                            {diff < 0 && <span className="storage-price">-₹{Math.abs(diff).toLocaleString('en-IN')}</span>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Protection Plan */}
                        <div className="customization-section">
                            <h3>ObsidianCare+. <span>Protect your device.</span></h3>
                            <button 
                                className={`care-btn ${appleCare ? 'active' : ''}`}
                                onClick={() => setAppleCare(!appleCare)}
                            >
                                <div className="care-info">
                                    <span className="care-title">ObsidianCare+</span>
                                    <span className="care-desc">Includes accidental damage protection.</span>
                                </div>
                                <div className="care-price">
                                    {appleCare ? 'Added' : '₹14,900'}
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className={`product-detail-stock ${(product.countInStock > 0) ? 'in-stock' : 'out-of-stock'}`}>
                        {product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
                    </div>

                    <div className="product-detail-qty">
                        <label>Quantity</label>
                        <div className="qty-selector">
                            <button onClick={() => handleQuantityChange(-1)}>−</button>
                            <span>{quantity}</span>
                            <button onClick={() => handleQuantityChange(1)}>+</button>
                        </div>
                    </div>

                    <div className="product-detail-actions">
                        <button 
                            className="btn-buy-now"
                            disabled={product.countInStock === 0}
                            onClick={() => handleAddToCart(true)}
                        >
                            Buy Now
                        </button>
                        <button 
                            className="btn-add-to-cart-detail"
                            disabled={product.countInStock === 0}
                            onClick={() => handleAddToCart(false)}
                        >
                            Add to Bag
                        </button>
                    </div>
                </div>
            </div>

            {/* Specifications Table */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="product-detail-specs">
                    <h2>Tech Specs</h2>
                    <div className="specs-grid">
                        {Object.entries(product.specifications).map(([key, value]) => (
                            <div className="spec-row" key={key}>
                                <div className="spec-label">{key}</div>
                                <div className="spec-value">{value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetailPage;
