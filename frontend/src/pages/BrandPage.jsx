import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../api/productApi';
import { useCart } from '../context/CartContext';
import SEO from '../components/SEO';
import './BrandPage.css';

const BRAND_META = {
    apple: { display: 'iPhone', isNew: true },
    samsung: { display: 'Galaxy', isNew: false },
    oneplus: { display: 'OnePlus', isNew: true },
    google: { display: 'Pixel', isNew: false },
    xiaomi: { display: 'Xiaomi', isNew: false },
    motorola: { display: 'Motorola', isNew: false },
    realme: { display: 'Realme', isNew: false },
    vivo: { display: 'Vivo', isNew: false },
    oppo: { display: 'OPPO', isNew: false },
    nothing: { display: 'Nothing', isNew: true },
};

const DEFAULT_META = (name) => ({ display: name, isNew: false });

const BrandPage = () => {
    const { brandName } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    // Default to a generic name if brand isn't mapped, otherwise capitalize
    const formattedBrandName = brandName.charAt(0).toUpperCase() + brandName.slice(1);
    const meta = BRAND_META[brandName.toLowerCase()] || DEFAULT_META(formattedBrandName);

    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('All Models');

    const tabs = ['All Models', 'Ease of Switching', 'Ways to Save', 'Shopping Guides', 'Accessories'];

    const [searchParams] = useSearchParams();
    const categoryQuery = searchParams.get('category');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const data = await fetchProducts({ pageSize: 1000, pageNumber: 1 });
                // Filter to this brand client-side (case-insensitive match)
                let brandProducts = (data.products || []).filter(
                    p => (p.brand || '').toLowerCase().replace(/\s+/g, '-') === brandName.toLowerCase()
                );

                // If a category query parameter is present, filter by that category too
                if (categoryQuery) {
                    brandProducts = brandProducts.filter(
                        p => (p.category || '').toLowerCase().replace(/\s+/g, '-') === categoryQuery.toLowerCase().replace(/\s+/g, '-')
                    );
                }

                // Sort by price descending to put flagships first
                brandProducts.sort((a, b) => b.price - a.price);

                setAllProducts(brandProducts);
            } catch {
                setError('Failed to load products');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [brandName]);

    return (
        <div className="brand-page">
            <SEO
                title={`Shop ${meta.display} | OBSIDIAN TECH`}
                description={`Browse all ${meta.display} smartphones at OBSIDIAN TECH. Take your pick from our latest models.`}
                url={`/brand/${brandName}`}
            />

            <div className="brand-container">
                {/* Breadcrumbs */}
                <nav className="breadcrumbs" style={{ padding: '20px 0 0', fontSize: '0.875rem', color: '#a1a1a6', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Link to="/" style={{ color: '#a1a1a6', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#fff'} onMouseOut={e => e.target.style.color = '#a1a1a6'}>
                        Home
                    </Link>
                    {categoryQuery && (
                        <>
                            <span>›</span>
                            <Link to={`/category/${categoryQuery}`} style={{ color: '#a1a1a6', textDecoration: 'none', textTransform: 'capitalize', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#fff'} onMouseOut={e => e.target.style.color = '#a1a1a6'}>
                                {categoryQuery}
                            </Link>
                        </>
                    )}
                    <span>›</span>
                    <span style={{ color: '#f5f5f7' }}>{meta.display}</span>
                </nav>

                {/* Header matching Apple's Shop layout */}
                <header className="shop-header">
                    <h1 className="shop-title">Shop {meta.display}</h1>
                    <div className="shop-header-links">
                        <Link to="/contact" className="shop-header-link">Connect with a Specialist ↗</Link>

                    </div>
                </header>

                {/* Horizontal Navigation Tabs */}
                <nav className="shop-tabs-nav">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            className={`shop-tab ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>

                {/* Subtitle */}
                <h2 className="shop-section-title">
                    <span className="highlight">All models.</span> <span className="muted">Take your pick.</span>
                </h2>

                {/* Products Grid */}
                {loading && (
                    <div style={{ color: '#f5f5f7', padding: '40px 0' }}>Loading {meta.display} models...</div>
                )}
                {error && <div style={{ color: '#ff453a' }}>{error}</div>}

                {!loading && !error && allProducts.length === 0 && (
                    <div style={{ color: '#6e6e73', padding: '40px 0' }}>No models currently available for this brand.</div>
                )}

                {!loading && !error && allProducts.length > 0 && activeTab === 'All Models' && (
                    <div className="shop-grid">
                        {allProducts.map((product, idx) => {
                            // Determine if this product should get a "NEW" badge
                            const isNew = idx < 2 && meta.isNew;

                            return (
                                <Link
                                    to={`/product/${product._id || product.id}`}
                                    key={product._id || product.id}
                                    className="shop-card"
                                >
                                    <div className="shop-card-info">
                                        {isNew && <div className="shop-card-badge">NEW</div>}
                                        <div className="shop-card-title">{product.name}</div>
                                        <div className="shop-card-price">From ₹{product.price?.toLocaleString('en-IN')}</div>

                                        <div className="shop-card-actions">
                                            <button
                                                className="btn-buy"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    addToCart(product, 1);
                                                    navigate('/cart');
                                                }}
                                            >
                                                Buy
                                            </button>
                                        </div>
                                    </div>

                                    <div className="shop-card-image">
                                        {product.image && product.image.startsWith('/') ? (
                                            <img src={product.image} alt={product.name} />
                                        ) : (
                                            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}

                {/* Placeholders for other tabs */}
                {!loading && !error && activeTab !== 'All Models' && (
                    <div style={{ color: '#6e6e73', padding: '40px 0', minHeight: '300px' }}>
                        Content for {activeTab} is currently being updated. Please check back later.
                    </div>
                )}
            </div>
        </div>
    );
};

export default BrandPage;
