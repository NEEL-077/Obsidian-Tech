import React, { useState, useEffect } from 'react';
import useScrollToTop from '../hooks/useScrollToTop';
import './ScrollToTop.css';

const ScrollToTop = () => {
    const [visible, setVisible] = useState(false);
    
    // Use the custom hook to scroll to top on route change
    useScrollToTop();

    // Show/hide scroll to top button
    useEffect(() => {
        const handleScroll = () => setVisible(window.scrollY > 300);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <button
            className={`scroll-to-top${visible ? ' scroll-to-top--visible' : ''}`}
            onClick={scrollToTop}
            aria-label="Scroll to top"
            title="Back to top"
        >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 15l-6-6-6 6" />
            </svg>
        </button>
    );
};

export default ScrollToTop;
