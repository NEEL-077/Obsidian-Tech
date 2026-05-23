import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchProducts } from '../api/productApi';
import { useCart } from '../context/CartContext';
import SEO from '../components/SEO';
import { getBrandMeta } from './ProductsPage';
import './BrandPage.css';
import './ProductsPage.css';
import './CategoryPage.css';

const CategoryPage = () => {
    const { categoryName } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    
    // Format category name for display
    const formattedCategoryName = categoryName.charAt(0).toUpperCase() + categoryName.slice(1).replace('-', ' ');

    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('All Models');

    const tabs = ['All Models', 'Ease of Switching', 'Ways to Save', 'Shopping Guides', 'Accessories'];

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                // Fetch all products (or we could pass category filter to fetchProducts if supported properly, but client-side filtering works for now)
                const data = await fetchProducts({ pageSize: 1000, pageNumber: 1 });
                
                // Filter to this category client-side
                const categoryProducts = (data.products || []).filter(
                    p => (p.category || '').toLowerCase().replace(/\s+/g, '-') === categoryName.toLowerCase().replace(/\s+/g, '-')
                );
                
                // Sort by price descending
                categoryProducts.sort((a, b) => b.price - a.price);
                
                // Group by brand
                const grouped = {};
                categoryProducts.forEach(p => {
                    const b = p.brand || 'Other';
                    if (!grouped[b]) grouped[b] = [];
                    grouped[b].push(p);
                });
                
                // Sort brands alphabetically or by product count
                const sortedBrands = Object.keys(grouped).sort((a, b) => grouped[b].length - grouped[a].length);
                
                const finalGroupedArray = sortedBrands.map(b => ({ brand: b, products: grouped[b] }));
                
                setAllProducts(finalGroupedArray);
            } catch {
                setError('Failed to load products');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [categoryName]);

    return (
        <div className="brand-page">
            <SEO
                title={`Shop ${formattedCategoryName} | OBSIDIAN TECH`}
                description={`Browse all ${formattedCategoryName} at OBSIDIAN TECH. Take your pick from our latest models.`}
                url={`/category/${categoryName}`}
            />

            <div className="brand-container">
                {/* Header matching Apple's Shop layout */}
                <header className="shop-header">
                    <h1 className="shop-title">Shop {formattedCategoryName}</h1>
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
                    <div style={{ color: '#f5f5f7', padding: '40px 0' }}>Loading {formattedCategoryName}...</div>
                )}
                {error && <div style={{ color: '#ff453a' }}>{error}</div>}

                {!loading && !error && allProducts.length === 0 && (
                    <div style={{ color: '#6e6e73', padding: '40px 0' }}>No products currently available in this category.</div>
                )}

                {!loading && !error && allProducts.length > 0 && activeTab === 'All Models' && (
                    <div className="hub-grid">
                        {allProducts.map(({ brand, products }) => {
                            const meta = getBrandMeta(brand);
                            const slug = brand.toLowerCase().replace(/\s+/g, '-');
                            
                            return (
                                <Link to={`/brand/${slug}?category=${categoryName}`} key={brand} className="hub-card" style={{ textDecoration: 'none' }}>
                                    <div className="hub-card-info">
                                        <div className="hub-card-title">{brand}</div>
                                        <div className="hub-card-tagline">{meta.tagline}</div>
                                        <div className="hub-card-stats">
                                            {products.length} models
                                        </div>
                                        <div className="hub-card-actions">
                                            <button className="btn-explore">Explore {brand}</button>
                                        </div>
                                    </div>
                                    <div className="hub-card-image">
                                        {meta.logo ? (
                                            <img src={meta.logo} alt={`${brand} logo`} className="hub-logo-img" />
                                        ) : (
                                            <div className="hub-card-icon">{meta.icon}</div>
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

export default CategoryPage;
