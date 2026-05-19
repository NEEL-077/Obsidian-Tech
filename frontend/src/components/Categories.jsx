import React from 'react';
import './Categories.css';

const Categories = () => {
    const categories = [
        {
            id: 1,
            name: 'Apple',
            icon: '/images/phones/apple-iphone-16-pro-max.jpg',
            count: 45,
            bg: '#1A1A24',
            border: '#2A2A3A',
            isImage: true
        },
        {
            id: 2,
            name: 'Samsung',
            icon: '/images/phones/samsung-galaxy-s25-ultra-sm-s938.jpg',
            count: 67,
            bg: '#1A1A24',
            border: '#2A2A3A',
            isImage: true
        },
        {
            id: 3,
            name: 'Google',
            icon: '/images/phones/google-pixel-9-pro-.jpg',
            count: 23,
            bg: '#1A1A24',
            border: '#2A2A3A',
            isImage: true
        },
        {
            id: 4,
            name: 'OnePlus',
            icon: '/images/phones/oneplus-12.jpg',
            count: 34,
            bg: '#1A1A24',
            border: '#2A2A3A',
            isImage: true
        },
        {
            id: 5,
            name: 'Xiaomi',
            icon: '/images/phones/xiaomi-17-ultra.jpg',
            count: 56,
            bg: '#1A1A24',
            border: '#2A2A3A',
            isImage: true
        },
        {
            id: 6,
            name: 'Others',
            icon: '/images/phones/motorola-edge-2025.jpg',
            count: 89,
            bg: '#1A1A24',
            border: '#2A2A3A',
            isImage: true
        }
    ];

    return (
        <section className="categories section">
            <div className="container">
                <h2 className="section-title">Shop by Brand</h2>
                <p className="section-subtitle">
                    Explore your favorite mobile brands
                </p>

                <div className="categories-grid">
                    {categories.map(category => (
                        <div key={category.id} className="category-card">
                            <div
                                className="category-icon"
                                style={{ 
                                    background: category.bg,
                                    border: `1px solid ${category.border}`
                                }}
                            >
                                {category.isImage ? (
                                    <img src={category.icon} alt={category.name} className="category-img" />
                                ) : (
                                    <span>{category.icon}</span>
                                )}
                            </div>
                            <h3 className="category-name">{category.name}</h3>
                            <p className="category-count">{category.count} Products</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Categories;
