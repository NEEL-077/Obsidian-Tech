import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axiosConfig';
import './SpotlightSearch.css';

const QUICK_LINKS = [
    { name: 'Home', url: '/', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { name: 'Brands', url: '/products', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg> },
    { name: 'Cart', url: '/cart', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> },
    { name: 'Profile', url: '/profile', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
    { name: 'Deals', url: '/deals', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg> },
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
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6e6e73" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
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
