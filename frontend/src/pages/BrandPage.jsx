import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { fetchProducts } from '../api/productApi';
import SEO from '../components/SEO';
import './BrandPage.css';

const BRAND_META = {
    apple: { display: 'Apple', accent: '#1d1d1f', bg: 'linear-gradient(135deg,#1d1d1f 0%,#3a3a3c 100%)', logo: '/logos/apple.png', tagline: 'Think Different' },
    samsung: { display: 'Samsung', accent: '#1428A0', bg: 'linear-gradient(135deg,#1428A0 0%,#0d47a1 100%)', logo: '/logos/samsung.png', tagline: 'Do What You Can\'t' },
    oneplus: { display: 'OnePlus', accent: '#eb0029', bg: 'linear-gradient(135deg,#eb0029 0%,#b71c1c 100%)', logo: '/logos/one-plus.png', tagline: 'Never Settle' },
    google: { display: 'Google', accent: '#4285F4', bg: 'linear-gradient(135deg,#4285F4 0%,#0d47a1 100%)', logo: '/logos/google.png', tagline: 'Made by Google' },
    xiaomi: { display: 'Xiaomi', accent: '#FF6900', bg: 'linear-gradient(135deg,#FF6900 0%,#e65100 100%)', logo: '/logos/xiaomi.png', tagline: 'Innovation for Everyone' },
    motorola: { display: 'Motorola', accent: '#0E6EB8', bg: 'linear-gradient(135deg,#0E6EB8 0%,#01579b 100%)', logo: '/logos/MOTOROLA.png', tagline: 'Ready For Anything' },
    realme: { display: 'Realme', accent: '#f5a623', bg: 'linear-gradient(135deg,#f5a623 0%,#f57f17 100%)', emoji: '🟡', tagline: 'Dare to Leap' },
    vivo: { display: 'Vivo', accent: '#415FFF', bg: 'linear-gradient(135deg,#415FFF 0%,#1a237e 100%)', emoji: '🔷', tagline: 'More Joy, More Life' },
    oppo: { display: 'OPPO', accent: '#1D6FA4', bg: 'linear-gradient(135deg,#1D6FA4 0%,#0d47a1 100%)', emoji: '🔹', tagline: 'Inspiration Ahead' },
    nothing: { display: 'Nothing', accent: '#222222', bg: 'linear-gradient(135deg,#333 0%,#111 100%)', emoji: '⬜', tagline: 'The Truth in Design' },
};
const DEFAULT_META = (name) => ({ display: name, accent: '#667eea', bg: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)', emoji: '📱', tagline: 'Premium Smartphones' });

const BrandPage = () => {
    const { brandName } = useParams();
    const meta = BRAND_META[brandName] || DEFAULT_META(brandName);

    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [keyword, setKeyword] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [minRating, setMinRating] = useState(0);
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const data = await fetchProducts({ pageSize: 1000, pageNumber: 1 });
                // Filter to this brand client-side (case-insensitive match)
                const brandProducts = (data.products || []).filter(
                    p => (p.brand || '').toLowerCase().replace(/\s+/g, '-') === brandName
                );
                setAllProducts(brandProducts);
            } catch {
                setError('Failed to load products');
            } finally {
                setLoading(false);
            }
        };
        load();
        // Reset filters on brand change
        setKeyword(''); setMinPrice(''); setMaxPrice(''); setMinRating(0);
        setSortBy('name'); setSortOrder('asc');
    }, [brandName]);

    const filtered = useMemo(() => {
        let result = [...allProducts];
        if (keyword) {
            const kw = keyword.toLowerCase();
            result = result.filter(p => (p.name || '').toLowerCase().includes(kw));
        }
        if (minPrice !== '') result = result.filter(p => p.price >= Number(minPrice));
        if (maxPrice !== '') result = result.filter(p => p.price <= Number(maxPrice));
        if (minRating > 0) result = result.filter(p => parseFloat(p.rating) >= minRating);

        result.sort((a, b) => {
            let va, vb;
            if (sortBy === 'price') { va = a.price; vb = b.price; }
            else if (sortBy === 'rating') { va = a.rating; vb = b.rating; }
            else if (sortBy === 'reviews') { va = a.numReviews; vb = b.numReviews; }
            else { va = (a.name || '').toLowerCase(); vb = (b.name || '').toLowerCase(); }
            if (va < vb) return sortOrder === 'asc' ? -1 : 1;
            if (va > vb) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
        return result;
    }, [allProducts, keyword, minPrice, maxPrice, minRating, sortBy, sortOrder]);

    const toggleSort = (key) => {
        if (sortBy === key) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
        else { setSortBy(key); setSortOrder('asc'); }
    };

    const clearFilters = () => {
        setKeyword(''); setMinPrice(''); setMaxPrice(''); setMinRating(0);
    };

    const priceRange = useMemo(() => {
        if (!allProducts.length) return { min: 0, max: 0 };
        return {
            min: Math.min(...allProducts.map(p => p.price)),
            max: Math.max(...allProducts.map(p => p.price)),
        };
    }, [allProducts]);

    return (
        <div className="brand-page" style={{ '--brand-accent': meta.accent, '--brand-bg': meta.bg }}>
            <SEO
                title={`${meta.display} Phones`}
                description={`Browse all ${meta.display} smartphones at OBSIDIAN TECH. ${allProducts.length} models available.`}
                url={`/brand/${brandName}`}
            />

            {/* Hero Banner */}
            <div className="brand-hero">
                <div className="brand-hero-bg"></div>
                <div className="brand-hero-content">
                    <Link to="/products" className="brand-back-link">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                        All Brands
                    </Link>
                    <div className="brand-hero-info">
                        {meta.logo ? (
                            <img src={meta.logo} alt={meta.display} className="brand-hero-logo" />
                        ) : (
                            <span className="brand-hero-emoji">{meta.emoji}</span>
                        )}
                        <div>
                            <h1 className="brand-hero-title">{meta.display}</h1>
                            <p className="brand-hero-tagline">{meta.tagline}</p>
                        </div>
                    </div>
                    <div className="brand-hero-stats">
                        <div className="brand-stat-pill">
                            <span className="stat-value">{allProducts.length}</span>
                            <span className="stat-label">Models</span>
                        </div>
                        {allProducts.length > 0 && (
                            <>
                                <div className="brand-stat-pill">
                                    <span className="stat-value">₹{priceRange.min.toLocaleString('en-IN')}</span>
                                    <span className="stat-label">Starting from</span>
                                </div>
                                <div className="brand-stat-pill">
                                    <span className="stat-value">₹{priceRange.max.toLocaleString('en-IN')}</span>
                                    <span className="stat-label">Up to</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="brand-content">
                {/* Sidebar */}
                <aside className="brand-sidebar">
                    <div className="filters-header">
                        <h3>Filters</h3>
                        <button className="btn-text" onClick={clearFilters}>Clear All</button>
                    </div>

                    <div className="filter-group">
                        <h4 className="filter-title">Search</h4>
                        <input
                            type="text"
                            className="search-input"
                            placeholder={`Search ${meta.display}…`}
                            value={keyword}
                            onChange={e => setKeyword(e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
                        <h4 className="filter-title">Price Range</h4>
                        <div className="price-inputs">
                            <input type="number" className="price-input" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
                            <span>–</span>
                            <input type="number" className="price-input" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
                        </div>
                        <div className="price-presets">
                            <button className="price-preset" onClick={() => { setMinPrice(''); setMaxPrice('50000'); }}>Under ₹50K</button>
                            <button className="price-preset" onClick={() => { setMinPrice('50000'); setMaxPrice('100000'); }}>₹50K – ₹1L</button>
                            <button className="price-preset" onClick={() => { setMinPrice('100000'); setMaxPrice(''); }}>Above ₹1L</button>
                        </div>
                    </div>

                    <div className="filter-group">
                        <h4 className="filter-title">Min Rating</h4>
                        <div className="rating-filter">
                            {[4, 3, 2, 1].map(r => (
                                <label key={r} className="rating-option">
                                    <input type="radio" name="bp-rating" value={r} checked={minRating === r} onChange={() => setMinRating(r)} />
                                    <span className="rating-stars">{'★'.repeat(r)}{'☆'.repeat(5 - r)}</span>
                                    <span style={{ fontSize: '0.78rem', color: '#9CA3AF', marginLeft: 'auto' }}>& up</span>
                                </label>
                            ))}
                            <label className="rating-option">
                                <input type="radio" name="bp-rating" value={0} checked={minRating === 0} onChange={() => setMinRating(0)} />
                                <span style={{ fontSize: '0.85rem', color: '#6B7280', fontWeight: minRating === 0 ? 700 : 500 }}>All Ratings</span>
                            </label>
                        </div>
                    </div>
                </aside>

                {/* Products area */}
                <div className="brand-products-area">
                    {/* Sort bar */}
                    <div className="sort-bar">
                        <span className="sort-label">Sort by:</span>
                        <div className="sort-options">
                            {['name', 'price', 'rating', 'reviews'].map(key => (
                                <button
                                    key={key}
                                    className={`sort-btn ${sortBy === key ? 'active' : ''}`}
                                    onClick={() => toggleSort(key)}
                                >
                                    {key.charAt(0).toUpperCase() + key.slice(1)}
                                    {sortBy === key && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                                </button>
                            ))}
                        </div>
                        <span className="results-count">{filtered.length} of {allProducts.length} models</span>
                    </div>

                    {loading && (
                        <div className="loading-state">
                            <div className="loading-spinner"></div>
                            <p>Loading {meta.display} phones…</p>
                        </div>
                    )}
                    {error && <div className="error-state"><p style={{ color: 'red' }}>{error}</p></div>}

                    {!loading && !error && filtered.length === 0 && (
                        <div className="no-products">
                            <div className="no-products-icon">{meta.emoji}</div>
                            <h3>No products match your filters</h3>
                            <p>Try adjusting or clearing your filters</p>
                            <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
                        </div>
                    )}

                    {!loading && !error && filtered.length > 0 && (
                        <div className="brand-products-grid">
                            {filtered.map(product => (
                                <ProductCard key={product._id || product.id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BrandPage;
