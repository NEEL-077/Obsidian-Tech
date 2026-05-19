import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import API from '../api/axiosConfig';
import './FeaturedProducts.css';

const FeaturedProducts = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data } = await API.get('/products');
                // Slice the first 4 products for featured section
                const productsList = data.products || data;
                setFeaturedProducts(productsList.slice(0, 4));
                setLoading(false);
            } catch (error) {
                console.error('Failed to load featured products', error);
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    return (
        <section className="featured-products section">
            <div className="container">
                <h2 className="section-title">Featured Products</h2>
                <p className="section-subtitle">
                    Handpicked smartphones with the best features and prices
                </p>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
            ) : (
                <div className="featured-products-grid-wrapper">
                    <div className="products-grid">
                        {featuredProducts.map(product => (
                            <ProductCard key={product._id || product.id} product={product} />
                        ))}
                    </div>
                </div>
            )}

            <div className="container">
                <div className="section-footer">
                    <a href="/products" className="btn btn-outline btn-lg">
                        View All Products
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </a>
                </div>
            </div>
        </section>
    );
};

export default FeaturedProducts;
