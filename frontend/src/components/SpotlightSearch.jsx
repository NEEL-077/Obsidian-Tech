import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axiosConfig';
import './SpotlightSearch.css';

const QUICK_LINKS = [
    { name: 'Home', url: '/', icon: '🏠' },
    { name: 'Brands', url: '/products', icon: '📱' },
    { name: 'Cart', url: '/cart', icon: '🛒' },
    { name: 'Profile', url: '/profile', icon: '👤' },
    { name: 'Deals', url: '/deals', icon: '🔥' },
];

const SpotlightSearch = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    
    const searchInputRef = useRef(null);
    const debounceRef = useRef(null);

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen) {
            setSearchQuery('');
            setSuggestions([]);
            setHighlightedIndex(-1);
            setTimeout(() => searchInputRef.current?.focus(), 10);
        }
    }, [isOpen]);

    // Handle global keyboard shortcut Cmd+K / Ctrl+K
    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (isOpen) {
                    onClose();
                } else {
                    // We need a way to open it from here if the state is lifted, 
                    // but the state is lifted to Navbar. 
                    // Let Navbar handle the global shortcut or do it via a custom event.
                }
            }
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [isOpen, onClose]);

    const fetchSuggestions = useCallback(async (query) => {
        if (!query.trim() || query.length < 2) {
            setSuggestions([]);
            return;
        }
        try {
            setLoadingSuggestions(true);
            const { data } = await API.get(`/products?keyword=${encodeURIComponent(query)}&pageNumber=1`);
            setSuggestions(data.products || []);
        } catch {
            setSuggestions([]);
        } finally {
            setLoadingSuggestions(false);
        }
    }, []);

    const handleQueryChange = (e) => {
        const val = e.target.value;
        setSearchQuery(val);
        setHighlightedIndex(-1);
        
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchSuggestions(val), 250);
    };

    const navigateTo = (url) => {
        navigate(url);
        onClose();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
                navigateTo(`/product/${suggestions[highlightedIndex]._id || suggestions[highlightedIndex].id}`);
            } else if (searchQuery.trim()) {
                // To support global search results page later if needed, right now just filter
                // Actually, the app supports `/products?q=xxx`
                navigateTo(`/products?keyword=${encodeURIComponent(searchQuery.trim())}`);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex(prev => Math.max(prev - 1, -1));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="spotlight-overlay" onClick={onClose}>
            <div className="spotlight-modal" onClick={e => e.stopPropagation()}>
                
                {/* 1. Quick Navigation Pills */}
                <div className="spotlight-quick-links">
                    {QUICK_LINKS.map(link => (
                        <button 
                            key={link.name} 
                            className="spotlight-pill"
                            onClick={() => navigateTo(link.url)}
                        >
                            <span className="spotlight-pill-icon">{link.icon}</span>
                            <span className="spotlight-pill-name">{link.name}</span>
                        </button>
                    ))}
                </div>

                {/* 2. Main Search Box */}
                <div className="spotlight-search-box">
                    <svg className="spotlight-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                        ref={searchInputRef}
                        type="text"
                        className="spotlight-input"
                        placeholder="Search OBSIDIAN TECH..."
                        value={searchQuery}
                        onChange={handleQueryChange}
                        onKeyDown={handleKeyDown}
                    />
                    <kbd className="spotlight-esc-hint">Esc</kbd>
                </div>

                {/* 3. Dropdown / Suggestions */}
                {(searchQuery.length >= 2 || loadingSuggestions) && (
                    <div className="spotlight-results">
                        {loadingSuggestions && (
                            <div className="spotlight-status">Searching...</div>
                        )}
                        
                        {!loadingSuggestions && suggestions.length === 0 && (
                            <div className="spotlight-status">No results found for "{searchQuery}"</div>
                        )}

                        {!loadingSuggestions && suggestions.length > 0 && (
                            <ul className="spotlight-list">
                                {suggestions.map((product, idx) => (
                                    <li key={product._id || product.id}>
                                        <button 
                                            className={`spotlight-result-item ${idx === highlightedIndex ? 'highlighted' : ''}`}
                                            onClick={() => navigateTo(`/product/${product._id || product.id}`)}
                                            onMouseEnter={() => setHighlightedIndex(idx)}
                                        >
                                            <div className="spotlight-result-img">
                                                {product.image && product.image.startsWith('/') ? (
                                                    <img src={product.image} alt={product.name} />
                                                ) : (
                                                    <span>📱</span>
                                                )}
                                            </div>
                                            <div className="spotlight-result-info">
                                                <div className="spotlight-result-brand">{product.brand}</div>
                                                <div className="spotlight-result-name">{product.name}</div>
                                            </div>
                                            <div className="spotlight-result-price">
                                                ₹{product.price?.toLocaleString('en-IN')}
                                            </div>
                                            <svg className="spotlight-result-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M5 12h14M12 5l7 7-7 7"/>
                                            </svg>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                {/* 4. Footer Hints */}
                <div className="spotlight-footer">
                    <div className="spotlight-hint">
                        <kbd>↵</kbd> to visit
                    </div>
                    <div className="spotlight-hint">
                        <kbd>↑</kbd><kbd>↓</kbd> to navigate
                    </div>
                    <div className="spotlight-hint">
                        <kbd>Esc</kbd> to close
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SpotlightSearch;
