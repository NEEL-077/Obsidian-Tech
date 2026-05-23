import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import SpotlightSearch from './SpotlightSearch';
import './Navbar.css';

const navItems = [
    { name: 'Store', url: '/' },
    { name: 'Smartphone', url: '/category/phones' },
    { name: 'Tablets', url: '/category/tablets' },
    { name: 'Laptops', url: '/category/laptops' },
    { name: 'Watch', url: '/category/watches' },
    { name: 'Earpiece', url: '/category/earpiece' },
    { name: 'TV & Home', url: '/category/tv-home' },
    { name: 'Accessories', url: '/category/accessories' },
    { name: 'Support', url: '/contact' }
];

const MENU_CONTENT = {
    'Store': {
        groups: [
            { title: 'Shop', links: ['Shop the Latest', 'Mac', 'iPad', 'iPhone', 'Apple Watch', 'Accessories'] },
            { title: 'Quick Links', links: ['Find a Store', 'Order Status', 'Financing', 'Apple Trade In'] },
            { title: 'Shop Special Stores', links: ['Education', 'Business'] }
        ]
    },
    'Smartphone': {
        groups: [
            { title: 'Explore Phones', links: ['Explore All Phones', 'iPhone 16 Pro', 'iPhone 16', 'Galaxy S25 Ultra', 'Pixel 9 Pro'] },
            { title: 'Shop Phones', links: ['Shop iPhone', 'Shop Samsung', 'Shop Google', 'Shop OnePlus'] },
            { title: 'More from Phones', links: ['Phone Support', 'Care+', 'Trade In'] }
        ]
    },
    'Tablets': {
        groups: [
            { title: 'Explore Tablets', links: ['Explore All Tablets', 'iPad Pro', 'iPad Air', 'Galaxy Tab S9'] },
            { title: 'Shop Tablets', links: ['Shop iPad', 'Shop Samsung Tablets', 'Tablet Accessories'] },
            { title: 'More from Tablets', links: ['Tablet Support', 'Apple Pencil', 'Keyboards'] }
        ]
    },
    'Laptops': {
        groups: [
            { title: 'Explore Laptops', links: ['Explore All Laptops', 'MacBook Pro', 'MacBook Air', 'Galaxy Book'] },
            { title: 'Shop Laptops', links: ['Shop Mac', 'Shop Samsung', 'Mac Accessories'] },
            { title: 'More from Laptops', links: ['Mac Support', 'macOS', 'Continuity'] }
        ]
    },
    'Watch': {
        groups: [
            { title: 'Explore Watches', links: ['Explore All Watches', 'Apple Watch Ultra 2', 'Apple Watch Series 9', 'Galaxy Watch 6'] },
            { title: 'Shop Watches', links: ['Shop Apple Watch', 'Shop Samsung Watch', 'Watch Bands'] },
            { title: 'More from Watches', links: ['Watch Support', 'watchOS', 'Fitness+'] }
        ]
    },
    'Earpiece': {
        groups: [
            { title: 'Explore Earpieces', links: ['Explore All Earpieces', 'AirPods Pro 2', 'AirPods 3', 'AirPods Max', 'Galaxy Buds 2 Pro'] },
            { title: 'Shop Earpieces', links: ['Shop AirPods', 'Shop Galaxy Buds', 'Accessories'] },
            { title: 'More from Earpieces', links: ['Audio Support', 'Apple Music'] }
        ]
    },
    'TV & Home': {
        groups: [
            { title: 'Explore TV & Home', links: ['Explore TV & Home', 'Apple TV 4K', 'HomePod', 'HomePod mini'] },
            { title: 'Shop TV & Home', links: ['Shop Apple TV 4K', 'Shop HomePod', 'Shop HomePod mini'] },
            { title: 'More from TV & Home', links: ['Apple TV Support', 'HomePod Support', 'Apple TV app', 'Apple TV+'] }
        ]
    },
    'Accessories': {
        groups: [
            { title: 'Shop Accessories', links: ['Shop All Accessories', 'Mac', 'iPad', 'iPhone', 'Apple Watch'] },
            { title: 'Explore Accessories', links: ['Made by Apple', 'Beats by Dr. Dre', 'AirTag'] }
        ]
    },
    'Support': {
        groups: [
            { title: 'Explore Support', links: ['iPhone', 'Mac', 'iPad', 'Watch', 'AirPods', 'Music', 'TV'] },
            { title: 'Get Help', links: ['Community', 'Check Coverage', 'Repair', 'Contact Us'] }
        ]
    }
};

const Navbar = () => {
    const location = useLocation();
    const { getCartCount } = useCart();
    const cartCount = getCartCount();
    const { user, logout } = useAuth();

    const [menuOpen, setMenuOpen] = useState(false);
    const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
    const [hoveredNav, setHoveredNav] = useState(null);
    const [isHoveringFlyout, setIsHoveringFlyout] = useState(false);

    // Close menu on route change
    useEffect(() => {
        setMenuOpen(false);
        setHoveredNav(null);
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

    // Prevent scrolling when mobile menu is open
    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; }
    }, [menuOpen]);

    const activeFlyout = isHoveringFlyout ? hoveredNav : hoveredNav;

    return (
        <>
            <div className={`nav-backdrop ${activeFlyout && !menuOpen ? 'nav-backdrop--active' : ''}`} />
            
            <nav className={`navbar ${activeFlyout ? 'navbar--flyout-open' : ''}`} onMouseLeave={() => setHoveredNav(null)}>
                <div className="container">
                    <ul className="navbar-content">
                        {/* Logo */}
                        <li className="nav-item">
                            <Link to="/" className="nav-link logo-link" onMouseEnter={() => setHoveredNav(null)}>
                                OBSIDIAN
                            </Link>
                        </li>

                        {/* Desktop Links */}
                        {navItems.map((item) => (
                            <li 
                                className="nav-item desktop-only" 
                                key={item.name}
                                onMouseEnter={() => setHoveredNav(item.name)}
                            >
                                <Link to={item.url} className={`nav-link ${activeFlyout === item.name ? 'nav-link--active' : ''}`}>
                                    {item.name}
                                </Link>
                            </li>
                        ))}

                        {/* Search Icon */}
                        <li className="nav-item">
                            <button 
                                className="icon-btn"
                                onClick={() => setIsSpotlightOpen(true)}
                                onMouseEnter={() => setHoveredNav(null)}
                                aria-label="Search"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                            </button>
                        </li>

                        {/* Cart Icon */}
                        <li className="nav-item">
                            <Link to="/cart" className="icon-btn cart-btn" aria-label="Cart" onMouseEnter={() => setHoveredNav(null)}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                    <line x1="3" y1="6" x2="21" y2="6"></line>
                                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                                </svg>
                                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                            </Link>
                        </li>

                        {/* Profile Icon / Mobile Hamburger */}
                        <li className="nav-item">
                            <Link to={user ? "/profile" : "/auth"} className="icon-btn desktop-only" aria-label="Account" onMouseEnter={() => setHoveredNav(null)}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                            </Link>
                            
                            <button
                                className={`hamburger-btn ${menuOpen ? 'open' : ''}`}
                                onClick={() => setMenuOpen(!menuOpen)}
                                aria-label="Toggle menu"
                            >
                                <span></span>
                                <span></span>
                                <span></span>
                            </button>
                        </li>
                    </ul>
                </div>

                {/* Desktop Flyout Mega Menu */}
                <div 
                    className={`nav-flyout ${activeFlyout ? 'nav-flyout--active' : ''}`}
                    onMouseEnter={() => setIsHoveringFlyout(true)}
                    onMouseLeave={() => {
                        setIsHoveringFlyout(false);
                        setHoveredNav(null);
                    }}
                >
                    <div className="nav-flyout-content container">
                        {activeFlyout && MENU_CONTENT[activeFlyout]?.groups.map((group, idx) => (
                            <div key={idx} className="nav-flyout-group">
                                <h4 className="nav-flyout-title">{group.title}</h4>
                                <ul className="nav-flyout-links">
                                    {group.links.map(link => (
                                        <li key={link}><Link to="#" className="nav-flyout-link">{link}</Link></li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Mobile Dropdown Menu */}
            <div className={`mobile-menu ${menuOpen ? 'mobile-menu--open' : ''}`}>
                <nav className="mobile-nav">
                    {navItems.map((item) => (
                        <Link key={item.name} to={item.url} className="nav-link">
                            {item.name}
                        </Link>
                    ))}
                    <Link to={user ? "/profile" : "/auth"} className="nav-link">
                        {user ? 'Account' : 'Sign In'}
                    </Link>
                    {user && (
                        <button 
                            className="nav-link" 
                            style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }} 
                            onClick={() => { logout(); setMenuOpen(false); }}
                        >
                            Sign Out
                        </button>
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
