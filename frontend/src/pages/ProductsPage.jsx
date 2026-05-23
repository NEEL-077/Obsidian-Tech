import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../api/productApi';
import SEO from '../components/SEO';
import './ProductsPage.css';

export const BRAND_META = {
    Apple: { logo: '/logos/apple.png', tagline: 'Think Different' },
    Samsung: { logo: '/logos/samsung.png', tagline: "Do What You Can't" },
    OnePlus: { logo: '/logos/one-plus.png', tagline: 'Never Settle' },
    Google: { logo: '/logos/google.png', tagline: 'Made by Google' },
    Xiaomi: { logo: '/logos/xiaomi.png', tagline: 'Innovation for Everyone' },
    Motorola: { logo: '/logos/MOTOROLA.png', tagline: 'Ready For Anything' },
    Realme: { icon: <svg width="48" height="48" viewBox="0 0 24 24" fill="#ffd60a" stroke="none"><circle cx="12" cy="12" r="10"/></svg>, tagline: 'Dare to Leap' },
    Vivo: { icon: <svg width="48" height="48" viewBox="0 0 24 24" fill="#2997ff" stroke="none"><polygon points="12 2 22 12 12 22 2 12 12 2"/></svg>, tagline: 'More Joy, More Life' },
    OPPO: { icon: <svg width="48" height="48" viewBox="0 0 24 24" fill="#30d158" stroke="none"><path d="M12 2L2 22h20L12 2z"/></svg>, tagline: 'Inspiration Ahead' },
    Nothing: { icon: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f5f5f7" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>, tagline: 'The Truth in Design' },
};

export const DEFAULT_META = { icon: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6e6e73" strokeWidth="1.5"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>, tagline: 'Premium Smartphones' };

export const getBrandMeta = (brand) => BRAND_META[brand] || DEFAULT_META;

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

    // Build brand summaries: name, count, price range
    const brands = useMemo(() => {
        const map = new Map();
        allProducts.forEach(p => {
            const b = p.brand || 'Other';
            if (!map.has(b)) {
                map.set(b, { name: b, count: 0, minPrice: Infinity, maxPrice: 0 });
            }
            const entry = map.get(b);
            entry.count++;
            if (p.price < entry.minPrice) entry.minPrice = p.price;
            if (p.price > entry.maxPrice) entry.maxPrice = p.price;
        });
        return Array.from(map.values()).sort((a, b) => b.count - a.count);
    }, [allProducts]);

    return (
        <div className="products-page">
            <SEO
                title="Shop by Brand | OBSIDIAN TECH"
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
                {error && <div className="error-state"><p>{error}</p></div>}

                {!loading && !error && (
                    <div className="hub-grid">
                        {brands.map(brand => {
                            const meta = getBrandMeta(brand.name);
                            const slug = brand.name.toLowerCase().replace(/\s+/g, '-');
                            return (
                                <Link
                                    key={brand.name}
                                    to={`/brand/${slug}`}
                                    className="hub-card"
                                >
                                    <div className="hub-card-info">
                                        <div className="hub-card-title">{brand.name}</div>
                                        <div className="hub-card-tagline">{meta.tagline}</div>
                                        <div className="hub-card-stats">
                                            {brand.count} models · From ₹{brand.minPrice.toLocaleString('en-IN')}
                                        </div>
                                        
                                        <div className="hub-card-actions">
                                            <button className="btn-explore">Explore</button>
                                        </div>
                                    </div>

                                    <div className="hub-card-image">
                                        {meta.logo ? (
                                            <img
                                                src={meta.logo}
                                                alt={`${brand.name} logo`}
                                                className="hub-logo-img"
                                            />
                                        ) : (
                                            <div className="hub-card-icon">{meta.icon}</div>
                                        )}
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
