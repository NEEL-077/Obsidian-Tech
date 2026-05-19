import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../api/productApi';
import SEO from '../components/SEO';
import './ProductsPage.css';

const BRAND_META = {
    Apple: { accent: '#66FCF1', bg: 'linear-gradient(135deg,#18181b 0%,#27272a 100%)', logo: '/logos/apple.png', tagline: 'Think Different' },
    Samsung: { accent: '#66FCF1', bg: 'linear-gradient(135deg,#18181b 0%,#27272a 100%)', logo: '/logos/samsung.png', tagline: "Do What You Can't" },
    OnePlus: { accent: '#66FCF1', bg: 'linear-gradient(135deg,#18181b 0%,#27272a 100%)', logo: '/logos/one-plus.png', tagline: 'Never Settle' },
    Google: { accent: '#66FCF1', bg: 'linear-gradient(135deg,#18181b 0%,#27272a 100%)', logo: '/logos/google.png', tagline: 'Made by Google' },
    Xiaomi: { accent: '#66FCF1', bg: 'linear-gradient(135deg,#18181b 0%,#27272a 100%)', logo: '/logos/xiaomi.png', tagline: 'Innovation for Everyone' },
    Motorola: { accent: '#66FCF1', bg: 'linear-gradient(135deg,#18181b 0%,#27272a 100%)', logo: '/logos/MOTOROLA.png', tagline: 'Ready For Anything' },
    Realme: { accent: '#66FCF1', bg: 'linear-gradient(135deg,#18181b 0%,#27272a 100%)', emoji: '🟡', tagline: 'Dare to Leap' },
    Vivo: { accent: '#66FCF1', bg: 'linear-gradient(135deg,#18181b 0%,#27272a 100%)', emoji: '🔷', tagline: 'More Joy, More Life' },
    OPPO: { accent: '#66FCF1', bg: 'linear-gradient(135deg,#18181b 0%,#27272a 100%)', emoji: '🔹', tagline: 'Inspiration Ahead' },
    Nothing: { accent: '#66FCF1', bg: 'linear-gradient(135deg,#18181b 0%,#27272a 100%)', emoji: '⬜', tagline: 'The Truth in Design' },
};

const DEFAULT_META = { accent: '#0ea5e9', bg: 'linear-gradient(135deg,#0ea5e9 0%,#6366f1 100%)', emoji: '📱', tagline: 'Premium Smartphones' };

const getBrandMeta = (brand) => BRAND_META[brand] || DEFAULT_META;

const ProductsPage = () => {
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchProducts({ pageSize: 1000, pageNumber: 1 });
                setAllProducts(data.products || []);
            } catch {
                setError('Failed to load brands');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // Build brand summaries: name, count, price range, sample image
    const brands = useMemo(() => {
        const map = new Map();
        allProducts.forEach(p => {
            const b = p.brand || 'Other';
            if (!map.has(b)) {
                map.set(b, { name: b, count: 0, minPrice: Infinity, maxPrice: 0, sampleImage: null });
            }
            const entry = map.get(b);
            entry.count++;
            if (p.price < entry.minPrice) entry.minPrice = p.price;
            if (p.price > entry.maxPrice) entry.maxPrice = p.price;
            if (!entry.sampleImage && p.image && p.image.startsWith('/')) {
                entry.sampleImage = p.image;
            }
        });
        return Array.from(map.values()).sort((a, b) => b.count - a.count);
    }, [allProducts]);

    return (
        <div className="products-page products-hub">
            <SEO
                title="Shop by Brand"
                description="Browse smartphones by brand — Apple, Samsung, OnePlus, Google and more. Find the perfect phone at OBSIDIAN TECH."
                url="/products"
            />

            <div className="hub-hero">
                <h1 className="hub-title">Shop by Brand</h1>
                <p className="hub-subtitle">
                    {loading ? 'Loading…' : `${brands.length} brands · ${allProducts.length}+ models`}
                </p>
            </div>

            <div className="hub-container">
                {loading && (
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Loading brands…</p>
                    </div>
                )}
                {error && <div className="error-state"><p style={{ color: 'red' }}>{error}</p></div>}

                {!loading && !error && (
                    <div className="brand-card-grid">
                        {brands.map(brand => {
                            const meta = getBrandMeta(brand.name);
                            const slug = brand.name.toLowerCase().replace(/\s+/g, '-');
                            return (
                                <Link
                                    key={brand.name}
                                    to={`/brand/${slug}`}
                                    className="brand-card"
                                    style={{ '--brand-bg': meta.bg, '--brand-accent': meta.accent }}
                                >
                                    <div className="brand-card-bg"></div>

                                    {/* Brand logo */}
                                    <div className="brand-card-image">
                                        {meta.logo ? (
                                            <div className="brand-logo-wrap">
                                                <img
                                                    src={meta.logo}
                                                    alt={`${brand.name} logo`}
                                                    className="brand-logo-img"
                                                />
                                            </div>
                                        ) : (
                                            <span className="brand-card-emoji">{meta.emoji}</span>
                                        )}
                                    </div>

                                    <div className="brand-card-body">
                                        {meta.logo ? (
                                            <div className="brand-logo-sm">
                                                <img src={meta.logo} alt={brand.name} />
                                            </div>
                                        ) : (
                                            <div className="brand-card-emoji-sm">{meta.emoji}</div>
                                        )}
                                        <h2 className="brand-card-name">{brand.name}</h2>
                                        <p className="brand-card-tagline">{meta.tagline}</p>
                                        <div className="brand-card-stats">
                                            <span className="brand-stat">{brand.count} models</span>
                                            <span className="brand-divider">·</span>
                                            <span className="brand-stat">
                                                from ₹{brand.minPrice.toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                        <div className="brand-card-cta">
                                            Shop Now
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductsPage;
