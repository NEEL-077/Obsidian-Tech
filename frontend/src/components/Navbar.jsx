import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { TubelightNavbar } from './ui/tubelight-navbar';
import { Home, Package } from 'lucide-react';
import SpotlightSearch from './SpotlightSearch';
import './Navbar.css';

const navItems = [
    { name: 'Home', url: '/', icon: Home },
    { name: 'Products', url: '/products', icon: Package },
];

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { getCartCount } = useCart();
    const cartCount = getCartCount();
    const { user, logout } = useAuth();

    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);

    // Scroll shrink effect
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close menu on route change
    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    // Global shortcut to open spotlight
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsSpotlightOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const isActive = (path) =>
        location.pathname === path ? 'nav-link active' : 'nav-link';

    return (
        <>
            <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
                <div className="container">
                    <div className="navbar-content">
                        <div className="navbar-brand">
                            <Link to="/" className="logo-link">

                                <div className="brand-text">
                                    <span className="brand-name">OBSIDIAN TECH</span>
                                </div>
                            </Link>
                        </div>

                        {/* Spotlight Search Trigger */}
                        <div className="navbar-search spotlight-trigger-wrapper">
                            <button
                                className="spotlight-trigger-btn"
                                onClick={() => setIsSpotlightOpen(true)}
                                aria-label="Open search modal"
                            >
                                <span className="search-icon-left">
                                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <circle cx="11" cy="11" r="8" />
                                        <path d="m21 21-4.35-4.35" />
                                    </svg>
                                </span>
                                <span className="spotlight-trigger-text">Search OBSIDIAN TECH...</span>
                                <span className="spotlight-shortcut">
                                    <kbd>⌘</kbd> <kbd>K</kbd>
                                </span>
                            </button>
                        </div>

                        {/* ✨ Tubelight Navbar Pill — Desktop only */}
                        <div className="navbar-links">
                            <TubelightNavbar items={navItems} />
                        </div>

                        {/* Action Buttons */}
                        <div className="navbar-actions">
                            <Link to="/cart" className="icon-btn cart-btn" title="Cart" aria-label="Cart">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                                    <circle cx="9" cy="21" r="1" />
                                    <circle cx="20" cy="21" r="1" />
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                </svg>
                                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                            </Link>
                            {user ? (
                                <div className="user-menu">
                                    <Link to="/profile" className="user-name" style={{ textDecoration: 'none', color: 'inherit' }}>
                                        Hi, {user.name ? user.name.split(' ')[0] : 'User'}
                                    </Link>
                                    <button onClick={logout} className="btn btn-outline btn-sm" style={{ marginLeft: '10px' }}>Logout</button>
                                </div>
                            ) : (
                                <Link to="/auth" className="btn btn-primary btn-sm">Sign In</Link>
                            )}

                            {/* Hamburger — mobile only */}
                            <button
                                className={`hamburger-btn${menuOpen ? ' open' : ''}`}
                                onClick={() => setMenuOpen(!menuOpen)}
                                aria-label="Toggle menu"
                                aria-expanded={menuOpen}
                            >
                                <span></span>
                                <span></span>
                                <span></span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            {menuOpen && <div className="mobile-overlay" onClick={() => setMenuOpen(false)} />}
            <div className={`mobile-menu${menuOpen ? ' mobile-menu--open' : ''}`}>
                <div className="mobile-menu-header">
                    <div className="mobile-logo">

                        <span>OBSIDIAN TECH</span>
                    </div>
                    <button className="mobile-close-btn" onClick={() => setMenuOpen(false)} aria-label="Close menu">✕</button>
                </div>
                <nav className="mobile-nav">
                    <Link to="/" className={isActive('/')}>🏠 Home</Link>
                    <Link to="/products" className={isActive('/products')}>📦 Products</Link>
                    <Link to="/deals" className={isActive('/deals')}>🔥 Deals</Link>
                    <Link to="/cart" className={isActive('/cart')}>🛒 Cart {cartCount > 0 && `(${cartCount})`}</Link>
                    {user ? (
                        <>
                            <Link to="/profile" className={isActive('/profile')}>👤 Profile</Link>
                            <button onClick={logout} className="btn btn-outline" style={{ marginTop: '1rem', width: '100%' }}>Logout</button>
                        </>
                    ) : (
                        <Link to="/auth" className="btn btn-primary" style={{ marginTop: '1rem', textAlign: 'center' }}>Sign In</Link>
                    )}
                </nav>
            </div>
            <SpotlightSearch
                isOpen={isSpotlightOpen}
                onClose={() => setIsSpotlightOpen(false)}
            />
        </>
    );
};

export default Navbar;
